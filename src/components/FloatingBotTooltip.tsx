"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function FloatingBotTooltip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: 0.3,
      }}
    >
      <Link
        href="/chat?mode=free-explore"
        className="fixed md:relative z-50 left-1/2 -translate-x-1/2 bottom-1 flex flex-col items-center justify-center bg-transparent transition-colors cursor-pointer rounded-full p-3 w-full max-w-2xl md:mt-12 "
      >
        <div
          className="flex items-center justify-center gap-2 w-fit bg-[#113361] p-2 rounded-lg border border-[#fff]/50     transition-shadow duration-300
hover:shadow-[0_0_15px_1px_#ffffff]"
        >
          <img
            src="/images/Bot.png"
            alt="Chat Bot"
            className="h-9 animate-float"
            style={{
              filter: "drop-shadow(0 4px 8px rgba(255, 255, 255, 0.5))",
            }}
          />
          <p className="text-white" style={{ fontSize: "12px" }}>
            {" "}
            Start a New Conversation
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
