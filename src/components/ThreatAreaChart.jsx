import { memo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import CyberTooltip from "./CyberTooltip";

function ThreatAreaChart({ data }) {
  return (
    <div
      className="flex flex-col glass anim-flicker h-full"
      style={{ minHeight: 130, minWidth: 0, overflow: "hidden" }}
    >
      <div className="panel-title">
        <span className="dot" />
        <span>THREAT ACTIVITY (LAST 32 MIN)</span>
      </div>
      <div className="flex-1 px-1 py-1" style={{ minHeight: 0 }}>
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={100}
          debounce={50}
        >
          <AreaChart
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
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default memo(ThreatAreaChart);
