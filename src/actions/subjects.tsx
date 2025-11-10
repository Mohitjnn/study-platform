"use server";
import { fetchFromAPI, postDataToAPI } from "@/lib/api/client";
import { id } from "zod/v4/locales";

// Types for subject-related data
export interface SubjectsResponse {
  subjects: string[];
}

export interface ConversationResponse { 
  conversation_id: string;
  link_id: string;
}

export interface SubjectStats {
  subject: string;
  total_topics: number;
  completed_topics: number;
  completion_percentage: number;
  progress_tag: string;
  image_url: string;
}

export interface SubjectsStatsResponse {
  grade_level: number;
  subjects: SubjectStats[];
  total_subjects: number;
  message: string;
}

interface TopicMetaData{
  id: string;
  subject: string;
  topic: string;
  
}

interface TopicsResponse {
  topics: string[];
}

export async function fetchTopics({subject}: {subject: string}): Promise<{topic: string, color: string}[]> {
  try {
    const response = await fetchFromAPI<{ topics: {topic: string,color: string}[] }>(`/topics/topics?subject=${subject}`, { requiresAuth: true });
    return response.topics;
    
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    throw new Error(`Failed to fetch topics: ${message}`);
  }
}

interface SubTopicData {
  id: string;
  sub_topic: string;
  learning_outcome: string;
}

interface SubTopicsResponse {
  items: SubTopicData[];
}

export async function fetchSubTopics({subject,topic}:{subject:string,topic:string}): Promise<SubTopicsResponse> {
  try {
    const response = await fetchFromAPI<SubTopicsResponse>(`/topics/subtopics?subject=${subject}&topic=${encodeURIComponent(topic)}`, { requiresAuth: true });
    return response;
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    throw new Error(`Failed to fetch subtopics: ${message}`);
  }
}

// Fetch all subjects from the API
export async function fetchSubjects(): Promise<SubjectsResponse> {
  try {
    const response = await fetchFromAPI<SubjectsResponse>(
      '/topics/subjects',
      { requiresAuth: true }
    );
    
    return response;
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    throw new Error(`Failed to fetch subjects: ${message}`);
  }
}

// NEW: Combined interface for topics with subtopics
export interface TopicWithSubTopics {
  topic: string;
  subtopics: SubTopicData[];
}

export interface SubjectWithTopics {
  subject: string;
  topics: TopicWithSubTopics[];
}

export interface AllTopicsResponse {
  subjects: SubjectWithTopics[];
}

// NEW: Combined function to fetch all topics with subtopics for all subjects
export async function fetchAllTopicsWithSubTopics(): Promise<AllTopicsResponse> {
  try {
    // First, fetch all subjects
    const subjectsResponse = await fetchSubjects();
    
    // For each subject, fetch its topics and then subtopics for each topic
    const subjectsWithTopics = await Promise.all(
      subjectsResponse.subjects.map(async (subject) => {
        try {
          // Fetch topics for this subject
          const topics = await fetchTopics({ subject });
          console.log("Fetched topics for subject", subject, topics);
          const TopicNames = topics.map(t => t.topic);

          // For each topic, fetch its subtopics
          const topicsWithSubTopics = await Promise.all(
            TopicNames.map(async (topic) => {
              try {
                const subtopicsResponse = await fetchSubTopics({ subject, topic });
                return {
                  topic,
                  subtopics: subtopicsResponse.items
                };
              } catch (error) {
                console.warn(`Failed to fetch subtopics for ${subject} - ${topic}:`, error);
                return {
                  topic,
                  subtopics: []
                };
              }
            })
          );
          
          return {
            subject,
            topics: topicsWithSubTopics
          };
        } catch (error) {
          console.warn(`Failed to fetch topics for subject ${subject}:`, error);
          return {
            subject,
            topics: []
          };
        }
      })
    );
    
    return {
      subjects: subjectsWithTopics
    };
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    throw new Error(`Failed to fetch all topics with subtopics: ${message}`);
  }
}

