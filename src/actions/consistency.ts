"use server";
import { fetchFromAPI } from "@/lib/api/client";

export type ConsistencyDay = {
  date: string;
  lecture_count: number;
  weekday: number;
  week_start: string;
  week_start_monday: string;
  month: number;
  month_key: string;
  year: number;
  is_today: boolean;
  is_future: boolean;
  week_index: number;
};

export type ConsistencyWeek = {
  week_start: string;
  week_end: string;
  days: ConsistencyDay[];
  total_lectures: number;
  active_days: number;
  index: number;
};

export type ConsistencyMonthBreakdown = {
  month: number;
  month_name: string;
  month_short: string;
  year: number;
  label: string;
  month_key: string;
  start_date: string;
  end_date: string;
  total_lectures: number;
  active_days: number;
};

export type ConsistencyStreak = {
  length: number;
  start_date: string | null;
  end_date: string | null;
};

export type ConsistencySummary = {
  total_lectures: number;
  active_days: number;
  daily_max: number;
  daily_max_dates: string[];
  daily_min: number;
  daily_min_dates: string[];
  daily_min_active: number;
  daily_min_active_dates: string[];
  average_per_day: number;
  average_per_active_day: number;
  streaks: {
    current: ConsistencyStreak;
    longest: ConsistencyStreak;
  };
};

export type ConsistencyCalendarResponse = {
  period: string;
  months: number;
  today: string;
  range: {
    start_date: string;
    end_date: string;
  };
  days: ConsistencyDay[];
  weeks: ConsistencyWeek[];
  months_breakdown: ConsistencyMonthBreakdown[];
  summary: ConsistencySummary;
};

/**
 * Server action to fetch usage calendar data for consistency chart.
 * @param range - "month", "week", or "year"
 */
export async function getConsistencyCalendar(
  range: "month" | "week" | "year" = "month"
): Promise<ConsistencyCalendarResponse> {
  const url = `realtime2/usage/calendar?range=${encodeURIComponent(range)}`;
  const data = await fetchFromAPI<ConsistencyCalendarResponse>(url, {
    requiresAuth: true,
  });
  return data;
}
