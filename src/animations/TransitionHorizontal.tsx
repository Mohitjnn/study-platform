"use client";
import { motion } from "framer-motion";
import React from "react";

export default function TransitionHorizontal({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ x: "-100%" }}
        whileInView={{ x: "0%" }}
        transition={{
          ease: "easeInOut",
          duration: 1,
          delayChildren: 0.3,
        }}
        // viewport={{ once: true }}
        className="w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
