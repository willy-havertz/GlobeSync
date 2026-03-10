import { memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import CyberTooltip from "./CyberTooltip";

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
  return (
    <div
      className="flex flex-col glass anim-flicker h-full"
      style={{ minHeight: 130, minWidth: 0, overflow: "hidden" }}
    >
      <div className="panel-title purple">
        <span className="dot" />
        <span>ATTACK DISTRIBUTION</span>
      </div>
      <div className="flex-1 px-1 py-1" style={{ minHeight: 0 }}>
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={100}
          debounce={50}
        >
          <BarChart
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
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default memo(AttackBarChart);
