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
          curiosityData,
          consistencyData,
          masteryData,
          weeklyTimeData,
          followUpData,
        ] = await Promise.all([
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
