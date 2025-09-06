import { getUserDataFromAPI } from "@/actions/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  User,
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Award,
  Calendar,
  Activity,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DashboardSquareCard from "@/components/DashboardSquareCard";

export default async function DashboardPage() {
  // Get user data from API
  const result = await getUserDataFromAPI();

  // If not authenticated or should redirect, redirect to login
  if (!result.success || result.shouldRedirect) {
    console.log("Redirecting to login:", result.message);
    redirect("/login");
  }

  const user = result.data;

  if (result.success) {
    console.log("User data retrieved:", user);
    if (!user.survey.submitted) {
      redirect("/survey");
    }
  }

  // Mock data for dashboard stats (replace with real data from your API)
  const dashboardStats = {
    totalCourses: 8,
    completedCourses: 3,
    hoursStudied: 24,
    currentStreak: 7,
    weeklyGoal: 15,
    weeklyProgress: 9,
  };

  const recentActivities = [
    {
      id: 1,
      type: "course",
      title: "Completed JavaScript Fundamentals",
      time: "2 hours ago",
      status: "completed",
    },
    {
      id: 2,
      type: "quiz",
      title: "React Hooks Quiz",
      time: "5 hours ago",
      status: "passed",
    },
    {
      id: 3,
      type: "assignment",
      title: "CSS Grid Project",
      time: "1 day ago",
      status: "submitted",
    },
    {
      id: 4,
      type: "lesson",
      title: "Advanced TypeScript",
      time: "2 days ago",
      status: "in-progress",
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: "Complete Node.js Assignment",
      dueDate: "Tomorrow",
      priority: "high",
    },
    {
      id: 2,
      title: "Review Database Concepts",
      dueDate: "Dec 8",
      priority: "medium",
    },
    {
      id: 3,
      title: "Practice Algorithm Problems",
      dueDate: "Dec 10",
      priority: "low",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <Navbar title="Dashboard" showProfile={true} />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col items-start gap-4">
          <div className="flex gap-4 items-end">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Hi, {user.full_name || "Student"}!
            </h1>
          </div>
          <p className="text-muted-foreground">
            Ready to continue your learning journey? Here's what's happening
            today.
          </p>
        </div>

        {/* Stats Badges */}
        <div className="flex flex-nowrap gap-3 mb-8 items-center overflow-x-auto lg:overflow-visible">
          <Badge className="min-w-[100px] whitespace-nowrap flex items-center gap-2 px-4 py-2 text-base font-semibold">
            <BookOpen className="h-5 w-5" />
            <span>Total Courses: {dashboardStats.totalCourses}</span>
          </Badge>
          <Badge className="min-w-[100px] whitespace-nowrap flex items-center gap-2 px-4 py-2 text-base font-semibold ">
            <CheckCircle className="h-5 w-5" />
            <span>Completed: {dashboardStats.completedCourses}</span>
          </Badge>
          <Badge className="min-w-[100px] whitespace-nowrap flex items-center gap-2 px-4 py-2 text-base font-semibold ">
            <Clock className="h-5 w-5" />
            <span>Hours Studied: {dashboardStats.hoursStudied}</span>
          </Badge>
          <Badge className="min-w-[100px] whitespace-nowrap flex items-center gap-2 px-4 py-2 text-base font-semibold">
            <TrendingUp className="h-5 w-5" />
            <span>Streak: {dashboardStats.currentStreak}</span>
          </Badge>
        </div>

        {/* Weekly Progress */}
        <div className="mb-8 bg-card border-border p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5" />
            Weekly Learning Goal
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{0}%</span>
              <span>{100}%</span>
            </div>
            <Progress
              value={
                (dashboardStats.weeklyProgress / dashboardStats.weeklyGoal) *
                100
              }
              className="h-2"
            />
            <p className="text-sm text-muted-foreground">
              {dashboardStats.weeklyGoal - dashboardStats.weeklyProgress} hours
              left to reach your goal
            </p>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <DashboardSquareCard
            title="Guided Journey"
            text="Learn with structure plus free exploration."
            imageUrl="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80"
            link="/subjects"
            linkText="View Subjects"
          />
          <DashboardSquareCard
            title="Free Explore"
            text="Choose any topic and learn without limits."
            imageUrl="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80"
            link="/quizzes"
            linkText="Take a Quiz"
          />
        </div>
      </main>
    </div>
  );
}
