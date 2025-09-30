// components/Splash.tsx (Client Component)
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    // redirect after 2s
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="h-screen flex text-center flex-col items-center justify-center bg-gradient-to-br from-[#010532] to-[#DF9AEE]">
      <img src="/images/Bot.png" />
      <h1 className="text-white/70 font-light mt-3 text-2xl">
        Hey, I am <span className="text-white">Nova</span>
      </h1>
      <h1 className="text-white/70 font-light text-2xl">
        your <span className="text-white">learning buddy</span>
      </h1>
    </div>
  );
}
