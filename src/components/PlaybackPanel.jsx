/**
 * PlaybackPanel.jsx — Historical playback controls
 * A fixed bottom HUD bar that appears when playback mode is active.
 */

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const SPEEDS = [1, 2, 5, 10];

function fmt(ts) {
  if (!ts) return "--:--:--";
  try {
    return new Date(ts * 1000).toLocaleTimeString();
  } catch {
    return "--:--:--";
  }
}

function fmtDate(ts) {
  if (!ts) return "";
  try {
    return new Date(ts * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function PlaybackPanel({
  isPlaybackMode,
  isPlaying,
  events,
  index,
  speed,
  loading,
  error,
  play,
  pause,
  seek,
  setSpeed,
  closePlayback,
}) {
  const current = events[index] || null;
  const total = events.length;
  const pct = total > 1 ? index / (total - 1) : 0;

  const SEV_COLOR = {
    CRITICAL: "#ff3333",
    HIGH: "#ff8800",
    MEDIUM: "#ffcc00",
    LOW: "#00d4ff",
  };
  const sevColor = SEV_COLOR[current?.severity] || "var(--hud)";

  const panel = (
    <AnimatePresence>
      {isPlaybackMode && (
        <motion.div
          key="playback-panel"
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 8000,
            background: "rgba(2,6,16,0.97)",
            borderTop: "1px solid rgba(var(--hud-rgb),0.35)",
            boxShadow: "0 -4px 40px rgba(var(--hud-rgb),0.15)",
            backdropFilter: "blur(8px)",
            padding: "0",
          }}
        >
          {/* ── Top accent line ── */}
          <div style={{ height: 2, background: "linear-gradient(90deg, transparent, var(--hud), transparent)" }} />

          <div style={{ padding: "10px 16px 12px", display: "flex", flexDirection: "column", gap: 8 }}>

            {/* ── Row 1: Title + event info + close ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Title */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span
                  className="anim-blink"
                  style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--hud)", boxShadow: "0 0 8px var(--hud)", display: "inline-block" }}
                />
                <span
                  className="font-['Orbitron']"
                  style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "3px", color: "var(--hud)", whiteSpace: "nowrap" }}
                >
                  HISTORICAL PLAYBACK
                </span>
              </div>

              {/* Error */}
              {error && (
                <span style={{ fontSize: "0.52rem", color: "#ff6666", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  ⚠ {error}
                </span>
              )}

              {/* Current event summary */}
              {!error && current && (
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0, overflow: "hidden" }}>
                  <span style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>
                    {fmtDate(current.ts)} {fmt(current.ts)}
                  </span>
                  <span
                    className="font-['Orbitron']"
                    style={{ fontSize: "0.5rem", fontWeight: 700, color: sevColor, whiteSpace: "nowrap", textShadow: `0 0 8px ${sevColor}88` }}
                  >
                    {current.severity}
                  </span>
                  <span style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {current.type} — {current.ip}
                  </span>
                </div>
              )}

              {loading && (
                <span style={{ flex: 1, fontSize: "0.52rem", color: "rgba(var(--hud-rgb),0.6)" }}>Loading history…</span>
              )}

              {/* Event counter */}
              {!error && total > 0 && (
                <span
                  className="font-['Orbitron']"
                  style={{ fontSize: "0.5rem", color: "rgba(var(--hud-rgb),0.5)", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  {index + 1} / {total}
                </span>
              )}

              {/* Close */}
              <button
                onClick={closePlayback}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(var(--hud-rgb),0.5)", fontSize: "0.9rem", lineHeight: 1, padding: "2px 6px", flexShrink: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--hud)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(var(--hud-rgb),0.5)"; }}
                title="Exit playback"
              >
                ✕
              </button>
            </div>

            {/* ── Row 2: Scrubber ── */}
            <div style={{ position: "relative", height: 20, display: "flex", alignItems: "center", gap: 8 }}>
              {/* Start time */}
              <span style={{ fontSize: "0.45rem", color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap", flexShrink: 0 }}>
                {events[0] ? fmt(events[0].ts) : "--"}
              </span>

              {/* Track */}
              <div style={{ flex: 1, position: "relative", height: 20, display: "flex", alignItems: "center" }}>
                {/* Background track */}
                <div style={{ position: "absolute", left: 0, right: 0, height: 3, borderRadius: 2, background: "rgba(var(--hud-rgb),0.12)" }} />
                {/* Filled portion */}
                <div style={{ position: "absolute", left: 0, width: `${pct * 100}%`, height: 3, borderRadius: 2, background: "var(--hud)", boxShadow: "0 0 6px var(--hud)", transition: "width 0.3s ease" }} />
                {/* HTML range input */}
                <input
                  type="range"
                  min={0}
                  max={Math.max(total - 1, 0)}
                  value={index}
                  onChange={(e) => seek(Number(e.target.value))}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    width: "100%",
                    appearance: "none",
                    background: "transparent",
                    cursor: "pointer",
                    height: 20,
                    margin: 0,
                    padding: 0,
                    zIndex: 2,
                  }}
                />
              </div>

              {/* End time */}
              <span style={{ fontSize: "0.45rem", color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap", flexShrink: 0 }}>
                {events[total - 1] ? fmt(events[total - 1].ts) : "--"}
              </span>
            </div>

            {/* ── Row 3: Play controls + speed ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Rewind to start */}
              <button
                onClick={() => seek(0)}
                disabled={!total}
                title="Restart"
                style={{ background: "rgba(var(--hud-rgb),0.06)", border: "1px solid rgba(var(--hud-rgb),0.2)", borderRadius: 4, cursor: "pointer", color: "rgba(var(--hud-rgb),0.7)", padding: "5px 10px", fontSize: "0.8rem", lineHeight: 1 }}
              >
                ⏮
              </button>

              {/* Step back */}
              <button
                onClick={() => seek(index - 1)}
                disabled={index <= 0}
                title="Step back"
                style={{ background: "rgba(var(--hud-rgb),0.06)", border: "1px solid rgba(var(--hud-rgb),0.2)", borderRadius: 4, cursor: "pointer", color: "rgba(var(--hud-rgb),0.7)", padding: "5px 10px", fontSize: "0.8rem", lineHeight: 1 }}
              >
                ◀
              </button>

              {/* Play / Pause */}
              <button
                onClick={isPlaying ? pause : play}
                disabled={!total}
                style={{
                  background: isPlaying ? "rgba(var(--hud-rgb),0.15)" : "var(--hud)",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  color: isPlaying ? "var(--hud)" : "rgba(2,6,16,0.95)",
                  padding: "6px 18px",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  lineHeight: 1,
                  minWidth: 64,
                  transition: "all 0.15s ease",
                }}
              >
                {isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
              </button>

              {/* Step forward */}
              <button
                onClick={() => seek(index + 1)}
                disabled={index >= total - 1}
                title="Step forward"
                style={{ background: "rgba(var(--hud-rgb),0.06)", border: "1px solid rgba(var(--hud-rgb),0.2)", borderRadius: 4, cursor: "pointer", color: "rgba(var(--hud-rgb),0.7)", padding: "5px 10px", fontSize: "0.8rem", lineHeight: 1 }}
              >
                ▶
              </button>

              {/* Jump to end */}
              <button
                onClick={() => seek(total - 1)}
                disabled={!total}
                title="Jump to latest"
                style={{ background: "rgba(var(--hud-rgb),0.06)", border: "1px solid rgba(var(--hud-rgb),0.2)", borderRadius: 4, cursor: "pointer", color: "rgba(var(--hud-rgb),0.7)", padding: "5px 10px", fontSize: "0.8rem", lineHeight: 1 }}
              >
                ⏭
              </button>

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* Speed */}
              <span className="font-['Orbitron']" style={{ fontSize: "0.48rem", color: "rgba(var(--hud-rgb),0.5)", letterSpacing: "2px" }}>SPEED</span>
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className="font-['Orbitron']"
                  style={{
                    background: speed === s ? "rgba(var(--hud-rgb),0.15)" : "transparent",
                    border: `1px solid ${speed === s ? "rgba(var(--hud-rgb),0.5)" : "rgba(var(--hud-rgb),0.15)"}`,
                    borderRadius: 4,
                    cursor: "pointer",
                    color: speed === s ? "var(--hud)" : "rgba(var(--hud-rgb),0.4)",
                    padding: "4px 8px",
                    fontSize: "0.48rem",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    transition: "all 0.15s",
                  }}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(panel, document.body);
}
