"use client";
import TransitionVertical from "@/animations/TransitionVertical";
import React from "react";

const ConsistencyChart: React.FC = () => {
  const year = 2025;
  const month = 8;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Generate day data (simulate work intensity)
  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    date: new Date(year, month, i + 1),
    value: Math.floor(Math.random() * 10),
  }));

  const firstDay = new Date(year, month, 1).getDay();

  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const weeks: ((typeof days)[number] | null)[][] = [];
  let currentWeek: ((typeof days)[number] | null)[] = Array(offset).fill(null);

  days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const getOpacity = (value: number) =>
    value === 0 ? 0.1 : 0.2 + value * 0.08;

  const weekdays = ["M", "T", "W", "Th", "F", "Sa", "S"];

  return (
    <div className="w-full flex flex-col items-center mt-5 border border-white/20 rounded-lg p-3">
      <TransitionVertical>
        <h2 className="text-lg  mb-3 text-white">Consistency</h2>
      </TransitionVertical>

      <h1 className="text-[#DF9AEE] text-xs font-extralight mb-3">
        August 2025
      </h1>

      {/* Weekday header */}
      <div className="w-full grid grid-cols-7 mb-2 text-center">
        {weekdays.map((day) => (
          <div key={day} className="text-xs text-[#DF9AEE] text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="w-full flex flex-col gap-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day, di) =>
              day ? (
                <div
                  key={di}
                  className=" h-5 rounded-xs flex items-center justify-center text-[10px]"
                  style={{
                    backgroundColor: `rgba(223, 154, 238, ${getOpacity(
                      day.value
                    )})`,
                    color: day.value > 5 ? "white" : "#DF9AEE",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                  title={`${day.date.getDate()}: ${day.value} pts`}
                ></div>
              ) : (
                <div key={di} className="w-10 h-10" />
              )
            )}
          </div>
        ))}
      </div>

      <div className="w-full h-px bg-white/20"></div>

      <div className="w-full flex justify-around items-center mt-2">
        <div className="flex justify-between items-center w-1/3 gap-2">
          <div className="flex flex-col justify-center text-center gap-2 items-center">
            <div className="w-7 h-3 bg-[#DF9AEE]/50"></div>
            <h1 className="text-[10px] font-extralight text-[#DF9AEE]">
              7-Day Streak
            </h1>
          </div>

          <div className="flex flex-col justify-center text-center gap-2 items-center">
            <div className="w-7 h-3 bg-[#DF9AEE]"></div>
            <h1 className="text-[10px] font-extralight text-[#DF9AEE]">
              30 Day Streak
            </h1>
          </div>
        </div>

        <div className="w-px h-12 bg-white/10 mx-3"></div>

        <div className="flex justify-between items-start w-2/3 gap-2">
          <div className="w-1/3 flex flex-col justify-start gap-2 items-center">
            <div className="w-7 h-3 bg-[#DF9AEE]/10"></div>
            <h1 className="text-[10px] font-extralight text-[#DF9AEE]">
              0 min
            </h1>
          </div>

          <div className="w-1/3 flex flex-col justify-start gap-2 items-start">
            <div className="w-7 h-3 bg-[#DF9AEE]/50"></div>
            <h1 className="text-[10px] font-extralight text-[#DF9AEE]">
              Short Session
            </h1>
          </div>

          <div className="w-1/3 flex flex-col justify-center gap-2 items-start">
            <div className="w-7 h-3 bg-[#DF9AEE]"></div>
            <h1 className="text-[10px] font-extralight text-[#DF9AEE]">
              Long Session
            </h1>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-white/20 my-3"></div>
      <div className="flex gap-3">
        <div className="w-7 h-3 bg-[#DF9AEE]"></div>
        <h1 className="text-[10px] font-extralight text-[#DF9AEE]">
          Your longest streak was 14 days in September — try breaking it!
        </h1>
      </div>
    </div>
  );
};

export default ConsistencyChart;
