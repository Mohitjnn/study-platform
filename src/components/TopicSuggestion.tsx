"use client";

import { useState, useRef } from "react";
import { Search, ChevronRight } from "lucide-react";
import { fetchFromAPI, postDataToAPI } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { initiateConversation } from "@/actions/subjects";

// TypeScript interfaces
interface TopicResult {
  id: string;
  subject: string;
  topic: string;
  sub_topic: string;
  learning_outcome: string;
  image_url: string;
}

interface TopicSearchResponse {
  query: string;
  grade_level: number;
  results: TopicResult[];
  total_results: number;
}

interface ApiError {
  detail: string;
}

interface SubTopicData {
  id: string;
  sub_topic: string;
  learning_outcome: string;
}

interface InitiateConversationResponse {
  conversation_id: string;
  link_id: string;
}

export default function TopicSearch() {
  const [searchResults, setSearchResults] =
    useState<TopicSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loadingSubtopic, setLoadingSubtopic] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSearch = async () => {
    const query = inputRef.current?.value.trim();

    if (!query) {
      setError("Please enter a search query");
      return;
    }

    if (query.length < 3) {
      setError("Search query must be at least 3 characters long");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchFromAPI<TopicSearchResponse>(
        `/topics/search?q=${encodeURIComponent(query)}`,
        { requiresAuth: true }
      );

      setSearchResults(response);
      setIsDrawerOpen(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Search error:", err.message);
      }
      setError("Failed to fetch search results");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <div className="w-full lex flex-col justify-between items-start cursor-pointer">
            <h1 className="text-xl lg:text-5xl font-medium lg:text-left mb-3">
              What are you curious about?
            </h1>

            <div className="flex items-center rounded-sm border-2 border-white/20 px-4 py-3">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-white placeholder-white/70 w-full"
                onKeyPress={handleKeyPress}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                className="ml-2 text-white/70 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSearch();
                }}
                disabled={isLoading}
              >
                <Search size={20} />
              </button>
            </div>
          </div>
        </DrawerTrigger>

        <DrawerContent className="bg-gradient-to-br from-[#010532]/30 to-[#DF9AEE]/20 border-white/20 backdrop-blur-2xl">
          <DrawerHeader>
            <DrawerTitle className="text-white text-2xl">
              {searchResults
                ? `Search Results for "${searchResults.query}"`
                : "Search Topics"}
            </DrawerTitle>
            <DrawerDescription className="text-white/70">
              {searchResults
                ? `Found ${searchResults.total_results} result${
                    searchResults.total_results !== 1 ? "s" : ""
                  }`
                : "Enter at least 3 characters to search"}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto">
            {isLoading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white/20 border-t-white"></div>
                <p className="text-white/70 mt-4">Searching...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {searchResults && searchResults.results.length > 0 && (
              <div className="space-y-3">
                {searchResults.results.map((result) => (
                  <div
                    key={result.id}
                    className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all cursor-pointer group"
                    onClick={() =>
                      handleSubtopicClick({
                        id: result.id,
                        sub_topic: result.sub_topic,
                        learning_outcome: result.learning_outcome,
                      })
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                          src={result.image_url}
                          alt={result.topic}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white/60 text-sm font-medium">
                          {result.subject}
                        </p>
                        <h3 className="text-white font-semibold text-lg">
                          {result.topic}
                        </h3>
                        <p className="text-white/80 text-sm mt-1">
                          {result.sub_topic}
                        </p>
                      </div>

                      {loadingSubtopic === result.id ? (
                        <div className="flex-shrink-0">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white"></div>
                        </div>
                      ) : (
                        <ChevronRight
                          className="text-white/40 group-hover:text-white/80 transition-colors flex-shrink-0"
                          size={24}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchResults && searchResults.results.length === 0 && (
              <div className="text-center py-8">
                <p className="text-white/70">
                  No results found for &quot;{searchResults.query}&quot;
                </p>
              </div>
            )}
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
