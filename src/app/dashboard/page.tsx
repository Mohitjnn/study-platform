import { getUserDataFromAPI } from "@/actions/auth";
import { redirect } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
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
import CuriosityChart from "@/components/CuriosityChart";
import ConceptMasteryChart from "@/components/ConceptMasteryChart";
import ActiveTimeCharts from "@/components/ActiveTimeCharts";
import ConceptMasteryPie from "@/components/ConceptMasteryPie";
import ConsistencyChart from "@/components/ConsistencyChart";
import TransitionHorizontal from "@/animations/TransitionHorizontal";
import { SlotMachineCounter } from "@/animations/SlotMachineCounter";

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
    <div className="relative w-full min-h-screen bg-[#010532] text-foreground dark pt-5">
      {/* <Navbar title="Dashboard" showProfile={true} /> */}

      <div className="fixed top-24 left-[-100px] w-[400px] h-[400px] bg-[#DF9AEE] opacity-40 blur-3xl rounded-full"></div>

      <div className="fixed bottom-[-100px] right-0 w-[400px] h-[400px] bg-[#DF9AEE] opacity-40 blur-3xl rounded-full"></div>
      <main className="relative w-full p-4 sm:p-6 lg:p-8">
        {/* Welcome Section */}
        <div className=" w-full flex items-center justify-between">
          <div className="w-1/2 flex gap-3 items-center">
            <CategoryButton />
            <MobileMenu />
            <TransitionHorizontal>
              <h1 className="text-xl sm:text-3xl font-medium text-foreground">
                Hi,{" "}
                {typeof user?.full_name === "string" && user.full_name
                  ? user.full_name
                  : "Student"}
                !
              </h1>
              <p className="text-muted-foreground text-sm">Good Morning</p>
            </TransitionHorizontal>
          </div>
        </div>

        {overallStats ? (
          <div className="flex flex-col justify-center items-center relative my-5">
            <div className="w-full h-px bg-gradient-to-r from-white/40 via-transparent to-white/40 my-2"></div>
            <div className="flex items-center w-full">
              <div className="relative flex items-center gap-4 w-1/2 h-full p-2">
                <div className="p-1 h-10 w-10 flex justify-center items-center bg-white/20 border-2 border-white/30 rounded-full">
                  <img src="images/topic.png" alt="img" />
                </div>
                <div>
                  {/* <h1 className="text-2xl font-bold">
                    {overallStats.totalCourses}
                  </h1> */}

                  <SlotMachineCounter targetValue={overallStats.totalCourses}>
                    <h1 className="text-2xl font-bold" />
                  </SlotMachineCounter>
                  <h1 className="text-sm font-extralight">Topics Completed</h1>
                </div>
              </div>

              <div className="w-px h-16 bg-gradient-to-b from-white/40 to-transparent  "></div>

              <div className="relative flex items-center gap-4 w-1/2 h-full p-2">
                <div className="p-1 h-10 w-10 flex justify-center items-center bg-white/20 border-2 border-white/30 rounded-full">
                  <img src="images/hours.png" alt="img" />
                </div>
                <div>
                  <SlotMachineCounter
                    targetValue={overallStats.completedCourses}
                  >
                    <h1 className="text-2xl font-bold" />
                  </SlotMachineCounter>

                  <h1 className="text-sm font-light">Hours Spend</h1>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-white/40 via-transparent to-white/40 my-1"></div>

            <div className=" flex items-center w-full">
              <div className="relative flex items-center gap-4 w-1/2 h-full p-2">
                <div className="p-1 h-10 w-10 flex justify-center items-center bg-white/20 border-2 border-white/30 rounded-full">
                  <img src="images/streak.png" alt="img" />
                </div>
                <div>
                  <SlotMachineCounter targetValue={overallStats.minutesStudied}>
                    <h1 className="text-2xl font-bold" />
                  </SlotMachineCounter>

                  <h1 className="text-sm font-light">Streaks</h1>
                </div>
              </div>

              <div className="w-px h-16 bg-gradient-to-t from-white/40 to-transparent  "></div>

              <div className="relative flex items-center gap-4 w-1/2 h-full p-2">
                <div className="p-1 h-10 w-10 flex justify-center items-center bg-white/20 border-2 border-white/30 rounded-full">
                  <img src="images/topic.png" alt="img" />
                </div>
                <div>
                  <SlotMachineCounter targetValue={overallStats.currentStreak}>
                    <h1 className="text-2xl font-bold" />
                  </SlotMachineCounter>

                  <h1 className="text-sm font-light">Curiosity Level</h1>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-white/40 via-transparent to-white/40 my-2"></div>
          </div>
        ) : (
          <div className="flex justify-center items-center mb-8 min-h-[40px]">
            <div className="text-muted-foreground">Loading stats...</div>
          </div>
        )}

        <Link
          href="/chat?mode=free-explore"
          className="w-full py-5 px-4 border-2 border-white/20 rounded-2xl mt-7 mb-5 flex justify-between items-center hover:bg-white/20 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <img src="/images/Bot.png" alt="img" className="h-10" />
            <TransitionHorizontal>
              <h1 className="font-light">Ask me anything</h1>
            </TransitionHorizontal>
          </div>
          <div className="h-8 w-8 p-1 flex justify-center items-center bg-white/10 rounded-full border border-white/20">
            <ChevronRight />
          </div>
        </Link>

        <div className="w-full py-3 px-4 border-2 border-white/20 rounded-lg mb-8 flex justify-between items-center hover:bg-white/20 transition-colors cursor-pointer">
          <h1 className="font-extralight text-lg">
            What are you curious about?
          </h1>

          <div className="flex items-center rounded-sm border-2 border-white/20 px-4 py-2">
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-white placeholder-white/70 text-sm w-12"
            />
            <button className="ml-2 text-white/70 transition-colors">
              <Search size="12" />
            </button>
          </div>
        </div>

        <h1 className="text-2xl lg:text-5xl mt-12 font-medium lg:text-left mb-5">
          Subject and Topic
        </h1>
        <TransitionHorizontal>
          <div className="w-full flex gap-5 overflow-auto scrollbar-hide">
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
        </TransitionHorizontal>

        <div className="w-full flex justify-center mt-5">
          <div className="flex gap-2 items-center px-6 py-2 bg-white/20 rounded-xl border-2 border-white/30">
            <h1> View all</h1>

            <ChevronRight size={16} />
          </div>
        </div>

        <div className="mt-12">
          <h1 className="text-2xl">Congratulations!🎉</h1>
          <p className="text-muted-foreground">You are a Thinker</p>

          <CuriosityChart />
          <ConceptMasteryChart />
          <ActiveTimeCharts />
          <ConsistencyChart />

          <ConceptMasteryPie />
        </div>

        {/* Weekly Progress */}
        <div className="mb-8 border-border p-4 rounded-2xl">
          <ScreenTimeChart
            dailyMinutes={screenTimeStats.dailyMinutes}
            dailyPoints={screenTimeStats.dailyPoints} // 👈 pass per-day points
            dayLabels={screenTimeStats.dayLabels}
            weeklyAverage={screenTimeStats.weeklyAverage}
            weeklyChange={screenTimeStats.weeklyChange}
            lastUpdated={screenTimeStats.lastUpdated}
          />
        </div>
      </main>
    </div>
  );
}
