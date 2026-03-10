import { memo } from "react";

function CircularGauge({ pct, color, label, sublabel }) {
  const r = 37;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - pct / 100);
  const txtColor = {
    cyan: "#00d4ff",
    red: "#ff4444",
    purple: "#c084fc",
    green: "#00ff88",
  }[color];

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-2 px-1">
      <svg viewBox="0 0 100 100" className="w-20 h-20 anim-float">
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke={`${txtColor}15`}
          strokeWidth="1"
          strokeDasharray="3 3"
          className="spinning-ring"
        />
        <circle className="gauge-bg" cx="50" cy="50" r={r} />
        <circle
          className={`gauge-track ${color}`}
          cx="50"
          cy="50"
          r={r}
          strokeDasharray={circ}
          strokeDashoffset={off}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50px 50px",
            transition: "stroke-dashoffset 1.5s ease-out",
          }}
        />
        <text
          x="50"
          y="46"
          fill={txtColor}
          fontFamily="Orbitron,sans-serif"
          fontSize="15"
          fontWeight="700"
          dominantBaseline="middle"
          textAnchor="middle"
        >
          {pct}%
        </text>
        <text
          x="50"
          y="59"
          fill={`${txtColor}99`}
          fontFamily="Share Tech Mono,monospace"
          fontSize="6.5"
          dominantBaseline="middle"
          textAnchor="middle"
        >
          {sublabel}
        </text>
      </svg>
      <p
        className="font-['Orbitron'] text-[0.5rem] tracking-[2.5px] mt-1 font-bold"
        style={{ color: txtColor }}
      >
        {label.toUpperCase()}
      </p>
    </div>
  );
}

export default memo(CircularGauge);
