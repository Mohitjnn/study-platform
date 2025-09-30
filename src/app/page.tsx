import { getUserDataFromAPI } from "@/actions/auth";
import { redirect } from "next/navigation";
import Splash from "@/components/Splash";

export default async function Home() {
  // Get user data from API
  const result = await getUserDataFromAPI();

  // If not authenticated or should redirect, redirect to login
  if (result.success || !result.shouldRedirect) {
    console.log("Redirecting to dashboard:", result.message);
    redirect("/dashboard");
  }

  return <Splash />;
}
