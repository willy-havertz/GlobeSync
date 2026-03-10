import { memo, useRef, useState, useLayoutEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import CyberTooltip from "./CyberTooltip";

const CHART_H = 180;

const GlowBar = ({ x, y, width, height, fill }) => (
  <g>
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      style={{ filter: `drop-shadow(0 0 4px ${fill}88)` }}
    />
    <rect
      x={x}
      y={y}
      width={width}
      height={2}
      fill={fill}
      style={{ filter: `drop-shadow(0 0 6px ${fill})` }}
    />
  </g>
);

function AttackBarChart({ data }) {
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
      <div className="panel-title purple">
        <span className="dot" />
        <span>ATTACK DISTRIBUTION</span>
      </div>
      <div ref={wrapRef} style={{ width: "100%", height: CHART_H }}>
        <BarChart
          width={width}
          height={CHART_H}
          data={data}
          margin={{ top: 4, right: 8, bottom: 28, left: -22 }}
          barCategoryGap="25%"
        >
          <CartesianGrid
            stroke="rgba(168,85,247,.05)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 7, fill: "#9966dd" }}
            angle={-35}
            textAnchor="end"
            interval={0}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 7, fill: "#9966dd" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CyberTooltip />} />
          <Bar
            dataKey="count"
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
            shape={<GlowBar />}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </div>
    </div>
  );
}

export default memo(AttackBarChart);
