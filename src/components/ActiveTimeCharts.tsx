"use client";
import TransitionVertical from "@/animations/TransitionVertical";
import React from "react";
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

// Sample data for June
const data = [
  { date: "Jun 1", practice: 50, assessment: 40, creative: 30, movingAvg: 45 },
  { date: "Jun 6", practice: 70, assessment: 60, creative: 50, movingAvg: 55 },
  { date: "Jun 12", practice: 90, assessment: 70, creative: 60, movingAvg: 70 },
  { date: "Jun 18", practice: 80, assessment: 75, creative: 65, movingAvg: 72 },
  {
    date: "Jun 22",
    practice: 100,
    assessment: 85,
    creative: 80,
    movingAvg: 80,
  },
  {
    date: "Jun 26",
    practice: 110,
    assessment: 95,
    creative: 90,
    movingAvg: 90,
  },
  {
    date: "Jun 30",
    practice: 120,
    assessment: 100,
    creative: 95,
    movingAvg: 95,
  },
];

const ActiveTimeCharts = () => {
  return (
    <div className="w-full h-full border border-white/20 rounded-lg py-4 mt-7">
      <TransitionVertical>
        <h1 className="text-lg font-light mb-4 text-center">Active Time</h1>
      </TransitionVertical>

      <div className="h-48 px-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
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
                value: "Days",
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
              ticks={[0, 30, 60, 90, 120, 150]}
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

            {/* Lines */}
            <Line
              type="monotone"
              dataKey="practice"
              stroke="#FBE38E"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="assessment"
              stroke="#FF41AA"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="creative"
              stroke="#462CF4"
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