// NEW: Alternative function to fetch topics with subtopics for a specific subject
export async function fetchTopicsWithSubTopicsForSubject({subject}: {subject: string}): Promise<TopicWithSubTopics[]> {
  try {
    // Fetch topics for the subject
    const topics = await fetchTopics({ subject });
    const TopicNames = topics.map(t => t.topic);
    // For each topic, fetch its subtopics
    const topicsWithSubTopics = await Promise.all(
      TopicNames.map(async (topic) => {
        try {
          const subtopicsResponse = await fetchSubTopics({ subject, topic });
          return {
            topic,
            subtopics: subtopicsResponse.items
          };
        } catch (error) {
          console.warn(`Failed to fetch subtopics for ${subject} - ${topic}:`, error);
          return {
            topic,
            subtopics: []
          };
        }
      })
    );
    
    return topicsWithSubTopics;
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    throw new Error(`Failed to fetch topics with subtopics for subject ${subject}: ${message}`);
  }
}

export async function initiateConversation({topic_id}:{topic_id:string}) {
  try {
    const response = await postDataToAPI<ConversationResponse>('/conversations/from-topic', { topic_id }, { requiresAuth: true });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function fetchSubjectWithStats(){
  try {
    const response = await fetchFromAPI<SubjectsStatsResponse>('/topics/subjects/progress',{requiresAuth:true})
    return response;
  } catch (error) {
    console.error("Error fetching subject stats:", error);
    return {
      grade_level: 0,
      subjects: [],
      total_subjects: 0,
      message: 'Failed to fetch subject stats'
    };
  }
}

export interface TopTopic {
  id: string | null;
  subject: string;
  topic: string;
  sub_topic: string | null;
  learning_outcome: string | null;
  image_url: string;
  performance_tag: string;
  session_count: number;
  avg_accuracy: number;
  avg_evaluation: number;
  last_session_at: string;
}

export interface TopTopicsResponse {
  grade_level: number;
  topics: TopTopic[];
  total_topics: number;
  message: string;
}

// Types for topic search
export interface SubTopicStats {
  sessions: number;
  mastery_pct: number;
  last_studied: string | null;
}

export interface SearchSubTopic {
  id: string;
  sub_topic: string;
  learning_outcome: string;
  image_url: string;
  stats: SubTopicStats;
}

export interface TopicStats {
  total_sessions: number;
  mastery_pct: number;
  last_studied: string | null;
}

export interface SearchTopicResult {
  subject: string;
  topic: string;
  topic_image_url: string;
  topic_stats: TopicStats;
  subtopics: SearchSubTopic[];
}

export interface SearchPagination {
  total_topics: number;
  returned_topics: number;
  total_subtopics: number;
  limit: number;
  offset: number;
  has_more: boolean;
  next_offset: number | null;
}

export interface TopicSearchResponse {
  query: string;
  grade_level: number;
  results: SearchTopicResult[];
  pagination: SearchPagination;
}

export async function fetchTopTopics(): Promise<TopTopicsResponse> {
  try {
    const response = await fetchFromAPI<TopTopicsResponse>(
      '/topics/top-5',
      { requiresAuth: true }
    );
    return response;
  } catch (error) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    throw new Error(`Failed to fetch top topics: ${message}`);
  }
}

// Search topics by subject and query
export async function searchTopics({
  subject,
  query,
  limit = 20,
  offset = 0
}: {
  subject: string;
  query: string;
  limit?: number;
  offset?: number;
}): Promise<TopicSearchResponse> {
  try {
    const params = new URLSearchParams({
      subject,
      q: query,
      limit: limit.toString(),
      offset: offset.toString()
    });

    const response = await fetchFromAPI<TopicSearchResponse>(
      `/topics/search-topic?${params.toString()}`,
      { requiresAuth: true }
    );
    return response;
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    throw new Error(`Failed to search topics: ${message}`);
  }
}
