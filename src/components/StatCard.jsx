import { motion } from "framer-motion";

const PALETTE = {
  cyan: {
    border: "glass",
    text: "#00d4ff",
    shadow: "0 0 24px #00d4ff44",
    edge: "#00d4ff88",
  },
  red: {
    border: "glass-red",
    text: "#ff4444",
    shadow: "0 0 24px #ff2d2d44",
    edge: "#ff444488",
  },
  purple: {
    border: "glass-purple",
    text: "#c084fc",
    shadow: "0 0 24px #a855f744",
    edge: "#c084fc88",
  },
  green: {
    border: "glass",
    text: "#00ff88",
    shadow: "0 0 24px #00ff8844",
    edge: "#00ff8888",
  },
  orange: {
    border: "glass",
    text: "#ff8800",
    shadow: "0 0 24px #ff880044",
    edge: "#ff880088",
  },
};

export default function StatCard({ label, value, accent, trend }) {
  const p = PALETTE[accent] || PALETTE.cyan;

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${p.border} px-3 py-2 overflow-hidden cursor-default stat-card`}
      style={{ boxShadow: p.shadow }}
    >
      {/* Depth accent — bottom edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${p.edge}, transparent)`,
          boxShadow: `0 0 10px ${p.edge}`,
        }}
      />
      {/* Depth accent — left edge */}
      <div
        className="absolute top-0 left-0 bottom-0 w-0.5 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, transparent, ${p.edge}, transparent)`,
        }}
      />

      {/* Label */}
      <div className="text-[0.5rem] tracking-[2px] text-cyan-700 uppercase mb-px">
        {label}
      </div>

      {/* Value */}
      <motion.div
        className="font-['Orbitron'] text-xl font-bold tabular-nums"
        key={value}
        initial={{ scale: 1.3, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ color: p.text, textShadow: `0 0 16px ${p.text}bb` }}
      >
        {value.toLocaleString()}
      </motion.div>

      {trend && (
        <div className="text-[0.5rem] mt-px" style={{ color: p.text }}>
          ▲ {trend}
        </div>
      )}
    </div>
  );
}
