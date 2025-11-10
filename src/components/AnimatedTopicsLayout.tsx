"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Play, Search, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { initiateConversation, searchTopics } from "@/actions/subjects";

interface SubTopicData {
  id: string;
  sub_topic: string;
  learning_outcome: string;
  image_url?: string | null;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [displayedTopics, setDisplayedTopics] = useState<TopicWithSubTopics[]>(topicsWithSubTopics);
  const router = useRouter();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleSearch = async (query: string) => {
    if (query.trim() === "") {
      setDisplayedTopics(topicsWithSubTopics);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await searchTopics({
        subject: subjectName,
        query: query.trim(),
        limit: 20
      });

      // Transform search results to match TopicWithSubTopics format
      const searchTopicsMap = new Map<string, SubTopicData[]>();
      
      searchResults.results.forEach(result => {
        if (!searchTopicsMap.has(result.topic)) {
          searchTopicsMap.set(result.topic, []);
        }
        
        // Process all subtopics from the search result
        result.subtopics.forEach(subtopic => {
          searchTopicsMap.get(result.topic)?.push({
            id: subtopic.id,
            sub_topic: subtopic.sub_topic,
            image_url: subtopic.image_url ? subtopic.image_url : null,
            learning_outcome: subtopic.learning_outcome
          });
        });
      });

      const transformedResults: TopicWithSubTopics[] = Array.from(searchTopicsMap.entries()).map(([topic, subtopics]) => ({
        topic,
        subtopics
      }));

      setDisplayedTopics(transformedResults);
    } catch (error) {
      console.error("Search error:", error);
      // Reset to original topics on error
      setDisplayedTopics(topicsWithSubTopics);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear existing timeout first
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    // If empty, reset to original topics
    if (!value.trim()) {
      setIsSearching(false);
      setTimeout(() => {
        setDisplayedTopics(topicsWithSubTopics);
      }, 10);
      return;
    }

    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Reset displayed topics when original topics change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDisplayedTopics(topicsWithSubTopics);
    }
  }, [topicsWithSubTopics, searchQuery]);

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
    <div className="max-w-7xl mx-auto py-6 px-5 ">
      <div className="absolute inset-0 bg-radial from-white/20 to-transparent left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full h-72 w-72 overflow-hidden blur-lg z-0" />
      {/* Subject Title */}
      <motion.div
        className="mb-10 flex justify-between items-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-1/3 flex reltive z-10">
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

      {/* Search Input */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
          <Input
            type="text"
            placeholder={`Search topics in ${decodeURIComponent(subjectName)}...`}
            value={searchQuery}
            onChange={handleInputChange}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
              />
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        key={displayedTopics.length}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {displayedTopics.length === 0 && !isSearching ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-white/70 text-lg">
              {searchQuery.trim() ? `No topics found for "${searchQuery}"` : "No topics available"}
            </p>
            {searchQuery.trim() && (
              <p className="text-white/50 mt-2">
                Try searching for a different topic or clear your search.
              </p>
            )}
          </motion.div>
        ) : (
          displayedTopics.map((topicData, topicIndex) => (
          <motion.section
            key={`${topicData.topic}-${displayedTopics.length}`}
            variants={topicSectionVariants}
            className="space-y-3"
            id={topicData.topic}
          >
            {/* Topic Header */}
            <div className={"pl-3 border-l-6 border-grey-200"}>
              <h2 className="text-lg font-light text-foreground">
                {topicData.topic}
              </h2>
              <p className="text-slate-200 text-sm">
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
                    className="flex-shrink-0 w-64 border border-gray-100/20 elevated rounded-lg overflow-hidden"
                  >
                    {subtopic.image_url ? (
                      <img className="w-full h-40 bg-white/20" src={subtopic.image_url} alt={subtopic.sub_topic} />
                    ) : (
                      <div className="w-full h-40 bg-white/20" />
                    )}

                    <div className="p-4 space-y-3">
                      <h3 className="text-sm lg:text-lg font-semibold text-foreground leading-tight line-clamp-2">
                        {subtopic.sub_topic}
                      </h3>

                      <p className="text-xs lg:text-sm text-slate-300 leading-relaxed line-clamp-3">
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
        ))
        )}
      </motion.div>
    </div>
  );
};

export default AnimatedTopicsLayout;
