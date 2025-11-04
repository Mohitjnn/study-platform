"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import Link from "next/link";
import { Home, User, Zap, Box } from "lucide-react";
import LogoutButton from "./LogoutButton";
import { useMobileMenu } from "./MobileMenuContext";

const menuVariants: Variants = {
  closed: { opacity: 0, height: 0, transition: { duration: 0.3 } },
  open: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
};

const itemVariants: Variants = {
  closed: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  open: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.1 } },
};

export default function MobileMenu() {
  const { isOpen, toggle } = useMobileMenu();
  const showProfile = true; // or pass as prop
  const showSandbox = true; // or pass as prop

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={menuVariants}
          initial="closed"
          animate="open"
          exit="closed"
          className="fixed top-32 left-0 w-full md:hidden overflow-hidden z-50 text-white rounded-lg"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 border-t bg-white/10 backdrop-blur-md text-white shadow-md">
            <motion.div variants={itemVariants}>
              <Link
                href="/dashboard"
                onClick={toggle}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-white transition-colors duration-200"
              >
                <Home className="h-5 w-5" /> Home
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link
                href="/activity"
                onClick={toggle}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-white transition-colors duration-200"
              >
                <Zap className="h-5 w-5" /> Activity
              </Link>
            </motion.div>
            {showProfile && (
              <motion.div variants={itemVariants}>
                <Link
                  href="/profile"
                  onClick={toggle}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-white transition-colors duration-200"
                >
                  <User className="h-5 w-5" /> Profile
                </Link>
              </motion.div>
            )}
            <motion.div variants={itemVariants} className="px-3 py-2">
              <LogoutButton />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
