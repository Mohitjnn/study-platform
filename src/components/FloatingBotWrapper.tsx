"use client";

import { useMobileMenu } from "@/components/MobileMenuContext";
import FloatingBotTooltip from "@/components/FloatingBotTooltip";

export default function FloatingBotWrapper() {
  const { isOpen } = useMobileMenu();

  return (
    <div
      className={`transition-all duration-300 ${
        isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <FloatingBotTooltip />
    </div>
  );
}
