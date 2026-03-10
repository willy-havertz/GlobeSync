import { useTilt } from "../hooks/useTilt";

/**
 * Panel3D — drop-in wrapper that adds rAF mouse-tracking 3-D tilt +
 * a specular-highlight shimmer to any panel.
 *
 * Usage:
 *   <Panel3D className="glass anim-flicker flex flex-col min-h-0 flex-1">
 *     {children}
 *   </Panel3D>
 *
 * Props forwarded to useTilt: maxX, maxY, perspective, tz, shineColor
 */
export default function Panel3D({
  children,
  className = "",
  style = {},
  maxX,
  maxY,
  perspective,
  tz,
  shineColor,
}) {
  const opts = {};
  if (maxX       !== undefined) opts.maxX       = maxX;
  if (maxY       !== undefined) opts.maxY       = maxY;
  if (perspective !== undefined) opts.perspective = perspective;
  if (tz         !== undefined) opts.tz         = tz;
  if (shineColor !== undefined) opts.shineColor = shineColor;

  const { setEl, setShine, onMouseEnter, onMouseMove, onMouseLeave } = useTilt(opts);

  return (
    <div
      ref={setEl}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`relative ${className}`}
      style={{
        transition: "transform 0.18s ease",
        transformStyle: "preserve-3d",
        willChange: "transform",
        ...style,
      }}
    >
      {/* Specular shimmer overlay — positionally fills the panel */}
      <div
        ref={setShine}
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          borderRadius: "inherit",
          zIndex: 10,
          transition: "opacity 0.22s ease",
        }}
      />
      {children}
    </div>
  );
}
