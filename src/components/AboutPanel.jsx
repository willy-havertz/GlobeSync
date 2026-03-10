import { memo } from "react";

const FEEDS = [
  { label: "Feodo Tracker", detail: "Botnet C2 IPs — no key required" },
  { label: "ThreatFox", detail: "Malware IOC feed via abuse.ch" },
  { label: "URLhaus", detail: "Active malware-hosting IPs" },
  { label: "AbuseIPDB", detail: "Abuse-score enrichment (1k/day)" },
  { label: "AlienVault OTX", detail: "Subscribed pulse IOCs" },
];

const PANELS = [
  {
    icon: "🌐",
    label: "ATTACK MAP",
    detail:
      "Live 3-D globe — arcs trace active attack vectors across 180+ countries.",
  },
  {
    icon: "📋",
    label: "LIVE LOGS",
    detail:
      "Streaming event feed with IP, type, severity and timestamp per threat.",
  },
  {
    icon: "💊",
    label: "SYSTEM HEALTH",
    detail:
      "Four gauges — Network, Firewall, Risk Score and Block Rate, all derived from live data.",
  },
  {
    icon: "🔌",
    label: "ATTACKED PORTS",
    detail:
      "Ranked list of most-targeted TCP/UDP ports, updated each feed cycle.",
  },
  {
    icon: "📊",
    label: "ANALYTICS",
    detail:
      "Threat Activity chart (32 min window) and Attack Distribution bar chart.",
  },
  {
    icon: "🔢",
    label: "STAT COUNTERS",
    detail:
      "Cumulative totals — Intrusions, Malware, DDoS and Threats via live WebSocket.",
  },
  {
    icon: "🔔",
    label: "TOAST ALERTS",
    detail:
      "Critical/High severity events surfaced as dismissible overlay notifications.",
  },
  {
    icon: "📡",
    label: "THREAT TICKER",
    detail:
      "Scrolling feed under the header showing the latest events as they arrive.",
  },
];

const STACK = [
  { label: "React 18", color: "#61dafb" },
  { label: "Vite 7", color: "#646cff" },
  { label: "FastAPI", color: "#009688" },
  { label: "WebSocket", color: "#00d4ff" },
  { label: "globe.gl", color: "#00ff88" },
  { label: "Three.js", color: "#dddddd" },
  { label: "Recharts", color: "#8884d8" },
  { label: "Framer Motion", color: "#ff61a6" },
  { label: "Tailwind v4", color: "#38bdf8" },
];

