"use client";

import Navbar from "./Navbar";

interface ConditionalNavbarProps {
  title?: string;
  showProfile?: boolean;
  children: React.ReactNode;
  showNavbar?: boolean;
}

export default function ConditionalNavbar({ 
  title = "Dashboard", 
  showProfile = true, 
  children,
  showNavbar = true
}: ConditionalNavbarProps) {
  return (
    <div>
      {showNavbar && <Navbar title={title} showProfile={showProfile} />}
      {children}
    </div>
  );
}
