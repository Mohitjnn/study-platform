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
    <div className="flex flex-col">
      <div
        onClick={handleClick}
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
      <div className="w-full pl-1 mt-2">
        <h1 className="font-semibold">{name}</h1>
      </div>
      <div className="w-full px-1 flex justify-start items-center mt-2">
        <div className="w-full flex items-center gap-1 relative">
          <Progress
            value={progress}
            className="relative h-2 bg-white transition-all duration-300 px-4 w-full"
          />
          <motion.div
            animate={{ x: [0, 1, 0, -1, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronRight size={16} />
          </motion.div>
        </div>
        <span className="text-xs text-[#DF9AEE] font-medium">{progress}%</span>
      </div>
    </div>
  );
};

export default SubjectCard;
