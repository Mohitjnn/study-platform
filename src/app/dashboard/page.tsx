import { getUserDataFromAPI } from "@/actions/auth";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DashboardSquareCard from "@/components/DashboardSquareCard";
import ScreenTimeChart from "@/components/Bar-chart";
import {
  getOverAllStats,
  getWeeklyScreenTimeStats,
} from "@/actions/screenTime";
import { getSubjectsWithMetadata } from "@/actions/subjects";
import SubjectCard from "@/components/PersonalCards/SubjectCard";
import CategoryButton from "@/components/CategoryButton";
import MobileMenu from "@/components/MobileMenu";

export default async function DashboardPage() {
  // Get user data from API
  const result = await getUserDataFromAPI();
  const subjects = await getSubjectsWithMetadata();
  const screenTimeStats = await getWeeklyScreenTimeStats();
  const overallStats = await getOverAllStats();
  // If not authenticated or should redirect, redirect to login
  if (!result.success || result.shouldRedirect) {
    redirect("/login");
  }

  const user = result.data;

  if (result.success) {
    if (user && typeof user === "object" && "survey" in user) {
      const userWithSurvey = user as { survey: { submitted: boolean } };
      if (!userWithSurvey.survey.submitted) {
        redirect("/survey");
      }
    }
  }

  return (
    <div className="bg-[#010532] text-foreground dark relative pt-5 w-full">
      {/* <Navbar title="Dashboard" showProfile={true} /> */}

      <div className="absolute inset-0 flex justify-start items-start mt-24 -translate-x-20 right-0 ">
        <div className="w-[400px] h-[400px] bg-[#DF9AEE] opacity-30 blur-3xl rounded-full"></div>
      </div>

      <div className="absolute inset-0 flex justify-end items-center mt-24 -translate-x-20 right-0 ">
        <div className="w-[400px] h-[400px] bg-[#DF9AEE] opacity-30 blur-3xl rounded-full"></div>
      </div>

      <div className="absolute inset-0 flex justify-end ml-36 items-end mt-24 -translate-x-20 right-0 ">
        <div className="w-[400px] h-[400px] bg-[#DF9AEE] opacity-30 blur-3xl rounded-full"></div>
      </div>
      <main className="w-full p-4 sm:p-6 lg:p-8">
        {/* Welcome Section */}
        <div className=" w-full flex items-center justify-between">
          <div className="w-1/2 flex gap-3 items-center">
            <CategoryButton />
            <MobileMenu />
            <div>
              <h1 className="text-xl sm:text-3xl font-medium text-foreground">
                Hi,{" "}
                {typeof user?.full_name === "string" && user.full_name
                  ? user.full_name
                  : "Student"}
                !
              </h1>
              <p className="text-muted-foreground text-sm">Good Morning</p>
            </div>
          </div>
          <div className="flex w-1/2 justify-end">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="my-8">
          <h1 className="font-extralight text-xl text-white/60">
            Ready to grow your brain?
          </h1>

          <h1 className="font-bold text-2xl">Lets Dive in!</h1>
        </div>

        {overallStats ? (
          <div className="flex flex-col justify-center items-center gap-3 relative my-5">
            <div className="flex items-center gap-3 w-full">
              <div
                className="relative bg-white/20 flex flex-col border-2 border-white/20 w-1/2 h-full p-6 
  [mask-image:radial-gradient(circle_70px_at_105%_110%,transparent_99%,black)]
  [mask-repeat:no-repeat] [mask-size:100%_100%] rounded-lg"
              >
                <h1 className="text-2xl font-bold">
                  {overallStats.totalCourses}
                </h1>
                <h1 className="text-sm font-light">Total Courses</h1>
              </div>

              <div
                className="relative bg-white/20 flex flex-col items-end rounded-lg border-2 border-white/20 w-1/2 h-full p-6
  [mask-image:radial-gradient(circle_70px_at_-5%_110%,transparent_99%,black)]
  [mask-repeat:no-repeat] [mask-size:100%_100%]"
              >
                <h1 className="text-2xl font-bold">
                  {overallStats.completedCourses}
                </h1>
                <h1 className="text-sm font-light">Completed</h1>
              </div>
            </div>

            <div className="p-3 rounded-full absolute">
              <img
                src="/images/globe.png"
                alt="Globe"
                className="h-28 w-28 object-cover rounded-2xl 
             [filter:brightness(1.2)_drop-shadow(0_0_10px_rgba(255,255,255,0.5))]"
              />
            </div>

            <div className=" flex items-center gap-3 w-full">
              <div
                className="relative bg-white/20 flex flex-col rounded-lg border-2 border-white/20 w-1/2 h-full p-6
  [mask-image:radial-gradient(circle_70px_at_105%_-10%,transparent_99%,black)]
  [mask-repeat:no-repeat] [mask-size:100%_100%]"
              >
                <h1 className="text-2xl font-bold">
                  {overallStats.minutesStudied}
                </h1>
                <h1 className="text-sm font-light">Minutes Studied</h1>
              </div>

              <div
                className="relative bg-white/20 flex flex-col items-end rounded-lg border-2 border-white/20 w-1/2 h-full p-6
  [mask-image:radial-gradient(circle_70px_at_-5%_-10%,transparent_99%,black)]
  [mask-repeat:no-repeat] [mask-size:100%_100%]"
              >
                <h1 className="text-2xl font-bold">
                  {overallStats.currentStreak}
                </h1>
                <h1 className="text-sm font-light">Streak</h1>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center mb-8 min-h-[40px]">
            <div className="text-muted-foreground">Loading stats...</div>
          </div>
        )}

        {/* Weekly Progress */}
        <div className="mb-8 bg-card border-border p-4 rounded-2xl">
          <ScreenTimeChart
            dailyMinutes={screenTimeStats.dailyMinutes}
            weeklyAverage={screenTimeStats.weeklyAverage}
            weeklyChange={screenTimeStats.weeklyChange}
            lastUpdated={screenTimeStats.lastUpdated}
          />
        </div>

        <Link href="/chat?mode=free-explore" className="w-full py-4 px-7 border border-white/20 bg-white/10 rounded-lg mt-5 mb-8 flex justify-between items-center hover:bg-white/20 transition-colors cursor-pointer">
          <h1>Free Explore</h1>
          <div className="h-6 w-6 p-1 flex justify-center items-center bg-white/10 rounded-full border border-white/20">
            <ChevronRight />
          </div>
        </Link>
        <h1 className="text-xl lg:text-5xl font-medium lg:text-left mb-5">
          Subjects
        </h1>
        <div className="w-full">
          {subjects.map((subject, index) => (
            <SubjectCard
              key={subject.name}
              name={subject.name}
              progress={subject.progress}
              subtitle={subject.subtitle}
              index={index}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
