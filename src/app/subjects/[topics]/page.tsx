import React from "react";
import SubjectCard from "@/components/PersonalCards/SubjectCard";
import Navbar from "@/components/Navbar";
import { fetchTopics, getSubjectsWithMetadata } from "@/actions/subjects";
import TopicCard from "@/components/PersonalCards/TopicCard";
export default async function Page({params}:{params:Promise<{topics:string}>}) {
	const { topics } = await params;
	console.log('Received topic:', topics);
	const TopicsList = await fetchTopics({subject: topics});
	console.log(TopicsList);

	return (
		<div className="min-h-screen bg-background px-4 dark">
            <Navbar title="My Subjects" showProfile={true} />
			
			{/* Loading state */}
			{!TopicsList && (
				<div className="flex justify-center items-center min-h-[400px]">
					<div className="text-muted-foreground">Loading subjects...</div>
				</div>
			)}
			
			{/* Subjects grid */}
			{TopicsList && (
				<div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 max-w-7xl mx-auto p-6">
					{TopicsList.map((topic, index) => (
						<TopicCard
							key={topic}
							name={topic}
							progress={0}
							titleName={topics}
							index={index}
						/>
					))}
				</div>
			)}
		</div>
	);
}