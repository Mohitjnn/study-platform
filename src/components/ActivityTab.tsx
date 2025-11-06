"use client";

import { useEffect, useState } from "react";
import CuriosityChart from "@/components/CuriosityChart";
import ActiveTimeCharts from "@/components/ActiveTimeCharts";
import ConceptMasteryPie from "@/components/ConceptMasteryPie";
import ConsistencyChart from "@/components/ConsistencyChart";
import FollowUpChart from "@/components/FollowUpChart";
import { getCuriosityIndex } from "@/actions/curiosity";
import { getConsistencyCalendar } from "@/actions/consistency";
import { getSubjectMastery } from "@/actions/mastery";
import { getWeeklyTime } from "@/actions/weeklyTime";
import { getTopRepeatedTopics } from "@/actions/followUp";
import { getOverAllStats } from "@/actions/screenTime";
import { SlotMachineCounter } from "@/animations/SlotMachineCounter";

// Import or define the proper return types from your actions
type CuriosityIndexData = Awaited<ReturnType<typeof getCuriosityIndex>>;
type ConsistencyCalendarData = Awaited<
  ReturnType<typeof getConsistencyCalendar>
>;
type SubjectMasteryData = Awaited<ReturnType<typeof getSubjectMastery>>;
type WeeklyTimeData = Awaited<ReturnType<typeof getWeeklyTime>>;
type TopRepeatedTopicsData = Awaited<ReturnType<typeof getTopRepeatedTopics>>;

type ActivityData = {
  curiosityData: CuriosityIndexData;
  consistencyData: ConsistencyCalendarData;
  masteryData: SubjectMasteryData;
  weeklyTimeData: WeeklyTimeData;
  followUpData: TopRepeatedTopicsData;
  overallStats: {
    totalCourses: number;
    completedCourses: number;
    minutesStudied: number;
    currentStreak: number;
  };
};

export default function ActivityTab() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [
          overallStats,
          curiosityData,
          consistencyData,
          masteryData,
          weeklyTimeData,
          followUpData
        ] = await Promise.all([
          getOverAllStats(),
          getCuriosityIndex(4),
          getConsistencyCalendar("month"),
          getSubjectMastery(),
          getWeeklyTime(5),
          getTopRepeatedTopics(5),
        ]);

        setData({
          curiosityData,
          consistencyData,
          masteryData,
          weeklyTimeData,
          followUpData,
          overallStats: {
            totalCourses: overallStats.totalCourses,
            completedCourses: overallStats.completedCourses,
            minutesStudied: overallStats.minutesStudied,
            currentStreak: overallStats.currentStreak,
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 mt-12">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-64 bg-white/10 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <div className="mt-12">
               {/* Stats Section */}
        {data.overallStats ? (
          <div className="flex flex-col justify-center items-center relative my-5">
            <div className="w-full h-px bg-gradient-to-r from-white/40 via-transparent to-white/40 my-2"></div>
            <div className="flex items-center w-full">
              <div className="relative flex items-center gap-4 w-1/2 h-full p-2">
                <div className="p-1 h-10 w-10 flex justify-center items-center bg-white/20 border-2 border-white/30 rounded-full">
                  <img src="images/topic.png" alt="img" />
                </div>
                <div>
                  <SlotMachineCounter targetValue={data.overallStats.totalCourses}>
                    <h1 className="text-2xl font-bold" />
                  </SlotMachineCounter>
                  <h1 className="text-xs font-extralight">Total Courses</h1>
                </div>
              </div>

              <div className="w-px h-16 bg-gradient-to-b from-white/40 to-transparent"></div>

              <div className="relative flex items-center gap-4 w-1/2 h-full pl-2">
                <div className="p-1 h-10 w-10 flex justify-center items-center bg-white/20 border-2 border-white/30 rounded-full">
                  <img src="images/hours.png" alt="img" />
                </div>
                <div>
                  <SlotMachineCounter
                    targetValue={data.overallStats.completedCourses}
                  >
                    <h1 className="text-2xl font-bold" />
                  </SlotMachineCounter>
                  <h1 className="text-xs font-light">Completed Courses</h1>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-white/40 via-transparent to-white/40 my-1"></div>

            <div className="flex items-center w-full">
              <div className="relative flex items-center gap-4 w-1/2 h-full pl-2">
                <div className="p-1 h-10 w-10 flex justify-center items-center bg-white/20 border-2 border-white/30 rounded-full">
                  <img src="images/streak.png" alt="img" />
                </div>
                <div>
                  <SlotMachineCounter targetValue={data.overallStats.minutesStudied}>
                    <h1 className="text-2xl font-bold" />
                  </SlotMachineCounter>
                  <h1 className="text-xs font-light">Minutes Studied</h1>
                </div>
              </div>

              <div className="w-px h-16 bg-gradient-to-t from-white/40 to-transparent"></div>

              <div className="relative flex items-center gap-4 w-1/2 h-full p-2">
                <div className="p-1 h-10 w-10 flex justify-center items-center bg-white/20 border-2 border-white/30 rounded-full">
                  <img src="images/topic.png" alt="img" />
                </div>
                <div>
                  <SlotMachineCounter targetValue={data.overallStats.currentStreak}>
                    <h1 className="text-2xl font-bold" />
                  </SlotMachineCounter>
                  <h1 className="text-xs font-light">Streak</h1>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-white/40 via-transparent to-white/40 my-2"></div>
          </div>
        ) : (
          <div className="flex justify-center items-center mb-8 min-h-[40px]">
            <div className="text-muted-foreground">Loading stats...</div>
          </div>
        )}
        <div className="sticky top-10 z-10 backdrop-blur-xl">
          <CuriosityChart data={data.curiosityData} />
        </div>
        <div className="sticky top-20 z-20 backdrop-blur-xl">
          <ConceptMasteryPie data={data.masteryData} />
        </div>
        <div className="sticky top-30 z-30 backdrop-blur-xl">
          <ActiveTimeCharts data={data.weeklyTimeData} />
        </div>
        <div className="sticky top-40 z-40 backdrop-blur-xl">
          <FollowUpChart data={data.followUpData} />
        </div>
        <div className="sticky top-50 z-50 backdrop-blur-xl">
          <ConsistencyChart data={data.consistencyData} />
        </div>
      </div>
    </>
  );
}
