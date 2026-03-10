import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CsiLogo from "./CsiLogo";

/* ── Data ─────────────────────────────────────────────────────────────── */
const PANELS = [
  {
    icon: "🌐",
    label: "Global Attack Map",
    desc: "An interactive 3-D globe renders live cyberattack arcs between origin and target countries. Over 180 nations are monitored simultaneously. Arc colour, thickness and pulse rate encode severity — from low-confidence reconnaissance sweeps to confirmed critical intrusions.",
  },
  {
    icon: "📋",
    label: "Time Logs",
    desc: "A real-time event stream showing every threat as it arrives: source IP, geolocation, attack classification, MITRE ATT&CK category, severity level and precise timestamp. Events are colour-coded by severity and persist in a scrollable history for the current session.",
  },
  {
    icon: "💊",
    label: "System Health",
    desc: "Two circular gauges track Network Integrity and Firewall Status derived from live feed ratios. Gauges animate smoothly between states and shift from green through amber to red as conditions degrade — providing instant situational awareness without reading raw numbers.",
  },
  {
    icon: "🔴",
    label: "Threat Level",
    desc: "Risk Score and Blocked-Rate gauges computed dynamically from the rolling ratio of malware, DDoS, phishing and intrusion events in the current data window. The Risk Score rises as critical events cluster; Blocked Rate reflects how many threats the perimeter suppressed.",
  },
  {
    icon: "📊",
    label: "Threat Activity",
    desc: "A 32-point area chart plotting the last ~30 minutes of activity broken into Malware, DDoS and Phishing trend lines. The chart refreshes every simulation cycle and provides a visual signal of attack waves, campaign bursts and overall intensity over time.",
  },
  {
    icon: "📈",
    label: "Attack Distribution",
    desc: "A stacked bar chart showing the proportional breakdown of attack types for the current session — Intrusion Attempts, Malware Drops, DDoS Floods, Phishing Lures and Ransomware deployments. Instantly reveals the dominant threat vector for the period.",
  },
  {
    icon: "🔌",
    label: "Attacked Ports",
    desc: "A ranked live table of the most-scanned and most-attacked TCP/UDP ports, updated each feed cycle. Displays port number, service name and relative hit count. Common targets like port 22 (SSH), 3389 (RDP) and 443 (HTTPS) surface immediately when campaigns begin.",
  },
  {
    icon: "🔢",
    label: "Stat Counters",
    desc: "Session-cumulative counters for Total Threats Detected, Intrusion Attempts, Malware Detections and DDoS Events. All four counters tick upward in real time driven by the WebSocket event stream, giving a running tally of session exposure.",
  },
  {
    icon: "🔔",
    label: "Toast Alerts",
    desc: "Critical and High-severity events surface as full-colour overlay toast notifications in the corner of the screen — so analysts are never dependent on watching the scrolling log. Toasts include source, type and severity, and auto-dismiss after 5.5 seconds.",
  },
  {
    icon: "📡",
    label: "Threat Ticker",
    desc: "A horizontally auto-scrolling ticker beneath the header shows the latest events as they stream in — source country, attack type and severity. Provides ambient awareness of live activity at a glance without interrupting focus on any individual panel.",
  },
];

const FEEDS = [
  {
    label: "Feodo Tracker",
    badge: "No key",
    url: "feodotracker.abuse.ch",
    category: "Botnet C2",
    desc: "Maintained by abuse.ch, Feodo Tracker lists active command-and-control server IPs for Emotet, TrickBot, QakBot, Dridex and Bumblebee malware families. Updated every 5 minutes — one of the fastest public botnet feeds available.",
  },
  {
    label: "ThreatFox",
    badge: "Free key",
    url: "threatfox.abuse.ch",
    category: "IOC Feed",
    desc: "A community-driven indicator-of-compromise database by abuse.ch. Provides malicious IP:port pairs with malware family tags, confidence scores and first- and last-seen timestamps. Free API key required.",
  },
  {
    label: "URLhaus",
    badge: "Free key",
    url: "urlhaus.abuse.ch",
    category: "Malware URLs",
    desc: "Tracks URLs currently distributing malware. GlobeSync extracts the host IPs from active entries, geolocates them and plots them on the globe as active malware distribution nodes.",
  },
  {
    label: "AbuseIPDB",
    badge: "Free key",
    url: "abuseipdb.com",
    category: "IP Reputation",
    desc: "Enriches every detected IP with an abuse-confidence score (0–100%) and attack-category tags reported by the community. Up to 1,000 lookups per day on the free tier.",
  },
  {
    label: "AlienVault OTX",
    badge: "Free key",
    url: "otx.alienvault.com",
    category: "Threat Intel",
    desc: "Open Threat Exchange provides crowd-sourced IOC pulses authored by 200,000+ researchers worldwide. GlobeSync subscribes to general-threat pulses for real-time IPs and hostnames.",
  },
];

