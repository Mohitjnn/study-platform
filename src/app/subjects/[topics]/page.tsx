import React, { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { fetchTopicsWithSubTopicsForSubject } from "@/actions/subjects";
import AnimatedTopicsLayout from "@/components/AnimatedTopicsLayout";
import SubjectSkeleton from "@/components/SubjectSkeleton";
import SubjectContent from "@/components/SubjectContent";

// Color mapping for different subjects
// const subjectColors: Record<string, { primary: string; secondary: string }> = {
//   Mathematics: { primary: "#3B82F6", secondary: "#60A5FA" },
//   Science: { primary: "#10B981", secondary: "#34D399" },
//   Physics: { primary: "#8B5CF6", secondary: "#A78BFA" },
//   Chemistry: { primary: "#EC4899", secondary: "#F472B6" },
//   Biology: { primary: "#14B8A6", secondary: "#2DD4BF" },
//   English: { primary: "#F59E0B", secondary: "#FBBF24" },
//   History: { primary: "#EF4444", secondary: "#F87171" },
//   Geography: { primary: "#06B6D4", secondary: "#22D3EE" },
//   default: { primary: "#6366F1", secondary: "#818CF8" },
// };

export default async function Page({
  params,
}: {
  params: Promise<{ topics: string }>;
}) {
  const { topics } = await params;

  return (
    <Suspense fallback={<SubjectSkeleton subject={topics} />}>
      <SubjectContent topics={topics} />
    </Suspense>
  );
}
