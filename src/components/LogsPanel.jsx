import { motion, AnimatePresence } from "framer-motion";
import { SEVERITY_COLOR } from "../data/constants";

export default function LogsPanel({ logs }) {
  return (
    <div
      className="flex flex-col glass anim-flicker overflow-hidden h-full"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="panel-title">
        <span className="dot" />
        <span>REAL-TIME LOGS</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {logs.slice(0, 40).map((log) => (
            <motion.div
              key={log.id}
              initial={{
                opacity: 0,
                x: -20,
                backgroundColor: "rgba(0,212,255,.12)",
              }}
              animate={{ opacity: 1, x: 0, backgroundColor: "rgba(0,0,0,0)" }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.35 }}
              whileHover={{ z: 6, backgroundColor: "rgba(0,212,255,0.05)" }}
              className="grid px-2 py-1.5 border-b border-cyan-950/50 cursor-default text-[0.58rem]"
              style={{
                gridTemplateColumns: "50px 1fr",
                transformStyle: "preserve-3d",
                transition: "transform 0.15s ease",
              }}
            >
              <span className="text-cyan-800 whitespace-nowrap pt-px">
                {log.time}
              </span>
              <div className="flex flex-col gap-px">
                <span
                  className={`font-bold ${log.cls} flex items-center gap-1`}
                  style={{ transform: "translateZ(4px)" }}
                >
                  <span
                    style={{
                      color: SEVERITY_COLOR[log.severity],
                      fontSize: "6px",
                    }}
                  >
                    ●
                  </span>
                  {log.type}
                </span>
                <span className="text-[#336688] text-[0.5rem]">
                  IP: {log.ip}
                  <span className="ml-2 opacity-60">[{log.severity}]</span>
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
