import { motion, AnimatePresence } from "framer-motion";

const SEVERITY_BG = {
  CRITICAL: {
    border: "#ff2d2d",
    bg: "rgba(255,45,45,0.08)",
    dot: "#ff2d2d",
    text: "#ff5555",
  },
  HIGH: {
    border: "#ff8800",
    bg: "rgba(255,136,0,0.07)",
    dot: "#ff8800",
    text: "#ff9922",
  },
  MEDIUM: {
    border: "#ffcc00",
    bg: "rgba(255,204,0,0.06)",
    dot: "#ffcc00",
    text: "#ffdd44",
  },
};

export default function ToastAlert({ toasts, onDismiss }) {
  return (
    <div
      className="fixed top-16 right-3 z-999 flex flex-col gap-2 pointer-events-none"
      style={{ maxWidth: 270 }}
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const s = SEVERITY_BG[toast.severity] || SEVERITY_BG.HIGH;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 90, scale: 0.88 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 90, scale: 0.88 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="pointer-events-auto cursor-pointer rounded-sm overflow-hidden"
              style={{
                background: s.bg,
                border: `1px solid ${s.border}44`,
                borderLeft: `3px solid ${s.border}`,
                boxShadow: `0 0 20px ${s.border}22, 0 2px 16px rgba(0,0,0,0.5)`,
              }}
              onClick={() => onDismiss(toast.id)}
            >
              {/* Top bar */}
              <div
                className="flex items-center gap-2 px-3 py-1.5"
                style={{ borderBottom: `1px solid ${s.border}22` }}
              >
                <span
                  className="w-2 h-2 rounded-full anim-blink shrink-0"
                  style={{ background: s.dot, boxShadow: `0 0 6px ${s.dot}` }}
                />
                <span
                  className="font-['Orbitron'] text-[0.52rem] font-black tracking-[2px]"
                  style={{ color: s.text }}
                >
                  {toast.severity} ALERT
                </span>
                <span
                  className="ml-auto text-[0.4rem] tracking-widest"
                  style={{ color: `${s.dot}88` }}
                >
                  {toast.time}
                </span>
              </div>

              {/* Body */}
              <div className="px-3 py-1.5">
                <p
                  className="text-[0.55rem] font-bold font-['Share Tech Mono'] mb-1"
                  style={{ color: s.text }}
                >
                  {toast.type}
                </p>
                <p className="text-[0.46rem]" style={{ color: `${s.dot}99` }}>
                  SRC: {toast.ip}
                </p>
                <p
                  className="text-[0.4rem] mt-1 tracking-widest"
                  style={{ color: `${s.dot}44` }}
                >
                  CLICK TO DISMISS
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
