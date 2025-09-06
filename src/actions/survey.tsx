"use server"

import {fetchFromAPI, postDataToAPI } from "@/lib/api/client";
import { Survey, SurveyApiResponse, SurveySubmission, SurveySubmissionResponse } from "@/types/survey";
import { surveySubmissionSchema } from "@/schema/surveySchema";

// Get survey by slug
export async function getSurvey(slug: string): Promise<SurveyApiResponse> {
  try {
    console.log(`Fetching survey with slug: ${slug}`);
    
    const result = await fetchFromAPI<Survey>(
      `/surveys/${slug}`,
      { requiresAuth: true }
    );

    console.log("Survey fetched successfully:", result);
    return {
      success: true,
      message: "Survey fetched successfully",
      data: result
    };
  } catch (error: any) {
    console.error("Get survey error:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Failed to fetch survey",
      data: undefined
    };
  }
}

// Submit survey responses
export async function submitSurvey(submission: SurveySubmission): Promise<SurveySubmissionResponse> {
  try {
    // Validate the submission data
    const validatedData = surveySubmissionSchema.parse(submission);
    
    console.log("Submitting survey:", validatedData);
    
    const result = await postDataToAPI<{ submission_id: string; message: string }>(
      "/surveys/user_personalization_v1/submit",
      validatedData,
      { requiresAuth: true }
    );

    console.log("Survey submitted successfully:", result);
    return {
      success: true,
      message: result.message || "Survey submitted successfully",
      submission_id: result.submission_id
    };
  } catch (error: any) {
    console.error("Submit survey error:", error);
    console.error("Error response data:", error.response?.data);
    console.error("Error response status:", error.response?.status);
    console.error("Error response headers:", error.response?.headers);
    return {
      success: false,
      error: error.response?.data?.detail || "Failed to submit survey"
    };
  }
}

// Get user's survey responses (if they've already submitted)
export async function getUserSurveyResponse(slug: string): Promise<SurveyApiResponse> {
  try {
    console.log(`Fetching user survey response for slug: ${slug}`);
    
    const result = await fetchFromAPI<any>(
      `/surveys/${slug}/response`,
      { requiresAuth: true }
    );

    console.log("User survey response fetched:", result);
    return {
      success: true,
      message: "User survey response fetched successfully",
      data: result
    };
  } catch (error: any) {
    console.error("Get user survey response error:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Failed to fetch user survey response"
    };
  }
}
