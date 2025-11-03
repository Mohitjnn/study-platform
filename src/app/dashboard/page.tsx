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
import { fetchTopTopics, fetchSubjectWithStats } from "@/actions/subjects";
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
import FollowUpChart from "@/components/FollowUpChart";
import { getCuriosityIndex } from "@/actions/curiosity";
import { getConsistencyCalendar } from "@/actions/consistency";
import { getSubjectMastery } from "@/actions/mastery";
import { getWeeklyTime } from "@/actions/weeklyTime";
import { getTopRepeatedTopics } from "@/actions/followUp";
import AllSubjectRedirectButton from "@/components/AllSubjectRedirectButton";
import TopicCard from "@/components/PersonalCards/TopicCard";
import TopicSearch from "@/components/TopicSuggestion";
import ActivityTabServer from "@/components/ActivityTab";

export default async function DashboardPage() {
  // Get user data from API
  const result = await getUserDataFromAPI();
  const topTopics = await fetchTopTopics();
  const newSubjects = await fetchSubjectWithStats();
  const screenTimeStats = await getWeeklyScreenTimeStats();
  const overallStats = await getOverAllStats();
  const curiosityData = await getCuriosityIndex(4);
  const consistencyData = await getConsistencyCalendar("month");
  const masteryData = await getSubjectMastery();
  const weeklyTimeData = await getWeeklyTime(5);
  const followUpData = await getTopRepeatedTopics(5);
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
      <main className="relative w-full md:max-w-3xl md:mx-auto p-4 sm:p-6 lg:p-8 pb-20">
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
          className="fixed z-50 left-1/2 -translate-x-1/2 bottom-3 flex flex-col items-center justify-center bg-transparent hover:bg-white/20 transition-colors cursor-pointer rounded-full p-3"
        >
          <img
            src="/images/Bot.png"
            alt="Chat Bot"
            className="h-12 animate-float"
            style={{
              filter: "drop-shadow(0 4px 8px rgba(255, 255, 255, 0.5))",
            }}
          />

          {/* <div className="text-center mt-2 px-3 py-1 text-xs text-white rounded-full backdrop-blur-md shadow-md">
            Click for a new conversation
          </div> */}
        </Link>

        <TopicSearch />

        <h1 className="text-2xl lg:text-3xl font-medium lg:text-left mb-5">
          All Subjects
        </h1>

        <TransitionHorizontal>
          <div className="w-full flex gap-5 overflow-auto scrollbar-hide">
            {newSubjects.subjects.map((subject, index) => (
              <SubjectCard
                key={subject.subject}
                name={subject.subject}
                progress={subject.completion_percentage}
                imageUrl={subject.image_url}
                tag={subject.progress_tag}
                index={index}
              />
            ))}
          </div>
        </TransitionHorizontal>

        {/* <AllSubjectRedirectButton /> */}

        <div className="mt-3 mb-2 border-border p-4 rounded-2xl">
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
