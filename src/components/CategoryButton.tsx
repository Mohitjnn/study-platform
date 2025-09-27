"use client";
import { useMobileMenu } from "./MobileMenuContext";

export default function CategoryButton() {
  const { toggle, isOpen } = useMobileMenu();

  return (
    <>
      <div
        onClick={toggle}
        className="p-3 border-[1px] border-white/30 rounded-lg bg-white/10 backdrop-blur-3xl cursor-pointer relative z-50"
      >
        <img src="/images/Category.png" alt="Dashboard" className="h-5 w-5" />
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={toggle}
        />
      )}
    </>
  );
}
