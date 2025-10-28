"use client";

import { AnimatePresence, motion } from "framer-motion"; // Corrected import
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react"; // Import the Search icon

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
}: {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  // --- Placeholder Animation Logic (unchanged) ---
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startAnimation = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 6000);
  }, [placeholders.length]);
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === "visible") {
      startAnimation();
    }
  }, [startAnimation]);

  useEffect(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startAnimation, handleVisibilityChange]);
  // --- End Placeholder Logic ---

  // --- Vanish Animation Logic (mostly unchanged) ---
  type PixelData = { x: number; y: number; r: number; color: string };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const newDataRef = useRef<PixelData[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [animating, setAnimating] = useState(false);

  const draw = useCallback(() => {
    if (!inputRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    const computedStyles = getComputedStyle(inputRef.current);
    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = "#FFF"; // Text is white
    ctx.fillText(value, 16, 40);

    const imageData = ctx.getImageData(0, 0, 800, 800);
    const pixelData = imageData.data;
    const newData: PixelData[] = [];
    for (let t = 0; t < 800; t++) {
      const i = 4 * t * 800;
      for (let n = 0; n < 800; n++) {
        const e = i + 4 * n;
        if (
          pixelData[e] !== 0 &&
          pixelData[e + 1] !== 0 &&
          pixelData[e + 2] !== 0
        ) {
          newData.push({
            x: n,
            y: t,
            r: 1,
            color: `rgba(${pixelData[e]}, ${pixelData[e + 1]}, ${pixelData[e + 2]}, ${pixelData[e + 3]})`,
          });
        }
      }
    }
    newDataRef.current = newData;
  }, [value]);

  useEffect(() => {
    draw();
  }, [value, draw]);

  const animate = (start: number) => {
    const animateFrame = (pos: number = 0) => {
      requestAnimationFrame(() => {
        const newArr = [];
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) {
            newArr.push(current);
          } else {
            if (current.r <= 0) {
              current.r = 0;
              continue;
            }
            current.x += Math.random() > 0.5 ? 1 : -1;
            current.y += Math.random() > 0.5 ? 1 : -1;
            current.r -= 0.05 * Math.random();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800);
          newDataRef.current.forEach((t) => {
            const { x: n, y: i, r: s, color: color } = t;
            if (n > pos) {
              ctx.beginPath();
              ctx.rect(n, i, s, s);
              ctx.fillStyle = color;
              ctx.strokeStyle = color;
              ctx.stroke();
            }
          });
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8);
        } else {
          setValue("");
          setAnimating(false);
        }
      });
    };
    animateFrame(start);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !animating) {
      vanishAndSubmit();
    }
  };

  const vanishAndSubmit = () => {
    setAnimating(true);
    draw();

    const value = inputRef.current?.value || "";
    if (value && inputRef.current) {
      const maxX = newDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev),
        0
      );
      animate(maxX);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    vanishAndSubmit();
    onSubmit && onSubmit(e);
  };
  // --- End Vanish Logic ---

  return (
    <form
      className={cn(
        // --- STYLING MODIFICATIONS ---
        // Replaced shadow, bg-white, rounded-full, and h-12
        // Added bg-transparent, border, rounded-sm, and py-3 (for height)
        "w-full relative max-w-lg bg-transparent rounded-lg border-2 border-white/20 overflow-hidden transition duration-200",
        // Changed value state to modify border color instead of bg
        value && "border-white/50"
        // --- END MODIFICATIONS ---
      )}
      onSubmit={handleSubmit}
    >
      <canvas
        className={cn(
          "absolute pointer-events-none text-base transform scale-50 top-[20%] left-2 sm:left-8 origin-top-left pr-20",
          // --- STYLING MODIFICATION ---
          // Removed "filter invert dark:invert-0"
          // --- END MODIFICATION ---
          !animating ? "opacity-0" : "opacity-100"
        )}
        ref={canvasRef}
      />
      <input
        onChange={(e) => {
          if (!animating) {
            setValue(e.target.value);
            onChange && onChange(e);
          }
        }}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        value={value}
        type="text"
        className={cn(
          // --- STYLING MODIFICATIONS ---
          // Replaced text-black, dark:text-white, rounded-full
          // Added text-white, rounded-sm
          // Adjusted padding to match original (pl-4) and keep room for button (pr-12)
          "w-full relative text-sm sm:text-base z-50 border-none bg-transparent text-white h-full rounded-sm focus:outline-none focus:ring-0 pl-4 pr-12 py-3",
          // --- END MODIFICATIONS ---
          animating && "text-transparent" // Kept vanish effect
        )}
      />

      <button
        disabled={!value}
        type="submit"
        className={cn(
          // --- STYLING MODIFICATIONS ---
          // Replaced all styling (bg-black, rounded-full, etc.)
          // Added styles to match original icon button
          "absolute right-4 top-1/2 z-50 -translate-y-1/2 text-white/70 transition-colors hover:text-white disabled:text-white/30"
          // --- END MODIFICATIONS ---
        )}
      >
        {/* --- MODIFICATION: Replaced SVG with Lucide Icon --- */}
        <Search size={20} />
      </button>

      <div className="absolute inset-0 flex items-center rounded-full pointer-events-none">
        <AnimatePresence mode="wait">
          {!value && (
            <motion.p
              initial={{
                y: 5,
                opacity: 0,
              }}
              key={`current-placeholder-${currentPlaceholder}`}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -15,
                opacity: 0,
              }}
              transition={{
                duration: 0.3,
                ease: "linear",
              }}
              className={cn(
                // --- STYLING MODIFICATIONS ---
                // Replaced text-neutral-500, dark:text-zinc-500
                // Added text-white/70
                // Synced padding (pl-4)
                "text-sm sm:text-base font-normal text-white/70 pl-4 text-left w-[calc(100%-2rem)] truncate"
                // --- END MODIFICATIONS ---
              )}
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}