"use client";
import TransitionVertical from "@/animations/TransitionVertical";
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { WeeklyTimeResponse } from "@/actions/weeklyTime";

// Color mapping for subjects
const SUBJECT_COLORS: Record<string, string> = {
  English: "#FBE38E",
  Mathematics: "#FF41AA",
  Science: "#462CF4",
  "Social Science": "#4EE6FF",
  "Open-ended": "#7CFF6B",
};

type ActiveTimeChartsProps = {
  data: WeeklyTimeResponse;
};

const ActiveTimeCharts: React.FC<ActiveTimeChartsProps> = ({ data }) => {
  // Transform API data to chart format
  const chartData = useMemo(() => {
    return data.weeks
      .slice()
      .reverse() // Reverse to show oldest to newest
      .map((week) => {
        const weekLabel = new Date(week.week_start).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        
        // Create data point with all subjects and moving average
        const dataPoint: Record<string, number | string> = {
          date: weekLabel,
          movingAvg: week.average_minutes,
        };

        // Add each subject's time
        data.all_subjects.forEach((subject) => {
          dataPoint[subject] = week.subjects[subject] || 0;
        });

        return dataPoint;
      });
  }, [data]);

  // Calculate max value for Y axis
  const maxValue = useMemo(() => {
    let max = 0;
    data.weeks.forEach((week) => {
      Object.values(week.subjects).forEach((value) => {
        if (value > max) max = value;
      });
    });
    return Math.ceil(max / 30) * 30; // Round up to nearest 30
  }, [data]);

  const yAxisTicks = useMemo(() => {
    const ticks = [];
    const step = Math.max(30, Math.ceil(maxValue / 5 / 10) * 10);
    for (let i = 0; i <= maxValue; i += step) {
      ticks.push(i);
    }
    return ticks;
  }, [maxValue]);
  return (
    <div className="w-full h-full border border-white/20 rounded-lg py-4 mt-7">
      <TransitionVertical>
        <h1 className="text-lg font-light mb-4 text-center">Active Time</h1>
      </TransitionVertical>

      <div className="h-48 px-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid
              horizontal={false}
              vertical={true}
              stroke="#ffffff33"
            />

            {/* X Axis */}
            <XAxis
              dataKey="date"
              tick={{ fill: "#DF9AEE", fontSize: 10 }}
              axisLine={{ stroke: "#555" }}
              tickLine={false}
              label={{
                value: "Week Start",
                position: "insideBottom",
                offset: 0,
                fill: "#DF9AEE",
                fontSize: 12,
                dy: 10,
              }}
            />

            <YAxis
              tick={{ fill: "#DF9AEE", fontSize: 10 }}
              axisLine={{ stroke: "#555" }}
              tickLine={false}
              ticks={yAxisTicks}
              domain={[0, maxValue]}
              label={{
                value: "Minutes Active",
                dy: 30,
                angle: -90,
                position: "insideLeft",
                fill: "#DF9AEE",
                fontSize: 12,
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(30,30,30,0.9)",
                borderColor: "#DF9AEE",
              }}
            />

            {/* Line for Open-ended only */}
            <Line
              type="monotone"
              dataKey="Open-ended"
              stroke={SUBJECT_COLORS["Open-ended"] || "#7CFF6B"}
              strokeWidth={2}
              dot={false}
            />

            {/* Dotted moving average line */}
            <Line
              type="monotone"
              dataKey="movingAvg"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActiveTimeCharts;
