"""
feeds.py — pulls real threat data from multiple sources.

Free feeds (require free abuse.ch account key from https://auth.abuse.ch/):
  - ThreatFox      — recent IOCs from abuse.ch community  [Auth-Key header]
  - URLhaus        — active malware download IPs          [Auth-Key header]

No-key feeds (truly unlimited, no account needed):
  - Feodo Tracker  — active botnet C2 IPs (Emotet, TrickBot, etc.)

Keyed feeds (optional, degrades gracefully without keys):
  - AbuseIPDB /check — enriches IPs found by above feeds (1,000/day free)
  - AlienVault OTX  — subscribed pulse IOCs (unlimited free)

If ALL feeds fail, falls back to a realistic event simulator.
"""

import os
import random
import asyncio
import ipaddress
from datetime import datetime, timezone

import httpx
from dotenv import load_dotenv
from geoip import lookup_async

load_dotenv()

ABUSEIPDB_KEY = os.getenv("ABUSEIPDB_KEY", "").strip()
OTX_KEY       = os.getenv("OTX_KEY",       "").strip()
ABUSE_CH_KEY  = os.getenv("ABUSE_CH_KEY",  "").strip()  # free key from https://auth.abuse.ch/

TARGETS = [
    {"name": "New York",  "lat":  40.71, "lng":  -74.00},
    {"name": "London",    "lat":  51.51, "lng":   -0.13},
    {"name": "Berlin",    "lat":  52.52, "lng":   13.40},
    {"name": "Tokyo",     "lat":  35.69, "lng":  139.69},
    {"name": "Sydney",    "lat": -33.87, "lng":  151.21},
    {"name": "Sao Paulo", "lat": -23.55, "lng":  -46.63},
]

def score_to_severity(score: int) -> str:
    if score >= 90: return "CRITICAL"
    if score >= 50: return "HIGH"
    if score >= 25: return "MEDIUM"
    return "LOW"

_CLS_MAP = {
    "CRITICAL": "text-red-400",
    "HIGH":     "text-orange-400",
    "MEDIUM":   "text-yellow-400",
    "LOW":      "text-cyan-400",
}
_ARC_COLOR = {
    "CRITICAL": ["#ff2d2d", "#ff000000"],
    "HIGH":     ["#ff8800", "#ff000000"],
    "MEDIUM":   ["#ffcc00", "#ff000000"],
    "LOW":      ["#00d4ff", "#ff000000"],
}

def _now_str() -> str:
    return datetime.now().strftime("%H:%M:%S")

def _build_event(ip, severity, event_type, slat, slng):
    target = random.choice(TARGETS)
    return {
        "id":       f"{ip}-{datetime.now(timezone.utc).timestamp():.3f}",
        "time":     _now_str(),
        "ip":       ip,
        "severity": severity,
        "type":     event_type,
        "cls":      _CLS_MAP[severity],
        "arc": {
            "slat": slat, "slng": slng,
            "elat": target["lat"], "elng": target["lng"],
            "color": _ARC_COLOR[severity],
        },
    }

_seen: set[str] = set()

def _is_new(ip: str) -> bool:
    if ip in _seen:
        return False
    _seen.add(ip)
    if len(_seen) > 10_000:
        _seen.clear()
    return True

async def _geolocate_ips(ips, max_results=8):
    geos = await asyncio.gather(*[lookup_async(ip) for ip in ips])
    return [(ip, lat, lng) for ip, (lat, lng) in zip(ips, geos) if lat is not None][:max_results]