const STACK = [
  { label: "React 18", color: "#61dafb", note: "UI framework" },
  { label: "Vite 7", color: "#646cff", note: "Build tooling" },
  { label: "FastAPI", color: "#009688", note: "REST + WS backend" },
  { label: "WebSocket", color: "#00d4ff", note: "Live data stream" },
  { label: "globe.gl", color: "#00ff88", note: "3-D globe renderer" },
  { label: "Three.js", color: "#cccccc", note: "WebGL engine" },
  { label: "Recharts", color: "#8884d8", note: "Chart library" },
  { label: "Framer Motion", color: "#ff61a6", note: "Animations" },
  { label: "Tailwind v4", color: "#38bdf8", note: "Utility CSS" },
  { label: "Python 3.12", color: "#ffd140", note: "Backend runtime" },
  { label: "httpx", color: "#22c55e", note: "Async HTTP client" },
  { label: "GeoIP2", color: "#a78bfa", note: "IP geolocation" },
  { label: "Uvicorn", color: "#f97316", note: "ASGI server" },
  { label: "asyncio", color: "#64748b", note: "Concurrency model" },
  { label: "vite-plugin-pwa", color: "#22c55e", note: "PWA / service worker" },
  { label: "Workbox", color: "#ffd140", note: "Cache strategy" },
];

const THREAT_LEVELS = [
  {
    level: "CRITICAL",
    color: "#ff2d2d",
    examples: "Ransomware, active C2 beaconing, confirmed exfiltration",
    desc: "Immediate response required. Event indicates confirmed compromise or active ongoing attack with direct impact on systems. Triggers toast alert overlay.",
  },
  {
    level: "HIGH",
    color: "#ff8800",
    examples: "ThreatFox IOC match, URLhaus active malware URL",
    desc: "Significant threat with high confidence. Feed-confirmed malicious indicator with verifiable attribution to a known malware family or campaign.",
  },
  {
    level: "MEDIUM",
    color: "#ffcc00",
    examples: "AbuseIPDB score 50–79, brute-force login attempts",
    desc: "Suspicious activity with partial attribution. Known-bad activity pattern but not yet confirmed as active campaign. Requires monitoring.",
  },
  {
    level: "LOW",
    color: "#00d4ff",
    examples: "Reconnaissance scan, port probe, AbuseIPDB score <50",
    desc: "Low-confidence signal. Common background noise or early-stage reconnaissance that may not develop into a full attack. Logged for pattern analysis.",
  },
];

const ATTACK_CATEGORIES = [
  {
    name: "MALWARE",
    color: "#ff2d2d",
    desc: "Malicious software delivery or execution — includes ransomware, trojans, RATs and droppers detected by ThreatFox and URLhaus.",
  },
  {
    name: "DDOS",
    color: "#ff8800",
    desc: "Distributed denial-of-service flood traffic. Typically sourced from Feodo-tracked botnet C2 infrastructure coordinating compromised hosts.",
  },
  {
    name: "PHISHING",
    color: "#ffcc00",
    desc: "Credential harvesting or deceptive lure campaigns. Identified via URLhaus phishing entries and OTX community-reported phishing pulses.",
  },
  {
    name: "BRUTEFORCE",
    color: "#a855f7",
    desc: "Repeated credential stuffing or password spray attempts against exposed services such as SSH (22), RDP (3389) and web logins (443).",
  },
  {
    name: "RANSOMWARE",
    color: "#ff61a6",
    desc: "Ransomware payload delivery infrastructure — domains, IPs and URLs attributed to active ransomware groups by ThreatFox family tags.",
  },
  {
    name: "SQLINJECT",
    color: "#00ff88",
    desc: "SQL injection probes targeting exposed web applications. Identified from OTX pulses and AbuseIPDB reports of web attack categories.",
  },
  {
    name: "C2",
    color: "#00d4ff",
    desc: "Command and control callback IPs. Primary source is Feodo Tracker which lists active botnet C2 servers for Emotet, TrickBot, QakBot and allied families.",
  },
  {
    name: "MALWARE HOSTING",
    color: "#ffd140",
    desc: "Infrastructure actively serving malware payloads. Sourced from URLhaus active entries where status is confirmed online at time of polling.",
  },
];

