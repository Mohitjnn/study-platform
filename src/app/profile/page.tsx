import { getUserDataFromAPI } from "@/actions/auth";
import { redirect } from "next/navigation";
import { User, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackButton from "@/components/BackButton";
import { createPaymentIntent } from "@/actions/paymentActions";
import PaymentForm from "@/components/Profile/PaymentTabSection";
import PaymentHistorySection from "@/components/Profile/PaymentHistorSection";

type Survey = {
  submitted: boolean;
};

type UserType = {
  full_name?: string;
  email?: string;
  verified?: boolean;
  user_id?: string;
  user_since?: string;
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
  console.log("Payment Intent:", payment);

  return (
    <div className="relative w-full min-h-screen bg-[#010532] text-foreground dark">
      <div className="fixed top-24 left-[-100px] w-[400px] h-[400px] bg-[#DF9AEE] opacity-30 blur-3xl rounded-full"></div>

      <div className="fixed bottom-[-100px] right-0 w-[400px] h-[400px] bg-[#DF9AEE] opacity-30 blur-3xl rounded-full"></div>
      {/* <Navbar title="Profile" showProfile={true} /> */}

      <main className="relative w-full mx-auto py-6 sm:px-6 lg:px-8 z-10">
        <div className="mb-4 flex justify-between items-center px-5">
          <div className="w-1/3 flex">
            <BackButton />
          </div>
          <h1 className="text-2xl font-light text-foreground w-1/3 flex justify-center">
            Profile
          </h1>

          <div className="w-1/3"></div>
        </div>
        <div className="px-4 py-6 sm:px-0">
          {/* <div className="space-y-8">
            <h2 className="text-3xl font-bold text-card-foreground mb-6 text-center">
              Hello, {user?.full_name || "User"}! Checkout Your Profile
            </h2>
            {user && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <User className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="text-base text-muted-foreground">Name</p>
                    <p className="font-semibold text-card-foreground text-lg">
                      {user.full_name || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="text-base text-muted-foreground">Email</p>
                    <p className="font-semibold text-card-foreground text-lg">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-6 w-6 flex items-center justify-center">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        user.verified ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                  </div>
                  <div>
                    <p className="text-base text-muted-foreground">Status</p>
                    <p
                      className={`font-semibold text-lg ${
                        user.verified ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {user.verified ? "Verified" : "Unverified"}
                    </p>
                  </div>
                </div>
                {user.user_id && (
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-6 flex items-center justify-center">
                      <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-base text-muted-foreground">User ID</p>
                      <p className="font-semibold text-card-foreground text-lg">
                        {user.user_id}
                      </p>
                    </div>
                  </div>
                )}
                {user.user_since && (
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-6 flex items-center justify-center">
                      <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-base text-muted-foreground">
                        Member Since
                      </p>
                      <p className="font-semibold text-card-foreground text-lg">
                        {new Date(user.user_since).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!user && (
              <div className="text-center">
                <p className="text-muted-foreground">
                  Unable to load profile data. Please try refreshing the page.
                </p>
              </div>
            )}
          </div> */}

          <Tabs defaultValue="information" className="w-[400px]">
            <TabsList className="w-full ">
              <TabsTrigger value="information">Information</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="information">
              <h1 className="mt-7">Personal Information</h1>
              {user && (
                <div className="space-y-6">
                  <div className="mt-7">
                    <p className="text-base text-muted-foreground mb-2">
                      Full Name
                    </p>
                    <div className="pl-7 text-white placeholder:text-white/60 py-3 border-2 border-white/10 rounded-xl">
                      <div>
                        <p className="font-light text-white/70 text-lg">
                          {user.full_name || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-7">
                    <p className="text-base text-muted-foreground mb-2">
                      Email
                    </p>
                    <div className="pl-7 text-white placeholder:text-white/60 py-3 border-2 border-white/10 rounded-xl">
                      <div>
                        <p className="font-light text-white/70 text-lg">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-6 w-6 flex items-center justify-center">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          user.verified ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                    </div>
                    <div>
                      <p className="text-base text-muted-foreground">Status</p>
                      <p
                        className={`font-semibold text-lg ${
                          user.verified ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {user.verified ? "Verified" : "Unverified"}
                      </p>
                    </div>
                  </div>
                  {user.user_id && (
                    <div className="flex items-center gap-4">
                      <div className="h-6 w-6 flex items-center justify-center">
                        <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-base text-muted-foreground">
                          User ID
                        </p>
                        <p className="font-semibold text-card-foreground text-lg">
                          {user.user_id}
                        </p>
                      </div>
                    </div>
                  )}
                  {user.user_since && (
                    <div className="flex items-center gap-4">
                      <div className="h-6 w-6 flex items-center justify-center">
                        <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-base text-muted-foreground">
                          Member Since
                        </p>
                        <p className="font-semibold text-card-foreground text-lg">
                          {new Date(user.user_since).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!user && (
                <div className="text-center">
                  <p className="text-muted-foreground">
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
