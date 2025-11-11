// components/Splash.tsx (Client Component)
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
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
    <div className="h-screen flex text-center flex-col items-center justify-center bg-gradient-to-br from-purple-700 to-purple-900">
      <motion.div
        initial={{ opacity: 1, y: 20, scale: 1.5 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
      >
        <img src="/images/Bot.png" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-white/70 font-light mt-3 text-2xl">
          Hey, I am <span className="text-white">Nova</span>
        </h1>
        <h1 className="text-white/70 font-light text-2xl">
          your <span className="text-white">learning buddy</span>
        </h1>
      </motion.div>
    </div>
  );
}
