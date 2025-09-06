"use client"
import React from "react";
import SubjectCard from "@/components/SubjectCard";
import Navbar from "@/components/Navbar";

const subjects = [
	{ 
		name: "Mathematics", 
		progress: 80, 
		theme: "coral",
		subtitle: "Algebra, Geometry, Calculus" 
	},
	{ 
		name: "English", 
		progress: 60, 
		theme: "navy",
		subtitle: "Grammar, Literature, Writing" 
	},
	{ 
		name: "Science", 
		progress: 40, 
		theme: "sunny",
		subtitle: "Physics, Chemistry, Biology" 
	},
	{ 
		name: "History", 
		progress: 20, 
		theme: "coral",
		subtitle: "Ancient, Medieval, Modern" 
	},
	{ 
		name: "Geography", 
		progress: 50, 
		theme: "navy",
		subtitle: "Physical, Human, Environmental" 
	},
	{ 
		name: "Computer Science", 
		progress: 70, 
		theme: "sunny",
		subtitle: "Programming, Algorithms, Data Structures" 
	},
];

export default function SubjectsPage() {

    const handleClick = (subjectName: string) => {
        console.log(`Navigate to ${subjectName} details page`);
    };

	return (
		<div className="min-h-screen bg-background px-4 dark">
            <Navbar title="My Subjects" showProfile={true} />
			<div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 max-w-7xl mx-auto p-6">
				{subjects.map((subject, index) => (
					<SubjectCard
						key={subject.name}
						name={subject.name}
						progress={subject.progress}
						subtitle={subject.subtitle}
						index={index}
						onClick={() => handleClick(subject.name)}
					/>
				))}
			</div>
		</div>
	);
}