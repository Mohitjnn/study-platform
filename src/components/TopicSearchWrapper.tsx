"use client";

import { useMobileMenu } from "@/components/MobileMenuContext";
import TopicSearch from "@/components/TopicSuggestion";

export default function TopicSearchWrapper() {
  const { isOpen } = useMobileMenu();

  return (
    <div className={isOpen ? "hidden" : "block"}>
      <TopicSearch />
    </div>
  );
}
