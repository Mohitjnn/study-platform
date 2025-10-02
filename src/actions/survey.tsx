"use server"

import {fetchFromAPI, postDataToAPI } from "@/lib/api/client";
import { Survey, SurveyApiResponse, SurveySubmission, SurveySubmissionResponse } from "@/types/survey";
import { surveySubmissionSchema } from "@/schema/surveySchema";

// API Error interface
interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
    status?: number;
    headers?: unknown;
  };
  message?: string;
}

// Get survey by slug
export async function getSurvey(slug: string): Promise<SurveyApiResponse> {
  try {    
    const result = await fetchFromAPI<Survey>(
      `/surveys/${slug}`,
      { requiresAuth: true }
    );
    return {
      success: true,
      message: "Survey fetched successfully",
      data: result
    };
  } catch (error: unknown) {
    console.error("Get survey error:", error);
    const apiError = error as ApiError;
    return {
      success: false,
      error: apiError.response?.data?.detail || "Failed to fetch survey",
      data: undefined
    };
  }
}

// Submit survey responses
export async function submitSurvey(submission: SurveySubmission): Promise<SurveySubmissionResponse> {
  try {
    // Validate the submission data
    const validatedData = surveySubmissionSchema.parse(submission);
        
    const result = await postDataToAPI<{ submission_id: string; message: string }>(
      "/surveys/user_personalization_v2/submit",
      validatedData,
      { requiresAuth: true }
    );
    return {
      success: true,
      message: result.message || "Survey submitted successfully",
      submission_id: result.submission_id
    };
  } catch (error: unknown) {
    console.error("Submit survey error:", error);
    const apiError = error as ApiError;
    console.error("Error response data:", apiError.response?.data);
    console.error("Error response status:", apiError.response?.status);
    console.error("Error response headers:", apiError.response?.headers);
    return {
      success: false,
      error: apiError.response?.data?.detail || "Failed to submit survey"
    };
  }
}

// Get user's survey responses (if they've already submitted)
export async function getUserSurveyResponse(slug: string): Promise<SurveyApiResponse> {
  try {    
    const result = await fetchFromAPI<Survey>(
      `/surveys/${slug}/response`,
      { requiresAuth: true }
    );
    return {
      success: true,
      message: "User survey response fetched successfully",
      data: result
    };
  } catch (error: unknown) {
    console.error("Get user survey response error:", error);
    const apiError = error as ApiError;
    return {
      success: false,
      error: apiError.response?.data?.detail || "Failed to fetch user survey response"
    };
  }
}
