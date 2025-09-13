import { fetchFromAPI } from '@/lib/api/client';
import { cookies } from 'next/headers';

interface dayContent {
  date: string;
  duration_seconds: number;
  label:string
}
export interface ScreenTimeStats {
  daily_average_seconds: number;
  labels: string[];
  days: dayContent[];
  percent_change_vs_prev: number;
}

// Helper to convert seconds to hours (float)
function secondsToHours(seconds: number): number {
  return Math.round((seconds / 3600) * 10) / 10;
}

export async function getWeeklyScreenTimeStats (){
  const endpoint = 'realtime2/usage/days';

  const res = await fetchFromAPI<ScreenTimeStats>(endpoint,{requiresAuth: true})
  console.log("Screen time response:", res);
  // Map days to hours
  const dailyHours = (res.days || []).map((d: dayContent) => secondsToHours(d.duration_seconds));
  // Ensure 7 days
  while (dailyHours.length < 7) dailyHours.push(0);

  // Weekly average
  const weeklyAverage = res.daily_average_seconds
  // Weekly change
  const weeklyChange = typeof res.percent_change_vs_prev === 'number' ? res.percent_change_vs_prev : 0;
  // Last updated
  const lastUpdated = (res.days && res.days.length > 0) ? `Updated on ${res.days[res.days.length-1].date}` : '';

  return {
    dailyHours,
    weeklyAverage,
    weeklyChange,
    lastUpdated,
  };
}
