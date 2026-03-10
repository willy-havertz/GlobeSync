import { memo, useRef, useState, useLayoutEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import CyberTooltip from "./CyberTooltip";

const CHART_H = 180;

function ThreatAreaChart({ data }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(300);

  useLayoutEffect(() => {
    const measure = () => {
      if (wrapRef.current) {
        const w = wrapRef.current.getBoundingClientRect().width;
        if (w > 0) setWidth(Math.floor(w));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="flex flex-col glass anim-flicker"
      style={{ minWidth: 0 }}
    >
      <div className="panel-title" style={{ overflow: "hidden" }}>
        <span className="dot" />
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
            flex: 1,
          }}
        >
          THREAT ACTIVITY (32 MIN)
        </span>
      </div>
      <div ref={wrapRef} style={{ width: "100%", height: CHART_H }}>
        <AreaChart
          width={width}
          height={CHART_H}
          data={data}
          margin={{ top: 4, right: 8, bottom: 0, left: -20 }}
        >
          <defs>
            <linearGradient id="gMal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff2d2d" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ff2d2d" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gDdos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff8800" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#ff8800" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gPhi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(0,212,255,.05)" strokeDasharray="3 3" />
          <XAxis
            dataKey="t"
            tick={{ fontSize: 7, fill: "#4488aa" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 7, fill: "#4488aa" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CyberTooltip />} />
          <Area
            type="monotone"
            dataKey="malware"
            stroke="#ff2d2d"
            strokeWidth={1.5}
            fill="url(#gMal)"
            dot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="ddos"
            stroke="#ff8800"
            strokeWidth={1.5}
            fill="url(#gDdos)"
            dot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="phishing"
            stroke="#a855f7"
            strokeWidth={1.5}
            fill="url(#gPhi)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </div>
    </div>
  );
}

export default memo(ThreatAreaChart);
