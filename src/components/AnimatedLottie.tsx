"use client";

import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function AnimatedLottie() {
  return (
    <motion.div
      className="relative flex justify-center items-center"
      animate={{
        // Smooth floating effect
        y: ["-10px", "10px"],
        // Gentle glowing / pulsing scale
        scale: [1, 1.05, 1],
        // Subtle fade in/out shimmer
        opacity: [0.9, 1, 0.9],
      }}
      transition={{
        y: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: 4,
          ease: "easeInOut",
        },
        scale: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: 2,
          ease: "easeInOut",
        },
        opacity: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: 3,
          ease: "easeInOut",
        },
      }}
    >
      <DotLottieReact
        src="https://lottie.host/38c45396-5af3-4765-98b2-4a853a891e0d/LxroABG7MP.lottie"
        loop
        autoplay
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-full overflow-hidden pointer-events-none"
      />
    </motion.div>
  );
}
