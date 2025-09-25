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
  console.log("Fetching topics for subject:", topics);
  const topicsWithSubTopics = await fetchTopicsWithSubTopicsForSubject({
    subject: topics,
  });
  console.log("Fetched topics with subtopics:", topicsWithSubTopics);
  console.log(topicsWithSubTopics);

  return (
    <div className="bg-[#010532] text-foreground dark relative pt-5 w-full dark">
      {/* <Navbar title={`${topics} Topics`} showProfile={true} /> */}

      {/* <div className="absolute inset-0 flex justify-start items-start mt-24 -translate-x-20 right-0 ">
        <div className="w-[400px] h-[400px] bg-[#DF9AEE] opacity-30 blur-3xl rounded-full"></div>
      </div>

      <div className="absolute inset-0 flex justify-end items-center mt-24 -translate-x-20 right-0 -z-50 ">
        <div className="w-[600px] h-[600px] bg-[#DF9AEE] opacity-30 blur-3xl rounded-full"></div>
      </div>

      <div className="absolute inset-0 flex justify-end ml-36 items-end mt-24 -translate-x-20 right-0  -z-50">
        <div className="w-[400px] h-[400px] bg-[#DF9AEE] opacity-30 blur-3xl rounded-full"></div>
      </div> */}

      {/* Loading state */}
      {!topicsWithSubTopics && (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-muted-foreground">Loading topics...</div>
        </div>
      )}

      <div className="z-50">
        {/* Topics with subtopics layout */}
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
