"use server";

import { fetchFromAPI } from "@/lib/api/client";

// Types for subject-related data
export interface SubjectsResponse {
  subjects: string[];
}

// Fetch all subjects from the API
export async function fetchSubjects(): Promise<SubjectsResponse> {
  try {
    console.log('📚 Fetching subjects from API...');
    
    const response = await fetchFromAPI<SubjectsResponse>(
      '/topics/subjects',
      { requiresAuth: true }
    );
    
    console.log('✅ Subjects fetched successfully:', response);
    return response;
  } catch (error: unknown) {
    console.error('❌ Failed to fetch subjects:', error);
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
    console.error('❌ Failed to get subjects with metadata:', error);
    // Return fallback data
    return [];
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


