"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="relative w-full min-h-screen bg-[#090E6C] text-foreground dark pt-5">
      <main className="relative w-full md:max-w-3xl md:mx-auto p-4 sm:p-6 lg:p-8 pb-20">
        {/* Welcome Section Skeleton */}
        <div className="w-full flex items-center justify-between mb-5">
          <div className="w-1/2 flex gap-3 items-center">
            <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
            <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 bg-white/10" />
              <Skeleton className="h-4 w-32 bg-white/10" />
            </div>
          </div>
        </div>

        {/* Floating Bot Skeleton */}
        <div className="fixed z-50 left-1/2 -translate-x-1/2 bottom-3 flex flex-col items-center justify-center">
          <Skeleton className="h-12 w-12 rounded-full bg-white/10" />
        </div>

        {/* Topic Search Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-12 w-full bg-white/10 rounded-lg" />
        </div>

        {/* Section Title Skeleton */}
        <Skeleton className="h-8 w-48 mb-5 bg-white/10" />

        {/* Subjects Grid Skeleton */}
        <div className="w-full gap-4 grid grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              {/* Subject card skeleton */}
              <Skeleton className="w-full aspect-square bg-white/10 rounded-2xl" />
              <Skeleton className="h-5 w-3/4 bg-white/10" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-2 w-2/3 bg-white/10" />
                <Skeleton className="h-4 w-8 bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
