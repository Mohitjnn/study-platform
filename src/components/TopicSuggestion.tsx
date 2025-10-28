"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { fetchFromAPI } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { initiateConversation } from "@/actions/subjects";

// --- Aceternity UI Import ---
// You will still need this component for the input
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

// TypeScript interfaces (unchanged)
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

// Re-usable Loading Spinner Component (unchanged)
const LoadingSpinner = ({ className = "" }: { className?: string }) => (
  <div
    className={`inline-block animate-spin rounded-full h-8 w-8 border-4 border-white/20 border-t-white ${className}`}
  ></div>
);

export default function TopicSearch() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] =
    useState<TopicSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSubtopic, setLoadingSubtopic] = useState<string | null>(null);
  const router = useRouter();

  // --- Aceternity UI Content ---
  const placeholders = [
    "Search 'photosynthesis'",
    "What is the Roman Empire?",
    "Explain black holes",
    "How does DNA replication work?",
    "Who was Cleopatra?",
  ];

  const handleSearch = async () => {
    const searchQuery = query.trim();

    if (!searchQuery) {
      setError("Please enter a search query");
      return;
    }

    if (searchQuery.length < 3) {
      setError("Search query must be at least 3 characters long");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const response = await fetchFromAPI<TopicSearchResponse>(
        `/topics/search?q=${encodeURIComponent(searchQuery)}`,
        { requiresAuth: true }
      );
      setSearchResults(response);
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
    <div className="w-full">
      {/* Search Header and Input */}
      <div className="w-full flex flex-col justify-between items-start">
        {/* --- Reverted h1 back to original --- */}
        <h1 className="text-xl lg:text-3xl font-medium lg:text-left mb-3">
          What are you curious about?
        </h1>

        {/* --- Kept PlaceholdersAndVanishInput --- */}
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={(e) => setQuery(e.target.value)}
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        />
      </div>

      {/* Results Section (unchanged) */}
      <div className="mt-8">
        {isLoading && (
          <div className="text-center py-8">
            <LoadingSpinner />
            <p className="text-white/70 mt-4">Searching...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {searchResults && !isLoading && !error && (
          <>
            {searchResults.results.length > 0 ? (
              <>
                <h2 className="text-white text-2xl font-semibold mb-4">
                  {`Results for "${searchResults.query}"`}
                </h2>
                <div className="flex flex-row gap-4 overflow-x-auto pb-4">
                  {searchResults.results.map((result: TopicResult) => (
                    <div
                      key={result.id}
                      className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all cursor-pointer group w-80 flex-shrink-0"
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
                          <h3 className="text-white font-semibold text-lg truncate">
                            {result.topic}
                          </h3>
                          <p className="text-white/80 text-sm mt-1 truncate">
                            {result.sub_topic}
                          </p>
                        </div>

                        {loadingSubtopic === result.id ? (
                          <div className="flex-shrink-0">
                            <LoadingSpinner className="h-6 w-6 border-2" />
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
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/70 text-lg">
                  No results found for &quot;{searchResults.query}&quot;
                </p>
                <p className="text-white/50">
                  Try searching for a different topic.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}