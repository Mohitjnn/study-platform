import { fetchTopicsWithSubTopicsForSubject, fetchTopics } from "@/actions/subjects";
import AnimatedTopicsLayout from "@/components/AnimatedTopicsLayout";

// Dynamic color mapping based on API response
const colorMapping: Record<string, { primary: string; secondary: string }> = {
  blue: { primary: "#1E3A8A", secondary: "#13245A" },
  green: { primary: "#166534", secondary: "#0F3F21" },
  purple: { primary: "#6B21A8", secondary: "#4A1674" },
  red: { primary: "#991B1B", secondary: "#6B1212" },
  yellow: { primary: "#b48609ff", secondary: "#7A3906" },
  default: { primary: "#1E3A8A", secondary: "#13245A" },
};

// Function to determine the dominant color from topics
function getDominantColor(topics: { topic: string; color: string }[]): { primary: string; secondary: string } {
  if (!topics || topics.length === 0) {
    return colorMapping.default;
  }

  // Count color occurrences
  const colorCounts = topics.reduce((acc, topicItem) => {
    const color = topicItem.color?.toLowerCase() || 'default';
    acc[color] = (acc[color] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Find the most frequent color
  const dominantColor = Object.entries(colorCounts).reduce((a, b) => 
    colorCounts[a[0]] > colorCounts[b[0]] ? a : b
  )[0];

  return colorMapping[dominantColor] || colorMapping.default;
}

export default async function SubjectContent({ topics }: { topics: string }) {
  // Fetch topics with colors and subtopics
  const [topicsWithColors, topicsWithSubTopics] = await Promise.all([
    fetchTopics({ subject: topics }),
    fetchTopicsWithSubTopicsForSubject({ subject: topics })
  ]);

  // Get colors based on API response
  const colors = getDominantColor(topicsWithColors);

  return (
    <div
      className="relative w-full min-h-screen text-foreground dark transition-all duration-500"
      style={{
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      }}
    >
      {/* Page content on top */}
      <div className="relative z-10 pt-5">
        {!topicsWithSubTopics && (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-muted-foreground">Loading topics...</div>
          </div>
        )}

        {topicsWithSubTopics && (
          <AnimatedTopicsLayout
            topicsWithSubTopics={topicsWithSubTopics}
            subjectName={topics}
          />
        )}
      </div>
    </div>
  );
}
