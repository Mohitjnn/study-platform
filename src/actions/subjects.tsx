"use server";

import { fetchFromAPI, postDataToAPI } from "@/lib/api/client";

// Types for subject-related data
export interface SubjectsResponse {
  subjects: string[];
}

export interface ConversationResponse { 
  conversation_id: string;
  link_id: string;
}

export async function fetchTopics({subject}: {subject: string}): Promise<string[]> {
  try {
    const response = await fetchFromAPI<{ topics: string[] }>(`/topics/topics?subject=${subject}`, { requiresAuth: true });
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
    const response = await fetchFromAPI<SubTopicsResponse>(`/topics/subtopics?subject=${subject}&topic=${topic}`, { requiresAuth: true });
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


// Get subjects with additional metadata (for UI components)
export async function getSubjectsWithMetadata() {
  try {
    const response = await fetchSubjects();
    
    // Map subjects to include UI metadata
    const subjectsWithMetadata = response.subjects.map((subject, index) => ({
      name: subject,
      progress: 0, // Default progress - could be fetched from another endpoint
      subtitle: getSubjectSubtitle(subject),
      theme: getSubjectTheme(index)
    }));
    
    return subjectsWithMetadata;
  } catch (error) {
    // Return fallback data
    return [];
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


// Helper function to get subject subtitle
function getSubjectSubtitle(subject: string): string {
  const subtitles: Record<string, string> = {
    "Mathematics": "Algebra, Geometry, Calculus",
    "English": "Grammar, Literature, Writing",
    "Science": "Physics, Chemistry, Biology",
    "Social Science": "History, Geography, Civics",
    "Computer Science": "Programming, Algorithms, Data Structures",
    "Physics": "Mechanics, Thermodynamics, Optics",
    "Chemistry": "Organic, Inorganic, Physical",
    "Biology": "Botany, Zoology, Genetics",
    "History": "Ancient, Medieval, Modern",
    "Geography": "Physical, Human, Environmental"
  };
  
  return subtitles[subject] || "Explore and Learn";
}

// Helper function to get subject theme
function getSubjectTheme(index: number): string {
  const themes = ["coral", "navy", "sunny"];
  return themes[index % themes.length];
}


