import React from 'react';
import { motion } from 'framer-motion';

interface ScrollIndicatorProps {
  activeSection: number;
  totalSections: number;
  onSelectSection: (index: number) => void;
}

const SECTIONS = [
  { num: '01', title: 'Home' },
  { num: '02', title: 'Team CVs' },
  { num: '03', title: 'Raw Videos' },
  { num: '04', title: 'Final Video' },
];

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  activeSection,
  onSelectSection,
}) => {
  return (
    <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4 select-none">
      {SECTIONS.map((sec, idx) => {
        const isActive = activeSection === idx;
        return (
          <button
            key={sec.num}
            onClick={() => onSelectSection(idx)}
            className="group relative flex items-center justify-center p-1.5 focus:outline-none"
            aria-label={`Scroll to ${sec.title}`}
          >
            {/* Tooltip on left */}
            <div className="absolute right-8 px-2.5 py-1 rounded-md bg-slate-900/90 text-slate-200 text-xs font-mono border border-slate-700/80 backdrop-blur-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap shadow-xl -translate-x-1 group-hover:translate-x-0">
              <span className="text-amber-400 font-bold mr-1.5">{sec.num}</span>
              {sec.title}
            </div>

            {/* Dot Indicator */}
            <div className="relative flex items-center justify-center">
              {isActive && (
                <motion.div
                  layoutId="activeDotRing"
                  className="absolute w-6 h-6 rounded-full border border-amber-400/80 bg-amber-400/10"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
              <div
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-2.5 h-2.5 bg-amber-400 shadow-md shadow-amber-500/50'
                    : 'w-2 h-2 bg-slate-600 group-hover:bg-slate-400 group-hover:scale-125'
                }`}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};
