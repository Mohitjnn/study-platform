import { getUserDataFromAPI } from "@/actions/auth";
import { redirect } from "next/navigation";
import { User, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackButton from "@/components/BackButton";
import { createPaymentIntent } from "@/actions/paymentActions";
import PaymentForm from "@/components/Profile/PaymentTabSection";
import PaymentHistorySection from "@/components/Profile/PaymentHistorSection";
import MobileMenu from "@/components/MobileMenu";
import CategoryButton from "@/components/CategoryButton";

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

  const payment = await createPaymentIntent({ tokens: "MINS_200" });

  return (
    <div className="relative w-full min-h-screen bg-[#090E6C] text-foreground dark">
      {/* <Navbar title="Profile" showProfile={true} /> */}

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
          <Tabs defaultValue="information">
            <TabsList className="w-full ">
              <TabsTrigger value="information">Information</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="information">
              <h1 className="mt-7">Personal Information</h1>
              {user && (
                <div className="space-y-3">
                  {/* Full Name */}
                  <div className="mt-7">
                    <p className="text-base text-foreground mb-2">Full Name</p>
                    <div className="pl-2 text-white placeholder:text-white/60 border-2 border-white/10 rounded-md h-10 px-3 py-2 text-sm bg-white/10 backdrop-blur-md">
                      <p className="font-light text-white/70 text-sm">
                        {user.full_name || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <p className="text-base text-foreground mb-2">Email</p>
                    <div className="pl-2 text-white placeholder:text-white/60 border-2 border-white/10 rounded-md h-10 px-3 py-2 text-sm bg-white/10 backdrop-blur-md">
                      <p className="font-light text-white/70 text-sm">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {/* Age */}
                  {user.age_years !== undefined && (
                    <div>
                      <p className="text-base text-foreground mb-2">Age</p>
                      <div className="pl-2 text-white placeholder:text-white/60 border-2 border-white/10 rounded-md h-10 px-3 py-2 text-sm bg-white/10 backdrop-blur-md">
                        <p className="font-light text-white/70 text-sm">
                          {user.age_years}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Grade Level */}
                  {user.grade_level !== undefined && (
                    <div>
                      <p className="text-base text-foreground mb-2">
                        Grade Level
                      </p>
                      <div className="pl-2 text-white placeholder:text-white/60 border-2 border-white/10 rounded-md h-10 px-3 py-2 text-sm bg-white/10 backdrop-blur-md">
                        <p className="font-light text-white/70 text-sm">
                          {user.grade_level}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Last Payment Method */}
                  {user.last_payment_method && (
                    <div>
                      <p className="text-base text-foreground mb-2">
                        Last Payment Method
                      </p>
                      <div className="pl-2 text-white placeholder:text-white/60 border-2 border-white/10 rounded-md h-10 px-3 py-2 text-sm bg-white/10 backdrop-blur-md">
                        <p className="font-light text-white/70 text-sm">
                          {user.last_payment_method}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Voice Minutes */}
                  {user.voice_minutes_available !== undefined && (
                    <div>
                      <p className="text-base text-foreground mb-2">
                        Voice Minutes Available
                      </p>
                      <div className="pl-2 text-white placeholder:text-white/60 border-2 border-white/10 rounded-md h-10 px-3 py-2 text-sm bg-white/10 backdrop-blur-md">
                        <p className="font-light text-white/70 text-sm">
                          {user.voice_minutes_available}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  {/* <div className="flex items-center gap-4">
                    <div className="h-6 w-6 flex items-center justify-center">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          user.verified ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                    </div>
                    <div>
                      <p className="text-base text-foreground">Status</p>
                      <p
                        className={`font-semibold text-lg ${
                          user.verified ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {user.verified ? "Verified" : "Unverified"}
                      </p>
                    </div>
                  </div> */}

                  {/* User ID */}
                  {/* {user.user_id && (
                    <div className="flex items-center gap-4">
                      <div className="h-6 w-6 flex items-center justify-center">
                        <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-base text-foreground">
                          User ID
                        </p>
                        <p className="font-semibold text-card-foreground text-lg">
                          {user.user_id}
                        </p>
                      </div>
                    </div>
                  )} */}

                  {/* Member Since */}
                  {/* {user.user_since && (
                    <div className="flex items-center gap-4">
                      <div className="h-6 w-6 flex items-center justify-center">
                        <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-base text-foreground">
                          Member Since
                        </p>
                        <p className="font-semibold text-card-foreground text-lg">
                          {new Date(user.user_since).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )} */}

                  {/* Survey Info */}
                  {/* {user.survey && (
                    <div className="flex items-center gap-4">
                      <div className="h-6 w-6 flex items-center justify-center">
                        <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-base text-foreground">
                          Survey
                        </p>
                        <p className="font-semibold text-card-foreground text-lg">
                          {user.survey.submitted
                            ? `Submitted`
                            : "Not Submitted"}
                        </p>
                      </div>
                    </div>
                  )} */}
                </div>
              )}

              {!user && (
                <div className="text-center">
                  <p className="text-foreground">
                    Unable to load profile data. Please try refreshing the page.
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="payment">
              <PaymentForm />
            </TabsContent>
            <TabsContent value="billing">
              <PaymentHistorySection />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