# ── Feodo Tracker (no key) ────────────────────────────────────────────────────
async def poll_feodo(sample=12):
    events = []
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(
                "https://feodotracker.abuse.ch/downloads/ipblocklist.json",
                headers={"User-Agent": "CyberShieldAI/1.0"},
            )
        if r.status_code != 200:
            print(f"[feodo] HTTP {r.status_code}"); return []
        entries = r.json()
        active = [e for e in entries if e.get("status") == "online"] or entries
        random.shuffle(active)
        new_ips = [e["ip_address"] for e in active if _is_new(e["ip_address"])][:sample]
        if not new_ips:
            return []
        meta = {e["ip_address"]: e.get("malware", "BOTNET C2") for e in active}
        for ip, lat, lng in await _geolocate_ips(new_ips):
            family = meta.get(ip, "BOTNET C2").upper()
            label  = f"C2 SERVER — {family}" if family != "BOTNET C2" else "BOTNET C2 DETECTED"
            events.append(_build_event(ip, "CRITICAL", label, lat, lng))
    except Exception as e:
        print(f"[feodo] Error: {e}")
    return events


# ── ThreatFox (free abuse.ch key) ───────────────────────────────────────────
async def poll_threatfox(sample=10):
    if not ABUSE_CH_KEY:
        print("[threatfox] Skipped — set ABUSE_CH_KEY in .env (free: https://auth.abuse.ch/)")
        return []
    events = []
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(
                "https://threatfox-api.abuse.ch/api/v1/",
                json={"query": "get_iocs", "days": 1},
                headers={"User-Agent": "CyberShieldAI/1.0", "Auth-Key": ABUSE_CH_KEY},
            )
        if r.status_code != 200:
            print(f"[threatfox] HTTP {r.status_code}"); return []
        data = r.json()
        if data.get("query_status") != "ok":
            return []
        iocs = data.get("data") or []
        ip_iocs = [i for i in iocs if i.get("ioc_type") == "ip:port"]
        ips = []
        ioc_meta = {}
        for ioc in ip_iocs:
            raw = ioc.get("ioc_value") or ioc.get("ioc") or ""
            if not raw:
                continue
            ip = raw.split(":")[0]
            if ip and _is_new(ip):
                ips.append(ip)
                ioc_meta[ip] = ioc
            if len(ips) >= sample:
                break
        if not ips:
            return []
        for ip, lat, lng in await _geolocate_ips(ips):
            m        = ioc_meta.get(ip, {})
            malware  = (m.get("malware_printable") or "MALWARE").upper()
            severity = "CRITICAL" if m.get("confidence_level", 50) >= 75 else "HIGH"
            events.append(_build_event(ip, severity, f"THREATFOX — {malware}", lat, lng))
    except Exception as e:
        print(f"[threatfox] Error: {e}")
    return events


# ── URLhaus (free abuse.ch key) ─────────────────────────────────────────────
async def poll_urlhaus(sample=8):
    if not ABUSE_CH_KEY:
        print("[urlhaus] Skipped — set ABUSE_CH_KEY in .env (free: https://auth.abuse.ch/)")
        return []
    events = []
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(
                "https://urlhaus-api.abuse.ch/v1/urls/recent/",
                params={"limit": 100},
                headers={"User-Agent": "CyberShieldAI/1.0", "Auth-Key": ABUSE_CH_KEY},
            )
        if r.status_code != 200:
            print(f"[urlhaus] HTTP {r.status_code}"); return []
        urls = r.json().get("urls", [])
        active = [u for u in urls if u.get("url_status") == "online"]
        random.shuffle(active)
        ips = []
        for entry in active:
            host = entry.get("host", "")
            try:
                ipaddress.ip_address(host)
                if _is_new(host):
                    ips.append(host)
            except ValueError:
                pass
            if len(ips) >= sample:
                break
        if not ips:
            return []
        for ip, lat, lng in await _geolocate_ips(ips):
            events.append(_build_event(ip, "HIGH", "MALWARE HOSTING DETECTED", lat, lng))
    except Exception as e:
        print(f"[urlhaus] Error: {e}")
    return events


# ── AbuseIPDB /check (keyed, 1,000/day) ──────────────────────────────────────
_abuse_check_count = 0
_ABUSE_DAILY_LIMIT = 900

