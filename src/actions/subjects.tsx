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
  console.log("Fetching subtopics for:", { subject, topic });
  try {
    const response = await fetchFromAPI<SubTopicsResponse>(`/topics/subtopics?subject=${subject}&topic=${topic}`, { requiresAuth: true });
    console.log("Fetched subtopics:", response.items);
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
          
          // For each topic, fetch its subtopics
          const topicsWithSubTopics = await Promise.all(
            topics.map(async (topic) => {
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
    console.log("Fetched topics:", topics);
    // For each topic, fetch its subtopics
    const topicsWithSubTopics = await Promise.all(
      topics.map(async (topic) => {
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