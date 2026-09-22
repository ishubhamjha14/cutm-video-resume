import React from 'react';
import { motion } from 'framer-motion';
import { CutmLogo } from '../common/CutmLogo';
import { ChevronDown, Play, FileText, Sparkles, Award, Users } from 'lucide-react';

interface HeroSectionProps {
  onExplore: () => void;
  onWatchVideo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore, onWatchVideo }) => {
  return (
    <section 
      id="hero" 
      className="snap-section relative flex flex-col justify-center items-center text-center overflow-hidden"
    >
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none -z-10" />

      {/* Main Content Container with Staggered Framer Motion Animations */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.18,
              delayChildren: 0.1,
            },
          },
        }}
        className="max-w-4xl mx-auto flex flex-col items-center z-10 px-4"
      >
        {/* Top: CUTM Crest & University Title */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: -20, scale: 0.9 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
          }}
          className="flex flex-col items-center mb-6"
        >
          <div className="mb-4 relative group">
            <CutmLogo size={80} glow={true} className="transform transition-transform group-hover:scale-105" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-md mb-2 shadow-lg shadow-amber-500/5">
            <Sparkles size={13} className="text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Centurion University of Technology and Management</span>
          </div>
        </motion.div>

        {/* Main Heading: "VIDEO RESUME" */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 25, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
          }}
          className="space-y-2 mb-4"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-heading font-black tracking-tight leading-none uppercase">
            <span className="gradient-text-white block">VIDEO</span>
            <span className="gradient-text-gold block drop-shadow-2xl">RESUME</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
          }}
          className="text-base sm:text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed mb-6"
        >
          An Interactive Digital Resume & Project Presentation
        </motion.p>

        {/* Team 03 Badge & Members preview */}
        <motion.div
          variants={{
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
          }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs sm:text-sm font-mono text-slate-200 backdrop-blur-sm">
            <Award size={15} className="text-amber-400" />
            <span className="font-bold text-amber-400">Team 03</span>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-xs sm:text-sm text-slate-300">
            <Users size={14} className="text-cyan-400" />
            <span>Shubham • Priyatam • Jisu</span>
          </div>
        </motion.div>

        {/* Quick Action CTA Buttons */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
          }}
          className="flex flex-wrap items-center justify-center gap-4 mb-10"
        >
          <button
            onClick={onExplore}
            className="group relative inline-flex items-center gap-2 px-7 py-3 rounded-xl font-heading font-semibold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 shadow-xl shadow-amber-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <FileText size={17} />
            <span>Explore Team CVs</span>
          </button>

          <button
            onClick={onWatchVideo}
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-xl font-heading font-semibold text-sm sm:text-base text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Play size={16} className="text-amber-400 fill-amber-400 group-hover:text-cyan-400 group-hover:fill-cyan-400 transition-colors" />
            <span>Watch Final Video</span>
          </button>
        </motion.div>
      </motion.div>

      {/* Bottom Floating Instruction: "Scroll to Explore ↓" */}
      <motion.button
        onClick={onExplore}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer group focus:outline-none"
      >
        <span className="text-xs font-mono font-medium tracking-widest uppercase text-slate-400 group-hover:text-amber-400">
          Scroll to Explore
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="p-1 rounded-full bg-slate-900/60 border border-slate-800 text-slate-300 group-hover:border-amber-500/50 group-hover:text-amber-400"
        >
          <ChevronDown size={18} />
        </motion.div>
      </motion.button>
    </section>
  );
};
