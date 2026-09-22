import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundOrbs: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#07090E]">
      {/* Background Gradient Mesh */}
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      
      {/* Golden Accent Orb (Top-Right / CUTM Gold) */}
      <motion.div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl"
        animate={{
          x: [0, 20, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Cyan Cyber Orb (Bottom-Left) */}
      <motion.div
        className="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-cyan-500/10 blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Indigo Core Orb (Center) */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-blue-600/5 blur-[120px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />
    </div>
  );
};
