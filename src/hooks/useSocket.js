/**
 * useSocket.js
 *
 * Connects to the GlobeSync AI backend WebSocket at /ws/live.
 * In development Vite's proxy forwards /ws/* to ws://localhost:8000.
 * In production set VITE_WS_URL=wss://your-backend.onrender.com/ws/live
 * in Render's environment variables (or a local .env file).
 *
 * Features:
 *  - Automatic reconnect with exponential back-off (1s → 2s → 4s … max 30s)
 *  - Calls onEvent(event) for every message received
 *  - Reports connection status so the UI can show LIVE / OFFLINE badge
 */

import { useEffect, useRef, useCallback, useState } from "react";

const WS_URL =
  import.meta.env.VITE_WS_URL ??
  ((window.location.protocol === "https:" ? "wss" : "ws") +
    "://" +
    window.location.host +
    "/ws/live");

export function useSocket({ onEvent }) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const retryTimer = useRef(null);
  const retryDelay = useRef(1000);
  const unmounted = useRef(false);
  const connectRef = useRef(null);

  const connect = useCallback(() => {
    if (unmounted.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      if (unmounted.current) {
        ws.close();
        return;
      }
      setConnected(true);
      retryDelay.current = 1000; // reset back-off on success
      console.log("[ws] Connected to backend");
    };

    ws.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        onEvent(event);
      } catch {
        /* ignore malformed frames */
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (unmounted.current) return;
      const delay = retryDelay.current;
      retryDelay.current = Math.min(delay * 2, 30_000);
      console.log(`[ws] Disconnected. Retrying in ${delay}ms…`);
      retryTimer.current = setTimeout(() => connectRef.current?.(), delay);
    };

    ws.onerror = () => ws.close(); // onclose will handle retry

    wsRef.current = ws;
  }, [onEvent]);

  // Keep the ref pointing at the latest connect function
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    unmounted.current = false;
    connect();
    return () => {
      unmounted.current = true;
      clearTimeout(retryTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { connected };
}
