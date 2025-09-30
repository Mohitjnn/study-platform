"use client";
import { ChevronLeft } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

const BackButton = () => {
  const router = useRouter();
  return (
    <div
      onClick={() => {
        router.back();
      }}
      className="p-2 rounded-full bg-white/10 border-2 border-white/10"
    >
      <ChevronLeft />
    </div>
  );
};

export default BackButton;
