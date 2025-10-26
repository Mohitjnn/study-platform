import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface TopicCardProps {
  subjectName: string;
  name: string;
  imageUrl?: string;
  index?: number;
}

const TopicCard: React.FC<TopicCardProps> = ({
  name,
  imageUrl,
  subjectName,
  index = 0,
}) => {
  return (
    <Link className="flex flex-col" href={`/subjects/${subjectName}/#${name}`}>
      <div
        className="w-32 h-32 rounded-2xl bg-cover bg-center cursor-pointer relative overflow-hidden"
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        }}
      >
      </div>
      <div className="w-full px-1 flex justify-between items-center mt-2">
        <div className="flex items-center gap-1">
          <h1 className="text-base">{name}</h1>
          <ChevronRight size={16} />
        </div>
      </div>
    </Link>
  );
};

export default TopicCard;
