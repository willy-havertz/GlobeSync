/**
 * useAlertRules.js — User-configured push notification rules
 *
 * Each rule is a boolean toggle.  When a rule is disabled the
 * corresponding event type will NOT trigger a push notification.
 * Settings persist to localStorage.
 */

import { useState, useCallback } from "react";

const STORAGE_KEY = "globesync-alert-rules";

export const ALERT_RULE_DEFS = [
  {
    id: "ransomware",
    label: "Ransomware",
    icon: "🦠",
    desc: "Any ransomware detection (always CRITICAL)",
  },
  {
    id: "malware",
    label: "Malware",
    icon: "💀",
    desc: "Malware events at CRITICAL severity",
  },
  {
    id: "ddos",
    label: "DDoS Attacks",
    icon: "💥",
    desc: "DDoS events at HIGH or CRITICAL severity",
  },
  {
    id: "brute",
    label: "Brute Force",
    icon: "🔐",
    desc: "Brute-force attacks at CRITICAL severity",
  },
  {
    id: "phishing",
    label: "Phishing",
    icon: "🎣",
    desc: "Phishing campaign alerts at CRITICAL severity",
  },
  {
    id: "anyCritical",
    label: "Any Critical",
    icon: "🚨",
    desc: "Catch-all for any other CRITICAL event not covered above",
  },
];

const DEFAULT_RULES = {
  ransomware: true,
  malware: true,
  ddos: true,
  brute: true,
  phishing: true,
  anyCritical: true,
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_RULES;
    return { ...DEFAULT_RULES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_RULES;
  }
}

export function useAlertRules() {
  const [rules, setRules] = useState(load);

  const toggle = useCallback((id) => {
    setRules((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setAll = useCallback((enabled) => {
    setRules(() => {
      const next = Object.fromEntries(
        ALERT_RULE_DEFS.map((r) => [r.id, enabled]),
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { rules, toggle, setAll };
}
