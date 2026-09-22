import React from 'react';
import { CutmLogo } from './CutmLogo';
import { Lock, LayoutDashboard, UserCheck, Sparkles, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenAdmin: () => void;
  activeSection: number;
  onNavigate: (index: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin, activeSection, onNavigate }) => {
  const { isAuthenticated, adminUser } = useAuth();

  const navItems = [
    { label: 'Home', index: 0 },
    { label: 'Team CVs', index: 1 },
    { label: 'Raw Videos', index: 2 },
    { label: 'Final Video', index: 3 },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-3.5 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Branding */}
        <button 
          onClick={() => onNavigate(0)}
          className="flex items-center gap-3.5 group text-left focus:outline-none"
        >
          <CutmLogo size={38} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-sm sm:text-base tracking-wider text-slate-100 group-hover:text-amber-400 transition-colors">
                CUTM VIDEO RESUME
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                TEAM 03
              </span>
            </div>
            <span className="text-[11px] text-slate-400 tracking-tight hidden md:inline">
              Centurion University of Technology and Management
            </span>
          </div>
        </button>

        {/* Center: Desktop Nav links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = activeSection === item.index;
            return (
              <button
                key={item.index}
                onClick={() => onNavigate(item.index)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Discreet Admin Button & Status */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 hover:border-cyan-400 transition-all duration-200 shadow-sm"
              title="Open Admin Dashboard"
            >
              <LayoutDashboard size={14} className="animate-pulse" />
              <span>DASHBOARD</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </button>
          ) : (
            <button
              onClick={onOpenAdmin}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all duration-200"
              title="Team Admin Login"
            >
              <Lock size={12} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
              <span className="tracking-wide">ADMIN</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
