import { useEffect, useRef, useState, useCallback, memo } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import Globe from "globe.gl";
import { BASE_ARCS, CITIES } from "../data/constants";

/* ── Threat classification ─────────────────────────────────────────────── */
const THREAT_ORIGINS = new Set(["Russia", "China", "Iran", "North Korea"]);
const HIGH_RISK = new Set([
  "Belarus",
  "Syria",
  "Venezuela",
  "Cuba",
  "Sudan",
  "Libya",
]);

const hashStr = (s) => s.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

function getCountryStats(name) {
  const h = hashStr(name);
  const isOrigin = THREAT_ORIGINS.has(name);
  const isHighRisk = !isOrigin && (HIGH_RISK.has(name) || h % 7 === 0);
  const isMonitored = !isOrigin && !isHighRisk && h % 3 === 0;
  const status = isOrigin
    ? "THREAT ORIGIN"
    : isHighRisk
      ? "HIGH RISK"
      : isMonitored
        ? "MONITORED"
        : "NEUTRAL";
  const color = isOrigin
    ? "#ff2d2d"
    : isHighRisk
      ? "#ff8800"
      : isMonitored
        ? "#ffcc00"
        : "#00d4ff";
  return {
    status,
    color,
    attacks: ((h * 37) % 8400) + 200,
    blocked: ((h * 13) % 5000) + 100,
    connections: ((h * 7) % 420) + 8,
    risk: isOrigin
      ? 80 + (h % 18)
      : isHighRisk
        ? 55 + (h % 30)
        : isMonitored
          ? 25 + (h % 28)
          : 3 + (h % 20),
  };
}

/* ── Country polygon colors ────────────────────────────────────────────── */
function capColor(feat) {
  const name = feat.properties?.ADMIN || "";
  const continent = feat.properties?.CONTINENT || "";
  if (THREAT_ORIGINS.has(name)) return "rgba(160,10,10,0.95)";
  if (HIGH_RISK.has(name)) return "rgba(110,42,4,0.92)";
  switch (continent) {
    case "Africa":
      return "rgba(10,40,20,0.88)";
    case "Europe":
      return "rgba(8,22,48,0.88)";
    case "Asia":
      return "rgba(8,20,42,0.88)";
    case "North America":
      return "rgba(8,24,44,0.88)";
    case "South America":
      return "rgba(8,20,38,0.88)";
    case "Oceania":
      return "rgba(7,18,32,0.88)";
    case "Antarctica":
      return "rgba(12,14,18,0.85)";
    default:
      return "rgba(8,14,24,0.88)";
  }
}

function strokeColor(feat) {
  const name = feat.properties?.ADMIN || "";
  if (THREAT_ORIGINS.has(name)) return "rgba(255,45,45,0.90)";
  if (HIGH_RISK.has(name)) return "rgba(255,136,0,0.70)";
  return "rgba(0,212,255,0.45)";
}

function polyAlt(feat) {
  const name = feat.properties?.ADMIN || "";
  return THREAT_ORIGINS.has(name) ? 0.028 : HIGH_RISK.has(name) ? 0.016 : 0.008;
}

