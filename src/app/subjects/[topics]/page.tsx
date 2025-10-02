import React from "react";
import Navbar from "@/components/Navbar";
import { fetchTopicsWithSubTopicsForSubject } from "@/actions/subjects";
import AnimatedTopicsLayout from "@/components/AnimatedTopicsLayout";

export default async function Page({
  params,
}: {
  params: Promise<{ topics: string }>;
}) {
  const { topics } = await params;
  const topicsWithSubTopics = await fetchTopicsWithSubTopicsForSubject({
    subject: topics,
  });
  return (
    <div className="relative w-full min-h-screen bg-[#010532] text-foreground dark">
      <div className="fixed top-24 left-[-100px] w-[400px] h-[400px] bg-[#DF9AEE] opacity-30 blur-3xl rounded-full"></div>

      <div className="fixed bottom-[-100px] right-0 w-[400px] h-[400px] bg-[#DF9AEE] opacity-30 blur-3xl rounded-full"></div>

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
