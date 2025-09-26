"use client";
import { useMobileMenu } from "./MobileMenuContext";

export default function CategoryButton() {
  const { toggle } = useMobileMenu();

  return (
    <div
      onClick={toggle}
      className="p-3 border-[1px] border-white/30 rounded-lg bg-white/10 backdrop-blur-3xl cursor-pointer"
    >
      <img src="/images/Category.png" alt="Dashboard" className="h-5 w-5" />
    </div>
  );
}
