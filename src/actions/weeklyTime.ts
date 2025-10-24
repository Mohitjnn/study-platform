"use server";
import { fetchFromAPI } from "@/lib/api/client";

export type WeeklySubjects = {
  [subject: string]: number;
};

export type WeeklyTimeData = {
  week: number;
  week_start: string;
  week_end: string;
  subjects: WeeklySubjects;
  average_minutes: number;
  total_minutes: number;
};

export type WeeklyTimeResponse = {
  weeks: WeeklyTimeData[];
  all_subjects: string[];
};

/**
 * Server action to fetch weekly time breakdown by subject.
 * @param weeks - Number of weeks to fetch (default: 5)
 */
export async function getWeeklyTime(weeks = 5): Promise<WeeklyTimeResponse> {
  const url = `topics/weekly-time?weeks=${encodeURIComponent(weeks)}`;
  const data = await fetchFromAPI<WeeklyTimeResponse>(url, {
    requiresAuth: true,
  });
  return data;
}
