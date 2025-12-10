import { getUserDataFromAPI } from "@/actions/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackButton from "@/components/BackButton";
import MobileMenu from "@/components/MobileMenu";
import CategoryButton from "@/components/CategoryButton";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import AccountStatusCard from "@/components/Profile/AccountStatusCard";
import PaymentHistorySection from "@/components/Profile/PaymentHistorSection";

// Force dynamic rendering since this page uses cookies for authentication
export const dynamic = 'force-dynamic';

type Survey = {
  submitted: boolean;
  slug: string;
};

type UserType = {
  full_name?: string;
  email?: string;
  verified?: boolean;
  user_id?: string;
  user_since?: string;
  age_years?: number;
  grade_level?: string | number;
  last_payment_method?: string;
  voice_minutes_available?: number;
  survey?: Survey;
};

export default async function ProfilePage() {
  // Get user data from API
  const result = await getUserDataFromAPI();

  // If not authenticated or should redirect, redirect to login
  if (!result.success || result.shouldRedirect) {
    redirect("/login");
  }

  // Type guard for user data
  const isValidUser = (data: unknown): data is UserType => {
    return data !== null && typeof data === "object" && "email" in data;
  };

  const user = isValidUser(result.data) ? result.data : null;

  if (result.success && user) {
    if (user.survey && !user.survey.submitted) {
      redirect("/survey");
    }
  }

  return (
    <div className="relative w-full min-h-screen bg-[#090E6C] text-foreground dark">
      <BackgroundRippleEffect />
      <main className="relative w-full md:max-w-3xl mx-auto py-6 sm:px-6 lg:px-8 z-10">
        <div className="mb-4 flex justify-between items-center px-5">
          <div className="w-1/3 flex">
            <CategoryButton />
            <MobileMenu />
          </div>
          <h1 className="text-2xl font-light text-foreground w-1/3 flex justify-center">
            Profile
          </h1>
          <div className="w-1/3"></div>
        </div>

        <div className="px-4 py-6 sm:px-0">
          {/* Account Status Card */}
          <AccountStatusCard voiceMinutes={user?.voice_minutes_available} />

          {/* Tabs */}
          <Tabs defaultValue="information" className="mt-6 bg-white p-2 rounded-sm">
            <TabsList className="w-full mt-2">
              <TabsTrigger
                value="information"
              >
                Information
              </TabsTrigger>
              <TabsTrigger 
                value="payment"
                // className="data-[state=active]:bg-white"
              >
                Payment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="information" className="bg-white rounded-b-lg p-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Personal Information
              </h2>
              {user && (
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </p>
                    <div className="border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                      <p className="text-gray-900">
                        {user.full_name || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Email
                    </p>
                    <div className="border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full justify-center flex-1">
                  {/* Age */}
                  {user.age_years !== undefined && (
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Age
                      </p>
                      <div className="border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                        <p className="text-gray-900">{user.age_years}</p>
                      </div>
                    </div>
                  )}

                  {/* Grade Level */}
                  {user.grade_level !== undefined && (
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Grade Level
                      </p>
                      <div className="border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                        <p className="text-gray-900">{user.grade_level}</p>
                      </div>
                    </div>
                  )}
                  </div>

                  {/* Last Payment Method */}
                  {user.last_payment_method && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Last Payment Method
                      </p>
                      <div className="border border-gray-300 rounded-md px-4 py-2 bg-gray-50">
                        <p className="text-gray-900">
                          {user.last_payment_method}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!user && (
                <div className="text-center">
                  <p className="text-gray-600">
                    Unable to load profile data. Please try refreshing the page.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="payment" className="bg-white rounded-b-lg p-2">
              <PaymentHistorySection />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}