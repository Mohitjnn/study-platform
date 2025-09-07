import React from "react";
import SubjectCard from "@/components/PersonalCards/SubjectCard";
import Navbar from "@/components/Navbar";
import { getSubjectsWithMetadata } from "@/actions/subjects";


export default async function Page() {

	const subjects = await getSubjectsWithMetadata();

	return (
		<div className="min-h-screen bg-background px-4 dark">
            <Navbar title="My Subjects" showProfile={true} />
			
			{/* Loading state */}
			{!subjects && (
				<div className="flex justify-center items-center min-h-[400px]">
					<div className="text-muted-foreground">Loading subjects...</div>
				</div>
			)}
			
			{/* Subjects grid */}
			{subjects && (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 max-w-7xl mx-auto p-6">
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
			)}
		</div>
	);
}