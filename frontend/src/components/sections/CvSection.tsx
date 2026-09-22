import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TeamMemberCV } from '../../types';
import { FileText, Download, Eye, Clock, CheckCircle2, User, Sparkles } from 'lucide-react';

interface CvSectionProps {
  cvs: TeamMemberCV[];
  isLoading: boolean;
  onOpenCvModal: (cv: TeamMemberCV) => void;
}

export const CvSection: React.FC<CvSectionProps> = ({ cvs, isLoading, onOpenCvModal }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Exact team photos mapped to members
  const memberPhotoMap: { [key: string]: string } = {
    shubham: '/team/shubham.jpg',
    priyatam: '/team/priyatam.jpg',
    jisu: '/team/jisu.jpg',
  };

  // Fallback cards if loading or empty
  const defaultMembers = [
    {
      personKey: 'shubham',
      personName: 'Shubham Kumar Jha',
      role: 'Full Stack & Lead Developer',
      bio: 'Specialized in modern full-stack web applications, AI integrations, and high-performance UI architecture at CUTM.',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Python'],
      avatarUrl: '/team/shubham.jpg',
      fileUrl: null
    },
    {
      personKey: 'priyatam',
      personName: 'Priyatam Raj',
      role: 'System Architect & Backend Specialist',
      bio: 'Focused on scalable cloud infrastructure, backend microservices, database optimizations, and API design.',
      skills: ['Express.js', 'PostgreSQL', 'Docker', 'REST APIs', 'Cloud'],
      avatarUrl: '/team/priyatam.jpg',
      fileUrl: null
    },
    {
      personKey: 'jisu',
      personName: 'Jisu Kumar Thakur',
      role: 'UI/UX Designer & Frontend Engineer',
      bio: 'Passionate about cinematic interactions, responsive design systems, accessibility, and dynamic web presentations.',
      skills: ['Framer Motion', 'Figma', 'React', 'CSS Architecture', 'UI/UX'],
      avatarUrl: '/team/jisu.jpg',
      fileUrl: null
    }
  ];

  const displayList = (cvs.length > 0 ? cvs : defaultMembers).map(member => ({
    ...member,
    avatarUrl: memberPhotoMap[member.personKey?.toLowerCase()] || member.avatarUrl || '/team/shubham.jpg'
  }));

  return (
    <section 
      id="resumes" 
      className="snap-section relative flex flex-col justify-center items-center overflow-hidden py-12"
    >
      <div className="max-w-6xl w-full mx-auto px-4 z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-amber-400 text-xs font-mono mb-2"
          >
            <Sparkles size={12} />
            <span>TEAM 03 PROFILES</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-heading font-black tracking-tight uppercase"
          >
            <span className="gradient-text-white">TEAM </span>
            <span className="gradient-text-gold">RESUMES</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base text-slate-400 mt-2 font-normal"
          >
            Explore the professional profiles of our team members
          </motion.p>
        </div>

        {/* 3 Interactive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {displayList.map((member, index) => {
            const hasCV = !!member.fileUrl;
            const photoSrc = memberPhotoMap[member.personKey?.toLowerCase()] || member.avatarUrl;

            return (
              <motion.div
                key={member.personKey || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                onMouseEnter={() => setHoveredCard(member.personKey)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative rounded-2xl glass-card p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 border border-slate-800 hover:border-amber-500/40"
              >
                {/* Top: Status Badge & Member Number */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono font-bold tracking-wider text-amber-400/80 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    MEMBER 0{index + 1}
                  </span>

                  {hasCV ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 size={11} />
                      CV Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/50">
                      <Clock size={11} />
                      Coming soon
                    </span>
                  )}
                </div>

                {/* Avatar & Header */}
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="relative mb-3.5">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-slate-700 group-hover:border-amber-400/70 transition-colors shadow-xl bg-slate-950/90 flex items-center justify-center p-0.5">
                      <img
                        src={photoSrc}
                        alt={member.personName}
                        className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 rounded-xl"
                        loading="eager"
                      />
                    </div>
                    {/* CUTM dot indicator */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center">
                      <div className={`w-2.5 h-2.5 rounded-full ${hasCV ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                    {member.personName}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-cyan-400 mt-0.5">
                    {member.role}
                  </p>
                </div>

                {/* Bio */}
                <p className="text-xs sm:text-sm text-slate-300/80 text-center leading-relaxed line-clamp-3 mb-4">
                  {member.bio}
                </p>

                {/* Skills tags */}
                {member.skills && member.skills.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6">
                    {member.skills.slice(0, 4).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions Bottom Bar */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2 mt-auto">
                  <button
                    onClick={() => onOpenCvModal(member as TeamMemberCV)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-heading font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 transition-all duration-200 active:scale-95"
                  >
                    <Eye size={15} />
                    <span>View CV</span>
                  </button>

                  {hasCV ? (
                    <a
                      href={member.fileUrl!}
                      download={member.fileName || `${member.personName}_CV`}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 transition-colors"
                    >
                      <Download size={13} />
                      <span>Download File</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-center font-mono text-slate-400 py-1">
                      CV will be available soon.
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
