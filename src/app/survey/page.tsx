import React from "react";
import { getSurvey } from "@/actions/survey";
import { redirect } from "next/navigation";
import MultiStepSurvey from "@/components/MultiStepSurvey";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

export default async function SurveyPage() {
  const surveySlug = process.env.SURVEY_SLUG || "user_personalization_v2";

  // Fetch the survey data
  const surveyResult = await getSurvey(surveySlug);

  if (!surveyResult.success || !surveyResult.data) {
    // Handle error - could redirect to an error page or show error message
    return (
      <div className="h-full w-full bg-[#090E6C] flex items-center justify-center">
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
    <div className="min-h-screen w-full bg-gradient-to-br from-violet-900 to-violet-950 text-white flex flex-col justify-center">
      <BackgroundRippleEffect />
      {/* <Navbar title="Survey" showProfile={true} /> */}
      <div className="pt-6 lg:pb-8 w-full flex flex-col justify-center items-center relative z-20">
        <img src="/images/Bot.png" alt="Bot" />
        <h1 className="text-2xl font-light mt-3">Let us Get to Know You!</h1>
        <h1 className="text-white/60">Ready to spark your journey?</h1>
      </div>
      <MultiStepSurvey survey={surveyResult.data} />
    </div>
  );
}
