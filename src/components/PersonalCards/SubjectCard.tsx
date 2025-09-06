"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const accentColors = [
  "from-blue-500 to-blue-700",
  "from-green-500 to-green-700",
  "from-purple-500 to-purple-700",
  "from-pink-500 to-pink-700",
  "from-yellow-500 to-yellow-700",
  "from-teal-500 to-teal-700",
];

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
    router.push(`/subjects/${name.toLowerCase()}`);
  };
  return (
    <div className="flex flex-col h-full group hover:scale-[1.02] transition-all duration-300">
      <div
        className={`w-full rounded-xl shadow-lg p-6 flex flex-col bg-gradient-to-br bg-gray-900 h-[40vh] relative overflow-hidden`}
      >
        {/* Badge */}
        <div className="absolute top-3 right-3 text-white/70 text-xs font-mono bg-white/10 px-2 py-1 rounded-md">
          {name.slice(0, 2).toUpperCase()}
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white drop-shadow-md">
              {name}
            </h3>
            <p className="text-white/80 text-sm mt-1">{subtitle}</p>
          </div>

          {/* Level indicator */}
          {/* <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <span className="text-md font-semibold text-white">L{Math.floor(progress / 10) + 1}</span>
            </div>
            <div className="ml-3">
              <span className="text-white/90 text-xs font-semibold">LEVEL {Math.floor(progress / 10) + 1}</span>
            </div>
          </div> */}

          {/* Progress */}
          <div className="mt-auto w-full">
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-white/70">{progress}% completed</p>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-none"
                onClick={handleClick}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectCard;
