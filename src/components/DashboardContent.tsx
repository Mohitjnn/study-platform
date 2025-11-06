import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getOverAllStats,
  getWeeklyScreenTimeStats,
} from "@/actions/screenTime";
import { fetchTopTopics, fetchSubjectWithStats } from "@/actions/subjects";
import SubjectCard from "@/components/PersonalCards/SubjectCard";
import CategoryButton from "@/components/CategoryButton";
import MobileMenu from "@/components/MobileMenu";
import TransitionHorizontal from "@/animations/TransitionHorizontal";
import { SlotMachineCounter } from "@/animations/SlotMachineCounter";
import { getCuriosityIndex } from "@/actions/curiosity";
import { getConsistencyCalendar } from "@/actions/consistency";
import { getSubjectMastery } from "@/actions/mastery";
import { getWeeklyTime } from "@/actions/weeklyTime";
import { getTopRepeatedTopics } from "@/actions/followUp";
import TopicCard from "@/components/PersonalCards/TopicCard";
import TopicSearch from "@/components/TopicSuggestion";

type UserData = {
  full_name?: string;
  survey?: { submitted: boolean };
};

export default async function DashboardContent({ user }: { user: UserData }) {
  // Fetch all data in parallel
  const [
    topTopics,
    newSubjects,
    screenTimeStats,
    overallStats,
    curiosityData,
    consistencyData,
    masteryData,
    weeklyTimeData,
    followUpData,
  ] = await Promise.all([
    fetchTopTopics(),
    fetchSubjectWithStats(),
    getWeeklyScreenTimeStats(),
    getOverAllStats(),
    getCuriosityIndex(4),
    getConsistencyCalendar("month"),
    getSubjectMastery(),
    getWeeklyTime(5),
    getTopRepeatedTopics(5),
  ]);

  return (
    <div className="relative w-full min-h-screen bg-[#090E6C] text-foreground dark pt-5">
      {/* Background blobs */}

      <main className="relative w-full md:max-w-3xl md:mx-auto p-4 sm:p-6 lg:p-8 pb-20">
        {/* Welcome Section */}
        <div className="w-full flex items-center justify-between">
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

        {/* Stats Section */}
        {overallStats ? (
          <div className="flex flex-col justify-center items-center relative my-5">
            <div className="w-full h-px bg-gradient-to-r from-white/40 via-transparent to-white/40 my-2"></div>
            <div className="flex items-center w-full">
              <div className="relative flex items-center gap-4 w-1/2 h-full p-2">
                <div className="p-1 h-10 w-10 flex justify-center items-center bg-white/20 border-2 border-white/30 rounded-full">
                  <img src="images/topic.png" alt="img" />
                </div>
                <div>
                  <SlotMachineCounter targetValue={overallStats.totalCourses}>
                    <h1 className="text-2xl font-bold" />
                  </SlotMachineCounter>
                  <h1 className="text-xs font-extralight">Total Courses</h1>
                </div>
              </div>

              <div className="w-px h-16 bg-gradient-to-b from-white/40 to-transparent"></div>

              <div className="relative flex items-center gap-4 w-1/2 h-full pl-2">
                <div className="p-1 h-10 w-10 flex justify-center items-center bg-white/20 border-2 border-white/30 rounded-full">
                  <img src="images/hours.png" alt="img" />
                </div>
                <div>
                  <SlotMachineCounter
                    targetValue={overallStats.completedCourses}
                  >
                    <h1 className="text-2xl font-bold" />
                  </SlotMachineCounter>
                  <h1 className="text-xs font-light">Completed Courses</h1>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-white/40 via-transparent to-white/40 my-1"></div>

            <div className="flex items-center w-full">
              <div className="relative flex items-center gap-4 w-1/2 h-full pl-2">
                <div className="p-1 h-10 w-10 flex justify-center items-center bg-white/20 border-2 border-white/30 rounded-full">
                  <img src="images/streak.png" alt="img" />
                </div>
                <div>
                  <SlotMachineCounter targetValue={overallStats.minutesStudied}>
                    <h1 className="text-2xl font-bold" />
                  </SlotMachineCounter>
                  <h1 className="text-xs font-light">Minutes Studied</h1>
                </div>
              </div>

              <div className="w-px h-16 bg-gradient-to-t from-white/40 to-transparent"></div>

              <div className="relative flex items-center gap-4 w-1/2 h-full p-2">
                <div className="p-1 h-10 w-10 flex justify-center items-center bg-white/20 border-2 border-white/30 rounded-full">
                  <img src="images/topic.png" alt="img" />
                </div>
                <div>
                  <SlotMachineCounter targetValue={overallStats.currentStreak}>
                    <h1 className="text-2xl font-bold" />
                  </SlotMachineCounter>
                  <h1 className="text-xs font-light">Streak</h1>
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

        {/* Floating Bot with Tooltip */}
        <TooltipProvider>
          <Tooltip defaultOpen={true}>
            <TooltipTrigger asChild>
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
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Begin new conversation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Topic Search */}
        <TopicSearch />

        {/* All Subjects Section */}
        <h1 className="text-2xl lg:text-3xl font-medium lg:text-left mb-5">
          All Subjects
        </h1>

        <div className="w-full gap-4 grid grid-cols-1">
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
      </main>
    </div>
  );
}
