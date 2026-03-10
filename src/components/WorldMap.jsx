import { useState, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Sphere,
  Marker,
  Line,
} from "react-simple-maps";
import { CITIES, BASE_ARCS } from "../data/constants";

const GEO_URL = "/world-110m.json";

/* ── Continent bucket fills ── */
function countryFill(geo) {
  const id = Number(geo.id);
  const africaIds = [
    12, 24, 72, 86, 108, 120, 132, 140, 144, 174, 175, 178, 180, 204, 218, 231,
    232, 262, 266, 270, 288, 324, 336, 404, 426, 430, 434, 450, 454, 466, 478,
    480, 504, 508, 516, 562, 566, 646, 678, 686, 694, 706, 710, 716, 724, 728,
    729, 748, 768, 788, 800, 818, 834, 854, 894,
  ];
  if (africaIds.includes(id)) return "#051a10";
  const europeIds = [
    8, 20, 40, 56, 70, 100, 112, 191, 196, 203, 208, 233, 246, 250, 276, 292,
    300, 336, 348, 352, 372, 380, 388, 400, 428, 438, 440, 442, 470, 498, 492,
    504, 528, 578, 616, 620, 642, 643, 674, 688, 703, 705, 724, 752, 756, 792,
    804, 807, 826,
  ];
  if (europeIds.includes(id)) return "#071520";
  const americaIds = [
    28, 32, 44, 52, 60, 68, 76, 84, 124, 136, 152, 170, 188, 192, 212, 214, 218,
    222, 238, 254, 304, 312, 320, 328, 332, 340, 388, 474, 484, 500, 530, 531,
    533, 534, 535, 558, 591, 600, 604, 630, 652, 659, 660, 662, 663, 666, 670,
    740, 780, 796, 840, 850, 858, 862,
  ];
  if (americaIds.includes(id)) return "#071015";
  const asiaIds = [
    4, 50, 64, 96, 104, 116, 142, 144, 156, 158, 356, 360, 364, 368, 376, 392,
    398, 400, 408, 410, 414, 418, 422, 458, 462, 496, 524, 586, 608, 626, 634,
    682, 702, 703, 704, 760, 764, 784, 788, 792, 860,
  ];
  if (asiaIds.includes(id)) return "#071218";
  const oceaniaIds = [
    36, 90, 242, 296, 520, 540, 548, 554, 570, 580, 583, 584, 585, 598, 882,
  ];
  if (oceaniaIds.includes(id)) return "#050f15";
  return "#061828";
}

/* ── Per-country stats (deterministic hash) ── */
const hashStr = (s) => s.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
const ORIGIN_COUNTRIES = new Set(["Russia", "China", "Iran", "North Korea"]);
const HIGH_RISK = new Set([
  "Belarus",
  "Syria",
  "Venezuela",
  "Cuba",
  "Sudan",
  "Libya",
]);

