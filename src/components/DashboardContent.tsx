  import { ChevronRight } from "lucide-react";
  import Link from "next/link";
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
  import FloatingBotTooltip from "@/components/FloatingBotTooltip";
  import { BackgroundRippleEffect } from "./ui/background-ripple-effect";

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
    ] = await Promise.all([
      fetchTopTopics(),
      fetchSubjectWithStats(),
      getWeeklyScreenTimeStats(),
      getCuriosityIndex(4),
      getConsistencyCalendar("month"),
      getSubjectMastery(),
      getWeeklyTime(5),
      getTopRepeatedTopics(5),
    ]);

    return (
      <div className="relative w-full min-h-screen bg-[#090E6C] text-foreground dark pt-5">
                    <BackgroundRippleEffect/>
        <main className="relative w-full md:max-w-3xl md:mx-auto p-4 sm:p-6 lg:p-8 pb-20 2 relative z-50">

          {/* Welcome Section */}
          <div className="w-full flex items-center justify-between mb-12">
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




          {/* Topic Search */}
          <TopicSearch />

          {/* All Subjects Section */}
          <h1 className="text-2xl lg:text-3xl font-medium lg:text-left mb-5">
            All Subjects
          </h1>

          <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-2 mb-5">
            {newSubjects.subjects.map((subject, index) => (
              <TransitionHorizontal key={subject.subject}>
                <SubjectCard
                  key={subject.subject}
                  name={subject.subject}
                  progress={subject.completion_percentage}
                  imageUrl={subject.image_url}
                tag={subject.progress_tag}
                index={index}
              />
                          </TransitionHorizontal>
            ))}
          </div>
                  {/* Floating Bot with Persistent Tooltip */}
          <FloatingBotTooltip />
        </main>
      </div>
    );
  }
