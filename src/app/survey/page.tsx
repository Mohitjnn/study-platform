import React from "react";
import { getSurvey } from "@/actions/survey";
import { redirect } from "next/navigation";
import MultiStepSurvey from "@/components/MultiStepSurvey";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default async function SurveyPage() {
  const surveySlug = process.env.SURVEY_SLUG || "user_personalization_v1";

  // Fetch the survey data
  const surveyResult = await getSurvey(surveySlug);

  if (!surveyResult.success || !surveyResult.data) {
    // Handle error - could redirect to an error page or show error message
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Survey Not Found
          </h1>
          <p className="text-gray-400 mb-4">
            {surveyResult.error || "The requested survey could not be loaded."}
          </p>
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <Navbar title="Survey" showProfile={true} />
      <MultiStepSurvey survey={surveyResult.data} />
    </div>
  );
}
