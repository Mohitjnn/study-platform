import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex justify-center mb-8">
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
            Welcome to Study Platform
          </h1>
          <p className="text-xl max-w-2xl mx-auto text-muted-foreground">
            Your comprehensive learning platform designed to accelerate your educational journey
            with interactive courses, real-time progress tracking, and personalized learning paths.
          </p>
        </header>

        {/* Auth Cards */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-16">
          <Card className="shadow-lg hover:shadow-xl transition-shadow bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-card-foreground">
                New to Study Platform?
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Create your account and start learning today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Access to thousands of courses</li>
                <li>✓ Personalized learning paths</li>
                <li>✓ Progress tracking and certificates</li>
                <li>✓ Interactive learning experience</li>
              </ul>
              <Link href="/signup">
                <Button className="w-full" size="lg">
                  Create Account
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-card-foreground">
                Already have an account?
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Sign in to continue your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Continue where you left off</li>
                <li>✓ Access your saved courses</li>
                <li>✓ View your progress and achievements</li>
                <li>✓ Connect with your learning community</li>
              </ul>
              <Link href="/login">
                <Button variant="outline" className="w-full" size="lg">
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        {/* <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Why Choose Study Platform?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Expert-Curated Content</h3>
              <p className="text-gray-600">Learn from industry experts with carefully designed curriculum</p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Track Your Progress</h3>
              <p className="text-gray-600">Monitor your learning journey with detailed analytics and insights</p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Learn Together</h3>
              <p className="text-gray-600">Join a community of learners and grow together</p>
            </div>
          </div>
        </section> */}
      </div>
    </div>
  );
}
