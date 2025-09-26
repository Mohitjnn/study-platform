"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { initiateConversation } from "@/actions/subjects";
import { ChevronLeft } from "lucide-react";

interface SubTopicData {
  id: string;
  sub_topic: string;
  learning_outcome: string;
}

interface TopicWithSubTopics {
  topic: string;
  subtopics: SubTopicData[];
}

interface AnimatedTopicsLayoutProps {
  topicsWithSubTopics: TopicWithSubTopics[];
  subjectName: string;
}

const AnimatedTopicsLayout: React.FC<AnimatedTopicsLayoutProps> = ({
  topicsWithSubTopics,
  subjectName,
}) => {
  const [loadingSubtopic, setLoadingSubtopic] = useState<string | null>(null);
  const router = useRouter();

  const handleSubtopicClick = async (subtopic: SubTopicData) => {
    setLoadingSubtopic(subtopic.id);
    try {
      const conversationResponse = await initiateConversation({
        topic_id: subtopic.id,
      });

      router.push(
        `/chat?conversation_id=${conversationResponse.conversation_id}&link_id=${conversationResponse.link_id}`
      );
    } catch (error) {
      console.error("Error initiating conversation:", error);
    } finally {
      setLoadingSubtopic(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const topicSectionVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const subtopicVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25,
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Subject Title */}
      <motion.div
        className="mb-12 flex justify-between items-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-1/3 flex">
          <div
            onClick={() => {
              router.back();
            }}
            className="p-2 rounded-full bg-white/10 border-2 border-white/10"
          >
            <ChevronLeft />
          </div>
        </div>
        <h1 className="text-2xl font-light text-foreground w-1/3 flex justify-center">
          {subjectName}
        </h1>

        <div className="w-1/3"></div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {topicsWithSubTopics.map((topicData, topicIndex) => (
          <motion.section
            key={topicData.topic}
            variants={topicSectionVariants}
            className="space-y-6"
          >
            {/* Topic Header */}
            <div className={"pl-3 border-l-6 border-grey-200"}>
              <h2 className="text-lg font-light text-foreground">
                {topicData.topic}
              </h2>
              <p className="text-muted-foreground text-sm">
                {topicData.subtopics.length} subtopic
                {topicData.subtopics.length !== 1 ? "s" : ""} available
              </p>
            </div>

            {/* Subtopics List */}
            <div className="grid gap-1 ml-4">
              {topicData.subtopics.map((subtopic, subtopicIndex) => (
                <motion.div
                  key={subtopic.id}
                  variants={subtopicVariants}
                  className={`border-b-1 border-gray-700 py-4`}
                >
                  <div className="flex flex-col lg:flex-row items-start justify-between gap-2 ">
                    <div className="min-w-0 space-y-1">
                      {/* Subtopic Name and ID */}
                      <div className="flex flex-col lg:flex-row lg:items-center items-start gap-3">
                        <h3 className="text-sm lg:text-lg font-semibold text-foreground leading-tight">
                          {subtopic.sub_topic}
                        </h3>
                        <Badge
                          variant="secondary"
                          className=" hidden lg:block text-xs font-mono shrink-0 mt-1 bg-muted/50"
                        >
                          {subtopic.id}
                        </Badge>
                      </div>

                      {/* Learning Outcome */}
                      <div className=" flex items-start lg:items-center gap-2">
                        <p className=" text-xs lg:text-base text-muted-foreground leading-relaxed">
                          {subtopic.learning_outcome}
                        </p>
                      </div>
                    </div>

                    {/* Start Conversation Button */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="shrink-0"
                    >
                      <Button
                        onClick={() => handleSubtopicClick(subtopic)}
                        disabled={loadingSubtopic === subtopic.id}
                        className="z-50 text-sm lg:text-base bg-white/20 text-white shadow-lg transition-all duration-300 min-w-[140px] border border-white/20"
                        size="default"
                      >
                        {loadingSubtopic === subtopic.id ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
                            />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-2 w-2" />
                            Start Conversation
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}
      </motion.div>
    </div>
  );
};

export default AnimatedTopicsLayout;
