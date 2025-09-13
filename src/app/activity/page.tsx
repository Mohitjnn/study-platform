"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Star, Clock, BookOpen, Brain, Target, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { fetchWeeklyActivity, WeeklyActivity, ActivityItem, ActivityDay } from '@/actions/activity';

// Helper function to render stars based on percentage
const renderStars = (percentage: number) => {
  const stars = Math.min(3, Math.max(0, Math.round(percentage / 33.33))); // Convert 0-100 to 0-3 stars
  return Array.from({ length: 3 }, (_, i) => (
    <Star
      key={i}
      className={`w-3 h-3 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`}
    />
  ));
};

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper function to get subject icon and color
const getSubjectDisplay = (subject: string) => {
  const subjectLower = subject.toLowerCase();
  if (subjectLower.includes('math')) {
    return { icon: Target, color: 'text-blue-500 bg-blue-50' };
  } else if (subjectLower.includes('science')) {
    return { icon: Brain, color: 'text-green-500 bg-green-50' };
  } else {
    return { icon: BookOpen, color: 'text-purple-500 bg-purple-50' };
  }
};

interface ActivityCardProps {
  item: ActivityItem;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ item }) => {
  const accuracy = item.percentages.accuracy || 0;
  const quiz = item.percentages.quiz || 0;
  
  return (
    <div className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row  items-start justify-between">
        <div className="flex items-center space-x-3 flex-1 mr-4">
          <div className={`rounded-full p-2  dark:bg-card/80 dark:text-primary-foreground`}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-card-foreground text-sm leading-tight mb-1">
              {item.topic_title}
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              {item.subject} • {item.sub_topic}
            </p>
            {/* Summary */}
            <p className="text-xs text-foreground mt-2 leading-relaxed w-full">
              {item.summary}
            </p>
          </div>
        </div>
        
        <div className="lg:text-right ml-3 flex flex-col mt-4 lg mt-0 gap-2">
          <div className="flex items-center lg:justify-end text-xs text-muted-foreground mb-1">
            <Clock className="w-3 h-3 mr-1" />
            {formatDuration(item.duration_seconds)}
          </div>
          <div className="text-xs text-muted-foreground">
            {item.time}
          </div>
                      {/* Performance indicators */}
            <div className="space-y-2 w-full">
              {accuracy > 0 && (
                <div className="flex items-center justify-between lg:justify-end gap-4">
                  <span className="text-xs text-muted-foreground">Accuracy</span>
                  <div className="flex items-center space-x-1">
                    {renderStars(accuracy)}
                  </div>
                </div>
              )}
              
              {quiz > 0 && (
                <div className="flex items-center justify-end gap-4">
                  <span className="text-xs text-muted-foreground">Quiz Score</span>
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
        <h2 className="text-lg font-semibold text-card-foreground">{formatDate(day.date)}</h2>
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
  <div className="bg-card rounded-lg border border-border p-4 animate-pulse">
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-muted rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-muted rounded w-full"></div>
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

  // Load initial data
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
      setError(err instanceof Error ? err.message : 'Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreWeeks = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextWeek = await fetchWeeklyActivity({ weeks_back: currentWeek });
      
      // Check if we have data for this week
      if (nextWeek.days.length === 0 || nextWeek.days.every(day => day.items.length === 0)) {
        setHasMore(false);
        return;
      }

      setWeeks(prev => [...prev, nextWeek]);
      setCurrentWeek(prev => prev + 1);
    } catch (err) {
      console.error('Failed to load more weeks:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [currentWeek, loadingMore, hasMore]);

  // Scroll event handler for pagination
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMoreWeeks();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreWeeks]);

  if (loading) {
    return (
      <div className="mx-auto min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-center mb-8 text-card-foreground">
            Activity Timeline
          </h1>
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
      <div className="mx-auto min-h-screen bg-background">
        <Navbar />
        <div className="w-full mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-center mb-8 text-card-foreground">
            Activity Timeline
          </h1>
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
    <div className="mx-auto min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-center mb-8 text-card-foreground">
          Your Learning Journey
        </h1>

        <div className="space-y-8">
          {weeks.map((week, weekIndex) => (
            <div key={`${week.week_start}-${weekIndex}`}>
              {week.days.map((day) => (
                <TimelineSection key={day.date} day={day} />
              ))}
            </div>
          ))}
        </div>

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="space-y-4 mt-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        )}

        {/* End of timeline message */}
        {!hasMore && weeks.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You&apos;ve reached the beginning of your journey!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;