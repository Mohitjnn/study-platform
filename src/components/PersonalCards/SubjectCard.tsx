"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

interface SubjectCardProps {
  name: string;
  progress: number;
  imageUrl?: string;
  index?: number;
  tag: string;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  name,
  imageUrl,
  tag,
  progress,
  index = 0,
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/subjects/${name}`);
  };
  return (
    <div
      className="flex gap-x-3 items-start border border-[#fff]/50 rounded-lg p-2 bg-[#113361]
    transition-shadow duration-300
    hover:shadow-[0_0_15px_1px_#ffffff]"
      onClick={handleClick}
    >
      <div
        className="w-1/4 h-24 aspect-square rounded-lg bg-cover bg-center cursor-pointer relative overflow-hidden"
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        }}
      >
        {/* Dark overlay for better badge visibility */}
        <div className="absolute inset-0 bg-black/20"></div>

        <Badge className="absolute top-2 left-2 px-2 py-1 text-xs font-semibold bg-purple-900 text-white border-none hover:bg-[#DF9AEE]/90">
          {tag}
        </Badge>
      </div>

      <div className="w-3/4 flex flex-col gap-3">
        <div className="w-full px-1 flex items-center justify-start gap-2">
          <h1 className="font-semibold text-lg">{name}</h1>
          <ChevronRight size={20} className="text-white/70" />
        </div>
        <div className="w-full px-1 flex justify-between items-center">
          <div className="w-full flex items-center">
            <Progress
              value={progress}
              className="relative h-4 bg-white/20 transition-all duration-300 flex-1"
            />
          </div>
          <span className="text-xs text-[#DF9AEE] font-medium ml-3">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default SubjectCard;
