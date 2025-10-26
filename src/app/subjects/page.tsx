import React from "react";
import SubjectCard from "@/components/PersonalCards/SubjectCard";
import { getSubjectsWithMetadata } from "@/actions/subjects";
import BackButton from "@/components/BackButton";

export default async function Page() {
  const subjects = await getSubjectsWithMetadata();

  return (
    <div className="relative w-full min-h-screen bg-[#010532] text-foreground dark pt-5">
      <div className="fixed top-24 left-[-100px] w-[400px] h-[400px] bg-[#DF9AEE] opacity-40 blur-3xl rounded-full"></div>

      <div className="fixed bottom-[-100px] right-0 w-[400px] h-[400px] bg-[#DF9AEE] opacity-40 blur-3xl rounded-full"></div>

      <main className="relative w-full p-4 sm:p-6 lg:p-8">
        <div className="relaive flex justify-between items-center px-5">
          <div className="absolute top-3 flex">
            <BackButton />
          </div>
        </div>

        <h1 className="text-xl font-light text-foreground text-center flex justify-center mb-7">
          All Subjects
        </h1>

        {/* Loading state */}
        {!subjects && (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-muted-foreground">Loading subjects...</div>
          </div>
        )}

        {/* Subjects grid */}
        {subjects && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 p-1">
            {subjects.map((subject, index) => (
              <SubjectCard
                key={subject.name}
                name={subject.name}
                progress={subject.progress}
                subtitle={subject.subtitle}
                index={index}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