/* ── Sidebar — 200 px left column on desktop ──────────────────────────────── */
function SidebarAbout() {
  return (
    <div className="flex flex-col glass anim-flicker hud-corners overflow-hidden h-full">
      <div className="panel-title" style={{ fontSize: "0.52rem" }}>
        <span className="dot" />
        <span>ABOUT GLOBESYNC AI</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-2.5 min-h-0">
        {/* One-liner */}
        <p className="text-[0.56rem] text-cyan-700 leading-relaxed">
          AI-powered cyber-intelligence platform. Aggregates five live threat
          feeds, maps global attack vectors on a 3-D globe and monitors system
          security posture in real time.
        </p>

        {/* Dashboard panels */}
        <section className="flex flex-col gap-1">
          <div className="text-[0.48rem] tracking-[2px] text-cyan-800 font-bold uppercase mb-0.5">
            Dashboard Panels
          </div>
          {PANELS.map((p) => (
            <div key={p.label} className="flex gap-1.5 items-start">
              <span className="text-[0.75rem] leading-none mt-px shrink-0">
                {p.icon}
              </span>
              <div>
                <div className="font-['Orbitron'] text-[0.5rem] font-bold text-cyan-400 tracking-widest leading-tight">
                  {p.label}
                </div>
                <p className="text-[0.5rem] text-cyan-800 leading-relaxed mt-0.5">
                  {p.detail}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Intelligence feeds */}
        <section className="flex flex-col gap-1">
          <div className="text-[0.48rem] tracking-[2px] text-cyan-800 font-bold uppercase mb-0.5">
            Intelligence Feeds
          </div>
          {FEEDS.map((f) => (
            <div key={f.label} className="flex flex-col">
              <span className="font-['Orbitron'] text-[0.5rem] text-cyan-400 font-bold">
                {f.label}
              </span>
              <span className="text-[0.48rem] text-cyan-800">{f.detail}</span>
            </div>
          ))}
        </section>

        {/* Tech stack */}
        <section className="flex flex-col gap-1">
          <div className="text-[0.48rem] tracking-[2px] text-cyan-800 font-bold uppercase mb-0.5">
            Tech Stack
          </div>
          <div className="flex flex-wrap gap-1">
            {STACK.map((s) => (
              <span
                key={s.label}
                className="text-[0.46rem] px-1.5 py-0.5 rounded font-['Orbitron'] font-bold"
                style={{
                  color: s.color,
                  background: `${s.color}18`,
                  border: `1px solid ${s.color}30`,
                }}
              >
                {s.label}
              </span>
            ))}
          </div>
        </section>

        {/* Footer */}
        <p className="text-[0.44rem] tracking-[2px] text-cyan-900 text-center uppercase pt-1 border-t border-cyan-950/40">
          GlobeSync AI · v2.0 · © 2026
        </p>
      </div>
    </div>
  );
}

/* ── Drawer — inside mobile nav menu ─────────────────────────────────────── */
function DrawerAbout() {
  return (
    <div className="flex flex-col gap-2.5">
      <div>
        <div className="font-['Orbitron'] text-[0.62rem] font-black tracking-[3px] text-cyan-400 uppercase mb-1">
          About GlobeSync AI
        </div>
        <p className="text-[0.58rem] text-cyan-700 leading-relaxed">
          AI-powered cybersecurity intelligence platform — aggregates five live
          threat feeds, maps global attack vectors on a 3-D globe and monitors
          your system security posture in real time.
        </p>
      </div>

      {/* Panel feature cards 2-col */}
      <div className="grid grid-cols-2 gap-1.5">
        {PANELS.map((p) => (
          <div
            key={p.label}
            className="flex gap-1.5 items-start px-2 py-2 rounded-md"
            style={{
              background: "rgba(0,212,255,0.04)",
              border: "1px solid rgba(0,212,255,0.09)",
            }}
          >
            <span className="text-sm leading-none mt-0.5 shrink-0">
              {p.icon}
            </span>
            <div>
              <div className="font-['Orbitron'] text-[0.5rem] font-bold tracking-wider text-cyan-300">
                {p.label}
              </div>
              <div className="text-[0.48rem] text-cyan-800 mt-0.5 leading-relaxed">
                {p.detail}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feeds */}
      <div
        className="px-3 py-2 rounded-md flex flex-col gap-1"
        style={{
          background: "rgba(0,212,255,0.03)",
          border: "1px solid rgba(0,212,255,0.08)",
        }}
      >
        <div className="text-[0.5rem] tracking-[2px] text-cyan-600 font-bold uppercase mb-0.5">
          Intelligence Feeds
        </div>
        {FEEDS.map((f) => (
          <div key={f.label} className="flex items-baseline gap-1.5">
            <span className="w-1 h-1 rounded-full bg-cyan-600 shrink-0 mt-1" />
            <span className="font-['Orbitron'] text-[0.5rem] text-cyan-400 font-bold shrink-0">
              {f.label}
            </span>
            <span className="text-[0.46rem] text-cyan-800 truncate">
              {f.detail}
            </span>
          </div>
        ))}
      </div>

      {/* Tech stack chips */}
      <div className="flex flex-wrap gap-1">
        {STACK.map((s) => (
          <span
            key={s.label}
            className="text-[0.46rem] px-1.5 py-0.5 rounded font-['Orbitron'] font-bold"
            style={{
              color: s.color,
              background: `${s.color}18`,
              border: `1px solid ${s.color}28`,
            }}
          >
            {s.label}
          </span>
        ))}
      </div>

      <div className="text-[0.46rem] tracking-[2px] text-cyan-900 text-center uppercase">
        GlobeSync AI · Cyber Intelligence Platform · v2.0 · © 2026
      </div>
    </div>
  );
}

export default memo(function AboutPanel({ variant = "sidebar" }) {
  if (variant === "drawer") return <DrawerAbout />;
  return <SidebarAbout />;
});
