"use client";
import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "01 week", uv: 10 },
  { name: "02 week", uv: 30 },
  { name: "03 week", uv: 40 },
  { name: "04 week", uv: 60 },
];

const CuriosityChart = () => {
  return (
    <div className="w-full border border-white/20 rounded-lg mt-7">
      <div className="pt-2">
        <h1 className="text-lg font-light my-2 text-center">Curiosity Index</h1>
      </div>

      <div className="h-48 px-4 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 10 }}
          >
            <defs>
              {/* Gradient fill */}
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DF9AEE" stopOpacity={1} />
                <stop offset="100%" stopColor="#DF9AEE" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Custom stacked X labels */}
            <XAxis
              dataKey="name"
              axisLine={{ stroke: "#ffffff/10" }}
              tickLine={false}
              tick={({ x, y, payload }) => {
                const [num, label] = payload.value.split(" ");
                return (
                  <text
                    x={x}
                    y={y + 18}
                    textAnchor="middle"
                    fill="#DF9AEE"
                    fontSize="10"
                  >
                    <tspan x={x} dy="-6">
                      {num}
                    </tspan>
                    <tspan x={x} dy="12">
                      {label}
                    </tspan>
                  </text>
                );
              }}
            />

            {/* Left Y Axis */}
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fill: "#DF9AEE", fontSize: 10 }}
              axisLine={{ stroke: "#fff/10" }}
              tickLine={false}
              tickCount={30}
              ticks={[0, 20, 40, 60]}
              label={{
                value: "Unique Curiosity Events",
                angle: -90,
                position: "insideLeft",
                fill: "#DF9AEE",
                fontSize: 12,
                dy: 90,
              }}
            />

            {/* Right Y Axis */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#DF9AEE", fontSize: 10 }}
              axisLine={{ stroke: "#fff/10" }}
              tickLine={false}
              ticks={[0.0, 1.0, 2.0, 3.0]}
              tickFormatter={(value) => value.toFixed(1)}
              tickCount={30}
              label={{
                value: "Average Followups",
                angle: 90,
                position: "insideRight",
                fill: "#DF9AEE",
                fontSize: 12,
                dy: 90,
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(30, 30, 30, 0.9)",
                borderColor: "#DF9AEE",
              }}
            />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="uv"
              stroke="#F8D7FF"
              strokeWidth={2}
              fill="url(#colorUv)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CuriosityChart;
