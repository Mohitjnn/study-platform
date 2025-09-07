import React from 'react';
import { ChevronLeft, User, Play, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';

// Define interfaces and types
interface ActivitySession {
  id: number;
  time: string;
  title: string;
  subtitle: string;
  summary: string;
}

interface ActivityGroup {
  date: string;
  totalTime: string;
  sessions: ActivitySession[];
}

interface ActivityCardProps {
  session: ActivitySession;
  summary: string;
}

interface TimelineSectionProps {
  date: string;
  totalTime: string;
  sessions: ActivitySession[];
}

const ActivityTimeline: React.FC = () => {
  // Sample data array - you can modify this structure as needed
  const activities: ActivityGroup[] = [
    {
      date: "August 29, 2025",
      totalTime: "3m",
      sessions: [
        {
          id: 1,
          time: "6:12 PM",
          title: "Place Value Pathfinder",
          subtitle: "Numbers and Place Value • Lesson",
          summary: "Completed 15 problems with 87% accuracy"
        },
        {
          id: 2,
          time: "6:09 PM",
          title: "Playground: Flocking",
          subtitle: "Bonus Lessons • Widget Playground",
          summary: "Interactive simulation explored"
        },
        {
          id: 3,
          time: "6:07 PM",
          title: "Flashcard Warmup",
          subtitle: "Lesson",
          summary: "Quick review session completed"
        }
      ]
    },
    {
      date: "August 19, 2025",
      totalTime: "1m",
      sessions: [
        {
          id: 4,
          time: "2:05 PM",
          title: "Flashcard Frenzy Subtraction",
          subtitle: "Fluency Practice",
          summary: "Speed drill with mixed results"
        }
      ]
    },
    {
      date: "June 12, 2025",
      totalTime: "2m",
      sessions: [
        {
          id: 5,
          time: "7:44 PM",
          title: "Flashcard Frenzy Subtraction",
          subtitle: "Fluency Practice",
          summary: "0 of 2 correct • 0% accuracy"
        }
      ]
    }
  ];

  const ActivityCard: React.FC<ActivityCardProps> = ({ session, summary }) => (
    <div className="relative w-full bg-card rounded-lg p-4 mb-3 flex flex-col lg:flex-row items-start lg:items-center justify-between hover:bg-card/80 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="bg-card rounded-full p-2">
          <Zap className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="text-foreground font-semibold text-sm lg:text-base">
            {session.title}
          </h3>
          <p className="text-muted-foreground text-xs lg:text-sm opacity-90">
            {session.subtitle}
          </p>
        </div>
      </div>
      <div className="lg:text-right ml-4 mt-4 lg:mt-0">
        <p className="text-foreground text-xs lg:text-sm font-medium">
          Summary
        </p>
        <p className="text-muted-foreground text-xs opacity-90 lg:max-w-48">
          {summary}
        </p>
      </div>
    </div>
  );

  const TimelineSection: React.FC<TimelineSectionProps> = ({ date, totalTime, sessions }) => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-foreground text-lg lg:text-xl font-semibold">{date}</h2>
        <span className="text-muted-foreground text-sm">Total time: {totalTime}</span>
      </div>
      
      <div className="space-y-2 dark">
        {sessions.map((session: ActivitySession) => (
          <div key={session.id} className="flex flex-col lg:flex-row items-start lg:items-center space-x-3">
            <div className="flex flex-row my-2 space-x-1 items-center text-muted-foreground text-xs min-w-12">
              <span className="font-medium">{session.time.split(' ')[0]}</span>
              <span className="font-base">{session.time.split(' ')[1]}</span>
            </div>
            <div className="flex-1 w-full">
              <ActivityCard 
                session={session} 
                summary={session.summary}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
      <div className="mx-auto h-full bg-background dark">
        <Navbar />
        {/* Title */}
        <h1 className="text-foreground text-2xl lg:text-3xl font-bold text-center my-8 dark">
          Activity Timeline
        </h1>

        {/* Timeline */}
        <div className="space-y-8 dark max-w-7xl mx-auto px-6 h-full">
          {activities.map((activity: ActivityGroup, index: number) => (
            <TimelineSection
              key={index}
              date={activity.date}
              totalTime={activity.totalTime}
              sessions={activity.sessions}
            />
          ))}
        </div>
      </div>
  );
};

export default ActivityTimeline;