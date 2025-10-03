import { fetchFromAPI } from "@/lib/api/client";
import { cookies } from "next/headers";

interface dayContent {
  date: string;
  duration_seconds: number;
  label: string;
}
export interface ScreenTimeStats {
  daily_average_seconds: number;
  labels: string[];
  days: dayContent[];
  percent_change_vs_prev: number;
}

// Helper to convert seconds to minutes (float)
function secondsToMinutes(seconds: number): number {
  return Math.round((seconds / 60) * 10) / 10;
}

// export async function getWeeklyScreenTimeStats() {
//   const endpoint = "realtime2/usage/days";

//   const res = await fetchFromAPI<ScreenTimeStats>(endpoint, {
//     requiresAuth: true,
//   });
//   // Map days to minutes
//   const dailyMinutes = (res.days || []).map((d: dayContent) =>
//     secondsToMinutes(d.duration_seconds)
//   );
//   // Ensure 7 days
//   while (dailyMinutes.length < 7) dailyMinutes.push(0);

//   // Weekly average
//   const weeklyAverage = secondsToMinutes(res.daily_average_seconds);
//   // Weekly change
//   const weeklyChange =
//     typeof res.percent_change_vs_prev === "number"
//       ? res.percent_change_vs_prev
//       : 0;
//   // Last updated
//   const lastUpdated =
//     res.days && res.days.length > 0
//       ? `Updated on ${res.days[res.days.length - 1].date}`
//       : "";

//   return {
//     dailyMinutes,
//     weeklyAverage,
//     weeklyChange,
//     lastUpdated,
//   };
// }

export async function getWeeklyScreenTimeStats() {
  const endpoint = "realtime2/usage/days";

  const res = await fetchFromAPI<{
    days: {
      date: string;
      duration_seconds: number;
      curiosity_points: number;
      label: string;
    }[];
    labels: string[];
    daily_average_seconds: number;
    percent_change_vs_prev: number | null;
  }>(endpoint, {
    requiresAuth: true,
  });

  const dailyMinutes = (res.days || []).map((d) =>
    secondsToMinutes(d.duration_seconds)
  );
  const dailyPoints = (res.days || []).map((d) => d.curiosity_points ?? 0);
  const dayLabels = (res.days || []).map((d) => d.label);

  const weeklyAverage = secondsToMinutes(res.daily_average_seconds);
  const weeklyChange = res.percent_change_vs_prev ?? 0;

  const lastUpdated =
    res.days && res.days.length > 0
      ? `Updated on ${res.days[res.days.length - 1].date}`
      : "";

  return {
    dailyMinutes,
    dailyPoints, // 👈 return points per day
    dayLabels,
    weeklyAverage,
    weeklyChange,
    lastUpdated,
  };
}

export async function getOverAllStats() {
  const res = await fetchFromAPI<{
    total_courses: number;
    completed_courses: number;
    minutes_studied: number;
    streak: number;
  }>("realtime2/dashboard/stats", { requiresAuth: true });
  return {
    totalCourses: res.total_courses || 0,
    completedCourses: res.completed_courses || 0,
    minutesStudied: res.minutes_studied || 0,
    currentStreak: res.streak || 0,
  };
}
