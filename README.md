# GlobeSync AI — Cybersecurity Intelligence Dashboard

A real-time cybersecurity intelligence dashboard featuring a live 3D globe attack map, threat feeds, system health gauges, and live event logs. Built with React + Vite on the frontend and FastAPI on the backend.

---

## Features

- **Live 3D Globe** — animated attack arc visualisation powered by `globe.gl` + Three.js, colour-coded by threat origin
- **Real-Time Threat Feeds** — pulls live IOC data from ThreatFox, URLhaus, and Feodo Tracker; falls back to a realistic built-in simulator if feeds are unavailable
- **WebSocket Stream** — backend broadcasts new events instantly to all connected clients via `/ws/live`
- **System Health Gauges** — animated circular gauges for Network load and Firewall stress
- **Threat Level Panel** — Risk Score and Blocked percentage gauges
- **Threat Activity Chart** — live area chart of attack activity over the last 32 minutes
- **Attack Distribution Chart** — bar chart of attack types (Malware, DDoS, Phishing, BruteForce, Ransomware, SQLInject)
- **Real-Time Logs Panel** — scrolling live event feed with severity colour-coding
- **Top Attacked Ports** — bar chart of port attack volumes
- **Stat Cards** — live counters for Intrusions, Malware, DDoS, and Threats
- **Threat Feed Ticker** — scrolling marquee of the latest threat events
- **Toast Alerts** — pop-up notifications for incoming critical events
- **Boot Screen** — HUD-style startup animation on first load
- **About Modal** — full-screen overlay with platform info, privacy policy, and terms
- **Mobile Navigation** — fixed top bar + slide-out drawer with scroll-to-section links

---

## Tech Stack

### Frontend

| Package             | Role                       |
| ------------------- | -------------------------- |
| React 19 + Vite 7   | UI framework + build tool  |
| Tailwind CSS v4     | Utility-first styling      |
| framer-motion 12    | Animations and transitions |
| globe.gl + Three.js | 3D interactive globe       |
| Recharts            | Area / bar charts          |
| react-simple-maps   | Fallback 2D map            |

### Backend

| Package       | Role                               |
| ------------- | ---------------------------------- |
| FastAPI 0.115 | REST + WebSocket API               |
| Uvicorn       | ASGI server                        |
| httpx         | Async HTTP for threat feed polling |
| python-dotenv | Environment variable loading       |
| geoip2        | IP geolocation                     |

---

## Project Structure

```
security-dashboard/
├── index.html
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── index.css               # Global styles, glass/HUD CSS classes, animations
│   ├── pages/
│   │   └── Dashboard.jsx       # Main dashboard page
│   ├── components/
│   │   ├── GlobeMap.jsx        # 3D globe with attack arcs (lazy-loaded)
│   │   ├── LogsPanel.jsx       # Real-time event log feed
│   │   ├── ThreatAreaChart.jsx # Area chart (lazy-loaded)
│   │   ├── AttackBarChart.jsx  # Bar chart (lazy-loaded)
│   │   ├── CircularGauge.jsx   # SVG circular gauges
│   │   ├── StatCard.jsx        # Stat counter cards
│   │   ├── PortsPanel.jsx      # Top attacked ports
│   │   ├── ThreatTicker.jsx    # Scrolling marquee ticker
│   │   ├── MobileNav.jsx       # Mobile slide-out nav drawer
│   │   ├── AboutModal.jsx      # Full-screen about/info modal (lazy-loaded)
│   │   ├── BootScreen.jsx      # Startup HUD animation
│   │   ├── ToastAlert.jsx      # Toast notifications
│   │   └── CsiLogo.jsx         # Animated SVG logo
│   ├── hooks/
│   │   └── useSocket.js        # WebSocket connection hook
│   └── data/
│       └── constants.js        # Seed data, arc definitions, helpers
└── backend/
    ├── main.py                 # FastAPI app, WebSocket broadcaster
    ├── feeds.py                # Threat feed polling (ThreatFox, URLhaus, Feodo)
    ├── geoip.py                # GeoIP async lookup
    ├── requirements.txt
    ├── start.sh                # Convenience start script
    └── .env                    # API keys (not committed)
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.11

---

### 1. Clone & install frontend dependencies

```bash
git clone <repo-url>
cd security-dashboard
npm install
```

### 2. Set up the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure API keys (optional)

Create `backend/.env`:

```env
# Free account at https://auth.abuse.ch/ — enables ThreatFox + URLhaus
ABUSE_CH_KEY=your_abuse_ch_key

