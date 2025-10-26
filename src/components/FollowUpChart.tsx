"use client";
import React, { useMemo } from "react";
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
import type { TopRepeatedTopicsResponse } from "@/actions/followUp";

// Color mapping for subjects
const SUBJECT_COLORS: Record<string, string> = {
  English: "#FBE38E",
  Mathematics: "#FF41AA",
  Science: "#462CF4",
  "Social Science": "#4EE6FF",
  "Open-ended": "#7CFF6B",
};

type FollowUpChartProps = {
  data: TopRepeatedTopicsResponse;
};

type ChartDataPoint = {
  x: number;
  y: number;
  minutes: number;
  subject: string;
  topic: string;
  sessions: number;
  color: string;
};

// Custom tooltip to show minutes and subject
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const { subject, topic, sessions, minutes } = payload[0]
      .payload as ChartDataPoint;
    return (
      <div className="bg-white text-black px-2 py-1 rounded text-sm shadow-md">
        <div className="font-semibold">{subject}</div>
        <div className="text-xs">{topic}</div>
        <div className="text-xs">Sessions: {sessions}</div>
        <div className="text-xs">Total: {minutes.toFixed(2)} min</div>
        <div className="text-xs">
          Avg: {(minutes / sessions).toFixed(2)} min
        </div>
      </div>
    );
  }
  return null;
};

const FollowUpChart: React.FC<FollowUpChartProps> = ({ data: apiData }) => {
  // Transform API data to chart format
  const chartData = useMemo<ChartDataPoint[]>(() => {
    return apiData.topics
      .filter((topic) => topic.top_topic && topic.session_count > 0) // Only show topics with data
      .map((topic, index) => ({
        x: topic.session_count, // X-axis: session count
        y: topic.avg_minutes, // Y-axis: average minutes
        minutes: topic.total_minutes, // Radius: total minutes
        subject: topic.subject,
        topic: topic.top_topic || "Unknown",
        sessions: topic.session_count,
        color: SUBJECT_COLORS[topic.subject] || "#FFFFFF",
      }));
  }, [apiData]);

  // Get unique subjects for legend
  const subjects = useMemo(() => {
    return chartData.map((item) => ({
      name: item.subject,
      color: item.color,
    }));
  }, [chartData]);

  // Calculate max values for axis domains
  const maxSessions = useMemo(() => {
    return Math.max(...chartData.map((d) => d.x), 5);
  }, [chartData]);

  const maxAvgMinutes = useMemo(() => {
    return Math.max(...chartData.map((d) => d.y), 10);
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="w-full border border-white/20 rounded-lg p-4 mt-7">
        <h1 className="text-lg font-light mb-3 text-center text-white">
          Follow Up - Depth
        </h1>
        <p className="text-sm text-center text-muted-foreground">
          No repeated topics yet
        </p>
      </div>
    );
  }

  return (
    <div className="w-full border border-white/20 rounded-lg p-4 mt-7">
      <h1 className="text-lg font-light mb-3 text-center text-white">
        Follow Up - Depth
      </h1>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, left: -12, bottom: 20 }}>
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
              domain={[0, maxSessions]}
              axisLine={{ stroke: "#ffffff20" }}
              tickLine={false}
              label={{
                value: "Session Count (Follow Ups)",
                position: "insideBottom",
                offset: -10,
                fill: "#DF9AEE",
                fontSize: 12,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              tick={{ fill: "#DF9AEE", fontSize: 12 }}
              domain={[0, maxAvgMinutes]}
              axisLine={{ stroke: "#ffffff20" }}
              tickLine={false}
              label={{
                value: "Avg Minutes",
                angle: -90,
                position: "insideLeft",
                offset: 20,
                fill: "#DF9AEE",
                fontSize: 12,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              data={chartData}
              fill="#8884d8"
              shape={(props: ScatterPointItem) => {
                const { cx = 0, cy = 0, payload } = props;
                const radius = Math.max(payload.minutes * 2.5, 10); // Scale by total minutes
                return (
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={payload.color}
                      opacity={0.7}
                    />
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={9}
                      fontWeight="bold"
                    >
                      {payload.minutes.toFixed(1)}
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
        {subjects.map((subject) => (
          <div
            key={subject.name}
            className="flex flex-col justify-center items-center mt-2 gap-2"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: subject.color }}
            ></div>
            <h1 className="text-xs text-[#DF9AEE]">{subject.name}</h1>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowUpChart;