const FAQ = [
  {
    q: "Does this show real cyberattacks happening right now?",
    a: "Yes — when API keys are configured, the threat events are pulled directly from live public threat intelligence feeds (ThreatFox, URLhaus, Feodo Tracker). The IPs, malware families and timestamps are real indicators reported by security researchers worldwide. Without keys the dashboard uses a realistic built-in simulator.",
  },
  {
    q: "Why does the globe show attacks from the same countries repeatedly?",
    a: "The feeds assign geographic origin based on where the malicious infrastructure is hosted, not necessarily where the human attacker is located. Countries with widespread broadband and lax takedown policies (Russia, China, the US, Germany) host large volumes of botnet C2 servers and malware distribution nodes regardless of the actual attacker nationality.",
  },
  {
    q: "How often does the data update?",
    a: "The backend polls all feeds every 60 seconds by default (configurable via the POLL_INTERVAL environment variable). When a feed returns new indicators, they are broadcast over WebSocket to all connected clients immediately — so the dashboard reflects the freshest available data within one poll cycle.",
  },
  {
    q: "Can I use this for real security operations?",
    a: "GlobeSync AI is built for education, research and situational awareness. It is not a certified SIEM or SOC tool. For operational security decisions, use the underlying feeds directly (ThreatFox, AbuseIPDB, etc.) through their own APIs with proper integration into your alert pipeline, SOAR or SIEM platform.",
  },
  {
    q: "Why is the globe showing a simulation instead of live data?",
    a: "The backend falls back to the built-in event simulator when all feed polls fail — usually because no API keys are configured. Add a free abuse.ch key (ABUSE_CH_KEY) to backend/.env to unlock ThreatFox and URLhaus. Feodo Tracker requires no key at all and should always be active when the backend is running with an internet connection.",
  },
  {
    q: "Can I add my own private threat feeds?",
    a: "Yes. The backend normalisation layer in feeds.py is designed to be extended. Add an async collector function that returns a list of event dicts matching the shared schema (type, ip, severity, country, lat, lon, time), then register it in the poll_all_real() function. No frontend changes are required.",
  },
  {
    q: "Is the app installable on mobile?",
    a: "Yes — GlobeSync AI is a Progressive Web App (PWA). On Android (Chrome) and iOS (Safari) you will see an option to add it to your home screen. Once installed it launches in standalone mode without browser chrome, caches the app shell for instant repeat loads, and shows a branded icon and splash screen.",
  },
];

const GETTING_STARTED = [
  {
    platform: "Android (Chrome)",
    color: "#22c55e",
    icon: "📱",
    steps: [
      "Open GlobeSync AI in Chrome on your Android device.",
      "Tap the three-dot menu (⋮) in the top-right corner.",
      'Select "Add to Home screen" or "Install app".',
      "Tap Install on the confirmation prompt.",
      "GlobeSync AI now appears on your home screen as a standalone app.",
    ],
  },
  {
    platform: "iPhone / iPad (Safari)",
    color: "#00d4ff",
    icon: "🍎",
    steps: [
      "Open GlobeSync AI in Safari (must be Safari, not Chrome).",
      "Tap the Share button at the bottom of the screen.",
      'Scroll down and tap "Add to Home Screen".',
      "Edit the name if you wish, then tap Add.",
      "The app icon appears on your home screen and opens fullscreen.",
    ],
  },
  {
    platform: "Desktop — Chrome or Edge",
    color: "#a78bfa",
    icon: "🖥️",
    steps: [
      "Open GlobeSync AI in Chrome or Edge on your computer.",
      "Look for the install icon (⊕) in the address bar on the right.",
      'Click it and select "Install" in the popup.',
      "The dashboard opens in its own window without browser controls.",
      "Find it in your Start Menu, Applications folder or desktop shortcut.",
    ],
  },
  {
    platform: "Any Other Browser",
    color: "#f97316",
    icon: "🌐",
    steps: [
      "Open GlobeSync AI in your browser.",
      "Bookmark the page for quick access (Ctrl+D / Cmd+D).",
      "For the best experience, Chrome, Edge or Samsung Internet are recommended as they fully support PWA installation.",
    ],
  },
];

const FUTURE_ENHANCEMENTS = [
  {
    icon: "🤖",
    color: "#00d4ff",
    title: "AI Anomaly Detection",
    desc: "Integrate an on-device ML model to detect behavioural anomalies in real time — flagging unusual traffic spikes, novel attack patterns and zero-day signatures before feeds report them.",
  },
  {
    icon: "🔐",
    color: "#a78bfa",
    title: "Multi-User Auth & RBAC",
    desc: "Role-based dashboards for SOC teams — analysts see raw feeds, managers see executive summaries. OAuth2 / OIDC sign-in with JWT session management.",
  },
  {
    icon: "📊",
    color: "#22c55e",
    title: "Report Export (PDF / CSV)",
    desc: "One-click incident report generation — export a snapshot of the current threat landscape, top IOCs and timeline as a formatted PDF or machine-readable CSV for SIEM ingestion.",
  },
  {
    icon: "🌐",
    color: "#f97316",
    title: "SIEM & Webhook Integration",
    desc: "Push critical events to Splunk, Elastic SIEM, Microsoft Sentinel or any webhook endpoint in real time. Configurable per-severity routing and custom payload templates.",
  },
  {
    icon: "📍",
    color: "#f43f5e",
    title: "Geo-Fencing Alerts",
    desc: "Define geographic regions of interest. Receive instant push notifications whenever a threat originates from or targets one of your monitored regions.",
  },
  {
    icon: "⏳",
    color: "#ff8800",
    title: "Historical Playback",
    shipped: true,
    desc: "Rewind the globe to any point in time and replay the attack timeline. Timeline scrubber, variable speed (1× – 10×), event counter and full incident detail panel — all live in v2 now.",
  },
  {
    icon: "🎨",
    color: "#06b6d4",
    title: "Custom Alert Rules & Themes",
    shipped: true,
    desc: "User-defined severity thresholds and alert rules, plus switchable HUD colour profiles (cyan, amber, red, green) to suit different deployment environments.",
  },
  {
    icon: "📱",
    color: "#8b5cf6",
    title: "Native Mobile App",
    desc: "Dedicated iOS and Android apps built with React Native, sharing the same backend WebSocket. Includes lock-screen widgets for live threat counters and home-screen attack map previews.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Feed Aggregation",
    desc: "The FastAPI backend polls five threat intelligence APIs concurrently every 60 seconds using async httpx. Raw data is normalised into a unified event schema regardless of source format.",
  },
  {
    step: "02",
    title: "IP Geolocation",
    desc: "Each unique IP extracted from the feeds is resolved to latitude/longitude coordinates using GeoIP2 (MaxMind GeoLite2 database), cached in memory to avoid redundant lookups.",
  },
  {
    step: "03",
    title: "WebSocket Broadcast",
    desc: "Processed events are pushed over a persistent WebSocket connection to all connected browser clients the moment they are available — zero HTTP polling, sub-second latency.",
  },
  {
    step: "04",
    title: "Live Visualisation",
    desc: "The React frontend processes the event stream in real time, updating the 3-D globe arcs, charts, gauges, counters and log feed simultaneously on every tick without a page reload.",
  },
];