async def check_abuseipdb(ips):
    global _abuse_check_count
    if not ABUSEIPDB_KEY:
        return []
    slots = min(5, _ABUSE_DAILY_LIMIT - _abuse_check_count)
    if slots <= 0:
        print("[abuseipdb] Daily /check limit reached"); return []
    check_ips = ips[:slots]
    events = []
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resps = await asyncio.gather(*[
                client.get(
                    "https://api.abuseipdb.com/api/v2/check",
                    headers={"Key": ABUSEIPDB_KEY, "Accept": "application/json"},
                    params={"ipAddress": ip, "maxAgeInDays": 30},
                ) for ip in check_ips
            ], return_exceptions=True)
        for ip, resp in zip(check_ips, resps):
            _abuse_check_count += 1
            if isinstance(resp, BaseException) or resp.status_code != 200:
                continue
            d     = resp.json().get("data", {})
            score = d.get("abuseConfidenceScore", 0)
            if score < 25:
                continue
            lat, lng = await lookup_async(ip)
            if lat is None:
                continue
            events.append(_build_event(ip, score_to_severity(score),
                                       f"ABUSEIPDB — SCORE {score}%", lat, lng))
    except Exception as e:
        print(f"[abuseipdb/check] Error: {e}")
    return events


# ── AlienVault OTX (keyed, unlimited) ────────────────────────────────────────
async def poll_otx(limit=10):
    if not OTX_KEY:
        return []
    events = []
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(
                "https://otx.alienvault.com/api/v1/pulses/subscribed",
                headers={"X-OTX-API-KEY": OTX_KEY},
                params={"limit": limit, "page": 1},
            )
        if r.status_code != 200:
            print(f"[otx] HTTP {r.status_code}"); return []
        pulses = r.json().get("results", [])
        ips = [
            ioc["indicator"]
            for pulse in pulses[:5]
            for ioc in pulse.get("indicators", [])
            if ioc.get("type") == "IPv4" and _is_new(ioc["indicator"])
        ][:10]
        if not ips:
            return []
        for ip, lat, lng in await _geolocate_ips(ips):
            events.append(_build_event(ip, "HIGH", "THREAT INTELLIGENCE IOC", lat, lng))
    except Exception as e:
        print(f"[otx] Error: {e}")
    return events[:4]


# ── Aggregate all real feeds ──────────────────────────────────────────────────
async def poll_all_real():
    feodo, threatfox, urlhaus = await asyncio.gather(
        poll_feodo(), poll_threatfox(), poll_urlhaus()
    )
    no_key = feodo + threatfox + urlhaus

    enriched = await check_abuseipdb([e["ip"] for e in no_key][:5]) if ABUSEIPDB_KEY and no_key else []
    otx      = await poll_otx()

    all_events = no_key + enriched + otx
    random.shuffle(all_events)
    return all_events


# ── Simulated fallback ────────────────────────────────────────────────────────
_SIM_IPS = [
    ("31.204.154.96",  55.75,  37.62),
    ("103.21.244.13",  39.90, 116.40),
    ("185.220.101.42", 52.52,  13.40),
    ("45.67.89.102",   51.51,  -0.13),
    ("91.108.4.200",   55.75,  37.62),
    ("116.110.84.22",  21.03, 105.85),
    ("194.165.16.79",  41.71,  44.79),
    ("77.37.248.11",   59.33,  18.07),
    ("178.128.220.54", 35.69, 139.69),
    ("51.174.67.48",   53.33,  -6.25),
    ("5.188.206.14",   55.75,  37.62),
    ("14.241.244.40",  10.82, 106.63),
]
_SIM_EVENTS = [
    ("MALWARE DETECTED",    "CRITICAL"),
    ("BRUTE FORCE ATTACK",  "CRITICAL"),
    ("RANSOMWARE DETECTED", "CRITICAL"),
    ("UNAUTHORIZED ACCESS", "HIGH"),
    ("DDOS ATTEMPT",        "HIGH"),
    ("SQL INJECTION",       "HIGH"),
    ("PORT SCAN DETECTED",  "MEDIUM"),
    ("PHISHING ALERT",      "MEDIUM"),
]

async def simulated_event():
    ip, slat, slng = random.choice(_SIM_IPS)
    evt_type, severity = random.choice(_SIM_EVENTS)
    return _build_event(ip, severity, evt_type, slat, slng)
