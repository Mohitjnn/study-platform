import React, { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { fetchTopicsWithSubTopicsForSubject } from "@/actions/subjects";
import AnimatedTopicsLayout from "@/components/AnimatedTopicsLayout";
import SubjectSkeleton from "@/components/SubjectSkeleton";
import SubjectContent from "@/components/SubjectContent";

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
