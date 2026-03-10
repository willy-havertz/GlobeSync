import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { randInt } from "../data/constants";

const BASE_PORTS = [
  { port: 80, name: "HTTP", base: 1204, color: "#00d4ff" },
  { port: 443, name: "HTTPS", base: 847, color: "#00ffea" },
  { port: 22, name: "SSH", base: 936, color: "#ff8800" },
  { port: 3389, name: "RDP", base: 621, color: "#ff4444" },
  { port: 445, name: "SMB", base: 389, color: "#a855f7" },
];

function PortsPanel() {
  const [counts, setCounts] = useState(() =>
    BASE_PORTS.map((p) => ({ ...p, count: p.base + randInt(0, 180) })),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setCounts((prev) =>
        prev.map((p) => ({ ...p, count: p.count + randInt(0, 14) })),
      );
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const max = Math.max(...counts.map((p) => p.count));

  return (
    <div
      className="glass anim-flicker flex flex-col shrink-0"
      style={{ height: 130 }}
    >
      <div className="panel-title">
        <span className="dot" />
        TOP ATTACKED PORTS
      </div>
      <div className="flex-1 flex flex-col justify-around px-3 py-1.5">
        {counts.map(({ port, name, count, color }) => {
          const pct = (count / max) * 100;
          return (
            <div key={port} className="flex flex-col gap-px">
              <div className="flex items-center justify-between">
                <span className="text-[0.48rem] font-['Share Tech Mono']">
                  <span style={{ color }}>:{port}</span>
                  <span style={{ color: "rgba(0,212,255,0.45)" }}> {name}</span>
                </span>
                <motion.span
                  key={count}
                  initial={{ scale: 1.15, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="font-['Orbitron'] text-[0.46rem] font-bold"
                  style={{ color }}
                >
                  {count.toLocaleString()}
                </motion.span>
              </div>
              <div
                className="h-0.75 rounded-full"
                style={{ background: "rgba(0,212,255,0.07)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}33, ${color})`,
                    boxShadow: `0 0 5px ${color}66`,
                    transition: "width 1s ease-out",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(PortsPanel);
