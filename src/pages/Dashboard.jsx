import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { motion } from "framer-motion";
import { useSocket } from "../hooks/useSocket";

import LogsPanel from "../components/LogsPanel";
import CircularGauge from "../components/CircularGauge";
import StatCard from "../components/StatCard";
import CsiLogo from "../components/CsiLogo";
import BootScreen from "../components/BootScreen";
import ThreatTicker from "../components/ThreatTicker";
import PortsPanel from "../components/PortsPanel";
import MobileNav from "../components/MobileNav";
import NotifBanner from "../components/NotifBanner";
import SettingsModal from "../components/SettingsModal";
import PlaybackPanel from "../components/PlaybackPanel";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { useTheme } from "../hooks/useTheme";
import { useAlertRules } from "../hooks/useAlertRules";
import { usePlayback } from "../hooks/usePlayback";

// Heavy modules — code-split so they load in parallel / after initial paint
const GlobeMap = lazy(() => import("../components/GlobeMap"));
const ThreatAreaChart = lazy(() => import("../components/ThreatAreaChart"));
const AttackBarChart = lazy(() => import("../components/AttackBarChart"));
const AboutModal = lazy(() => import("../components/AboutModal"));

import {
  BASE_ARCS,
  INIT_LOGS,
  makeLog,
  genChartData,
  genBarData,
  randInt,
} from "../data/constants";

