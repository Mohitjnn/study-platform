import React from "react";
import Navbar from "@/components/Navbar";
import { fetchTopicsWithSubTopicsForSubject } from "@/actions/subjects";
import AnimatedTopicsLayout from "@/components/AnimatedTopicsLayout";

// Color mapping for different subjects
const subjectColors: Record<string, { primary: string; secondary: string }> = {
  Mathematics: { primary: "#3B82F6", secondary: "#60A5FA" },
  Science: { primary: "#10B981", secondary: "#34D399" },
  Physics: { primary: "#8B5CF6", secondary: "#A78BFA" },
  Chemistry: { primary: "#EC4899", secondary: "#F472B6" },
  Biology: { primary: "#14B8A6", secondary: "#2DD4BF" },
  English: { primary: "#F59E0B", secondary: "#FBBF24" },
  History: { primary: "#EF4444", secondary: "#F87171" },
  Geography: { primary: "#06B6D4", secondary: "#22D3EE" },
  default: { primary: "#6366F1", secondary: "#818CF8" },
};

export default async function Page({
  params,
}: {
  params: Promise<{ topics: string }>;
}) {
  const { topics } = await params;
  const topicsWithSubTopics = await fetchTopicsWithSubTopicsForSubject({
    subject: topics,
  });

  // Get colors for the subject, fallback to default
  const colors = subjectColors[topics] || subjectColors.default;

  return (
    <div className="relative w-full min-h-screen bg-[#010532] text-foreground dark">
      {/* Top left blob - primary color */}
      <div
        className="fixed top-24 left-[-100px] w-[400px] h-[400px] opacity-30 blur-3xl rounded-full transition-colors duration-500"
        style={{ backgroundColor: colors.primary }}
      ></div>

      {/* Bottom right blob - secondary color */}
      <div
        className="fixed bottom-[-100px] right-0 w-[400px] h-[400px] opacity-30 blur-3xl rounded-full transition-colors duration-500"
        style={{ backgroundColor: colors.secondary }}
      ></div>

      {/* Page content on top */}
      <div className="relative z-10 pt-5">
        {!topicsWithSubTopics && (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-muted-foreground">Loading topics...</div>
          </div>
        )}

        {topicsWithSubTopics && (
          <AnimatedTopicsLayout
            topicsWithSubTopics={topicsWithSubTopics}
            subjectName={topics}
          />
        )}
      </div>
    </div>
  );
}
