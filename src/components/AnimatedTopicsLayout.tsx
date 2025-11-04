"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { initiateConversation } from "@/actions/subjects";
import { ChevronLeft, RotateCcw } from "lucide-react";
import TopicSearch from "./TopicSuggestion";

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
    <div className="max-w-7xl mx-auto py-6 px-5">
      {/* Subject Title */}
      <motion.div
        className="mb-10 flex justify-between items-center"
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
        <h1 className="text-2xl font-light text-foreground w-full flex justify-center">
          {decodeURIComponent(subjectName)}
        </h1>

        <div className="w-1/3"></div>
      </motion.div>

      <TopicSearch />

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
            className="space-y-3"
            id={topicData.topic}
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

            <div className="overflow-x-auto pb-4 scrollbar-hide">
              <div className="flex gap-4 min-w-max scrollbar-hide">
                {topicData.subtopics.map((subtopic, subtopicIndex) => (
                  <motion.div
                    key={subtopic.id}
                    variants={subtopicVariants}
                    className="flex-shrink-0 w-64 border border-gray-700 rounded-lg overflow-hidden"
                  >
                    <div className="w-full h-40 bg-white/20" />

                    <div className="p-4 space-y-3">
                      <h3 className="text-sm lg:text-lg font-semibold text-foreground leading-tight line-clamp-2">
                        {subtopic.sub_topic}
                      </h3>

                      <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {subtopic.learning_outcome}
                      </p>

                      <div className="flex justify-end pt-2">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 bg-white/20 rounded-full cursor-pointer"
                          onClick={() => handleSubtopicClick(subtopic)}
                        >
                          {loadingSubtopic === subtopic.id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                            />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        ))}
      </motion.div>
    </div>
  );
};

export default AnimatedTopicsLayout;
