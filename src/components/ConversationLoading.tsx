"use client";
import { motion } from "framer-motion";

export default function ConversationLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-8">
        {/* Animated Logo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />

        {/* Loading Text */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Starting Conversation
          </h2>
          <p className="text-muted-foreground">
            Setting up your AI assistant...
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex space-x-4">
          {[1, 2, 3].map((step) => (
            <motion.div
              key={step}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: step * 0.2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="w-3 h-3 bg-primary rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
