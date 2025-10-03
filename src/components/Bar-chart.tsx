"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
  LabelList,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartConfig = {
  minutes: {
    label: "Minutes",
    color: "#00d4aa", // Cyan/teal color like iPhone
  },
} satisfies ChartConfig;

// Hardcoded day structure (Sunday to Saturday)
const dayLabels = [
  { day: "S", dayFull: "Sunday" },
  { day: "M", dayFull: "Monday" },
  { day: "T", dayFull: "Tuesday" },
  { day: "W", dayFull: "Wednesday" },
  { day: "T", dayFull: "Thursday" },
  { day: "F", dayFull: "Friday" },
  { day: "S", dayFull: "Saturday" },
];

const screenTimeConfig = {
  header: {
    title: "Daily Average",
    subtitle: "Screen Time",
  },
  average: {
    label: "avg",
    color: "#00d4aa",
    lineColor: "#00d4aa",
    lineStyle: "4 4",
  },
  bar: {
    dataKey: "minutes",
    fill: "#e8e8e8ff",
    radius: [2, 2, 0, 0] as [number, number, number, number],
    maxBarSize: 80,
  },
  axis: {
    tickColor: "#9ca3af",
    fontSize: 12,
  },
  updated: {
    color: "text-gray-500",
  },
};

interface ScreenTimeChartProps {
  dailyMinutes: number[]; // Array of 7 numbers for Sunday to Saturday
  dailyPoints: number[];
  dayLabels: string[];
  weeklyAverage: number;
  weeklyChange: number; // Percentage change from last week
  lastUpdated: string; // e.g., "Updated today at 7:20 PM"
}

export default function ScreenTimeChart({
  dailyMinutes,
  dailyPoints,
  dayLabels,
  weeklyAverage,
  weeklyChange,
  lastUpdated,
}: ScreenTimeChartProps) {
  const chartData = React.useMemo(() => {
    return dayLabels.map((label, index) => ({
      day: label,
      minutes: dailyMinutes[index] || 0,
      points: dailyPoints[index] || 0,
    }));
  }, [dayLabels, dailyMinutes, dailyPoints]);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m}m`;
  };

  return (
    <div className="w-full text-white lg:rounded-2xl overflow-hidden ">
      {/* Header */}
      <div className="p-2">
        <h2 className="text-gray-400 text-sm mb-1">Daily Average</h2>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xl lg:text-4xl font-light">
            {Math.floor(weeklyAverage / 60)}h {weeklyAverage % 60}m
          </span>
          <div className="flex items-center gap-1 text-gray-400">
            <span className="text-lg">{weeklyChange >= 0 ? "↗" : "↘"}</span>
            <span className="text-xs lg:text-sm">
              {Math.abs(weeklyChange).toFixed(0)}% from last week
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ChartContainer
        config={chartConfig}
        className="h-[200px] w-[110%] sm:w-full -ml-6 lg:-ml-2"
      >
        <BarChart data={chartData} margin={{ top: 30 }}>
          <CartesianGrid vertical={false} stroke="#374151" opacity={0.3} />

          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />

          <YAxis
            tickFormatter={(v) => `${v}m`}
            domain={[0, "auto"]}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />

          {/* Average line for minutes */}
          <ReferenceLine
            y={weeklyAverage}
            stroke="#00d4aa"
            strokeDasharray="4 4"
            strokeWidth={2}
          />

          {/* Single Bar for minutes */}
          <Bar dataKey="minutes" fill="#00d4aa" radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="points"
              position="top"
              className="fill-amber-400 text-xs"
              formatter={(val: number) => `${val} pts`}
            />
          </Bar>
        </BarChart>
      </ChartContainer>

      {/* Legend */}
      <div className="flex justify-end mt-2 gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#00d4aa] rounded-sm"></div>
          <span>Screen Time</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#f59e0b] rounded-sm"></div>
          <span>Curiosity Points</span>
        </div>
      </div>

      {/* Updated time */}
      <div className="pb-4 mt-4">
        <p className="text-gray-500 text-sm">{lastUpdated}</p>
      </div>
    </div>
  );
}
