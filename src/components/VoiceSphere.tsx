"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface VoiceSphereProps {
  isActive: boolean;
  audioLevel: number;
  isListening: boolean;
  isSpeaking: boolean;
}

export default function VoiceSphere({ isActive, audioLevel, isListening, isSpeaking }: VoiceSphereProps) {
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    setPulseIntensity(audioLevel);
  }, [audioLevel]);

  const baseSize = 120;
  const maxPulse = 40;
  const currentSize = baseSize + (pulseIntensity * maxPulse);

  // Color variations based on state
  const getGradientColors = () => {
    if (isListening) {
      return 'from-blue-400 via-blue-500 to-blue-600';
    } else if (isSpeaking) {
      return 'from-green-400 via-green-500 to-green-600';
    } else if (isActive) {
      return 'from-purple-400 via-purple-500 to-purple-600';
    } else {
      return 'from-gray-400 via-gray-500 to-gray-600';
    }
  };

  // Generate floating particles
  const particles = Array.from({ length: 8 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-2 h-2 bg-white/30 rounded-full"
      animate={{
        x: [0, Math.cos(i * 45 * Math.PI / 180) * 80, 0],
        y: [0, Math.sin(i * 45 * Math.PI / 180) * 80, 0],
        opacity: isActive ? [0.3, 0.8, 0.3] : 0.1,
        scale: isActive ? [0.5, 1.2, 0.5] : 0.5,
      }}
      transition={{
        duration: 2 + (i * 0.2),
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    />
  ));

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring */}
      <motion.div
        className="absolute rounded-full"
        animate={{
          scale: isActive ? [1, 1.3, 1] : 1,
          opacity: isActive ? [0.3, 0.6, 0.3] : 0.2,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          width: currentSize + 60,
          height: currentSize + 60,
          background: `radial-gradient(circle, transparent 40%, rgba(59, 130, 246, 0.2) 70%)`,
        }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute rounded-full border-2 border-white/20"
        animate={{
          scale: isActive ? [1, 1.1, 1] : 1,
          rotate: isActive ? [0, 360] : 0,
        }}
        transition={{
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
        }}
        style={{
          width: currentSize + 30,
          height: currentSize + 30,
        }}
      />

      {/* Floating particles */}
      {particles}

      {/* Main sphere */}
      <motion.div
        className={`relative rounded-full bg-gradient-to-br ${getGradientColors()} shadow-2xl flex items-center justify-center overflow-hidden`}
        animate={{
          scale: isActive ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          width: currentSize,
          height: currentSize,
        }}
      >
        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-full" />
        
        {/* Audio visualizer waves */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 5 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 bg-white/60 rounded-full"
                animate={{
                  height: [10, 30 + (pulseIntensity * 40), 10],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 0.3 + (i * 0.1),
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${30 + i * 10}%`,
                }}
              />
            ))}
          </div>
        )}

        {/* Center dot */}
        {/* <motion.div
          className="w-3 h-3 bg-white rounded-full z-10"
          animate={{
            scale: isActive ? [1, 1.5, 1] : 1,
            opacity: isActive ? [0.8, 1, 0.8] : 0.6,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        /> */}

        {/* Ripple effects */}
        {isActive && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/30"
              animate={{
                scale: [0.8, 1.2],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/20"
              animate={{
                scale: [0.6, 1.4],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.5,
              }}
            />
          </>
        )}
      </motion.div>

      {/* Status text */}
      <motion.div
        className="absolute -bottom-12 text-center"
        animate={{ opacity: isActive ? 1 : 0.7 }}
      >
        <p className="text-sm font-medium text-muted-foreground">
          {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : isActive ? 'Active' : 'Ready'}
        </p>
      </motion.div>
    </div>
  );
}
