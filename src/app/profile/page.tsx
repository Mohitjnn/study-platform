import { getUserDataFromAPI } from "@/actions/auth";
import { redirect } from "next/navigation";
import { User, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";

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
    console.log("Redirecting to login:", result.message);
    redirect("/login");
  }

  // Type guard for user data
  const isValidUser = (data: unknown): data is UserType => {
    return data !== null && typeof data === "object" && "email" in data;
  };

  const user = isValidUser(result.data) ? result.data : null;

  if (result.success && user) {
    console.log("User data retrieved:", user);
    if (user.survey && !user.survey.submitted) {
      redirect("/survey");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <Navbar title="Profile" showProfile={true} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-8">
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
          </div>
        </div>
      </main>
    </div>
  );
}
