import React from "react";
import SubjectCard from "@/components/PersonalCards/SubjectCard";
import Navbar from "@/components/Navbar";
import { fetchSubTopics, fetchTopics, getSubjectsWithMetadata } from "@/actions/subjects";
import SubtTopicCard from "@/components/PersonalCards/SubTopicCard";

interface SubTopicData {
  id: string;
  sub_topic: string;
  learning_outcome: string;
}

interface SubTopicsResponse {
  items: SubTopicData[];
}

export default async function SubjectsPage({params}:{params:Promise<{topics:string,subtopics:string}>}) {
	const { topics, subtopics } = await params;
	const subTopicsList = await fetchSubTopics({subject: topics, topic: subtopics});
	
	// Extract items array from the response
	const subTopicsData = subTopicsList?.items || [];

	return (
		<div className="min-h-screen bg-background px-4 dark">
            <Navbar title="My Subjects" showProfile={true} />
			
			{/* Loading state */}
			{!subTopicsData && (
				<div className="flex justify-center items-center min-h-[400px]">
					<div className="text-muted-foreground">Loading subjects...</div>
				</div>
			)}
			
			{/* Subjects grid */}
			{subTopicsData && subTopicsData.length > 0 && (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 max-w-7xl mx-auto p-6">
					{subTopicsData.map((subTopic: SubTopicData, index: number) => (
						<SubtTopicCard
							key={subTopic.id || index}
							subTopicData={subTopic}
							progress={0}
							subjectName={topics}
							topicName={subtopics}
							index={index}
						/>
					))}
				</div>
			)}
		</div>
	);
}