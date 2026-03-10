import { SEVERITY_COLOR } from "../data/constants";

export default function ThreatTicker({ logs }) {
  const items = logs.slice(0, 22);

  return (
    <div
      className="shrink-0 overflow-hidden"
      style={{
        height: 24,
        background: "rgba(0,0,0,0.4)",
        borderTop: "1px solid rgba(0,212,255,0.1)",
        borderBottom: "1px solid rgba(0,212,255,0.1)",
      }}
    >
      <div className="flex items-center h-full">
        {/* Static label */}
        <div
          className="shrink-0 flex items-center gap-1.5 px-3 h-full border-r"
          style={{
            borderColor: "rgba(0,212,255,0.15)",
            background: "rgba(255,0,0,0.08)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full anim-blink shrink-0"
            style={{ background: "#ff2d2d", boxShadow: "0 0 5px #ff2d2d" }}
          />
          <span
            className="font-['Orbitron'] text-[0.44rem] tracking-[2.5px] shrink-0"
            style={{ color: "#ff4444" }}
          >
            LIVE FEED
          </span>
        </div>

        {/* Scrolling items */}
        <div className="flex-1 overflow-hidden relative">
          <div className="ticker-track">
            {[...items, ...items].map((log, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 shrink-0 mx-4"
              >
                <span
                  className="text-[0.46rem]"
                  style={{ color: "rgba(0,212,255,0.4)" }}
                >
                  {log.time}
                </span>
                <span
                  className="text-[0.5rem] font-bold font-['Share Tech Mono']"
                  style={{
                    color: SEVERITY_COLOR[log.severity] || "#00d4ff",
                    textShadow: `0 0 6px ${SEVERITY_COLOR[log.severity] || "#00d4ff"}88`,
                  }}
                >
                  ⚡ {log.type}
                </span>
                <span
                  className="text-[0.44rem]"
                  style={{ color: "rgba(0,212,255,0.3)" }}
                >
                  [{log.ip}]
                </span>
                <span
                  className="text-[0.4rem]"
                  style={{ color: "rgba(0,212,255,0.15)" }}
                >
                  ◆
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
