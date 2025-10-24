"use server";
import { fetchFromAPI } from "@/lib/api/client";

export type SubjectMastery = {
  name: string;
  mastery_pct: number;
  topics_count: number;
};

export type MasteryResponse = {
  subjects: SubjectMastery[];
};

/**
 * Server action to fetch subject mastery data.
 * Returns mastery percentage and topic counts per subject.
 */
export async function getSubjectMastery(): Promise<MasteryResponse> {
  const url = `topics/mastery`;
  const data = await fetchFromAPI<MasteryResponse>(url, {
    requiresAuth: true,
  });
  return data;
}
