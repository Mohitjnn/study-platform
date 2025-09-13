"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartConfig = {
  hours: {
    label: "Hours",
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
    dataKey: "hours",
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
  dailyHours: number[]; // Array of 7 numbers for Sunday to Saturday
  weeklyAverage: number;
  weeklyChange: number; // Percentage change from last week
  lastUpdated: string; // e.g., "Updated today at 7:20 PM"
}

export default function ScreenTimeChart({
  dailyHours,
  weeklyAverage,
  weeklyChange,
  lastUpdated,
}: ScreenTimeChartProps) {
  // Create chart data by mapping props to hardcoded structure
  const chartData = React.useMemo(() => {
    return dayLabels.map((dayInfo, index) => ({
      ...dayInfo,
      hours: dailyHours[index] || 0,
    }));
  }, [dailyHours]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="w-full text-white lg:rounded-2xl overflow-hidden ">
      {/* Header */}
      <div className="p-2">
        <h2 className="text-gray-400 text-sm mb-1">
          {screenTimeConfig.header.title}
        </h2>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xl lg:text-4xl font-light">
            {formatTime(weeklyAverage)}
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
        <BarChart data={chartData}>
          <CartesianGrid
            vertical={false}
            horizontal={true}
            strokeDasharray="none"
            stroke="#374151"
            opacity={0.3}
          />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{
              fill: screenTimeConfig.axis.tickColor,
              fontSize: screenTimeConfig.axis.fontSize,
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            domain={[0, 8]}
            ticks={[0, 2, 4, 6, 8]}
            tick={{
              fill: screenTimeConfig.axis.tickColor,
              fontSize: screenTimeConfig.axis.fontSize,
            }}
            tickFormatter={(value) => `${value}h`}
          />
          {/* Average line */}
          <ReferenceLine
            y={weeklyAverage}
            stroke={screenTimeConfig.average.lineColor}
            strokeDasharray={screenTimeConfig.average.lineStyle}
            strokeWidth={2}
            z={1000}
          />
          <Bar
            dataKey={screenTimeConfig.bar.dataKey}
            fill={screenTimeConfig.bar.fill}
            radius={screenTimeConfig.bar.radius}
            maxBarSize={screenTimeConfig.bar.maxBarSize}
            z={10}
          />
        </BarChart>
      </ChartContainer>
      {/* Average label */}
      <div className="flex justify-end mt-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div
            className="w-3 h-0 border-t-2 border-dashed"
            style={{ borderColor: screenTimeConfig.average.lineColor }}
          ></div>
          <span>{screenTimeConfig.average.label}</span>
        </div>
      </div>
      {/* Updated time */}
      <div className="px-6 pb-4">
        <p className={`${screenTimeConfig.updated.color} text-sm`}>
          {lastUpdated}
        </p>
      </div>
    </div>
  );
}
