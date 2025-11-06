"use client";
import TransitionVertical from "@/animations/TransitionVertical";
import React, { useState, useMemo } from "react";
import { PieChart, Pie, Sector, Cell, SectorProps } from "recharts";
import type { MasteryResponse } from "@/actions/mastery";

type DataItem = {
  name: string;
  value: number;
  color: string;
};

// Color palette for subjects
const SUBJECT_COLORS = [
  "#FBE38E", // Yellow
  "#FF41AA", // Pink
  "#e6e3ffff", // Purple
  "#4EE6FF", // Cyan
  "#7CFF6B", // Green
  "#FF6B6B", // Red
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

  // --- 2. START: ARROW POSITION CALCULATION ---
  const RADIAN = Math.PI / 180;
  const midAngle = (startAngle + endAngle) / 2;
  // Position the arrow 30px outside the main pie radius
  const arrowRadius = outerRadius + 30;
  // Calculate X and Y position
  const x = cx + arrowRadius * Math.sin(midAngle * RADIAN);
  // Y is inverted (negative) because 0 is at the top in this SVG coord system
  const y = cy - arrowRadius * Math.cos(midAngle * RADIAN);
  // Place the pointer inside the pie, at the midpoint between inner and outer radius
  const pointerRadius = innerRadius + (outerRadius - innerRadius) / 2;
  const pointerX = cx + pointerRadius * Math.sin(midAngle * RADIAN);
  const pointerY = cy - pointerRadius * Math.cos(midAngle * RADIAN);
  // Calculate rotation angle for the pointer (so it points outward)
  const pointerAngle = midAngle;
  // --- END: ARROW POSITION CALCULATION ---

  return (
    <g>
      {/* Gradient behind center text */}
      <defs>
        <linearGradient id="centerGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.5)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
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
      <text x={cx} y={cy} textAnchor="middle" fill="#090E6C" fontSize={32}>
        {displayPercent}%
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#090E6C" fontSize={10}>
        learning time on
      </text>
      <text x={cx} y={cy + 24} textAnchor="middle" fill="#090E6C" fontSize={10}>
        {payload?.name}
      </text>
    </g>
  );
};

type ConceptMasteryPieProps = {
  data: MasteryResponse;
};

export default function ConceptMasteryPie({
  data: apiData,
}: ConceptMasteryPieProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Transform API data to chart format with colors
  const data = useMemo<DataItem[]>(() => {
    return apiData.subjects.map((subject, index) => ({
      name: subject.name,
      value: subject.mastery_pct,
      color: SUBJECT_COLORS[index % SUBJECT_COLORS.length],
    }));
  }, [apiData]);

  // If no data, show empty state
  if (!data.length) {
    return (
      <div className="w-full border border-white/20 rounded-lg flex flex-col justify-center items-center mt-7 py-4">
        <TransitionVertical>
          <h1 className="font-light text-lg mb-2">Concept Mastery</h1>
        </TransitionVertical>
        <p className="text-sm text-muted-foreground">
          No mastery data available
        </p>
      </div>
    );
  }

  return (
    <div className="w-full border border-white/20 rounded-lg flex flex-col justify-center items-center mt-7 py-4">
      <TransitionVertical>
        <h1 className="font-light text-lg mb-2">Concept Mastery</h1>
      </TransitionVertical>

      <div className="bg-gradient-to-b from-[#fff]/20 to-[#fff]/10 rounded-full">
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
      <div className="grid grid-cols-2 gap-4 mt-4 w-full mx-auto px-8">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 w-full">
            <div
              className="w-3 h-3 rounded-full z-30"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-white">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
