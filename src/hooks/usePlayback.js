/**
 * usePlayback.js — Historical event playback engine
 *
 * Fetches stored events from /api/history then drives a frame-by-frame
 * replay so the globe and log panel update exactly as they did live.
 *
 * Returns:
 *   isPlaybackMode   — true while the playback panel is open
 *   isPlaying        — true while auto-advancing
 *   events           — full fetched history array
 *   index            — current playback cursor
 *   speed            — multiplier: 1 | 2 | 5 | 10
 *   loading          — true while fetching
 *   error            — string | null
 *   openPlayback()   — fetch history and show panel
 *   closePlayback()  — hide panel, restore live view
 *   play()
 *   pause()
 *   seek(i)          — jump to index i
 *   setSpeed(n)
 */

import { useState, useEffect, useRef, useCallback } from "react";

const HISTORY_URL = "/api/history?limit=200";
// ms between events at 1× speed
const BASE_INTERVAL_MS = 800;

export function usePlayback({ onReplay }) {
  const [isPlaybackMode, setIsPlaybackMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [events, setEvents] = useState([]);
  const [index, setIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const timerRef = useRef(null);
  const indexRef = useRef(0);
  const eventsRef = useRef([]);
  const speedRef = useRef(1);
  const onReplayRef = useRef(onReplay);

  useEffect(() => { onReplayRef.current = onReplay; }, [onReplay]);
  useEffect(() => { eventsRef.current = events; }, [events]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { indexRef.current = index; }, [index]);

  /* ── clear timer ── */
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /* ── start timer ── */
  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      const next = indexRef.current + 1;
      if (next >= eventsRef.current.length) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setIsPlaying(false);
        return;
      }
      indexRef.current = next;
      setIndex(next);
      onReplayRef.current(eventsRef.current[next]);
    }, Math.round(BASE_INTERVAL_MS / speedRef.current));
  }, [clearTimer]);

  /* ── open / fetch ── */
  const openPlayback = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsPlaying(false);
    setIndex(0);
    indexRef.current = 0;
    clearTimer();
    try {
      const res = await fetch(HISTORY_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.length) throw new Error("No historical events stored yet — wait for the live feed to collect more data.");
      setEvents(data);
      eventsRef.current = data;
      // seed the first event
      onReplayRef.current(data[0]);
      setIsPlaybackMode(true);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [clearTimer]);

  /* ── close ── */
  const closePlayback = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    setIsPlaybackMode(false);
    setEvents([]);
    setIndex(0);
    setError(null);
  }, [clearTimer]);

  /* ── play ── */
  const play = useCallback(() => {
    if (!eventsRef.current.length) return;
    // if at end, restart
    if (indexRef.current >= eventsRef.current.length - 1) {
      indexRef.current = 0;
      setIndex(0);
      onReplayRef.current(eventsRef.current[0]);
    }
    setIsPlaying(true);
    startTimer();
  }, [startTimer]);

  /* ── pause ── */
  const pause = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
  }, [clearTimer]);

  /* ── seek ── */
  const seek = useCallback((i) => {
    const clamped = Math.max(0, Math.min(i, eventsRef.current.length - 1));
    indexRef.current = clamped;
    setIndex(clamped);
    if (eventsRef.current[clamped]) {
      onReplayRef.current(eventsRef.current[clamped]);
    }
  }, []);

  /* ── setSpeed ── */
  const changeSpeed = useCallback((s) => {
    setSpeed(s);
    speedRef.current = s;
    // restart timer if playing
    if (timerRef.current) startTimer();
  }, [startTimer]);

  /* cleanup on unmount */
  useEffect(() => () => clearTimer(), [clearTimer]);

  return {
    isPlaybackMode,
    isPlaying,
    events,
    index,
    speed,
    loading,
    error,
    openPlayback,
    closePlayback,
    play,
    pause,
    seek,
    setSpeed: changeSpeed,
  };
}
