"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface DashboardSquareCardProps {
  title: string;
  text: string;
  imageUrl: string;
  link: string;
  linkText?: string;
}

export default function DashboardSquareCard({
  title,
  text,
  imageUrl,
  link,
  linkText = "Go to page"
}: DashboardSquareCardProps) {
  return (
    <Link href={link} className="block group">
      <motion.div
        whileHover={{ scale: 1.03, boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
        whileTap={{ scale: 0.98 }}
        className="relative aspect-square lg:aspect-video rounded-2xl overflow-hidden shadow-md bg-card flex flex-col justify-end cursor-pointer"
        style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {/* Overlay for darken effect */}
        <div className="relative h-full w-full flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/30 z-0" />
          {/* Title */}
          <div className="z-10 p-4">
            <h3 className="text-3xl lg:text-4xl font-bold text-white drop-shadow mb-2">{title}</h3>
          </div>
          {/* Content */}
          <div className="relative z-10 flex flex-col h-full justify-end items-start">
            <div className="flex items-center justify-start p-4">
              <p className="text-white text-xl text-left drop-shadow">{text}</p>
            </div>
            <div className="flex justify-between items-end p-4 w-full">
              <span className="text-sm font-medium text-white drop-shadow group-hover:underline transition-all duration-200">
                {linkText}
              </span>
              <motion.div
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-white drop-shadow flex items-center"
              >
                <ChevronRight className="h-6 w-6" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
