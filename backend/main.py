"""
main.py — CyberShield AI backend

Endpoints:
  GET  /api/logs          last 50 events
  GET  /api/stats         cumulative counters
  GET  /api/status        backend health + feed status
  WS   /ws/live           real-time event stream
"""

import asyncio
import os
from collections import deque
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from feeds import poll_all_real, simulated_event, ABUSEIPDB_KEY, OTX_KEY, ABUSE_CH_KEY

load_dotenv()

POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", 60))

# ── Shared state ────────────────────────────────────────────────────────────
event_store: deque[dict] = deque(maxlen=200)
stats = {"threats": 0, "intrusions": 0, "malware": 0, "ddos": 0}
clients: list[WebSocket] = []


def _update_stats(evt: dict):
    stats["threats"] += 1
    t = evt.get("type", "")
    s = evt.get("severity", "")
    if "MALWARE" in t or "RANSOMWARE" in t or s == "CRITICAL":
        stats["malware"] += 1
    elif "DDOS" in t:
        stats["ddos"] += 1
    else:
        stats["intrusions"] += 1


async def _broadcast(evt: dict):
    dead: list[WebSocket] = []
    for ws in list(clients):
        try:
            await ws.send_json(evt)
        except Exception:
            dead.append(ws)
    for ws in dead:
        if ws in clients:
            clients.remove(ws)


async def _ingest(events: list[dict]):
    for evt in events:
        event_store.append(evt)
        _update_stats(evt)
        await _broadcast(evt)


# ── Background polling loop ─────────────────────────────────────────────────
async def _poll_loop():
    print(f"[feeds] Mode: {'REAL + KEYED' if (ABUSEIPDB_KEY or OTX_KEY) else 'REAL (no-key feeds: Feodo/ThreatFox/URLhaus)'}")

    while True:
        try:
            events = await poll_all_real()
            if not events:
                events = [await simulated_event()]

            await _ingest(events)
            print(f"[feeds] Dispatched {len(events)} event(s). "
                  f"Store={len(event_store)} Clients={len(clients)}")
        except Exception as e:
            print(f"[feeds] Poll error: {e}")

        await asyncio.sleep(POLL_INTERVAL)


# ── App lifespan ─────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(_poll_loop())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="CyberShield AI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── REST endpoints ───────────────────────────────────────────────────────────
@app.get("/api/logs")
def get_logs():
    return list(event_store)[-50:][::-1]   # newest first


@app.get("/api/history")
def get_history(limit: int = 200):
    """Return all stored events sorted oldest-first for playback."""
    events = list(event_store)
    # Ensure every event has a ts field (backfill if missing)
    import time as _time
    for i, e in enumerate(events):
        if "ts" not in e:
            e["ts"] = _time.time() - (len(events) - i) * 60
    events.sort(key=lambda e: e["ts"])
    return events[-limit:]


@app.get("/api/stats")
def get_stats():
    return stats


@app.get("/api/status")
def get_status():
    return {
        "abuseipdb": bool(ABUSEIPDB_KEY),
        "otx":       bool(OTX_KEY),
        "abuse_ch":  bool(ABUSE_CH_KEY),
        "mode":      "real+keyed" if (ABUSEIPDB_KEY or OTX_KEY or ABUSE_CH_KEY) else "real",
        "poll_interval": POLL_INTERVAL,
        "events_stored": len(event_store),
        "connected_clients": len(clients),
    }


# ── WebSocket ────────────────────────────────────────────────────────────────
@app.websocket("/ws/live")
async def ws_live(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    print(f"[ws] Client connected. Total={len(clients)}")

    # Send the last 30 stored events immediately so the UI populates on connect
    for evt in list(event_store)[-30:][::-1]:
        try:
            await websocket.send_json(evt)
        except Exception:
            break

    try:
        while True:
            # Keep-alive: client can send any text (we ignore it)
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        if websocket in clients:
            clients.remove(websocket)
        print(f"[ws] Client disconnected. Total={len(clients)}")
