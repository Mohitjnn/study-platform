import React from "react";
import SubjectCard from "@/components/PersonalCards/SubjectCard";
import BackButton from "@/components/BackButton";
import { fetchSubjectWithStats } from "@/actions/subjects";

export default async function Page() {
  const subjectStats = await fetchSubjectWithStats();

  return (
    <div className="relative w-full min-h-screen bg-[#010532] text-foreground dark pt-5">
      <div className="fixed top-24 left-[-100px] w-[400px] h-[400px] bg-[#DF9AEE] opacity-40 blur-3xl rounded-full"></div>

      <div className="fixed bottom-[-100px] right-0 w-[400px] h-[400px] bg-[#DF9AEE] opacity-40 blur-3xl rounded-full"></div>

      <main className="relative w-full md:max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="relative flex justify-between items-center">
          <div className="absolute top-3 flex">
            <BackButton />
          </div>
        </div>

        {/* <h1 className="text-xl font-light text-foreground text-center flex justify-center mb-7">
          All Subjects
        </h1> */}

        {/* Loading state */}
        {!subjectStats && (
          <div className="flex justify-center items-center min-h-[400px] mt-7">
            <div className="text-muted-foreground">Loading subjects...</div>
          </div>
        )}

        {/* Subjects grid */}
        {subjectStats && (
          <div className="grid gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-3 p-1 mt-16 ">
            {subjectStats.subjects.map((subject, index) => (
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
        )}
      </main>
    </div>
  );
}
