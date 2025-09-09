import React from "react";
import Navbar from "@/components/Navbar";
import { fetchTopicsWithSubTopicsForSubject } from "@/actions/subjects";
import AnimatedTopicsLayout from "@/components/AnimatedTopicsLayout";

export default async function Page({params}: {params: Promise<{topics: string}>}) {
  const { topics } = await params;
  console.log("Fetching topics for subject:", topics);
  const topicsWithSubTopics = await fetchTopicsWithSubTopicsForSubject({subject: topics});
 console.log("Fetched topics with subtopics:", topicsWithSubTopics);
 console.log(topicsWithSubTopics)

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar title={`${topics} Topics`} showProfile={true} />
      
      {/* Loading state */}
      {!topicsWithSubTopics && (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-muted-foreground">Loading topics...</div>
        </div>
      )}
      
      {/* Topics with subtopics layout */}
      {topicsWithSubTopics && (
        <AnimatedTopicsLayout 
          topicsWithSubTopics={topicsWithSubTopics} 
          subjectName={topics}
        />
      )}
    </div>
  );
}