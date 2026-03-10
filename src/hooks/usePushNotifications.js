/**
 * usePushNotifications.js
 *
 * Wraps the Web Notifications API / Service Worker showNotification.
 * Works on desktop and on mobile when the PWA is installed to home screen.
 *
 * Usage:
 *   const { permission, requestPermission, notify } = usePushNotifications();
 */

import { useState, useCallback } from "react";

const ICON = "/pwa-192x192.png";
const BADGE = "/pwa-192x192.png";

export function usePushNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "denied",
  );

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "denied";
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  /**
   * Show a notification.
   * Prefers the service worker (shows even when tab is in background / PWA).
   * Falls back to new Notification() if SW is not available.
   */
  const notify = useCallback(async (title, body, { tag, icon = ICON } = {}) => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;

    const opts = {
      body,
      icon,
      badge: BADGE,
      tag: tag || title,
      renotify: true,
      silent: false,
    };

    try {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, opts);
      } else {
        new Notification(title, opts);
      }
    } catch {
      /* SW might not be available in dev — silently ignore */
      try {
        new Notification(title, opts);
      } catch {
        /* Notification API not supported */
      }
    }
  }, []);

  return { permission, requestPermission, notify };
}
