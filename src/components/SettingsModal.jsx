/**
 * SettingsModal.jsx
 *
 * HUD-styled settings overlay.
 * Two sections:
 *  1. Colour Profile — pick one of four HUD themes
 *  2. Alert Rules    — toggle which event types trigger push notifications
 */

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
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
  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const allEnabled = Object.values(rules).every(Boolean);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-150 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="settings-panel"
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed z-160 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,440px)] max-h-[85vh] overflow-y-auto glass hud-corners flex flex-col"
            style={{ background: "rgba(2,6,16,0.97)" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3 shrink-0"
              style={{ borderBottom: "1px solid rgba(var(--hud-rgb),0.14)" }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full anim-blink"
                  style={{
                    background: "var(--hud)",
                    boxShadow: "0 0 8px var(--hud)",
                  }}
                />
                <span
                  className="font-['Orbitron'] text-[0.7rem] font-bold tracking-[3px]"
                  style={{ color: "var(--hud)" }}
                >
                  SETTINGS
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-cyan-700 hover:text-cyan-300 text-base leading-none cursor-pointer transition-colors duration-150 px-1"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-6 px-5 py-5">
              {/* ── Theme ── */}
              <section>
                <div
                  className="font-['Orbitron'] text-[0.58rem] tracking-[3px] mb-3"
                  style={{ color: "var(--hud)" }}
                >
                  COLOUR PROFILE
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {Object.values(THEMES).map((t) => {
                    const active = themeId === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className="flex flex-col items-center gap-2 py-3 px-2 rounded cursor-pointer transition-all duration-200"
                        style={{
                          background: active
                            ? `rgba(${t.hudRgb}, 0.15)`
                            : "rgba(255,255,255,0.03)",
                          border: `1px solid ${active ? t.hud : "rgba(255,255,255,0.08)"}`,
                          boxShadow: active
                            ? `0 0 16px rgba(${t.hudRgb}, 0.35)`
                            : "none",
                        }}
                      >
                        {/* Colour swatch */}
                        <span
                          className="w-6 h-6 rounded-full block"
                          style={{
                            background: t.swatch,
                            boxShadow: active ? `0 0 12px ${t.swatch}` : "none",
                          }}
                        />
                        <span
                          className="font-['Orbitron'] text-[0.45rem] tracking-widest"
                          style={{
                            color: active ? t.hud : "rgba(255,255,255,0.35)",
                          }}
                        >
                          {t.label}
                        </span>
                        {active && (
                          <span
                            className="text-[0.45rem] font-bold"
                            style={{ color: t.hud }}
                          >
                            ACTIVE
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ── Alert Rules ── */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="font-['Orbitron'] text-[0.58rem] tracking-[3px]"
                    style={{ color: "var(--hud)" }}
                  >
                    ALERT RULES
                  </div>
                  <button
                    onClick={() => setAllRules(!allEnabled)}
                    className="font-['Orbitron'] text-[0.45rem] tracking-widest px-2 py-1 rounded cursor-pointer transition-colors duration-150"
                    style={{
                      border: "1px solid rgba(var(--hud-rgb),0.3)",
                      color: "rgba(var(--hud-rgb),0.7)",
                    }}
                  >
                    {allEnabled ? "DISABLE ALL" : "ENABLE ALL"}
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  {ALERT_RULE_DEFS.map((rule) => {
                    const on = rules[rule.id];
                    return (
                      <button
                        key={rule.id}
                        onClick={() => toggleRule(rule.id)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded text-left cursor-pointer transition-all duration-150 w-full"
                        style={{
                          background: on
                            ? "rgba(var(--hud-rgb),0.06)"
                            : "rgba(255,255,255,0.02)",
                          border: `1px solid ${on ? "rgba(var(--hud-rgb),0.22)" : "rgba(255,255,255,0.06)"}`,
                        }}
                      >
                        <span className="text-base leading-none shrink-0">
                          {rule.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-['Orbitron'] text-[0.58rem] font-bold tracking-widest text-cyan-300">
                            {rule.label}
                          </div>
                          <div className="text-[0.52rem] text-cyan-800 mt-0.5 truncate">
                            {rule.desc}
                          </div>
                        </div>
                        {/* Toggle pill */}
                        <div
                          className="shrink-0 w-8 h-4 rounded-full relative transition-all duration-200"
                          style={{
                            background: on
                              ? "var(--hud)"
                              : "rgba(255,255,255,0.12)",
                            boxShadow: on
                              ? "0 0 10px rgba(var(--hud-rgb),0.5)"
                              : "none",
                          }}
                        >
                          <span
                            className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-200"
                            style={{ left: on ? "18px" : "2px" }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[0.52rem] text-cyan-900 mt-3 leading-relaxed">
                  Notifications require browser permission. Install as a PWA for
                  background alerts even when the tab is not active.
                </p>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

SettingsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  themeId: PropTypes.string.isRequired,
  setTheme: PropTypes.func.isRequired,
  rules: PropTypes.object.isRequired,
  toggleRule: PropTypes.func.isRequired,
  setAllRules: PropTypes.func.isRequired,
};
