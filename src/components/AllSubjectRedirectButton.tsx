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
        className="flex gap-2 items-center px-6 py-2 bg-white/10 hover:bg-white/10 transition-colors rounded-lg border-2 border-white/20 shadow-md backdrop-blur-md cursor-pointer"
        // style={{ boxShadow: "0 4px 24px 0 rgba(223,154,238,0.15)" }}
      >
        <h1 className="font-light text-base text-white">View all Subjects</h1>
        <ChevronRight size={16} />
      </div>
    </div>
  );
};

export default AllSubjectRedirectButton;
