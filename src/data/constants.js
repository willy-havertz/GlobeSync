/* ──────────────────────────── CITY / ARC DATA ──────────────────────────── */
export const CITIES = [
  { name: "Moscow", lat: 55.75, lng: 37.62, role: "origin", color: "#ff2d2d" },
  { name: "Beijing", lat: 39.9, lng: 116.4, role: "origin", color: "#ff8800" },
  { name: "Tehran", lat: 35.69, lng: 51.39, role: "origin", color: "#ff8800" },
  {
    name: "Pyongyang",
    lat: 39.02,
    lng: 125.75,
    role: "origin",
    color: "#ff2d2d",
  },
  {
    name: "New York",
    lat: 40.71,
    lng: -74.0,
    role: "target",
    color: "#00d4ff",
  },
  { name: "London", lat: 51.51, lng: -0.13, role: "target", color: "#00d4ff" },
  { name: "Berlin", lat: 52.52, lng: 13.4, role: "target", color: "#a855f7" },
  { name: "Tokyo", lat: 35.69, lng: 139.69, role: "target", color: "#00ffea" },
  {
    name: "Sydney",
    lat: -33.87,
    lng: 151.21,
    role: "target",
    color: "#00ff88",
  },
  {
    name: "São Paulo",
    lat: -23.55,
    lng: -46.63,
    role: "target",
    color: "#00d4ff",
  },
];

export const BASE_ARCS = [
  {
    slat: 55.75,
    slng: 37.62,
    elat: 40.71,
    elng: -74.0,
    color: ["#ff2d2d", "#ff000000"],
  },
  {
    slat: 55.75,
    slng: 37.62,
    elat: 51.51,
    elng: -0.13,
    color: ["#ff2d2d", "#ff000000"],
  },
  {
    slat: 39.9,
    slng: 116.4,
    elat: 40.71,
    elng: -74.0,
    color: ["#ff8800", "#ff000000"],
  },
  {
    slat: 39.9,
    slng: 116.4,
    elat: 35.69,
    elng: 139.69,
    color: ["#ff8800", "#ff000000"],
  },
  {
    slat: 35.69,
    slng: 51.39,
    elat: 52.52,
    elng: 13.4,
    color: ["#ff6600", "#ff000000"],
  },
  {
    slat: 39.02,
    slng: 125.75,
    elat: 40.71,
    elng: -74.0,
    color: ["#ff2d2d", "#ff000000"],
  },
  {
    slat: 55.75,
    slng: 37.62,
    elat: -33.87,
    elng: 151.21,
    color: ["#ff4400", "#ff000000"],
  },
  {
    slat: 39.9,
    slng: 116.4,
    elat: -23.55,
    elng: -46.63,
    color: ["#ff8800", "#ff000000"],
  },
];

/* ──────────────────────────── LOG DATA ──────────────────────────── */
export const LOG_TYPES = [
  { type: "MALWARE DETECTED", cls: "text-red-400", severity: "CRITICAL" },
  { type: "UNAUTHORIZED ACCESS", cls: "text-orange-400", severity: "HIGH" },
  { type: "DDOS ATTEMPT", cls: "text-red-300", severity: "HIGH" },
  { type: "PHISHING ALERT", cls: "text-yellow-400", severity: "MEDIUM" },
  { type: "PORT SCAN DETECTED", cls: "text-orange-300", severity: "MEDIUM" },
  { type: "BRUTE FORCE ATTACK", cls: "text-red-500", severity: "CRITICAL" },
  { type: "RANSOMWARE DETECTED", cls: "text-purple-400", severity: "CRITICAL" },
  { type: "SQL INJECTION", cls: "text-orange-500", severity: "HIGH" },
];

export const SEVERITY_COLOR = {
  CRITICAL: "#ff2d2d",
  HIGH: "#ff8800",
  MEDIUM: "#ffcc00",
};

export const IPS = [
  "192.168.43.21",
  "45.67.89.102",
  "31.204.154.96",
  "103.21.244.0",
  "176.114.0.53",
  "91.108.4.200",
  "185.220.101.42",
  "77.37.248.11",
  "51.174.67.48",
  "194.165.16.79",
  "116.110.84.22",
  "178.128.220.54",
];

/* ──────────────────────────── HELPERS ──────────────────────────── */
export const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
export const randEl = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function makeLog(id) {
  const d = new Date();
  const t = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  const lt = randEl(LOG_TYPES);
  return { id, time: t, ...lt, ip: IPS[id % IPS.length] };
}

export const INIT_LOGS = Array.from({ length: 28 }, (_, i) => {
  const d = new Date(Date.now() - i * 13000);
  const t = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  return {
    id: i,
    time: t,
    ...LOG_TYPES[i % LOG_TYPES.length],
    ip: IPS[i % IPS.length],
  };
}).reverse();

export function genChartData(size = 16) {
  return Array.from({ length: size }, (_, i) => ({
    t: `${(i + 1) * 2}m`,
    malware: randInt(20, 120),
    ddos: randInt(10, 80),
    phishing: randInt(5, 60),
    exploits: randInt(8, 50),
  }));
}

export function genBarData() {
  return [
    { name: "Malware", count: randInt(600, 900), fill: "#ff2d2d" },
    { name: "DDoS", count: randInt(400, 700), fill: "#ff8800" },
    { name: "Phishing", count: randInt(200, 500), fill: "#ffcc00" },
    { name: "Brute", count: randInt(150, 400), fill: "#a855f7" },
    { name: "Ransom", count: randInt(80, 250), fill: "#ff4466" },
    { name: "SQLi", count: randInt(60, 180), fill: "#00d4ff" },
  ];
}
