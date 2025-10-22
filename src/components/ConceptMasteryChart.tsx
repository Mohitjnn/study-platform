"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { TooltipProps } from "recharts";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

const data = [
  { subject: "Science", percentage: 70, color: "#FBE38E" },
  { subject: "Math", percentage: 50, color: "#FF41AA" },
  { subject: "Social Science", percentage: 90, color: "#462CF4" },
];

// Custom minimal tooltip
const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-white text-black px-2 py-1 rounded text-sm shadow-md">
        Apply: {value}%
      </div>
    );
  }
  return null;
};

const ConceptMasteryChart = () => {
  return (
    <div className="w-full border border-white/20 rounded-lg py-4 mt-7">
      <h1 className="text-lg font-light mb-4 text-center">Concept Mastery</h1>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 30, right: 30, left: -30, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />

            <XAxis
              type="number"
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tick={{ fill: "#DF9AEE", fontSize: 12 }}
              orientation="top"
              axisLine={{ stroke: "#555" }}
              tickLine={false}
              label={{
                value: "Bloom Levels",
                position: "insideTop",
                offset: -20,
                fill: "#DF9AEE",
                fontSize: 12,
              }}
            />

            <YAxis
              type="category"
              dataKey="subject"
              tick={false}
              axisLine={false}
            />

            <Tooltip cursor={false} content={<CustomTooltip />} />

            <Bar dataKey="percentage">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList
                dataKey="subject"
                position="insideLeft"
                fill="#000"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConceptMasteryChart;
