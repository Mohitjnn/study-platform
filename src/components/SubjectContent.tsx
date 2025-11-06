import { fetchTopicsWithSubTopicsForSubject } from "@/actions/subjects";
import AnimatedTopicsLayout from "@/components/AnimatedTopicsLayout";

// Color mapping for different subjects
const subjectColors: Record<string, { primary: string; secondary: string }> = {
  Mathematics: {
    primary: "#6B21A8",
    secondary: "#A855F7",
  },
  Science: {
    primary: "#B45309",
    secondary: "#FACC15",
  },
  English: {
    primary: "#166534",
    secondary: "#4ADE80",
  },
  default: {
    primary: "#991B1B",
    secondary: "#F87171",
  },

  ExtraBlue: {
    primary: "#1E3A8A",
    secondary: "#60A5FA",
  },
};

export default async function SubjectContent({ topics }: { topics: string }) {
  const topicsWithSubTopics = await fetchTopicsWithSubTopicsForSubject({
    subject: topics,
  });

  // Get colors for the subject, fallback to default
  const colors = subjectColors[topics] || subjectColors.default;

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
