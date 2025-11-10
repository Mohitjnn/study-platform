'use server';

import { fetchFromAPI } from "@/lib/api/client";

// Updated interfaces based on the API response
export interface ActivityItem {
  time: string;
  title: string;
  topic_title: string;
  topic_id: string;
  subject: string;
  color: string;
  image_url: string;
  sub_topic: string;
  summary: string;
  quiz_m: number;
  quiz_n: number;
  scores: {
    evaluation: number;
    accuracy: number;
    question_asking: number;
    curiosity: number;
    quiz: number;
    quiz_m: number;
    quiz_n: number;
  };
  conversation_id: string;
  session_id: string;
  duration_seconds: number;
  percentages: {
    evaluation: number;
    accuracy: number;
    question_asking: number;
    curiosity: number;
    quiz: number;
  };
}

export interface ActivityDay {
  date: string;
  total_seconds: number;
  items: ActivityItem[];
}

export interface WeeklyActivity {
  week_start: string;
  week_end: string;
  total_seconds: number;
  days: ActivityDay[];
}

export interface TimelineParams {
  weeks_back?: number;
}

export async function fetchWeeklyActivity(params: TimelineParams = {}): Promise<WeeklyActivity> {
  try {
    const { weeks_back = 0 } = params;
    const url = `/analysis/timeline/week?weeks_back=${weeks_back}`;
    
    const response = await fetchFromAPI<WeeklyActivity>(url, {
      requiresAuth: true
    });
    
    return response;
  } catch (error) {
    console.error('Failed to fetch weekly activity:', error);
    throw new Error('Failed to load activity timeline');
  }
}

export async function fetchMultipleWeeks(weeksToFetch: number[]): Promise<WeeklyActivity[]> {
  try {
    const promises = weeksToFetch.map(weekBack => 
      fetchWeeklyActivity({ weeks_back: weekBack })
    );
    
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Failed to fetch multiple weeks:', error);
    throw new Error('Failed to load activity timeline');
  }
}