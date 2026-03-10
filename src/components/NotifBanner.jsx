/**
 * NotifBanner.jsx
 *
 * A slim fixed banner shown once when notification permission hasn't been
 * granted yet. Lets the user enable push alerts or dismiss forever.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";

export default function NotifBanner({ onEnable, onDismiss }) {
  const [visible, setVisible] = useState(true);

  function handleEnable() {
    setVisible(false);
    onEnable();
  }

  function handleDismiss() {
    setVisible(false);
    onDismiss?.();
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="notif-banner"
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -56, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-200 flex items-center justify-between gap-2 px-4 py-2"
          style={{
            background: "rgba(2,8,20,0.96)",
            borderBottom: "1px solid rgba(0,212,255,0.18)",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Bell icon + text */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm shrink-0">🔔</span>
            <span className="font-['Orbitron'] text-[0.58rem] tracking-widest text-cyan-400 leading-tight">
              ENABLE THREAT ALERTS
            </span>
            <span className="text-[0.58rem] text-cyan-700 hidden sm:block truncate">
              — get push notifications for critical & ransomware events
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleEnable}
              className="font-['Orbitron'] text-[0.55rem] tracking-widest px-3 py-1 rounded cursor-pointer transition-all duration-200 hover:brightness-110"
              style={{
                background: "rgba(0,212,255,0.12)",
                border: "1px solid rgba(0,212,255,0.4)",
                color: "#00d4ff",
              }}
            >
              ENABLE
            </button>
            <button
              onClick={handleDismiss}
              className="text-[0.7rem] text-cyan-700 hover:text-cyan-400 cursor-pointer px-1 transition-colors duration-150"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

NotifBanner.propTypes = {
  onEnable: PropTypes.func.isRequired,
  onDismiss: PropTypes.func,
};
