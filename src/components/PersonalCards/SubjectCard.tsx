"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface SubjectCardProps {
  name: string;
  progress: number;
  index?: number;
  subtitle?: string;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  name,
  progress,
  index = 0,
  subtitle = "Continue your learning journey",
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/subjects/${name}`);
  };

  return (
    <>
      {/*  */}

      <div
        className="w-full py-4 px-7 border border-white/20 bg-white/10 rounded-lg my-3 flex justify-between items-center cursor-pointer"
        onClick={handleClick}
      >
        <h1 className="font-semibold">{name}</h1>
        <div className="h-6 w-6 p-1 flex justify-center items-center bg-white/10 rounded-full border border-white/20">
          <ChevronRight />
        </div>
      </div>
    </>
  );
};

export default SubjectCard;
