"use client";
import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

import { ScatterPointItem } from "recharts/types/cartesian/Scatter";

// Sample data: x = index, y = constant (all on same line), size = minutes
const data = [
  { x: 0, y: 10, minutes: 10, subject: "Science", color: "#FBE38E" },
  { x: 1, y: 30, minutes: 30, subject: "Maths", color: "#FF41AA" },
  { x: 2, y: 20, minutes: 20, subject: "English", color: "#462CF4" },
  { x: 3, y: 40, minutes: 40, subject: "History", color: "#4EE6FF" },
];

// Custom tooltip to show minutes and subject

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const { subject, minutes } = payload[0].payload as {
      subject: string;
      minutes: number;
      color: string;
    };
    return (
      <div className="bg-white text-black px-2 py-1 rounded text-sm shadow-md">
        {subject}: {minutes} min
      </div>
    );
  }
  return null;
};

const FollowUpChart: React.FC = () => {
  return (
    <div className="w-full border border-white/20 rounded-lg p-4 mt-7">
      <h1 className="text-lg font-light mb-3 text-center text-white">
        Follow Up - Depth
      </h1>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ffffff10"
              horizontal={false}
              vertical={true}
            />
            <XAxis
              type="number"
              dataKey="x"
              tick={{ fill: "#DF9AEE", fontSize: 12 }}
              ticks={data.map((d) => d.x)}
              axisLine={{ stroke: "#ffffff20" }}
              tickLine={false}
              label={{
                value: "Follow Ups - Per Topic",
                position: "bottom",
                fill: "#DF9AEE",
                fontSize: 12,
              }}
            />
            <YAxis type="number" dataKey="y" hide />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              data={data}
              fill="#8884d8"
              shape={(props: ScatterPointItem) => {
                const { cx = 0, cy = 0, payload } = props;
                const radius = payload.minutes / 2;
                return (
                  <g>
                    <circle cx={cx} cy={cy} r={radius} fill={payload.color} />
                    <text
                      x={cx}
                      y={cy + 2}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={8}
                    >
                      {payload.minutes}
                    </text>
                  </g>
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full h-px bg-white/20 my-2"></div>

      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col justify-center items-center mt-2 gap-2">
          <div className="w-2 h-2 bg-[#FBE38E] rounded-full"></div>
          <h1 className="text-xs text-[#DF9AEE]">Science</h1>
        </div>

        <div className="flex flex-col justify-center items-center mt-2 gap-2">
          <div className="w-2 h-2 bg-[#FF41AA] rounded-full"></div>
          <h1 className="text-xs text-[#DF9AEE]">Maths</h1>
        </div>

        <div className="flex flex-col justify-center items-center mt-2 gap-2">
          <div className="w-2 h-2 bg-[#462CF4] rounded-full"></div>
          <h1 className="text-xs text-[#DF9AEE]">English</h1>
        </div>

        <div className="flex flex-col justify-center items-center mt-2 gap-2">
          <div className="w-2 h-2 bg-[#4EE6FF] rounded-full"></div>
          <h1 className="text-xs text-[#DF9AEE]">History</h1>
        </div>
      </div>
    </div>
  );
};

export default FollowUpChart;