# Free at https://www.abuseipdb.com/ — IP reputation enrichment (1,000/day)
ABUSEIPDB_KEY=your_abuseipdb_key

# Free at https://otx.alienvault.com/ — OTX pulse IOCs
OTX_KEY=your_otx_key

# How often (seconds) to re-poll feeds. Default: 60
POLL_INTERVAL=60
```

All keys are optional — the dashboard falls back to a realistic built-in event simulator if no feeds are reachable.

### 4. Start the backend

```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

Or use the convenience script:

```bash
cd backend && bash start.sh
```

### 5. Start the frontend dev server

```bash
# from project root
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Building for Production

```bash
npm run build
```

Output is written to `dist/`. The build is automatically code-split into separate cached chunks:

| Chunk              | Contents                 | Size (gzip) |
| ------------------ | ------------------------ | ----------- |
| `index.js`         | App shell, UI components | ~68 KB      |
| `vendor-3d.js`     | Three.js + globe.gl      | ~524 KB     |
| `vendor-charts.js` | Recharts                 | ~95 KB      |
| `vendor-motion.js` | framer-motion            | ~44 KB      |
| `GlobeMap.js`      | Globe component          | ~3 KB       |
| `AboutModal.js`    | About overlay            | ~8 KB       |

The heavy 3D and chart bundles load in parallel after the initial app shell, making first paint significantly faster.

Preview the production build locally:

```bash
npm run preview
```

---

## Progressive Web App (PWA)

GlobeSync AI is a fully installable PWA.

**What this means:**

- Chrome / Edge / Android show an **"Install App"** button in the address bar
- The app can be pinned to the home screen or taskbar like a native app
- After first load, the app shell (HTML, CSS, JS) loads **instantly from cache**
- Google Fonts are cached for offline use
- GeoJSON / topology data is cached for 30 days

**What still requires a live connection:**

- Live threat feed events (WebSocket `/ws/live`)
- API stats and logs (`/api/*`)
- The 3D globe attack arcs (data-driven, not cached)

**PWA files in `dist/`:**

| File                       | Purpose                                  |
| -------------------------- | ---------------------------------------- |
| `manifest.webmanifest`     | App metadata, icons, display mode        |
| `sw.js`                    | Workbox service worker (auto-generated)  |
| `pwa-192x192.png`          | Home screen icon                         |
| `pwa-512x512.png`          | Splash screen / store icon               |
| `pwa-512x512-maskable.png` | Maskable icon for Android adaptive icons |

The service worker uses `autoUpdate` mode — installed users automatically get the latest version in the background without any prompts.

---

## Threat Feeds

| Feed                                            | Requires        | Data                                            |
| ----------------------------------------------- | --------------- | ----------------------------------------------- |
| [ThreatFox](https://threatfox.abuse.ch/)        | `ABUSE_CH_KEY`  | Recent malware IOCs from the abuse.ch community |
| [URLhaus](https://urlhaus.abuse.ch/)            | `ABUSE_CH_KEY`  | Active malware download URLs and IPs            |
| [Feodo Tracker](https://feodotracker.abuse.ch/) | None            | Active botnet C2 IPs (Emotet, TrickBot, etc.)   |
| [AbuseIPDB](https://www.abuseipdb.com/)         | `ABUSEIPDB_KEY` | IP reputation enrichment                        |
| [AlienVault OTX](https://otx.alienvault.com/)   | `OTX_KEY`       | Threat pulse IOCs                               |

---

## License

MIT