/* ── Globe component ───────────────────────────────────────────────────── */
function GlobeMap({ arcs = BASE_ARCS }) {
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const arcConfigured = useRef(false);
  const [countries, setCountries] = useState({ features: [] });
  const [selected, setSelected] = useState(null); // GeoJSON feature

  const statName = selected ? selected.properties?.ADMIN || "" : null;
  const stats = statName ? getCountryStats(statName) : null;

  /* Load countries GeoJSON once */
  useEffect(() => {
    fetch("/countries.geojson")
      .then((r) => r.json())
      .then(setCountries)
      .catch((e) => console.warn("[globe] GeoJSON load failed:", e));
  }, []);

  /* Init globe once on mount */
  useEffect(() => {
    if (!containerRef.current || globeRef.current) return;
    const el = containerRef.current;
    const { width, height } = el.getBoundingClientRect();

    const globe = Globe()(el)
      .width(width)
      .height(height)
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true)
      .atmosphereColor("#00b4ff")
      .atmosphereAltitude(0.15);

    /* Cap pixel ratio to 2 — prevents 3× GPU cost on hi-DPI screens */
    globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio, 2));
    globe.renderer().powerPreference = "high-performance";

    /* Matte dark sphere — no image texture */
    globe.globeMaterial(
      new THREE.MeshPhongMaterial({
        color: new THREE.Color(0x010408),
        specular: new THREE.Color(0x001122),
        shininess: 14,
      }),
    );

    /* Camera / controls */
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.22;
    globe.controls().enableZoom = true;
    globe.controls().minDistance = 140;
    globe.controls().maxDistance = 600;
    globe.controls().enablePan = false;
    /* Damp rotation for buttery smooth deceleration after drag */
    globe.controls().enableDamping = true;
    globe.controls().dampingFactor = 0.08;

    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.35 });

    globeRef.current = globe;

    /* Debounce resize via rAF so it never fires mid-frame */
    let rafResize = null;
    const ro = new ResizeObserver(([entry]) => {
      if (rafResize) cancelAnimationFrame(rafResize);
      rafResize = requestAnimationFrame(() => {
        const { width: w, height: h } = entry.contentRect;
        globeRef.current?.width(w).height(h);
      });
    });
    ro.observe(el);

    return () => {
      if (rafResize) cancelAnimationFrame(rafResize);
      ro.disconnect();
      globeRef.current?._destructor?.();
      globeRef.current = null;
      arcConfigured.current = false; // reset so new globe instance gets full arc config
    };
  }, []);

  /* Countries layer */
  useEffect(() => {
    if (!globeRef.current || !countries.features.length) return;
    globeRef.current
      .polygonsData(countries.features)
      .polygonCapColor(capColor)
      .polygonSideColor((feat) => {
        const name = feat.properties?.ADMIN || "";
        if (THREAT_ORIGINS.has(name)) return "rgba(255,45,45,0.35)";
        if (HIGH_RISK.has(name)) return "rgba(255,136,0,0.20)";
        return "rgba(0,212,255,0.08)";
      })
      .polygonStrokeColor(strokeColor)
      .polygonAltitude(polyAlt)
      .polygonLabel((feat) => {
        const name = feat.properties?.ADMIN || "";
        const c = THREAT_ORIGINS.has(name)
          ? "#ff2d2d"
          : HIGH_RISK.has(name)
            ? "#ff8800"
            : "#00d4ff";
        return `<div style="background:rgba(1,4,14,0.90);border:1px solid ${c}55;padding:4px 10px;font-family:'Share Tech Mono',monospace;font-size:11px;color:${c};border-radius:2px;letter-spacing:2px">${name.toUpperCase()}</div>`;
      })
      .onPolygonClick((feat) => {
        setSelected((prev) =>
          prev?.properties?.ADMIN === feat?.properties?.ADMIN ? null : feat,
        );
      });
  }, [countries]);

  /* Attack arcs layer — apply config once, only update data when arcs change */
  useEffect(() => {
    if (!globeRef.current) return;
    const arcData = arcs.map((a) => {
      const base = Array.isArray(a.color) ? a.color[0] : a.color || "#ff2d2d";
      // Gradient: start color → transparent — fades nicely along the arc
      const fade = `${base}00`;
      return {
        startLat: a.slat,
        startLng: a.slng,
        endLat: a.elat,
        endLng: a.elng,
        color: [base, base, fade],
      };
    });

    if (!arcConfigured.current) {
      /* One-time config — never re-applied so arcs don't jump */
      globeRef.current
        .arcColor((d) => d.color)
        .arcAltitudeAutoScale(0.38)
        .arcStroke(0.6)
        .arcDashLength(0.4)
        .arcDashGap(0.15)
        .arcDashAnimateTime(2000)
        .arcDashInitialGap(() => Math.random() * 5);
      arcConfigured.current = true;
    }

    /* Data-only update — no config churn, no arc restart */
    globeRef.current.arcsData(arcData);
  }, [arcs]);

  /* City points layer */
  useEffect(() => {
    if (!globeRef.current) return;
    globeRef.current
      .pointsData(CITIES)
      .pointLat("lat")
      .pointLng("lng")
      .pointColor("color")
      .pointAltitude(0.04)
      .pointRadius((city) => (city.role === "origin" ? 0.44 : 0.28))
      .pointLabel(
        (city) =>
          `<div style="font-family:'Share Tech Mono',monospace;font-size:11px;color:${city.color};background:rgba(1,4,14,0.85);padding:3px 7px;border-left:2px solid ${city.color};letter-spacing:1px">${city.name}</div>`,
      );
  }, []);

  const closePanel = useCallback(() => setSelected(null), []);

  return (
    <div className="absolute inset-0 overflow-hidden" ref={containerRef}>
      {/* ── Country stats overlay ── */}
      <AnimatePresence>
        {selected && stats && statName && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.22 }}
            className="absolute top-4 left-2 z-20 glass-dark rounded-sm overflow-hidden pointer-events-auto"
            style={{
              width: 162,
              border: `1px solid ${stats.color}33`,
              boxShadow: `0 0 22px ${stats.color}18`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-2.5 py-1.5"
              style={{
                background: `${stats.color}10`,
                borderBottom: `1px solid ${stats.color}22`,
              }}
            >
              <div>
                <p
                  className="font-['Orbitron'] text-[0.52rem] font-black"
                  style={{ color: stats.color }}
                >
                  {statName.toUpperCase()}
                </p>
                <p
                  className="text-[0.42rem] tracking-[2px] mt-0.5"
                  style={{ color: `${stats.color}bb` }}
                >
                  {stats.status}
                </p>
              </div>
              <button
                onClick={closePanel}
                className="text-[0.7rem] leading-none"
                style={{ color: `${stats.color}88` }}
              >
                ✕
              </button>
            </div>

            {/* Stats grid */}
            <div className="px-2.5 py-2 grid grid-cols-2 gap-y-2 gap-x-1">
              {[
                {
                  label: "ATTACKS",
                  val: stats.attacks.toLocaleString(),
                  color: "#ff4444",
                },
                {
                  label: "BLOCKED",
                  val: stats.blocked.toLocaleString(),
                  color: "#00ff88",
                },
                {
                  label: "CONNECTIONS",
                  val: stats.connections.toLocaleString(),
                  color: "#00d4ff",
                },
                {
                  label: "RISK SCORE",
                  val: `${stats.risk}%`,
                  color: stats.color,
                },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-[0.38rem] tracking-[1.5px] text-cyan-900">
                    {label}
                  </span>
                  <span
                    className="font-['Orbitron'] text-[0.58rem] font-bold mt-px"
                    style={{ color }}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>

            {/* Risk bar */}
            <div className="px-2.5 pb-2">
              <div className="text-[0.38rem] tracking-widest text-cyan-900 mb-1">
                THREAT LEVEL
              </div>
              <div
                className="h-0.75 rounded-full"
                style={{ background: "rgba(0,212,255,0.07)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${stats.risk}%`,
                    background: `linear-gradient(90deg,${stats.color}44,${stats.color})`,
                    boxShadow: `0 0 4px ${stats.color}`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(GlobeMap);