/* ── Animation variants ── */
const panelAnim = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export default function Dashboard() {
  const [booted, setBooted] = useState(false);
  const [logs, setLogs] = useState(INIT_LOGS);
  const [stats, setStats] = useState({
    threats: 1285,
    intrusions: 5732,
    malware: 1289,
    ddos: 842,
  });
  const [chartData, setChart] = useState(() => genChartData());
  const [barData, setBar] = useState(() => genBarData());
  const ctr = useRef(100);
  const connectedRef = useRef(false);
  const [liveArcs, setLiveArcs] = useState([]);
  const [showAbout, setShowAbout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  /* Playback state */
  const [playbackLogs, setPlaybackLogs] = useState([]);
  const [playbackArcs, setPlaybackArcs] = useState([]);

  /* Theme */
  const { theme, themeId, setTheme } = useTheme();

  /* Alert rules */
  const { rules, toggle: toggleRule, setAll: setAllRules } = useAlertRules();
  /* Keep a stable ref so notification callbacks always see latest rules */
  const rulesRef = useRef(rules);
  useEffect(() => {
    rulesRef.current = rules;
  }, [rules]);

  /* Playback replay callback — prepends each replayed event into playback state */
  const handleReplay = useCallback((event) => {
    setPlaybackLogs((prev) => [event, ...prev].slice(0, 50));
    if (event.arc) setPlaybackArcs((prev) => [...prev.slice(-9), event.arc]);
  }, []);

  const {
    isPlaybackMode,
    isPlaying,
    events: pbEvents,
    index: pbIndex,
    speed: pbSpeed,
    loading: pbLoading,
    error: pbError,
    openPlayback: _openPlayback,
    closePlayback,
    play: pbPlay,
    pause: pbPause,
    seek: pbSeek,
    setSpeed: pbSetSpeed,
  } = usePlayback({ onReplay: handleReplay });

  const startPlayback = useCallback(() => {
    setPlaybackLogs([]);
    setPlaybackArcs([]);
    _openPlayback();
  }, [_openPlayback]);

  /* Push notifications */
  const { permission, requestPermission, notify } = usePushNotifications();
  const [notifDismissed, setNotifDismissed] = useState(false);
  const lastNotifRef = useRef({});

  /* Derive banner visibility — no effect needed */
  const showNotifBanner = booted && permission === "default" && !notifDismissed;

  /* Helper: fire a native notification with a per-tag 30 s cooldown */
  const pushNotif = useCallback(
    (title, body, tag) => {
      const now = Date.now();
      if ((lastNotifRef.current[tag] || 0) + 30000 > now) return;
      lastNotifRef.current[tag] = now;
      notify(title, body, { tag });
    },
    [notify],
  );

  /* Handle a real event arriving from the backend WebSocket */
  const handleSocketEvent = useCallback(
    (event) => {
      setLogs((prev) => [event, ...prev].slice(0, 50));
      setStats((prev) => {
        const t = event.type || "";
        const s = event.severity || "";
        return {
          threats: prev.threats + 1,
          malware:
            t.includes("MALWARE") ||
            t.includes("RANSOMWARE") ||
            s === "CRITICAL"
              ? prev.malware + 1
              : prev.malware,
          ddos: t.includes("DDOS") ? prev.ddos + 1 : prev.ddos,
          intrusions:
            !t.includes("MALWARE") &&
            !t.includes("RANSOMWARE") &&
            !t.includes("DDOS")
              ? prev.intrusions + 1
              : prev.intrusions,
        };
      });
      if (event.arc) {
        setLiveArcs((prev) => [...prev.slice(-9), event.arc]);
      }
      /* Native push notification for noteworthy events (gated by alert rules) */
      const sev = event.severity || "";
      const typ = event.type || "";
      const src = event.ip || "";
      const r = rulesRef.current;
      if (typ.includes("RANSOMWARE") && r.ransomware) {
        pushNotif("🦠 Ransomware Detected", `${typ} — ${src}`, "ransomware");
      } else if (typ.includes("MALWARE") && sev === "CRITICAL" && r.malware) {
        pushNotif("🦠 Malware Detected", `${typ} — ${src}`, "malware");
      } else if (
        typ.includes("DDOS") &&
        (sev === "CRITICAL" || sev === "HIGH") &&
        r.ddos
      ) {
        pushNotif("💥 DDoS Attack", `${typ} — ${src}`, "ddos");
      } else if (typ.includes("BRUTE") && sev === "CRITICAL" && r.brute) {
        pushNotif("🔐 Brute Force Attack", `${typ} — ${src}`, "brute");
      } else if (typ.includes("PHISH") && sev === "CRITICAL" && r.phishing) {
        pushNotif("🎣 Phishing Alert", `${typ} — ${src}`, "phishing");
      } else if (sev === "CRITICAL" && r.anyCritical) {
        pushNotif("🚨 Critical Threat", `${typ} — ${src}`, "critical");
      }
    },
    [pushNotif],
  );

  const { connected } = useSocket({ onEvent: handleSocketEvent });

  /* Stable arcs array — only changes when liveArcs actually changes */
  const allArcs = useMemo(() => [...BASE_ARCS, ...liveArcs], [liveArcs]);

  /* Swap to playback data while replaying */
  const displayLogs = isPlaybackMode ? playbackLogs : logs;
  const displayArcs = useMemo(
    () => (isPlaybackMode ? [...BASE_ARCS, ...playbackArcs] : allArcs),
    [isPlaybackMode, playbackArcs, allArcs],
  );

  /* Derive gauge percentages from live stats */
  const gauges = useMemo(() => {
    const total = Math.max(
      stats.threats + stats.intrusions + stats.malware + stats.ddos,
      1,
    );
    const network = Math.min(
      95,
      Math.max(40, Math.round(100 - ((stats.ddos * 100) / total) * 3)),
    );
    const firewall = Math.min(
      90,
      Math.max(30, Math.round(100 - ((stats.malware * 100) / total) * 3)),
    );
    const risk = Math.min(
      97,
      Math.max(
        30,
        Math.round((((stats.malware + stats.ddos) * 100) / total) * 3.5),
      ),
    );
    const blocked = Math.min(
      88,
      Math.max(
        20,
        Math.round(100 - (stats.malware * 100) / Math.max(stats.intrusions, 1)),
      ),
    );
    return {
      network,
      networkLabel:
        network >= 70 ? "STABLE" : network >= 50 ? "DEGRADED" : "CRITICAL",
      firewall,
      firewallLabel:
        firewall >= 60 ? "ACTIVE" : firewall >= 40 ? "STRESSED" : "BREACHED",
      risk,
      riskLabel: risk >= 70 ? "HIGH RISK" : risk >= 45 ? "ELEVATED" : "LOW",
      blocked,
      blockedLabel:
        blocked >= 60 ? "SUCCESS" : blocked >= 40 ? "PARTIAL" : "FAILING",
    };
  }, [stats]);

  /* Keep a ref in sync so the mock interval can read it without a dep */
  useEffect(() => {
    connectedRef.current = connected;
  }, [connected]);

  useEffect(() => {
    /* Mock log interval — skips when backend WebSocket is connected */
    const logId = setInterval(() => {
      if (connectedRef.current) return; // real data is flowing — skip mock
      ctr.current++;
      const newLog = makeLog(ctr.current);
      setLogs((prev) => [newLog, ...prev].slice(0, 50));
      setStats((prev) => ({
        threats: prev.threats + randInt(1, 6),
        intrusions: prev.intrusions + randInt(1, 9),
        malware: prev.malware + randInt(0, 4),
        ddos: prev.ddos + randInt(0, 3),
      }));
      /* Simulated push notification (CRITICAL events only) */
      if (newLog.severity === "CRITICAL") {
        const typ = newLog.type || "";
        const src = newLog.ip || "";
        if (typ.includes("RANSOMWARE")) {
          pushNotif("🦠 Ransomware Detected", `${typ} — ${src}`, "ransomware");
        } else if (typ.includes("BRUTE")) {
          pushNotif("🔐 Brute Force Attack", `${typ} — ${src}`, "brute");
        } else {
          pushNotif("🚨 Critical Threat", `${typ} — ${src}`, "critical");
        }
      }
    }, 2200);

    const chartId = setInterval(() => {
      setChart((prev) => [
        ...prev.slice(1),
        {
          t: "now",
          malware: randInt(20, 120),
          ddos: randInt(10, 80),
          phishing: randInt(5, 60),
          exploits: randInt(8, 50),
        },
      ]);
    }, 3500);

    const barId = setInterval(() => setBar(genBarData()), 5000);

    return () => {
      clearInterval(logId);
      clearInterval(chartId);
      clearInterval(barId);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* ── Boot screen overlay ── */}
      <BootScreen onComplete={() => setBooted(true)} />

      {/* ── Push notification permission banner ── */}
      {showNotifBanner && (
        <NotifBanner
          onEnable={async () => {
            await requestPermission();
            setNotifDismissed(true);
          }}
          onDismiss={() => setNotifDismissed(true)}
        />
      )}

      <motion.div
        className="flex flex-col min-h-screen lg:h-screen px-2 pb-6 lg:p-2 gap-2 lg:overflow-hidden overflow-x-hidden"
        style={{
          background: theme.bg,
          paddingBottom: isPlaybackMode ? "9rem" : undefined,
        }}
        variants={container}
        initial="hidden"
        animate={booted ? "show" : "hidden"}
      >
        {/* ════ HEADER ════ */}
        <motion.header
          variants={panelAnim}
          className="flex items-center justify-between px-4 py-2 glass shrink-0 hud-corners gap-2 fixed top-0 left-0 right-0 z-50 lg:relative lg:top-auto lg:left-auto lg:right-auto lg:z-auto"
        >
          {/* Mobile hamburger */}
          <MobileNav
            onOpenAbout={() => setShowAbout(true)}
            onOpenSettings={() => setShowSettings(true)}
            onOpenPlayback={startPlayback}
          />

          {/* Logo */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="shrink-0 -my-1 hidden sm:block">
              <CsiLogo size={62} />
            </div>
            <div className="min-w-0">
              <div className="font-['Orbitron'] text-base sm:text-lg font-black tracking-widest text-cyan-400 anim-text-glow leading-none truncate">
                Globe<span className="text-white">Sync</span> AI
              </div>
              <div className="text-[0.5rem] tracking-[4px] text-cyan-700 mt-px hidden sm:block">
                GLOBESYNC INTELLIGENCE PLATFORM
              </div>
            </div>
          </div>

          {/* ABOUT + SETTINGS + PLAYBACK buttons — desktop only */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded font-['Orbitron'] text-[0.58rem] tracking-[2px] font-bold cursor-pointer glass hud-corners"
              style={{
                background: "rgba(var(--hud-rgb),0.08)",
                border: "1px solid rgba(var(--hud-rgb),0.35)",
                color: "var(--hud)",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(var(--hud-rgb),0.18)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(var(--hud-rgb),0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              ⚙ HUD
            </button>
            <button
              onClick={startPlayback}
              className="flex items-center gap-2 px-3 py-1.5 rounded font-['Orbitron'] text-[0.58rem] tracking-[2px] font-bold cursor-pointer glass hud-corners"
              style={{
                background: isPlaybackMode
                  ? "rgba(255,136,0,0.18)"
                  : "rgba(255,136,0,0.07)",
                border: `1px solid ${isPlaybackMode ? "rgba(255,136,0,0.7)" : "rgba(255,136,0,0.3)"}`,
                color: "#ff8800",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,136,0,0.18)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isPlaybackMode
                  ? "rgba(255,136,0,0.18)"
                  : "rgba(255,136,0,0.07)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              ⏪ REWIND
            </button>
            <button
              onClick={() => setShowAbout(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded font-['Orbitron'] text-[0.58rem] tracking-[2px] font-bold cursor-pointer glass hud-corners"
              style={{
                background: "rgba(var(--hud-rgb),0.10)",
                border: "1px solid rgba(var(--hud-rgb),0.45)",
                color: "var(--hud)",
                boxShadow:
                  "0 0 18px rgba(var(--hud-rgb),0.25), inset 0 1px 0 rgba(var(--hud-rgb),0.2)",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(var(--hud-rgb),0.22)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(var(--hud-rgb),0.10)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 anim-blink"
                style={{
                  background: "var(--hud)",
                  boxShadow: "0 0 6px var(--hud)",
                }}
              />
              ABOUT
            </button>
          </div>

          {/* Stat ticker — hidden below xl */}
          <div className="hidden xl:flex items-center gap-3 text-[0.6rem] tracking-wider flex-wrap justify-end">
            {[
              {
                label: "ACTIVE THREATS",
                val: stats.threats.toLocaleString(),
                color: "#ff4444",
              },
              {
                label: "ATTACK ORIGIN",
                val: "RUSSIA / CHINA",
                color: "#ff8800",
              },
              {
                label: "TARGET REGION",
                val: "N.AMERICA / EU",
                color: "#00d4ff",
              },
              {
                label: "INTRUSIONS",
                val: stats.intrusions.toLocaleString(),
                color: "#a855f7",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center px-3 py-1 glass-dark rounded"
              >
                <span className="text-cyan-700 text-[0.48rem] tracking-[2px]">
                  {item.label}
                </span>
                <span
                  className="font-['Orbitron'] font-bold text-sm"
                  style={{
                    color: item.color,
                    textShadow: `0 0 10px ${item.color}88`,
                  }}
                >
                  {item.val}
                </span>
              </div>
            ))}
          </div>

          {/* Alert badge */}
          <div className="flex items-center gap-1.5 sm:gap-2 glass-red px-2 sm:px-3 py-2 anim-glow-red shrink-0">
            <div className="flex gap-0.5 items-end shrink-0">
              {[8, 14, 10].map((h, i) => (
                <span
                  key={i}
                  className="block w-1 bg-red-500 anim-blink rounded-sm"
                  style={{
                    height: h,
                    animationDelay: `${i * 0.15}s`,
                    boxShadow: "0 0 6px #ff2d2d",
                  }}
                />
              ))}
            </div>
            <div className="hidden xs:block">
              <div className="font-['Orbitron'] text-[0.58rem] sm:text-[0.65rem] font-black text-red-500 tracking-[2px] sm:tracking-[3px] anim-blink">
                THREAT<span className="hidden sm:inline"> DETECTED</span>
              </div>
              <div className="text-[0.45rem] text-red-700 tracking-widest hidden sm:block">
                LEVEL: CRITICAL
              </div>
            </div>
          </div>
        </motion.header>

        {/* Mobile header spacer — matches fixed header height */}
        <div className="lg:hidden h-14 shrink-0" />

        {/* ════ THREAT FEED TICKER ════ */}
        <motion.div variants={panelAnim} className="shrink-0">
          <ThreatTicker logs={displayLogs} />
        </motion.div>

        {/* ════ MAIN BODY ════ */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[200px_1fr_200px] min-h-0 gap-2">
          {/* Logs panel + About sidebar stacked in left column */}
          <motion.div
            id="section-logs"
            variants={panelAnim}
            className="min-h-0 h-72 sm:h-80 lg:h-full min-w-0 order-2 lg:order-1 flex flex-col gap-2"
          >
            <div className="flex-1 min-h-0">
              <LogsPanel logs={displayLogs} />
            </div>
          </motion.div>

          {/* World map — first/top on mobile */}
          <motion.div
            id="section-globe"
            variants={panelAnim}
            className="min-h-0 h-96 sm:h-112 md:h-120 lg:h-full min-w-0 order-1 lg:order-2"
          >
            <div className="flex flex-col glass anim-flicker h-full overflow-hidden cyber-grid hud-corners">
              <div className="panel-title">
                <span className="dot" />
                <span>
                  {isPlaybackMode
                    ? "GLOBAL ATTACK MAP — PLAYBACK"
                    : "GLOBAL ATTACK MAP — LIVE"}
                </span>
                <span
                  className={`ml-auto text-[0.48rem] tracking-widest ${
                    isPlaybackMode
                      ? "text-orange-400 anim-blink"
                      : connected
                        ? "text-green-400 anim-blink"
                        : "text-yellow-500 anim-blink"
                  }`}
                >
                  {isPlaybackMode
                    ? `● PLAYBACK — ${pbIndex + 1}/${pbEvents.length}`
                    : `● ${connected ? "LIVE — DISTRIBUTION" : "LIVE — SIMULATED"}`}
                </span>
              </div>
              <div className="flex-1 relative overflow-hidden">
                <Suspense fallback={<div className="w-full h-full" />}>
                  <GlobeMap arcs={displayArcs} />
                </Suspense>
              </div>
            </div>
          </motion.div>

          {/* Right column — gauges: 2-col grid on mobile, flex-col on desktop */}
          <motion.div
            id="section-health"
            variants={panelAnim}
            className="grid grid-cols-2 lg:flex lg:flex-col gap-2 min-h-0 lg:h-full min-w-0 order-3"
          >
            <div className="glass anim-flicker flex flex-col min-h-40 lg:flex-1 lg:min-h-0 hud-corners">
              <div className="panel-title">
                <span className="dot" />
                SYSTEM HEALTH
              </div>
              <div className="flex-1 grid grid-rows-2 divide-y divide-cyan-950/50">
                <CircularGauge
                  pct={gauges.network}
                  color="cyan"
                  label="Network"
                  sublabel={gauges.networkLabel}
                />
                <CircularGauge
                  pct={gauges.firewall}
                  color="purple"
                  label="Firewall"
                  sublabel={gauges.firewallLabel}
                />
              </div>
            </div>

            <div
              id="section-threat"
              className="glass-red anim-flicker flex flex-col min-h-40 lg:flex-1 lg:min-h-0 hud-corners"
            >
              <div className="panel-title red">
                <span className="dot" />
                THREAT LEVEL
              </div>
              <div className="flex-1 grid grid-rows-2 divide-y divide-red-950/50">
                <CircularGauge
                  pct={gauges.risk}
                  color="red"
                  label="Risk Score"
                  sublabel={gauges.riskLabel}
                />
                <CircularGauge
                  pct={gauges.blocked}
                  color="green"
                  label="Blocked"
                  sublabel={gauges.blockedLabel}
                />
              </div>
            </div>

            {/* ── Ports Panel — spans both columns on mobile ── */}
            <div id="section-ports" className="col-span-2 lg:shrink-0">
              <PortsPanel />
            </div>
          </motion.div>
        </div>

        {/* ════ BOTTOM ROW: Charts + Stats ════ */}
        <motion.div
          id="section-charts"
          variants={panelAnim}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_210px] gap-2 shrink-0 lg:h-44"
        >
          <div
            id="section-threat-activity"
            className="flex flex-col h-72 lg:h-full"
          >
            <Suspense fallback={<div className="w-full h-full" />}>
              <ThreatAreaChart data={chartData} />
            </Suspense>
          </div>
          <div id="section-stats" className="flex flex-col h-72 lg:h-full">
            <Suspense fallback={<div className="w-full h-full" />}>
              <AttackBarChart data={barData} />
            </Suspense>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 lg:h-full sm:col-span-2 lg:col-span-1">
            <StatCard
              label="INTRUSIONS"
              value={stats.intrusions}
              accent="cyan"
              trend="+12/m"
            />
            <StatCard
              label="MALWARE"
              value={stats.malware}
              accent="red"
              trend="+4/m"
            />
            <StatCard
              label="DDOS"
              value={stats.ddos}
              accent="orange"
              trend="+2/m"
            />
            <StatCard
              label="THREATS"
              value={stats.threats}
              accent="purple"
              trend="+5/m"
            />
          </div>
        </motion.div>
      </motion.div>

      <Suspense fallback={null}>
        <AboutModal open={showAbout} onClose={() => setShowAbout(false)} />
      </Suspense>

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        themeId={themeId}
        setTheme={setTheme}
        rules={rules}
        toggleRule={toggleRule}
        setAllRules={setAllRules}
      />

      <PlaybackPanel
        isPlaybackMode={isPlaybackMode}
        isPlaying={isPlaying}
        events={pbEvents}
        index={pbIndex}
        speed={pbSpeed}
        loading={pbLoading}
        error={pbError}
        play={pbPlay}
        pause={pbPause}
        seek={pbSeek}
        setSpeed={pbSetSpeed}
        closePlayback={closePlayback}
      />
    </>
  );
}
