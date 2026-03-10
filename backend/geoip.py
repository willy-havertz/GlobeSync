"""
geoip.py — IP → (lat, lng) resolver.

Priority:
  1. Local MaxMind GeoLite2-City.mmdb  (fastest, no rate limit)
  2. ip-api.com free endpoint           (no key needed, 45 req/min)
  3. Returns None, None on failure
"""

import os
import httpx

_reader = None

def _load_maxmind():
    global _reader
    db = os.path.join(os.path.dirname(__file__), "GeoLite2-City.mmdb")
    if os.path.isfile(db):
        try:
            import geoip2.database
            _reader = geoip2.database.Reader(db)
            print(f"[geoip] Loaded MaxMind DB: {db}")
        except Exception as e:
            print(f"[geoip] MaxMind load failed: {e}")

_load_maxmind()

# Synchronous lookup (called inside async feeds via thread pool)
def lookup(ip: str) -> tuple[float | None, float | None]:
    if _reader:
        try:
            r = _reader.city(ip)
            lat, lng = r.location.latitude, r.location.longitude
            if lat and lng:
                return lat, lng
        except Exception:
            pass
    return None, None


async def lookup_async(ip: str) -> tuple[float | None, float | None]:
    """Try MaxMind first; fall back to ip-api.com."""
    lat, lng = lookup(ip)
    if lat is not None:
        return lat, lng

    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(
                f"http://ip-api.com/json/{ip}",
                params={"fields": "status,lat,lon"},
            )
            data = r.json()
            if data.get("status") == "success":
                return data["lat"], data["lon"]
    except Exception:
        pass

    return None, None
