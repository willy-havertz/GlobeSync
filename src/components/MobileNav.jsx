import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import CsiLogo from "./CsiLogo";

const NAV_ITEMS = [
  {
    id: "section-health",
    label: "SYSTEM HEALTH",
    desc: "Network & firewall gauges",
  },
  {
    id: "section-threat",
    label: "THREAT LEVEL",
    desc: "Risk score & block rate",
  },
  {
    id: "section-threat-activity",
    label: "THREAT ACTIVITY",
    desc: "Activity chart — last 32 min",
  },
  {
    id: "section-logs",
    label: "TIME LOGS",
    desc: "Real-time event feed",
  },
];

export default function MobileNav({ onOpenAbout }) {
  const [open, setOpen] = useState(false);

  const scrollTo = (id) => {
    setOpen(false);
    setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 230); // wait for drawer exit animation
  };

  const handleAbout = () => {
    setOpen(false);
    setTimeout(() => onOpenAbout?.(), 230);
  };

  return (
    <>
      {/* ── Hamburger button ── */}
      <button
        className="lg:hidden flex flex-col justify-center gap-1.5 w-9 h-9 shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label="Toggle navigation"
      >
        <span
          className="block w-full h-0.5 bg-cyan-400 rounded origin-center transition-all duration-250"
          style={{ transform: open ? "translateY(8px) rotate(45deg)" : "none" }}
        />
        <span
          className="block w-full h-0.5 bg-cyan-400 rounded transition-all duration-250"
          style={{
            opacity: open ? 0 : 1,
            transform: open ? "scaleX(0)" : "none",
          }}
        />
        <span
          className="block w-full h-0.5 bg-cyan-400 rounded origin-center transition-all duration-250"
          style={{
            transform: open ? "translateY(-8px) rotate(-45deg)" : "none",
          }}
        />
      </button>

      {createPortal(
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.70)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.nav
              className="fixed top-0 left-0 z-50 flex flex-col"
              style={{
                width: 280,
                height: "100dvh",
                background: "rgba(3,9,26,0.88)",
                backdropFilter: "blur(20px) saturate(1.6)",
                WebkitBackdropFilter: "blur(20px) saturate(1.6)",
                borderRight: "1px solid rgba(0,212,255,0.28)",
                boxShadow:
                  "6px 0 60px rgba(0,212,255,0.14), 0 0 0 1px rgba(0,212,255,0.06) inset",
              }}
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Header (fixed) ── */}
              <div
                className="flex items-center gap-3 px-5 py-4 shrink-0"
                style={{ borderBottom: "1px solid rgba(0,212,255,0.14)" }}
              >
                <CsiLogo size={40} />
                <div>
                  <div className="font-['Orbitron'] text-sm font-black tracking-widest text-cyan-400 leading-tight">
                    Globe<span className="text-white">Sync</span> AI
                  </div>
                  <div className="text-[0.55rem] tracking-[3px] text-cyan-700 mt-0.5 uppercase">
                    Intelligence Platform
                  </div>
                </div>
              </div>

              {/* ── Scrollable content ── */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {/* ABOUT button */}
                <div className="px-3 pt-4 pb-2">
                  <motion.button
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.2 }}
                    onClick={handleAbout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer"
                    style={{
                      background: "rgba(0,212,255,0.10)",
                      border: "1px solid rgba(0,212,255,0.45)",
                      boxShadow: "0 0 18px rgba(0,212,255,0.2), inset 0 1px 0 rgba(0,212,255,0.15)",
                      transition: "all 0.18s ease",
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.background = "rgba(0,212,255,0.22)";
                      e.currentTarget.style.boxShadow = "0 0 28px rgba(0,212,255,0.4)";
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.background = "rgba(0,212,255,0.10)";
                      e.currentTarget.style.boxShadow = "0 0 18px rgba(0,212,255,0.2), inset 0 1px 0 rgba(0,212,255,0.15)";
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(0,212,255,0.20)";
                      e.currentTarget.style.boxShadow = "0 0 28px rgba(0,212,255,0.38), inset 0 1px 0 rgba(0,212,255,0.2)";
                      e.currentTarget.style.borderColor = "rgba(0,212,255,0.7)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(0,212,255,0.10)";
                      e.currentTarget.style.boxShadow = "0 0 18px rgba(0,212,255,0.2), inset 0 1px 0 rgba(0,212,255,0.15)";
                      e.currentTarget.style.borderColor = "rgba(0,212,255,0.45)";
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0 anim-blink"
                      style={{ background: "#00d4ff", boxShadow: "0 0 8px #00d4ff" }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-['Orbitron'] text-[0.68rem] font-bold tracking-widest text-cyan-200">
                        ABOUT
                      </div>
                      <div className="text-[0.58rem] text-cyan-500 mt-0.5">
                        Platform overview &amp; features
                      </div>
                    </div>
                    <span className="text-cyan-300 text-base shrink-0 font-bold">›</span>
                  </motion.button>
                </div>

                {/* Divider + nav label */}
                <div
                  className="px-5 pt-3 pb-2"
                  style={{ borderTop: "1px solid rgba(0,212,255,0.12)" }}
                >
                  <span className="text-[0.5rem] tracking-[3px] text-cyan-500 uppercase font-bold">
                    Navigate To
                  </span>
                </div>

                {/* Nav items */}
                <div className="px-3 pb-4 flex flex-col gap-1.5">
                  {NAV_ITEMS.map((item, i) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.2 }}
                      onClick={() => scrollTo(item.id)}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-left rounded-md"
                      style={{
                        background: "rgba(0,212,255,0.07)",
                        border: "1px solid rgba(0,212,255,0.18)",
                      }}
                      onTouchStart={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(0,212,255,0.18)")
                      }
                      onTouchEnd={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(0,212,255,0.07)")
                      }
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(0,212,255,0.14)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(0,212,255,0.07)")
                      }
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-['Orbitron'] text-[0.65rem] font-bold tracking-widest text-cyan-300">
                          {item.label}
                        </div>
                        <div className="text-[0.58rem] text-cyan-500 mt-0.5 truncate">
                          {item.desc}
                        </div>
                      </div>
                      <span className="text-cyan-400 text-sm shrink-0">›</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* ── Close button (fixed at bottom) ── */}
              <div
                className="px-4 py-3 shrink-0"
                style={{ borderTop: "1px solid rgba(255,45,45,0.18)" }}
              >
                <button
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md"
                  style={{
                    background: "rgba(255,45,45,0.08)",
                    border: "1px solid rgba(255,45,45,0.30)",
                  }}
                  onTouchStart={(e) =>
                    (e.currentTarget.style.background = "rgba(255,45,45,0.20)")
                  }
                  onTouchEnd={(e) =>
                    (e.currentTarget.style.background = "rgba(255,45,45,0.08)")
                  }
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(255,45,45,0.16)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "rgba(255,45,45,0.08)")
                  }
                >
                  <span className="text-red-400 text-xl leading-none font-bold">
                    ✕
                  </span>
                  <span className="font-['Orbitron'] text-[0.65rem] tracking-[3px] text-red-400 font-bold">
                    CLOSE MENU
                  </span>
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
      , document.body)}
    </>
  );
}
