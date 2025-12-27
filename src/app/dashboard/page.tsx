import { getUserDataFromAPI } from "@/actions/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import DashboardContent from "@/components/DashboardContent";

// Force dynamic rendering since this page uses cookies for authentication
export const dynamic = 'force-dynamic';

// Type definition for user data from API
interface UserApiData {
  child_name?: string;
  survey?: {
    submitted: boolean;
  };
}

export default async function DashboardPage() {
  // Get user data from API
  const result = await getUserDataFromAPI();

  // If not authenticated or should redirect, redirect to login
  if (!result.success || result.shouldRedirect) {
    redirect("/login");
  }

  const user = result.data;

  if (result.success) {
    if (user && typeof user === "object" && "survey" in user) {
      const userWithSurvey = user as UserApiData;
      if (userWithSurvey.survey && !userWithSurvey.survey.submitted) {
        redirect("/survey");
      }
    }
  }

  // Type-safe extraction of user data
  const userData: UserApiData = user && typeof user === "object" 
    ? { 
        child_name: "child_name" in user ? user.child_name as string : undefined, 
        survey: "survey" in user ? user.survey as { submitted: boolean } : undefined 
      }
    : { child_name: undefined, survey: undefined };

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent user={userData} />
    </Suspense>
  );
}