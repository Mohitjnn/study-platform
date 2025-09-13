"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Menu, X, User, Home, FileText,Zap,Box } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

interface NavbarProps {
  title?: string;
  showProfile?: boolean;
}

export default function Navbar({ title = "Dashboard", showProfile = true }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const menuVariants: Variants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        delay: 0.1
      }
    }
  };

  const iconVariants: Variants = {
    closed: { rotate: 0 },
    open: { rotate: 180 }
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-md bg-card/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-card-foreground">
              StudyMate
            </h1>
          </div> 

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href= {showProfile ? "/dashboard" : "/"}
              className="flex items-center gap-2 text-muted-foreground hover:text-card-foreground transition-colors duration-200"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
                        <Link
              // href= {showProfile ? "/dashboard" : "/"}
              href= {"/sandbox"}
              className="flex items-center gap-2 text-muted-foreground hover:text-card-foreground transition-colors duration-200"
            >
              <Box className="h-4 w-4" />
              <span>Sandbox</span>
            </Link>
            {showProfile && (
                        <Link href="/profile" className="flex items-center gap-2 text-muted-foreground hover:text-card-foreground transition-colors duration-200">
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
            )}
            {
              <Link href="/activity" className="flex items-center gap-2 text-muted-foreground hover:text-card-foreground transition-colors duration-200">
                <Zap className="h-4 w-4" />
                <span>Activity</span>
              </Link>
            }
            <LogoutButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors duration-200"
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                variants={iconVariants}
                animate={isMobileMenuOpen ? "open" : "closed"}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-t border-border">
                <motion.div variants={itemVariants}>
                  <Link
                    href={showProfile ? "/dashboard" : "/"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors duration-200"
                  >
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Link>
                </motion.div>

                                <motion.div variants={itemVariants}>
                  <Link
                    // href={showProfile ? "/dashboard" : "/"}
                    href={"/sandbox"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors duration-200"
                  >
                    <Box className="h-5 w-5" />
                    <span>Sandbox</span>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link
                    href="/activity"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors duration-200"
                  >
                    <Zap className="h-5 w-5" />
                    <span>Activity</span>
                  </Link>
                </motion.div>

                {showProfile && (
                  <motion.div variants={itemVariants}>
                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors duration-200">
                      <User className="h-5 w-5" />
                      <span>Profile</span>
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
      </div>
    </nav>
  );
}
