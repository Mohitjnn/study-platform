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
    <div className="flex flex-col space-y-2"  onClick={handleClick}>
      <div
        className="w-full aspect-square rounded-2xl bg-cover bg-center cursor-pointer relative overflow-hidden"
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
      <div className="w-full px-1 flex items-center justify-start gap-2">
        <h1 className="font-semibold text-sm">{name}</h1>
        <ChevronRight size={14} className="text-white/70" />
      </div>
      <div className="w-full px-1 flex justify-between items-center">
        <div className="w-3/4 flex items-center gap-2">
          <Progress
            value={progress}
            className="relative h-2 bg-white/20 transition-all duration-300 flex-1"
          />
          
        </div>
        <span className="text-xs text-[#DF9AEE] font-medium">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

export default SubjectCard;
