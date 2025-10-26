"use client";
import React from "react";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

const AllSubjectRedirectButton = () => {
  const router = useRouter();
  return (
    <div className="w-full flex justify-center mt-5">
      <div
        onClick={() => {
          router.push("/subjects");
        }}
        className="flex gap-2 items-center px-6 py-2 bg-white/20 rounded-xl border-2 border-white/30"
      >
        <h1> View all Subjects</h1>

        <ChevronRight size={16} />
      </div>
    </div>
  );
};

export default AllSubjectRedirectButton;