/* ── Section wrapper ────────────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex items-center gap-2 px-3 py-1.5 -mx-1 rounded-sm"
        style={{
          background: "rgba(0,212,255,0.04)",
          borderLeft: "2px solid rgba(0,212,255,0.55)",
          borderBottom: "1px solid rgba(0,212,255,0.10)",
        }}
      >
        <span
          className="block w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: "#00d4ff", boxShadow: "0 0 6px #00d4ff" }}
        />
        <div className="font-['Orbitron'] text-[0.58rem] tracking-[4px] text-cyan-400 uppercase font-bold">
          {title}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────────────── */
export default function AboutModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center px-3 py-4"
          style={{
            background: "rgba(0,0,8,0.92)",
            backdropFilter: "blur(6px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-4xl"
            style={{ maxHeight: "92dvh" }}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Card — flex column so header is pinned and body scrolls */}
            <div
              className="flex flex-col overflow-hidden"
              style={{
                maxHeight: "92dvh",
                background: "rgba(2,8,24,1)",
                border: "1px solid rgba(0,212,255,0.35)",
                boxShadow:
                  "0 0 0 1px rgba(0,212,255,0.10), 0 0 80px rgba(0,212,255,0.18), 0 40px 100px rgba(0,0,0,0.95), inset 0 1px 0 rgba(0,212,255,0.20)",
              }}
            >
              {/* ── Hero header ─────────────────────────────────────────── */}
              <div
                className="relative px-6 py-6 overflow-hidden shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,212,255,0.09) 0%, rgba(0,50,80,0.18) 50%, rgba(0,0,20,0) 100%)",
                  borderBottom: "1px solid rgba(0,212,255,0.14)",
                }}
              >
                {/* subtle grid overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                <div className="relative flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0">
                      <CsiLogo size={64} />
                    </div>
                    <div>
                      <div
                        className="font-['Orbitron'] text-2xl sm:text-3xl font-black tracking-widest leading-tight"
                        style={{
                          background:
                            "linear-gradient(90deg, #00d4ff 0%, #ffffff 55%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        GlobeSync AI
                      </div>
                      <div className="text-[0.57rem] tracking-[5px] text-cyan-600 uppercase mt-1">
                        Real-Time Cyber Intelligence Platform
                      </div>
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        <Badge color="#22c55e">● LIVE</Badge>
                        <Badge color="#00d4ff">v2.0</Badge>
                        <Badge color="#a78bfa">5 FEEDS</Badge>
                        <Badge color="#f97316">180+ COUNTRIES</Badge>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-4 py-2 rounded font-['Orbitron'] text-[0.62rem] tracking-[2px] text-red-400 font-bold transition-all"
                    style={{
                      background: "rgba(255,45,45,0.07)",
                      border: "1px solid rgba(255,45,45,0.28)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,45,45,0.16)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,45,45,0.07)")
                    }
                  >
                    <span className="text-base leading-none">✕</span> CLOSE
                  </button>
                </div>
              </div>

              {/* ── Body (scrollable) ─────────────────────────────────────── */}
              <div className="px-6 py-7 flex flex-col gap-9 overflow-y-auto flex-1 min-h-0">
                {/* About GlobeSync ──────────────────────────────────────── */}
                <Section title="About GlobeSync AI">
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-cyan-200/90 leading-relaxed">
                      <strong className="text-cyan-400 font-['Orbitron'] text-[0.7rem] tracking-wider">
                        GlobeSync AI
                      </strong>{" "}
                      is a real-time cybersecurity intelligence dashboard built
                      to give security analysts, researchers and enthusiasts an
                      immediate, comprehensive view of the global threat
                      landscape — entirely in the browser. It aggregates live
                      data from five publicly available threat intelligence
                      feeds, enriches each indicator with geolocation data, and
                      renders everything simultaneously across an interactive
                      3-D globe, streaming charts, ranked tables and cumulative
                      counters.
                    </p>
                    <p className="text-[0.78rem] text-cyan-400/70 leading-relaxed">
                      Unlike dashboards that poll on a fixed schedule, GlobeSync
                      uses a persistent WebSocket connection between the FastAPI
                      backend and the React frontend. The moment the backend
                      processes a new batch of threat events every cycle, they
                      are pushed directly to every connected client — no cache,
                      no delay. Every panel on screen updates in lockstep: globe
                      arcs animate, gauges rotate, charts extend, log rows
                      appear and toast alerts fire for critical-severity events,
                      all within milliseconds of receipt.
                    </p>
                    <p className="text-[0.78rem] text-cyan-400/70 leading-relaxed">
                      The platform is deliberately source-agnostic — the
                      normalisation layer in{" "}
                      <code className="text-cyan-300 bg-cyan-950/60 px-1 rounded text-[0.72rem]">
                        backend/feeds.py
                      </code>{" "}
                      translates each feed's unique response format into a
                      shared event schema so the frontend never needs to know
                      which source generated a particular event. Adding a new
                      feed requires only a new async collector function with
                      zero changes to the frontend, making GlobeSync
                      straightforward to extend with private feeds, paid APIs or
                      custom honeypot data.
                    </p>

                    {/* Stat pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {[
                        { val: "5", label: "Live Feeds" },
                        { val: "180+", label: "Countries" },
                        { val: "12", label: "Panels" },
                        { val: "<1s", label: "Latency" },
                        { val: "PWA", label: "Installable" },
                        { val: "OSS", label: "Open Source" },
                        { val: "7", label: "Attack Types" },
                        { val: "4", label: "Severity Levels" },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="flex flex-col items-center py-3 rounded-md"
                          style={{
                            background: "rgba(0,212,255,0.05)",
                            border: "1px solid rgba(0,212,255,0.13)",
                          }}
                        >
                          <span className="font-['Orbitron'] text-xl font-black text-cyan-400 leading-none">
                            {s.val}
                          </span>
                          <span className="text-[0.52rem] tracking-[2px] text-cyan-700 uppercase mt-1">
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>

                {/* How It Works ────────────────────────────────────────── */}
                <Section title="How It Works">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {HOW_IT_WORKS.map((item) => (
                      <div
                        key={item.step}
                        className="flex gap-4 px-4 py-4 rounded-md"
                        style={{
                          background: "rgba(0,212,255,0.03)",
                          border: "1px solid rgba(0,212,255,0.10)",
                        }}
                      >
                        <div
                          className="font-['Orbitron'] text-2xl font-black leading-none shrink-0 mt-0.5"
                          style={{ color: "rgba(0,212,255,0.22)" }}
                        >
                          {item.step}
                        </div>
                        <div>
                          <div className="font-['Orbitron'] text-[0.64rem] font-bold tracking-widest text-cyan-300 mb-1.5">
                            {item.title}
                          </div>
                          <p className="text-[0.62rem] text-cyan-600 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Getting Started ────────────────────────────────────── */}
                <Section title="Getting Started">
                  <div className="flex flex-col gap-2">
                    <p className="text-[0.65rem] text-cyan-600 leading-relaxed pb-1">
                      GlobeSync AI is a Progressive Web App — install it
                      directly from your browser with no app store required.
                    </p>
                    {GETTING_STARTED.map((item) => (
                      <div
                        key={item.platform}
                        className="px-4 py-4 rounded-md"
                        style={{
                          background: `${item.color}08`,
                          border: `1px solid ${item.color}25`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg leading-none">
                            {item.icon}
                          </span>
                          <span
                            className="font-['Orbitron'] text-[0.65rem] font-bold tracking-widest"
                            style={{ color: item.color }}
                          >
                            {item.platform}
                          </span>
                        </div>
                        <ol className="flex flex-col gap-1.5 pl-1">
                          {item.steps.map((s, i) => (
                            <li key={i} className="flex gap-2.5 items-start">
                              <span
                                className="font-['Orbitron'] text-[0.5rem] font-black shrink-0 mt-0.5"
                                style={{ color: `${item.color}70` }}
                              >
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <span className="text-[0.63rem] text-cyan-500 leading-relaxed">
                                {s}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Dashboard Panels ────────────────────────────────────── */}
                <Section title="Dashboard Panels">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PANELS.map((p) => (
                      <div
                        key={p.label}
                        className="flex gap-3 px-4 py-3 rounded-md"
                        style={{
                          background: "rgba(0,212,255,0.03)",
                          border: "1px solid rgba(0,212,255,0.09)",
                        }}
                      >
                        <span className="text-xl leading-none mt-0.5 shrink-0">
                          {p.icon}
                        </span>
                        <div>
                          <div className="font-['Orbitron'] text-[0.62rem] font-bold tracking-widest text-cyan-300 mb-1.5">
                            {p.label}
                          </div>
                          <p className="text-[0.6rem] text-cyan-700 leading-relaxed">
                            {p.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Intelligence Feeds ──────────────────────────────────── */}
                <Section title="Intelligence Feeds">
                  <div className="flex flex-col gap-3">
                    {FEEDS.map((f) => (
                      <div
                        key={f.label}
                        className="flex flex-col sm:flex-row sm:items-start gap-3 px-4 py-4 rounded-md"
                        style={{
                          background: "rgba(0,212,255,0.03)",
                          border: "1px solid rgba(0,212,255,0.09)",
                        }}
                      >
                        <div className="sm:w-44 shrink-0 flex flex-col gap-1.5">
                          <span className="font-['Orbitron'] text-[0.65rem] font-bold text-cyan-300 tracking-wider">
                            {f.label}
                          </span>
                          <span className="text-[0.52rem] text-cyan-700/60 tracking-wider">
                            {f.url}
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="text-[0.48rem] px-1.5 py-0.5 rounded font-['Orbitron'] font-bold"
                              style={{
                                color:
                                  f.badge === "No key" ? "#22c55e" : "#00d4ff",
                                background:
                                  f.badge === "No key"
                                    ? "#22c55e18"
                                    : "#00d4ff18",
                                border: `1px solid ${f.badge === "No key" ? "#22c55e40" : "#00d4ff40"}`,
                              }}
                            >
                              {f.badge}
                            </span>
                            <span
                              className="text-[0.46rem] px-1.5 py-0.5 rounded font-['Orbitron']"
                              style={{
                                color: "#a78bfa",
                                background: "rgba(167,139,250,0.08)",
                                border: "1px solid rgba(167,139,250,0.22)",
                              }}
                            >
                              {f.category}
                            </span>
                          </div>
                        </div>
                        <p className="text-[0.64rem] text-cyan-600/90 leading-relaxed flex-1">
                          {f.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Threat Classification ───────────────────────────────── */}
                <Section title="Threat Classification">
                  <div className="flex flex-col gap-4">
                    <p className="text-[0.65rem] text-cyan-600 leading-relaxed">
                      Every event is assigned a severity level and attack
                      category based on the originating feed, the indicator
                      type, and any available enrichment data from AbuseIPDB.
                    </p>

                    {/* Severity levels */}
                    <div className="flex flex-col gap-2">
                      <div className="font-['Orbitron'] text-[0.55rem] tracking-[3px] text-cyan-700 uppercase mb-1">
                        Severity Levels
                      </div>
                      {THREAT_LEVELS.map((t) => (
                        <div
                          key={t.level}
                          className="flex gap-3 px-4 py-3 rounded-md items-start"
                          style={{
                            background: `${t.color}0a`,
                            border: `1px solid ${t.color}28`,
                          }}
                        >
                          <span
                            className="font-['Orbitron'] text-[0.62rem] font-black tracking-widest shrink-0 pt-0.5 min-w-15.5"
                            style={{ color: t.color }}
                          >
                            {t.level}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.6rem] text-cyan-600 leading-relaxed mb-1">
                              {t.desc}
                            </p>
                            <p
                              className="text-[0.56rem] leading-relaxed"
                              style={{ color: `${t.color}80` }}
                            >
                              e.g. {t.examples}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Attack categories */}
                    <div className="flex flex-col gap-2">
                      <div className="font-['Orbitron'] text-[0.55rem] tracking-[3px] text-cyan-700 uppercase mb-1">
                        Attack Categories
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ATTACK_CATEGORIES.map((c) => (
                          <div
                            key={c.name}
                            className="flex gap-3 px-3 py-3 rounded-md"
                            style={{
                              background: `${c.color}08`,
                              border: `1px solid ${c.color}22`,
                            }}
                          >
                            <div
                              className="w-1 rounded-full shrink-0 self-stretch"
                              style={{
                                background: c.color,
                                boxShadow: `0 0 6px ${c.color}`,
                              }}
                            />
                            <div>
                              <div
                                className="font-['Orbitron'] text-[0.56rem] font-bold tracking-widest mb-1"
                                style={{ color: c.color }}
                              >
                                {c.name}
                              </div>
                              <p className="text-[0.58rem] text-cyan-700 leading-relaxed">
                                {c.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Section>

                {/* Tech Stack ──────────────────────────────────────────── */}
                <Section title="Technology Stack">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {STACK.map((s) => (
                      <div
                        key={s.label}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-md"
                        style={{
                          background: `${s.color}0d`,
                          border: `1px solid ${s.color}28`,
                        }}
                      >
                        <span
                          className="font-['Orbitron'] text-[0.58rem] font-bold"
                          style={{ color: s.color }}
                        >
                          {s.label}
                        </span>
                        <span className="text-[0.49rem] text-cyan-900 ml-auto text-right leading-tight">
                          {s.note}
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* FAQ ────────────────────────────────────────────────── */}
                <Section title="Frequently Asked Questions">
                  <div className="flex flex-col gap-2">
                    {FAQ.map((item, i) => (
                      <div
                        key={i}
                        className="px-4 py-4 rounded-md"
                        style={{
                          background: "rgba(0,212,255,0.025)",
                          border: "1px solid rgba(0,212,255,0.09)",
                        }}
                      >
                        <div className="flex gap-2 items-start mb-2">
                          <span
                            className="font-['Orbitron'] text-[0.52rem] font-black shrink-0 mt-0.5"
                            style={{ color: "rgba(0,212,255,0.35)" }}
                          >
                            Q{String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="font-['Orbitron'] text-[0.62rem] font-bold tracking-wide text-cyan-300 leading-relaxed">
                            {item.q}
                          </span>
                        </div>
                        <p className="text-[0.62rem] text-cyan-600 leading-relaxed pl-7">
                          {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Privacy & Data ────────────────────────────────────── */}
                <Section title="Privacy &amp; Data">
                  <div className="flex flex-col gap-3">
                    {[
                      {
                        icon: "🔒",
                        title: "No User Data Collected",
                        color: "#22c55e",
                        desc: "GlobeSync AI does not collect, store, log, or transmit any personally identifiable information (PII). No account is required to use the platform. There are no cookies, tracking pixels, analytics scripts or fingerprinting mechanisms of any kind embedded in this application.",
                      },
                      {
                        icon: "📡",
                        title: "Public API Sources Only",
                        color: "#00d4ff",
                        desc: "All threat intelligence displayed on this dashboard is sourced exclusively from openly available public APIs operated by independent third-party organisations (abuse.ch, AbuseIPDB, AlienVault). GlobeSync does not generate, fabricate or modify any threat data — it only aggregates, normalises and visualises what these sources publish.",
                      },
                      {
                        icon: "🌍",
                        title: "IP Geolocation (Local)",
                        color: "#a78bfa",
                        desc: "IP-to-location resolution is performed server-side using the MaxMind GeoLite2 database, which is stored locally. No IP addresses observed in threat feeds are ever forwarded to any geolocation API or external lookup service. Your own IP address is never processed or stored by this system.",
                      },
                      {
                        icon: "🗝️",
                        title: "API Key Security",
                        color: "#f97316",
                        desc: "Third-party API credentials (AbuseIPDB, ThreatFox, URLhaus, AlienVault OTX) are stored exclusively as server-side environment variables. They are never embedded in the frontend bundle, never exposed in browser network requests, and never logged to disk. Rotating or revoking a key requires only an environment variable change and server restart.",
                      },
                      {
                        icon: "🛡️",
                        title: "Read-Only Architecture",
                        color: "#ffd140",
                        desc: "GlobeSync AI is a passive observation tool. It queries read-only public feeds and displays the results — it does not interact with, probe, scan, attack or modify any external infrastructure. No outbound connections are made except to the five whitelisted threat intelligence APIs during scheduled polling cycles.",
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="flex gap-3 px-4 py-4 rounded-md"
                        style={{
                          background: `${item.color}08`,
                          border: `1px solid ${item.color}22`,
                        }}
                      >
                        <span className="text-lg shrink-0 mt-0.5">
                          {item.icon}
                        </span>
                        <div>
                          <div
                            className="font-['Orbitron'] text-[0.6rem] font-bold tracking-widest mb-1.5"
                            style={{ color: item.color }}
                          >
                            {item.title}
                          </div>
                          <p className="text-[0.63rem] text-cyan-600 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Terms & Conditions ──────────────────────────────────── */}
                <Section title="Terms &amp; Conditions">
                  <div className="flex flex-col gap-3">
                    <div
                      className="px-4 py-3 rounded-md"
                      style={{
                        background: "rgba(255,165,0,0.05)",
                        border: "1px solid rgba(255,165,0,0.16)",
                      }}
                    >
                      <p className="text-[0.6rem] text-amber-500/80 leading-relaxed font-['Orbitron'] tracking-wider uppercase mb-1">
                        ⚠ Disclaimer
                      </p>
                      <p className="text-[0.63rem] text-cyan-600 leading-relaxed">
                        GlobeSync AI is provided strictly for{" "}
                        <strong className="text-cyan-400">
                          educational, research and demonstration purposes
                        </strong>
                        . The threat data displayed is sourced from public feeds
                        and is presented as-is without warranty of accuracy,
                        completeness or fitness for any particular purpose. Do
                        not rely solely on this dashboard for operational
                        security decisions.
                      </p>
                    </div>
                    {[
                      {
                        num: "01",
                        title: "Acceptable Use",
                        desc: "You may use GlobeSync AI for personal research, educational study, security awareness, and non-commercial demonstration purposes. You may not use this platform to gather intelligence on specific individuals, facilitate cyberattacks, circumvent legal restrictions, or misrepresent the data as your own original threat intelligence.",
                      },
                      {
                        num: "02",
                        title: "No Warranty",
                        desc: "This platform is provided 'as-is' without any express or implied warranty. The authors make no representations regarding the accuracy, timeliness or completeness of any threat data displayed. Threat feeds may be delayed, incomplete, or contain false positives. The geographic attribution of attacks is approximate and based on publicly available geolocation databases.",
                      },
                      {
                        num: "03",
                        title: "Limitation of Liability",
                        desc: "Under no circumstances shall the developers of GlobeSync AI be liable for any direct, indirect, incidental or consequential damages arising out of or in connection with your use of this platform or the threat data it displays. Users assume full responsibility for any decisions made based on information provided herein.",
                      },
                      {
                        num: "04",
                        title: "Third-Party Services",
                        desc: "GlobeSync AI aggregates data from third-party APIs including abuse.ch services, AbuseIPDB and AlienVault OTX. Each of these services operates under its own terms of service and privacy policy. GlobeSync AI does not control, endorse or take responsibility for the content, accuracy or availability of any third-party data source.",
                      },
                      {
                        num: "05",
                        title: "Intellectual Property",
                        desc: "The GlobeSync AI source code, UI design and branding are the intellectual property of their respective authors. Threat data displayed on the platform remains the property of the originating feed providers. You may share screenshots or demonstrations of the dashboard provided you clearly attribute the source and do not misrepresent the data.",
                      },
                      {
                        num: "06",
                        title: "Changes to This Policy",
                        desc: "These terms and the privacy policy may be updated at any time to reflect changes in functionality, data sources or applicable regulations. Continued use of GlobeSync AI following any such update constitutes acceptance of the revised terms. The version number and date displayed in the footer reflect the current applicable revision.",
                      },
                    ].map((t) => (
                      <div
                        key={t.num}
                        className="flex gap-4 px-4 py-4 rounded-md"
                        style={{
                          background: "rgba(0,212,255,0.025)",
                          border: "1px solid rgba(0,212,255,0.08)",
                        }}
                      >
                        <div
                          className="font-['Orbitron'] text-xl font-black leading-none shrink-0 mt-0.5"
                          style={{ color: "rgba(0,212,255,0.18)" }}
                        >
                          {t.num}
                        </div>
                        <div>
                          <div className="font-['Orbitron'] text-[0.62rem] font-bold tracking-widest text-cyan-300 mb-1.5">
                            {t.title}
                          </div>
                          <p className="text-[0.62rem] text-cyan-700 leading-relaxed">
                            {t.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Future Enhancements ─────────────────────────── */}
                <Section title="Future Enhancements">
                  <div className="flex flex-col gap-2">
                    <p className="text-[0.65rem] text-cyan-600 leading-relaxed pb-1">
                      Planned features on the GlobeSync AI roadmap. Items marked{" "}
                      <span style={{ color: "#22c55e", fontWeight: 700 }}>✓ LIVE</span>{" "}
                      have already shipped.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {FUTURE_ENHANCEMENTS.map((item) => (
                        <div
                          key={item.title}
                          className="flex gap-3 px-4 py-3 rounded-md relative"
                          style={{
                            background: item.shipped ? `${item.color}12` : `${item.color}08`,
                            border: `1px solid ${item.shipped ? item.color + "44" : item.color + "22"}`,
                          }}
                        >
                          {item.shipped && (
                            <span
                              className="absolute top-2 right-2 font-['Orbitron'] text-[0.45rem] font-black tracking-widest px-1.5 py-0.5 rounded-full"
                              style={{ background: "rgba(34,197,94,0.18)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.4)" }}
                            >
                              ✓ LIVE
                            </span>
                          )}
                          <span className="text-xl leading-none shrink-0 mt-0.5">
                            {item.icon}
                          </span>
                          <div className="min-w-0 pr-6">
                            <div
                              className="font-['Orbitron'] text-[0.62rem] font-bold tracking-widest mb-1"
                              style={{ color: item.color }}
                            >
                              {item.title}
                            </div>
                            <p className="text-[0.6rem] text-cyan-700 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>

                {/* Footer ──────────────────────────────────────────────── */}
                <div
                  className="text-center pt-4 pb-1 flex flex-col gap-2"
                  style={{ borderTop: "1px solid rgba(0,212,255,0.08)" }}
                >
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Badge color="#22c55e">● LIVE SYSTEM</Badge>
                    <Badge color="#00d4ff">v2.0</Badge>
                    <Badge color="#a78bfa">PWA</Badge>
                    <Badge color="#f97316">OPEN SOURCE</Badge>
                  </div>
                  <p className="font-['Orbitron'] text-[0.5rem] tracking-[4px] text-cyan-900 uppercase">
                    GlobeSync AI · Cyber Intelligence Platform · v2.0 · © 2026 ·
                    All threat data sourced from public APIs
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Badge helper ───────────────────────────────────────────────────── */
function Badge({ color, children }) {
  return (
    <span
      className="text-[0.52rem] px-2 py-0.5 rounded font-['Orbitron'] font-bold tracking-wider"
      style={{
        color,
        background: `${color}18`,
        border: `1px solid ${color}40`,
      }}
    >
      {children}
    </span>
  );
}
