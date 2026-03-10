/**
 * useTheme.js — HUD colour profile switcher
 *
 * Four profiles: cyan (default), amber, green, red.
 * Applies CSS custom properties to document.documentElement so every
 * panel, border, glow and gauge updates instantly.
 * Persists the chosen theme to localStorage.
 */

import { useState, useEffect, useCallback } from "react";

export const THEMES = {
  cyan: {
    id: "cyan",
    label: "CYAN",
    hud: "#00d4ff",
    hud2: "#00ffea",
    hudRgb: "0,212,255",
    bg: "radial-gradient(ellipse at 50% 0%, #0d1a2e 0%, #02040a 65%)",
    swatch: "#00d4ff",
  },
  amber: {
    id: "amber",
    label: "AMBER",
    hud: "#f59e0b",
    hud2: "#fcd34d",
    hudRgb: "245,158,11",
    bg: "radial-gradient(ellipse at 50% 0%, #1a1000 0%, #060400 65%)",
    swatch: "#f59e0b",
  },
  green: {
    id: "green",
    label: "GREEN",
    hud: "#00ff88",
    hud2: "#00ffcc",
    hudRgb: "0,255,136",
    bg: "radial-gradient(ellipse at 50% 0%, #001a0d 0%, #000602 65%)",
    swatch: "#00ff88",
  },
  red: {
    id: "red",
    label: "RED",
    hud: "#ff4444",
    hud2: "#ff8888",
    hudRgb: "255,68,68",
    bg: "radial-gradient(ellipse at 50% 0%, #1a0202 0%, #060002 65%)",
    swatch: "#ff4444",
  },
};

const STORAGE_KEY = "globesync-theme";

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty("--hud", theme.hud);
  root.style.setProperty("--hud2", theme.hud2);
  root.style.setProperty("--hud-rgb", theme.hudRgb);
  root.setAttribute("data-theme", theme.id);
}

export function useTheme() {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || "cyan";
  });

  const theme = THEMES[themeId] || THEMES.cyan;

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((id) => {
    localStorage.setItem(STORAGE_KEY, id);
    setThemeId(id);
  }, []);

  return { theme, themeId, setTheme, themes: THEMES };
}
