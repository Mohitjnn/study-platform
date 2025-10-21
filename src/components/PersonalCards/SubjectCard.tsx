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
    <div className="flex flex-col">
      <div
        onClick={handleClick}
        className="w-28 h-28 rounded-2xl bg-cover bg-center bg-[url('/images/electricity.jpg')] cursor-pointer"
      ></div>

      <div className="w-full flex justify-between items-center mt-2">
        <h1>{name}</h1>
        <ChevronRight />
      </div>
    </div>
  );
};

export default SubjectCard;
