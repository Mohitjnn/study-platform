"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Star, Clock, BookOpen, Brain, Target, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  fetchWeeklyActivity,
  WeeklyActivity,
  ActivityItem,
  ActivityDay,
} from "@/actions/activity";

import ActivityTab from "@/components/ActivityTab";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import CategoryButton from "@/components/CategoryButton";
import MobileMenu from "@/components/MobileMenu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";

const renderStars = (percentage: number) => {
  const stars = Math.min(3, Math.max(0, Math.round(percentage / 33.33)));
  return Array.from({ length: 3 }, (_, i) => (
    <Star
      key={i}
      className={`w-3 h-3 ${
        i < stars ? "text-yellow-400 fill-yellow-400" : "text-white"
      }`}
    />
  ));
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const subjectColors: Record<string, { primary: string; secondary: string }> = {
  Mathematics: {
    primary: "#6B21A8",
    secondary: "#A855F7",
  },
  Science: {
    primary: "#B45309",
    secondary: "#FACC15",
  },
  English: {
    primary: "#166534",
    secondary: "#4ADE80",
  },
  default: {
    primary: "#991B1B",
    secondary: "#F87171",
  },
  ExtraBlue: {
    primary: "#1E3A8A",
    secondary: "#60A5FA",
  },
};

const getSubjectGradient = (subject: string | null | undefined) => {
  const safe = (subject || "").toString().trim();

  const exact = subjectColors[safe];
  if (exact)
    return `linear-gradient(135deg, ${exact.primary}, ${exact.secondary})`;

  const found = Object.keys(subjectColors).find((key) =>
    safe.toLowerCase().includes(key.toLowerCase())
  );

  const { primary, secondary } = subjectColors[found || "default"];
  return `linear-gradient(135deg, ${primary}, ${secondary})`;
};

interface ActivityCardProps {
  item: ActivityItem;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ item }) => {
  const accuracy = item.percentages.accuracy || 0;
  const quiz = item.percentages.quiz || 0;

  return (
    <div
      className="border-2 border-white/20 rounded-sm p-4 hover:shadow-md transition-shadow"
      style={{
        background: getSubjectGradient(item.subject),
      }}
    >
      <div className="flex flex-col  items-start justify-between">
        <div className="flex items-center space-x-3 flex-1 mr-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-lg font-bold ">
              {item.topic_title}
            </h3>
            <p className="text-xs tracking-wide mb-2 mt-1 text-white/80">
              {item.subject} • {item.sub_topic}
            </p>

            <p className="text-xs tracking-wide text-white my-2 leading-relaxed w-full">
              {item.summary}
            </p>
          </div>
        </div>

        <div className="lg:text-right flex flex-col mt-1 gap-2 w-full">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center lg:justify-end text-xs text-white/80">
              <Clock className="w-3 h-3 mr-1" />
              {formatDuration(item.duration_seconds)}
            </div>
            <div className="text-xs text-white/80">{item.time}</div>
          </div>

          <div className="space-y-1 w-full flex justify-between">
            {accuracy > 0 && (
              <div className="flex items-center lg:justify-end gap-4">
                <span className="text-xs text-white/80">Accuracy</span>
                <div className="flex items-center space-x-1">
                  {renderStars(accuracy)}
                </div>
              </div>
            )}

            {quiz > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/80">Quiz Score</span>
                <div className="flex items-center space-x-1">
                  {renderStars(quiz)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TimelineSectionProps {
  day: ActivityDay;
}

const TimelineSection: React.FC<TimelineSectionProps> = ({ day }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-card-foreground">
          {formatDate(day.date)}
        </h2>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="w-4 h-4 mr-1" />
          {formatDuration(day.total_seconds)}
        </div>
      </div>

      <div className="space-y-3">
        {day.items.map((item: ActivityItem) => (
          <ActivityCard key={item.conversation_id} item={item} />
        ))}
      </div>
    </div>
  );
};

const LoadingCard = () => (
  <div className="bg-[#3068C5]/20 rounded-lg border border-border p-4 animate-pulse">
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-white/20 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-[#3068C5]/50 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-[#3068C5]/50 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-[#3068C5]/50 rounded w-full"></div>
      </div>
    </div>
  </div>
);

const ActivityTimeline: React.FC = () => {
  const [weeks, setWeeks] = useState<WeeklyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const initialWeek = await fetchWeeklyActivity({ weeks_back: 0 });
      setWeeks([initialWeek]);
      setCurrentWeek(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load timeline");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreWeeks = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextWeek = await fetchWeeklyActivity({ weeks_back: currentWeek });

      if (
        nextWeek.days.length === 0 ||
        nextWeek.days.every((day) => day.items.length === 0)
      ) {
        setHasMore(false);
        return;
      }

      setWeeks((prev) => [...prev, nextWeek]);
      setCurrentWeek((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to load more weeks:", err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [currentWeek, loadingMore, hasMore]);

  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMoreWeeks();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreWeeks]);

  if (loading) {
    return (
      <div className="relative w-full min-h-screen bg-black text-foreground dark">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <motion.div
            className="mb-12 flex justify-between items-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-1/3 flex">
              <div className="p-2 rounded-full bg-white/10 border-2 border-white/10">
                <CategoryButton />
                <MobileMenu />
              </div>
            </div>
            <h1 className="text-2xl font-light text-foreground w-1/3 flex justify-center">
              Timeline
            </h1>

            <div className="w-1/3"></div>
          </motion.div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full min-h-screen bg-[#010532] text-foreground dark">
        <div className="fixed top-24 left-[-100px] w-[400px] h-[400px] bg-[#DF9AEE] opacity-30 blur-3xl rounded-full"></div>

        <div className="fixed bottom-[-100px] right-0 w-[400px] h-[400px] bg-[#DF9AEE] opacity-30 blur-3xl rounded-full"></div>

        <div className="w-full mx-auto px-6 py-8">
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
                <CategoryButton />
                <MobileMenu />
              </div>
            </div>
            <h1 className="text-2xl font-light text-foreground w-1/3 flex justify-center">
              Timeline
            </h1>

            <div className="w-1/3"></div>
          </motion.div>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={loadInitialData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-black text-foreground dark">
      <div className="relative z-10 pt-5">
        <div className="w-full px-6 py-5 md:max-w-3xl mx-auto">
          <div className="mb-7 flex items-center">
            <div className="w-1/3 flex">
              <CategoryButton />
              <MobileMenu />
            </div>

            <h1 className="text-xl">Your Activities</h1>
          </div>

          <Tabs defaultValue="timeline">
            <TabsList className="w-full ">
              <TabsTrigger
                value="timeline"
                className="data-[state=active]:text-white"
              >
                Timeline
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:text-white"
              >
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <div className="space-y-8">
                {weeks.map((week, weekIndex) => (
                  <div key={`${week.week_start}-${weekIndex}`}>
                    {week.days.map((day) => (
                      <TimelineSection key={day.date} day={day} />
                    ))}
                  </div>
                ))}
              </div>

              {loadingMore && (
                <div className="space-y-4 mt-8">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <LoadingCard key={i} />
                  ))}
                </div>
              )}

              {!hasMore && weeks.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    You&apos;ve reached the beginning of your journey!
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity">
              <ActivityTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;
