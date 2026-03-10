import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CsiLogo from "./CsiLogo";

const BOOT_LINES = [
  { text: "INITIALIZING GLOBESYNC AI v4.2.1...", delay: 0 },
  { text: "LOADING THREAT INTELLIGENCE DATABASE...", delay: 280 },
  { text: "CONNECTING TO GLOBAL SENSOR NETWORK [124 NODES]...", delay: 320 },
  { text: "INITIALIZING ML ANOMALY DETECTION ENGINE...", delay: 260 },
  { text: "LOADING GEOSPATIAL ATTACK MAPPING MODULE...", delay: 300 },
  { text: "SYNCING REAL-TIME IOC FEEDS [23,412 INDICATORS]...", delay: 350 },
  { text: "ESTABLISHING SECURE COMMS CHANNELS (TLS 1.3)...", delay: 270 },
  { text: "VERIFYING CRYPTOGRAPHIC SIGNATURES...", delay: 290 },
  { text: "ALL SYSTEMS NOMINAL — LAUNCHING DASHBOARD", delay: 400 },
];

export default function BootScreen({ onComplete }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cumulative = 600;
    BOOT_LINES.forEach((line, i) => {
      cumulative += line.delay + Math.random() * 120;
      setTimeout(() => {
        setVisibleCount(i + 1);
        if (i === BOOT_LINES.length - 1) {
          setTimeout(() => {
            setDone(true);
            setTimeout(onComplete, 650);
          }, 500);
        }
      }, cumulative);
    });
  }, [onComplete]);

  const progress = Math.round((visibleCount / BOOT_LINES.length) * 100);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center"
          style={{ background: "#02040a" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
        >
          {/* Scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.08) 2px,rgba(0,0,0,.08) 4px)",
            }}
          />

          {/* 3-D CSI logo */}
          <motion.div
            className="mb-2"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.65, ease: "backOut" }}
          >
            <CsiLogo size={220} />
          </motion.div>

          <motion.h1
            className="font-['Orbitron'] text-3xl font-black tracking-[10px] text-cyan-400 mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            style={{ textShadow: "0 0 40px #00d4ffaa" }}
          >
            GLOBE<span style={{ color: "#fff" }}>SYNC</span> AI
          </motion.h1>

          <motion.p
            className="text-[0.55rem] tracking-[6px] text-cyan-800 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            GLOBESYNC INTELLIGENCE PLATFORM — SECURE BOOT
          </motion.p>

          {/* Terminal lines */}
          <div
            className="w-full max-w-md px-4 mb-6 space-y-1.5"
            style={{ minHeight: 180 }}
          >
            {BOOT_LINES.slice(0, visibleCount).map((line, i) => {
              const isLast = i === visibleCount - 1;
              const isComplete = !isLast || progress === 100;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-2 text-[0.58rem] font-['Share Tech Mono']"
                >
                  <span
                    style={{ color: "#00d4ff44" }}
                    className="shrink-0 text-[0.7rem]"
                  >
                    ›
                  </span>
                  <span
                    style={{
                      color: isLast ? "#00d4ff" : "#1a4a6a",
                    }}
                  >
                    {line.text}
                  </span>
                  {isLast && progress < 100 && (
                    <span className="text-cyan-400 anim-blink shrink-0">█</span>
                  )}
                  {isComplete && i < BOOT_LINES.length - 1 && (
                    <span
                      className="ml-auto shrink-0 text-[0.5rem] tracking-widest"
                      style={{ color: "#00ff88" }}
                    >
                      [ OK ]
                    </span>
                  )}
                  {isComplete && i === BOOT_LINES.length - 1 && (
                    <span
                      className="ml-auto shrink-0 text-[0.5rem] tracking-widest anim-blink"
                      style={{ color: "#00d4ff" }}
                    >
                      [ READY ]
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-md px-4">
            <div className="flex justify-between text-[0.48rem] tracking-widest mb-1">
              <span style={{ color: "#1a4a6a" }}>SYSTEM BOOT PROGRESS</span>
              <span style={{ color: "#00d4ff" }}>{progress}%</span>
            </div>
            <div
              className="h-0.75 w-full rounded-full"
              style={{
                background: "rgba(0,212,255,0.08)",
                border: "1px solid rgba(0,212,255,0.12)",
              }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, #00d4ff, #a855f7, #00ffea)",
                  boxShadow: "0 0 10px #00d4ff88",
                }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
