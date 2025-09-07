"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { initiateConversation } from "@/actions/subjects";

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

  const getTopicAccent = (index: number) => {
    const accents = [
      "border-l-blue-500",
      "border-l-green-500",
      "border-l-purple-500",
      "border-l-pink-500",
      "border-l-orange-500",
      "border-l-teal-500",
      "border-l-indigo-500",
      "border-l-red-500",
    ];
    return accents[index % accents.length];
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Subject Title */}
      <motion.div
        className="mb-12 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-foreground mb-4">
          {subjectName}
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose a subtopic to start your learning journey
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12"
      >
        {topicsWithSubTopics.map((topicData, topicIndex) => (
          <motion.section
            key={topicData.topic}
            variants={topicSectionVariants}
            className="space-y-6"
          >
            {/* Topic Header */}
            <div
              className={`pl-6 border-l-4 ${getTopicAccent(
                topicIndex
              )}`}
            >
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                {topicData.topic}
              </h2>
              <p className="text-muted-foreground">
                {topicData.subtopics.length} subtopic
                {topicData.subtopics.length !== 1 ? "s" : ""} available
              </p>
            </div>

            {/* Subtopics List */}
            <div className="grid gap-4 ml-4">
              {topicData.subtopics.map((subtopic, subtopicIndex) => (
                <motion.div
                  key={subtopic.id}
                  variants={subtopicVariants}
                  className={`border-b-4 border-gray-700 py-4`}
                >
                  <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                    <div className="min-w-0 space-y-3">
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
                        <Target className="text-muted-foreground shrink-0 mt-1 h-4 w-4" />
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
                        className=" text-sm lg:text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 min-w-[140px]"
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
