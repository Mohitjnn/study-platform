"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function SubjectSkeleton() {
  return (
    <div className="relative w-full min-h-screen bg-[#090E6C] text-foreground dark">
      {/* Animated background blobs */}

      {/* Page content skeleton */}
      <div className="relative z-10 pt-5">
        <div className="w-full p-4 sm:p-6 lg:p-8">
          {/* Header section skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
              <Skeleton className="h-8 w-32 bg-white/10" />
            </div>
            <Skeleton className="h-10 w-64 mb-2 bg-white/10" />
            <Skeleton className="h-4 w-48 bg-white/10" />
          </div>

          {/* Search/filter skeleton */}
          <div className="mb-6">
            <Skeleton className="h-12 w-full max-w-md bg-white/10 rounded-lg" />
          </div>

          {/* Topics grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3">
                {/* Topic card skeleton */}
                <Skeleton className="h-48 w-full bg-white/10 rounded-xl" />
                <Skeleton className="h-6 w-3/4 bg-white/10" />
                <Skeleton className="h-4 w-1/2 bg-white/10" />

                {/* Subtopics skeleton */}
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-3 w-full bg-white/5" />
                  <Skeleton className="h-3 w-4/5 bg-white/5" />
                  <Skeleton className="h-3 w-3/5 bg-white/5" />
                </div>
              </div>
            ))}
          </div>

          {/* Additional content skeletons */}
          <div className="mt-12 space-y-8">
            <div>
              <Skeleton className="h-8 w-48 mb-4 bg-white/10" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-24 w-full bg-white/10 rounded-lg"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
