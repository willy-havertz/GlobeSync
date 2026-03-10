/**
 * SettingsModal.jsx
 * HUD-styled settings overlay — theme picker + alert rule toggles.
 * Rendered via portal so parent stacking contexts cannot clip it.
 */

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { THEMES } from "../hooks/useTheme";
import { ALERT_RULE_DEFS } from "../hooks/useAlertRules";

export default function SettingsModal({
  open,
  onClose,
  themeId,
  setTheme,
  rules,
  toggleRule,
  setAllRules,
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const allEnabled = rules && Object.values(rules).every(Boolean);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="sm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9000,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Centering shell — flex handles positioning; framer-motion only animates opacity/scale */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9001,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              pointerEvents: "none",
            }}
          >
          <motion.div
            key="sm-panel"
            initial={{ opacity: 0, scale: 0.95, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              pointerEvents: "auto",
              width: "100%",
              maxWidth: 440,
              maxHeight: "85vh",
              overflowY: "auto",
              background: "rgba(2,6,16,0.97)",
              border: "1px solid rgba(var(--hud-rgb),0.30)",
              borderRadius: 6,
              boxShadow:
                "0 0 40px rgba(var(--hud-rgb),0.18), 0 8px 32px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* ── Header ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 20px",
                borderBottom: "1px solid rgba(var(--hud-rgb),0.14)",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  className="anim-blink"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--hud)",
                    boxShadow: "0 0 8px var(--hud)",
                    display: "inline-block",
                  }}
                />
                <span
                  className="font-['Orbitron']"
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "3px",
                    color: "var(--hud)",
                  }}
                >
                  HUD SETTINGS
                </span>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(var(--hud-rgb),0.5)",
                  fontSize: "1rem",
                  lineHeight: 1,
                  padding: "4px 6px",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              {/* ── Colour Profile ── */}
              <section>
                <div
                  className="font-['Orbitron']"
                  style={{
                    fontSize: "0.55rem",
                    letterSpacing: "3px",
                    color: "var(--hud)",
                    marginBottom: 12,
                  }}
                >
                  COLOUR PROFILE
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 8,
                  }}
                >
                  {Object.values(THEMES).map((t) => {
                    const active = themeId === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 6,
                          padding: "12px 6px",
                          borderRadius: 6,
                          cursor: "pointer",
                          background: active
                            ? `rgba(${t.hudRgb},0.15)`
                            : "rgba(255,255,255,0.03)",
                          border: `1px solid ${active ? t.hud : "rgba(255,255,255,0.08)"}`,
                          boxShadow: active
                            ? `0 0 16px rgba(${t.hudRgb},0.35)`
                            : "none",
                          transition: "all 0.18s ease",
                        }}
                      >
                        <span
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: t.swatch,
                            boxShadow: active ? `0 0 12px ${t.swatch}` : "none",
                            display: "block",
                          }}
                        />
                        <span
                          className="font-['Orbitron']"
                          style={{
                            fontSize: "0.44rem",
                            letterSpacing: "2px",
                            color: active ? t.hud : "rgba(255,255,255,0.35)",
                          }}
                        >
                          {t.label}
                        </span>
                        {active && (
                          <span
                            className="font-['Orbitron']"
                            style={{
                              fontSize: "0.4rem",
                              color: t.hud,
                              fontWeight: 700,
                            }}
                          >
                            ● ACTIVE
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ── Alert Rules ── */}
              <section>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div
                    className="font-['Orbitron']"
                    style={{
                      fontSize: "0.55rem",
                      letterSpacing: "3px",
                      color: "var(--hud)",
                    }}
                  >
                    PUSH ALERT RULES
                  </div>
                  <button
                    onClick={() => setAllRules(!allEnabled)}
                    className="font-['Orbitron']"
                    style={{
                      fontSize: "0.44rem",
                      letterSpacing: "2px",
                      padding: "4px 8px",
                      borderRadius: 4,
                      cursor: "pointer",
                      border: "1px solid rgba(var(--hud-rgb),0.3)",
                      color: "rgba(var(--hud-rgb),0.7)",
                      background: "transparent",
                    }}
                  >
                    {allEnabled ? "DISABLE ALL" : "ENABLE ALL"}
                  </button>
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {ALERT_RULE_DEFS.map((rule) => {
                    const on = rules[rule.id];
                    return (
                      <button
                        key={rule.id}
                        onClick={() => toggleRule(rule.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 6,
                          cursor: "pointer",
                          width: "100%",
                          textAlign: "left",
                          background: on
                            ? "rgba(var(--hud-rgb),0.06)"
                            : "rgba(255,255,255,0.02)",
                          border: `1px solid ${on ? "rgba(var(--hud-rgb),0.22)" : "rgba(255,255,255,0.06)"}`,
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "1.1rem",
                            lineHeight: 1,
                            flexShrink: 0,
                          }}
                        >
                          {rule.icon}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            className="font-['Orbitron']"
                            style={{
                              fontSize: "0.56rem",
                              fontWeight: 700,
                              letterSpacing: "2px",
                              color: on
                                ? "var(--hud)"
                                : "rgba(255,255,255,0.4)",
                            }}
                          >
                            {rule.label}
                          </div>
                          <div
                            style={{
                              fontSize: "0.5rem",
                              color: "rgba(255,255,255,0.25)",
                              marginTop: 2,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {rule.desc}
                          </div>
                        </div>
                        {/* Toggle pill */}
                        <div
                          style={{
                            flexShrink: 0,
                            width: 32,
                            height: 16,
                            borderRadius: 8,
                            position: "relative",
                            transition: "all 0.2s ease",
                            background: on
                              ? "var(--hud)"
                              : "rgba(255,255,255,0.12)",
                            boxShadow: on
                              ? "0 0 10px rgba(var(--hud-rgb),0.5)"
                              : "none",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              top: 2,
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              background: "#fff",
                              left: on ? 18 : 2,
                              transition: "left 0.2s ease",
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p
                  style={{
                    fontSize: "0.5rem",
                    color: "rgba(255,255,255,0.2)",
                    marginTop: 12,
                    lineHeight: 1.6,
                  }}
                >
                  Notifications require browser permission. Install as a PWA for
                  background alerts.
                </p>
              </section>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
