import { useRef, useCallback } from "react";

/**
 * useTilt — attaches a rAF-driven 3-D perspective tilt to any DOM element.
 *
 * getBoundingClientRect is cached on pointerenter and on ResizeObserver,
 * so zero forced layouts happen during mousemove rAF callbacks.
 */
export function useTilt({
  maxX = 5,
  maxY = 8,
  perspective = 900,
  tz = 6,
  shineColor = "rgba(0,212,255,0.10)",
} = {}) {
  const elRef = useRef(null);
  const shineRef = useRef(null);
  const rafRef = useRef(null);
  const rectRef = useRef(null); // cached bounding rect
  const roRef = useRef(null); // ResizeObserver for cache invalidation

  /* Callback refs */
  const setEl = useCallback((node) => {
    /* Tear down previous observer */
    if (roRef.current) {
      roRef.current.disconnect();
      roRef.current = null;
    }
    elRef.current = node;
    if (!node) return;
    /* Prime the cache immediately */
    rectRef.current = node.getBoundingClientRect();
    /* Invalidate cache when element resizes */
    roRef.current = new ResizeObserver(() => {
      rectRef.current = elRef.current?.getBoundingClientRect() ?? null;
    });
    roRef.current.observe(node);
  }, []);

  const setShine = useCallback((node) => {
    shineRef.current = node;
  }, []);

  /* Re-cache rect on pointer-enter (handles scroll / layout shifts) */
  const onMouseEnter = useCallback(() => {
    if (elRef.current) rectRef.current = elRef.current.getBoundingClientRect();
  }, []);

  const onMouseMove = useCallback(
    (e) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const el = elRef.current;
        if (!el) return;
        const rect = rectRef.current;
        if (!rect) return;

        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        const rX = -y * maxX * 2;
        const rY = x * maxY * 2;

        el.style.transform = `perspective(${perspective}px) rotateX(${rX}deg) rotateY(${rY}deg) translateZ(${tz}px)`;

        const shine = shineRef.current;
        if (shine) {
          shine.style.opacity = "1";
          shine.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${
            (y + 0.5) * 100
          }%, ${shineColor} 0%, transparent 65%)`;
        }
      });
    },
    [maxX, maxY, perspective, tz, shineColor],
  );

  const onMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const el = elRef.current;
    if (el) el.style.transform = "";
    const shine = shineRef.current;
    if (shine) shine.style.opacity = "0";
  }, []);

  return { setEl, setShine, onMouseEnter, onMouseMove, onMouseLeave };
}
