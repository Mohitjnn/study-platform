"use server";
import { fetchFromAPI } from "@/lib/api/client";

export type TopRepeatedTopic = {
  subject: string;
  top_topic: string | null;
  session_count: number;
  avg_minutes: number;
  total_minutes: number;
};

export type TopRepeatedTopicsResponse = {
  topics: TopRepeatedTopic[];
  total_subjects: number;
};

/**
 * Server action to fetch top repeated topics.
 * @param limit - Number of top topics to fetch (default: 5)
 */
export async function getTopRepeatedTopics(
  limit = 5
): Promise<TopRepeatedTopicsResponse> {
  const url = `topics/top-repeated-topics?limit=${encodeURIComponent(limit)}`;
  const data = await fetchFromAPI<TopRepeatedTopicsResponse>(url, {
    requiresAuth: true,
  });
  return data;
}
