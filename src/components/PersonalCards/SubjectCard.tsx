"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div
      className="flex flex-col h-full group"
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut" 
      }}
    >
      <div className="w-full rounded-xl shadow-lg p-3 lg:p-6 flex flex-col justify-between bg-card relative overflow-hidden border border-border h-[20vh] lg:h-[25vh]">
        
        {/* Water filling effect with waves */}
        <motion.div 
          className="absolute inset-0 rounded-b-xl"
          initial={{ height: 0 }}
          animate={{ height: `${progress}%` }}
          transition={{
            duration: 1.2,
            delay: 0.3,
            ease: [0.4, 0.0, 0.2, 1]
          }}
          style={{ 
            background: `linear-gradient(to top, 
              #343434E6, 
              #343434B3, 
              #34343480)`,
            bottom: 0,
            top: 'auto'
          }}
        />

        {/* Animated wave layers */}
        <AnimatePresence>
          {progress > 0 && (
            <>
              {/* Primary wave */}
              <motion.div 
                className="absolute left-0 right-0 h-8"
                style={{ 
                  bottom: `${progress - 5}% `,
                  background: `radial-gradient(ellipse at center, 
                    #34343466 0%, 
                    #34343433 50%, 
                    transparent 100%)`,
                  clipPath: 'polygon(0% 50%, 10% 40%, 20% 45%, 30% 35%, 40% 50%, 50% 40%, 60% 45%, 70% 35%, 80% 50%, 90% 45%, 100% 40%, 100% 100%, 0% 100%)'
                }}
                animate={{
                  clipPath: [
                    'polygon(0% 50%, 10% 40%, 20% 45%, 30% 35%, 40% 50%, 50% 40%, 60% 45%, 70% 35%, 80% 50%, 90% 45%, 100% 40%, 100% 100%, 0% 100%)',
                    'polygon(0% 40%, 10% 50%, 20% 35%, 30% 45%, 40% 40%, 50% 50%, 60% 35%, 70% 45%, 80% 40%, 90% 50%, 100% 45%, 100% 100%, 0% 100%)',
                    'polygon(0% 45%, 10% 35%, 20% 50%, 30% 40%, 40% 45%, 50% 35%, 60% 50%, 70% 40%, 80% 45%, 90% 35%, 100% 50%, 100% 100%, 0% 100%)',
                    'polygon(0% 50%, 10% 40%, 20% 45%, 30% 35%, 40% 50%, 50% 40%, 60% 45%, 70% 35%, 80% 50%, 90% 45%, 100% 40%, 100% 100%, 0% 100%)'
                  ]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Secondary wave */}
              <motion.div 
                className="absolute left-0 right-0 h-6"
                style={{ 
                  bottom: `${progress}%`,
                  background: `linear-gradient(to right, 
                    #3434344D, 
                    #34343480, 
                    #3434344D)`,
                  clipPath: 'polygon(0% 60%, 15% 50%, 25% 65%, 35% 45%, 45% 60%, 55% 50%, 65% 65%, 75% 45%, 85% 60%, 95% 50%, 100% 55%, 100% 100%, 0% 100%)'
                }}
                animate={{
                  clipPath: [
                    'polygon(0% 60%, 15% 50%, 25% 65%, 35% 45%, 45% 60%, 55% 50%, 65% 65%, 75% 45%, 85% 60%, 95% 50%, 100% 55%, 100% 100%, 0% 100%)',
                    'polygon(0% 50%, 15% 65%, 25% 45%, 35% 60%, 45% 50%, 55% 65%, 65% 45%, 75% 60%, 85% 50%, 95% 65%, 100% 50%, 100% 100%, 0% 100%)',
                    'polygon(0% 65%, 15% 45%, 25% 60%, 35% 50%, 45% 65%, 55% 45%, 65% 60%, 75% 50%, 85% 65%, 95% 45%, 100% 60%, 100% 100%, 0% 100%)',
                    'polygon(0% 60%, 15% 50%, 25% 65%, 35% 45%, 45% 60%, 55% 50%, 65% 65%, 75% 45%, 85% 60%, 95% 50%, 100% 55%, 100% 100%, 0% 100%)'
                  ]
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Badge with dynamic colors */}
        <motion.div
          className="absolute hidden lg:block top-3 right-3 text-xs text-black font-mono px-2 py-1 rounded-md z-10 transition-all duration-500"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1
          }}
          transition={{ 
            duration: 0.3, 
            delay: 0.7
          }}
          style={{
            backgroundColor: progress > 70 ? '#FAFAFA33' : '#F5F5F5',
            // color: progress > 70 ? '#FAFAFA' : '#8E8E8E'
          }}
        >
          {name.slice(0, 2).toUpperCase()}
        </motion.div>

        {/* Content - positioned relative to be above the fill */}
        <div className="flex flex-col h-full relative z-10">
          
          {/* Header with dynamic text color */}
          <div className="mb-4">
            <motion.h3 
              className="text-lg lg:text-xl font-bold drop-shadow-md transition-colors duration-500"
            >
              {name}
            </motion.h3>
          </div>

          {/* Progress percentage display */}
          <div className="mt-auto w-full">
            {/* <div className="mb-3">
              <motion.div
                className="text-center mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                <motion.span 
                  className="text-2xl font-bold transition-colors duration-500"
                  key={progress}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  {progress}%
                </motion.span>
                <br />
                <motion.span 
                  className="text-xs font-semibold tracking-wider transition-colors duration-500"
                  style={{
                    color: progress > 25 ? '#FAFAFACC' : '#8E8E8E'
                  }}
                >
                  PROGRESS
                </motion.span>
              </motion.div>
            </div> */}

            <div className="flex justify-between items-end">
              <motion.div 
                className="block lg:hidden text-xs text-black font-mono p-1 rounded-md transition-all duration-500"
                style={{
                  backgroundColor: progress > 20 ? '#FAFAFA33' : '#F5F5F5',
                }}
              >
                {name.slice(0, 2).toUpperCase()}
              </motion.div>
              
              <motion.div
                className="lg:w-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  // variant={progress > 50 ? "default" : "secondary"}
                  size="sm"
                  className="lg:w-full transition-all duration-500"
                  onClick={handleClick}
                >
                  Continue
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Enhanced floating particles/bubbles */}
        <AnimatePresence>
          {progress > 0 && (
            <>
              {/* Large bubble */}
              <motion.div 
                className="absolute w-3 h-3 rounded-full bg-white"
                style={{ 
                  // backgroundColor: `hsl(var(--primary-foreground) / 0.4)`,
                  left: '15%',
                  bottom: `${Math.min(progress * 0.8, 85)}%`,
                  boxShadow: `0 0 10px #fafafa / 0.3)`
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1.2, 0.8],
                  y: [0, -60, -120],
                  x: [0, 15, -5]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  delay: 2,
                  ease: "easeOut"
                }}
              />
              
              {/* Medium bubble */}
              <motion.div 
                className="absolute w-2 h-2 rounded-full bg-white"
                style={{ 
                  // backgroundColor: `hsl(var(--primary-foreground) / 0.3)`,
                  right: '20%',
                  bottom: `${Math.min(progress * 0.6, 70)}%`,
                  boxShadow: `0 0 8px #fafafa / 0.2)`
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 0.6, 0],
                  scale: [0.3, 1, 0.6],
                  y: [0, -45, -90],
                  x: [0, -8, 3]
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  delay: 3.5,
                  ease: "easeOut"
                }}
              />
              
              {/* Small bubble */}
              <motion.div 
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{ 
                  backgroundColor: `#FAFAFA80`,
                  left: '75%',
                  bottom: `${Math.min(progress * 0.4, 50)}%`,
                  boxShadow: `0 0 6px #FAFAFA66`
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.2, 0.8, 0.4],
                  y: [0, -30, -60],
                  x: [0, 5, -2]
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  delay: 4.2,
                  ease: "easeOut"
                }}
              />
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SubjectCard;