"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface UseSlotMachineCounterProps {
  targetValue: number;
  duration?: number;
  delay?: number;
  easingFunction?: string;
  startValue?: number;
  trigger?: boolean;
}

// Reusable Slot Machine Counter Hook
export const useSlotMachineCounter = ({
  targetValue,
  duration = 2000,
  delay = 0,
  easingFunction = "easeOutQuart",
  startValue = 0,
  trigger = true,
}: UseSlotMachineCounterProps) => {
  const [currentValue, setCurrentValue] = useState(startValue);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Reset to start value when not in view
    if (!trigger) {
      setCurrentValue(startValue);
      setIsAnimating(false);
      return;
    }

    // Easing functions - moved inside useEffect to avoid dependency warning
    const easingFunctions: Record<string, (t: number) => number> = {
      linear: (t: number) => t,
      easeInQuad: (t: number) => t * t,
      easeOutQuad: (t: number) => t * (2 - t),
      easeInOutQuad: (t: number) =>
        t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
      easeInOutCubic: (t: number) =>
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
      easeOutBounce: (t: number) => {
        if (t < 1 / 2.75) return 7.5625 * t * t;
        if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
      },
    };

    let timeoutId: NodeJS.Timeout;
    let animationFrame: number;

    const startAnimation = () => {
      setIsAnimating(true);
      setCurrentValue(startValue); // Reset to start value before animation
      let startTime: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);

        // Apply easing function
        const easingFn =
          easingFunctions[easingFunction] || easingFunctions.easeOutQuart;
        const easedProgress = easingFn(progress);

        const value =
          startValue + Math.floor(easedProgress * (targetValue - startValue));
        setCurrentValue(value);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      animationFrame = requestAnimationFrame(animate);
    };

    // Start animation after delay
    if (delay > 0) {
      timeoutId = setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [targetValue, duration, delay, easingFunction, startValue, trigger]);

  return { currentValue, isAnimating };
};

interface SlotMachineCounterProps {
  targetValue: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  delay?: number;
  formatNumber?: boolean;
  easingFunction?: string;
  startValue?: number;
  trigger?: boolean;
  children?: React.ReactElement;
  className?: string;
  style?: React.CSSProperties;
}

// Reusable Slot Machine Counter Component with Children Support
export const SlotMachineCounter = ({
  targetValue,
  prefix = "",
  duration = 1000,
  delay = 0,
  formatNumber = true,
  easingFunction = "easeOutQuart",
  startValue = 0,
  trigger = true,
  children,
  className,
  style,
}: SlotMachineCounterProps) => {
  const { currentValue } = useSlotMachineCounter({
    targetValue,
    duration,
    delay,
    easingFunction,
    startValue,
    trigger,
  });

  const formatValue = (num: number) => {
    if (!formatNumber) return num.toString();
    return num.toLocaleString();
  };

  const animatedValue = `${prefix}${formatValue(currentValue)}`;

  // If children are provided, clone them and inject the animated value
  if (children) {
    return React.cloneElement(children, {}, animatedValue);
  }

  // Fallback to basic span if no children provided
  return (
    <motion.span
      className={className}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
    >
      {animatedValue}
    </motion.span>
  );
};
