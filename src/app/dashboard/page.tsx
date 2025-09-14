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
import ScreenTimeChart from "@/components/Bar-chart";
import {
  getOverAllStats,
  getWeeklyScreenTimeStats,
} from "@/actions/screenTime";
import { getSubjectsWithMetadata } from "@/actions/subjects";
import SubjectCard from "@/components/PersonalCards/SubjectCard";

export default async function DashboardPage() {
  // Get user data from API
  const result = await getUserDataFromAPI();
  const subjects = await getSubjectsWithMetadata();
  const screenTimeStats = await getWeeklyScreenTimeStats();
  const overallStats = await getOverAllStats();
  // If not authenticated or should redirect, redirect to login
  if (!result.success || result.shouldRedirect) {
    redirect("/login");
  }

  const user = result.data;

  if (result.success) {
    if (user && typeof user === "object" && "survey" in user) {
      const userWithSurvey = user as { survey: { submitted: boolean } };
      if (!userWithSurvey.survey.submitted) {
        redirect("/survey");
      }
    }
  }
  return (
    <div className="bg-background text-foreground dark">
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
              Hi,{" "}
              {typeof user?.full_name === "string" && user.full_name
                ? user.full_name
                : "Student"}
              !
            </h1>
          </div>
          <p className="text-muted-foreground">
            Ready to continue your learning journey? Here&apos;s what&apos;s
            happening today.
          </p>
        </div>

        {/* Stats Badges */}
        {overallStats ? (
          <div className="flex flex-nowrap gap-3 mb-8 items-center overflow-x-auto lg:overflow-visible">
            <Badge className="min-w-[100px] whitespace-nowrap flex items-center gap-2 px-4 py-2 text-base font-semibold">
              <BookOpen className="h-5 w-5" />
              <span>Total Courses: {overallStats.totalCourses}</span>
            </Badge>
            <Badge className="min-w-[100px] whitespace-nowrap flex items-center gap-2 px-4 py-2 text-base font-semibold ">
              <CheckCircle className="h-5 w-5" />
              <span>Completed: {overallStats.completedCourses}</span>
            </Badge>
            <Badge className="min-w-[100px] whitespace-nowrap flex items-center gap-2 px-4 py-2 text-base font-semibold ">
              <Clock className="h-5 w-5" />
              <span>Hours Studied: {overallStats.hoursStudied}</span>
            </Badge>
            <Badge className="min-w-[100px] whitespace-nowrap flex items-center gap-2 px-4 py-2 text-base font-semibold">
              <TrendingUp className="h-5 w-5" />
              <span>Streak: {overallStats.currentStreak}</span>
            </Badge>
          </div>
        ) : (
          <div className="flex justify-center items-center mb-8 min-h-[40px]">
            <div className="text-muted-foreground">Loading stats...</div>
          </div>
        )}

        {/* Weekly Progress */}
        <div className="mb-8 bg-card border-border p-4 rounded-2xl">
          <ScreenTimeChart {...screenTimeStats} />
        </div>
        <h1 className="text-3xl lg:text-5xl text-center lg:text-left font-bold mb-8">
          Subjects
        </h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-8">
          {subjects.map((subject, index) => (
            <SubjectCard
              key={subject.name}
              name={subject.name}
              progress={subject.progress}
              subtitle={subject.subtitle}
              index={index}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
