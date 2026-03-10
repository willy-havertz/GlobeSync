#!/usr/bin/env bash
# start.sh — Set up and run the CyberShield AI backend
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── 1. Create virtual environment ───────────────────────────────────────────
if [ ! -d ".venv" ]; then
  echo "[setup] Creating Python virtual environment..."
  python3 -m venv .venv
fi

# shellcheck disable=SC1091
source .venv/bin/activate

# ── 2. Install dependencies ─────────────────────────────────────────────────
echo "[setup] Installing dependencies..."
pip install -q -r requirements.txt

# ── 3. Create .env from example if not present ──────────────────────────────
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "[setup] Created .env from .env.example — add your API keys there."
fi

# ── 4. Remind about GeoLite2 ────────────────────────────────────────────────
if [ ! -f "GeoLite2-City.mmdb" ]; then
  echo ""
  echo "  [optional] For faster IP geolocation, download GeoLite2-City.mmdb"
  echo "  from https://www.maxmind.com/en/geolite2/signup and place it in:"
  echo "  $SCRIPT_DIR/GeoLite2-City.mmdb"
  echo "  Without it the backend falls back to ip-api.com (45 req/min)."
  echo ""
fi

# ── 5. Free port 8000 if already in use ─────────────────────────────────────
if fuser 8000/tcp &>/dev/null; then
  echo "[start] Port 8000 in use — killing existing process..."
  fuser -k 8000/tcp &>/dev/null
  sleep 1
fi

# ── 6. Start server ──────────────────────────────────────────────────────────
echo "[start] Starting CyberShield AI backend on http://localhost:8000"
echo "[start] Press Ctrl+C to stop."
echo ""
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