function getCountryStats(name) {
  const h = hashStr(name);
  const isOrigin = ORIGIN_COUNTRIES.has(name);
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

function WorldMap({ arcs = BASE_ARCS }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const stats = selected ? getCountryStats(selected) : null;

  const handleEnter = useCallback((name) => setHovered(name), []);
  const handleLeave = useCallback(() => setHovered(null), []);
  const handleClick = useCallback(
    (name) => setSelected((prev) => (prev === name ? null : name)),
    [],
  );

  return (
    <div className="w-full h-full relative select-none">
      {/* ── Legend ── */}
      <div className="absolute top-1 right-2 z-10 flex flex-col gap-1 text-[0.48rem] tracking-wider">
        {[
          { color: "#ff2d2d", label: "ATTACK ORIGIN" },
          { color: "#00d4ff", label: "TARGET — US/EU" },
          { color: "#a855f7", label: "TARGET — EU" },
          { color: "#00ffea", label: "TARGET — APAC" },
          { color: "#00ff88", label: "TARGET — OCE" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: color, boxShadow: `0 0 4px ${color}` }}
            />
            <span style={{ color }}>{label}</span>
          </div>
        ))}
        <div className="mt-1 text-[0.4rem] text-cyan-900 tracking-[2px]">
          CLICK COUNTRY FOR STATS
        </div>
      </div>

      {/* ── Continent labels ── */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { label: "N. AMERICA", top: "22%", left: "14%" },
          { label: "S. AMERICA", top: "62%", left: "22%" },
          { label: "EUROPE", top: "18%", left: "47%" },
          { label: "AFRICA", top: "50%", left: "47%" },
          { label: "ASIA", top: "22%", left: "65%" },
          { label: "OCEANIA", top: "68%", left: "77%" },
        ].map(({ label, top, left }) => (
          <span
            key={label}
            className="absolute font-['Orbitron'] text-[0.42rem] tracking-[3px] opacity-25"
            style={{
              top,
              left,
              color: "#00d4ff",
              transform: "translate(-50%,-50%)",
            }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* ── Country stats side panel ── */}
      <AnimatePresence>
        {selected && stats && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.22 }}
            className="absolute top-6 left-2 z-20 glass-dark rounded-sm overflow-hidden"
            style={{
              width: 160,
              border: `1px solid ${stats.color}33`,
              boxShadow: `0 0 20px ${stats.color}18`,
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
                  {selected.toUpperCase()}
                </p>
                <p
                  className="text-[0.42rem] tracking-[2px] mt-0.5"
                  style={{ color: `${stats.color}bb` }}
                >
                  {stats.status}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
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

      {/* ── Map ── */}
      <ComposableMap
        projectionConfig={{ scale: 148, center: [10, 5] }}
        style={{ width: "100%", height: "100%" }}
      >
        <Sphere
          id="rsm-sphere"
          fill="rgba(2,10,22,0.85)"
          stroke="rgba(0,212,255,0.18)"
          strokeWidth={0.6}
        />
        <Graticule stroke="rgba(0,212,255,0.055)" strokeWidth={0.45} />

        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name = geo.properties?.name || `#${geo.id}`;
              const isSelected = selected === name;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isSelected ? "#0d2d4a" : countryFill(geo)}
                  stroke={
                    isSelected ? "rgba(0,212,255,0.6)" : "rgba(0,212,255,0.22)"
                  }
                  strokeWidth={isSelected ? 0.7 : 0.38}
                  onMouseEnter={() => handleEnter(name)}
                  onMouseLeave={handleLeave}
                  onClick={() => handleClick(name)}
                  style={{
                    default: { outline: "none" },
                    hover: {
                      fill: "#0a2238",
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: { fill: "#0d2d4a", outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Attack arcs */}
        {arcs.map((arc, i) => {
          const color = Array.isArray(arc.color) ? arc.color[0] : arc.color;
          return (
            <Line
              key={i}
              from={[arc.slng, arc.slat]}
              to={[arc.elng, arc.elat]}
              stroke={color}
              strokeWidth={1.1}
              strokeLinecap="round"
              strokeDasharray="7 5"
              strokeDashoffset={0}
              style={{
                filter: `drop-shadow(0 0 3px ${color}cc)`,
                animation: `arc-dash 2s linear ${(i * 0.18).toFixed(2)}s infinite`,
              }}
            />
          );
        })}

        {/* City markers */}
        {CITIES.map((city) => (
          <Marker key={city.name} coordinates={[city.lng, city.lat]}>
            {city.role === "target" && (
              <>
                <circle
                  r={8}
                  fill="none"
                  stroke={city.color}
                  strokeWidth={0.9}
                  opacity={0}
                >
                  <animate
                    attributeName="r"
                    values="3;14"
                    dur="2.6s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.9;0"
                    dur="2.6s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  r={5}
                  fill="none"
                  stroke={city.color}
                  strokeWidth={0.6}
                  opacity={0}
                >
                  <animate
                    attributeName="r"
                    values="2;8"
                    dur="2.6s"
                    begin="0.9s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.7;0"
                    dur="2.6s"
                    begin="0.9s"
                    repeatCount="indefinite"
                  />
                </circle>
              </>
            )}
            <circle
              r={city.role === "origin" ? 4 : 3.5}
              fill={city.color}
              style={{ filter: `drop-shadow(0 0 6px ${city.color})` }}
            />
            {city.role === "origin" && (
              <circle
                r={6}
                fill="none"
                stroke={city.color}
                strokeWidth={0.5}
                opacity={0}
              >
                <animate
                  attributeName="opacity"
                  values="0.5;0"
                  dur="1s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="r"
                  values="4;9"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            <text
              x={city.role === "origin" ? -7 : 7}
              y={-6}
              fontSize={6.5}
              fill={city.color}
              fontFamily="'Share Tech Mono',monospace"
              textAnchor={city.role === "origin" ? "end" : "start"}
              style={{
                filter: `drop-shadow(0 0 3px ${city.color})`,
                pointerEvents: "none",
                opacity: hovered === city.name ? 1 : 0.85,
              }}
            >
              {city.name}
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}

export default memo(WorldMap);
