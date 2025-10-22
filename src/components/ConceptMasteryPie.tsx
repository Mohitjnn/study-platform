"use client";
import React, { useState } from "react";
import { PieChart, Pie, Sector, Cell, SectorProps } from "recharts";

type DataItem = {
  name: string;
  value: number;
  color: string;
};

const data: DataItem[] = [
  { name: "Science", value: 20, color: "#FBE38E" },
  { name: "Maths", value: 45, color: "#FF41AA" },
  { name: "English", value: 15, color: "#462CF4" },
  { name: "History", value: 20, color: "#4EE6FF" },
];

// Render active slice with center text and gradient
const renderActiveShape = (props: unknown) => {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill = "#000",
    payload,
    percent = 0,
  } = props as SectorProps & {
    payload: DataItem;
    percent: number;
  };

  const displayPercent = (percent * 100).toFixed(0);

  return (
    <g>
      {/* Gradient behind center text */}
      <defs>
        <linearGradient id="centerGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(223, 154, 238, 0.5)" />
          <stop offset="100%" stopColor="rgba(223, 154, 238, 0)" />
        </linearGradient>
      </defs>

      {/* Normal slice */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />

      {/* Highlight slice when active */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius - 1}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />

      {/* Center circle gradient */}
      <circle cx={cx} cy={cy} r={64} fill="url(#centerGradient)" />

      {/* Center text */}
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#DF9AEE" fontSize={10}>
        You are spending
      </text>
      <text x={cx} y={cy} textAnchor="middle" fill="#DF9AEE" fontSize={10}>
        {displayPercent}%
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#DF9AEE" fontSize={10}>
        of your learning time on
      </text>
      <text x={cx} y={cy + 24} textAnchor="middle" fill="#DF9AEE" fontSize={10}>
        {payload?.name}
      </text>
    </g>
  );
};

export default function ConceptMasteryPie() {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  return (
    <div className="w-full border border-white/20 rounded-lg flex flex-col justify-center items-center mt-7 py-4">
      <h1 className="font-light text-lg mb-2">Concept Mastery</h1>

      <div className="bg-gradient-to-b from-[#DF9AEE]/20 to-[#DF9AEE]/10 rounded-full">
        <PieChart width={200} height={200}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="80%"
            outerRadius="90%"
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            dataKey="value"
            onMouseEnter={(_, index) => setActiveIndex(index)}
            paddingAngle={4}
            cornerRadius={8}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
        </PieChart>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4 mt-4 w-44">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-white">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
