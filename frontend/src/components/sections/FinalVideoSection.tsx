import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FinalVideoItem, QrCodeResponse } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles, QrCode, Check, Copy, ExternalLink, Smartphone } from 'lucide-react';
import { CutmLogo } from '../common/CutmLogo';
import { normalizeUrl, isExternalUrl } from '../../utils/urlHelper';

interface FinalVideoSectionProps {
  finalVideo: FinalVideoItem | null;
  qrData: QrCodeResponse | null;
}

export const FinalVideoSection: React.FC<FinalVideoSectionProps> = ({
  finalVideo,
  qrData,
}) => {
  const [copied, setCopied] = useState(false);

  // Determine dynamic target public URL
  const publicUrl = finalVideo?.publicUrl && finalVideo.publicUrl.trim()
    ? normalizeUrl(finalVideo.publicUrl)
    : (qrData?.targetUrl || `${window.location.origin}/final-video`);

  const isExternal = isExternalUrl(publicUrl);

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Final Video] QR Target URL:', publicUrl, `(External: ${isExternal})`);
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQrClick = () => {
    if (isExternal) {
      window.open(publicUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section 
      id="final-video" 
      className="snap-section relative flex flex-col justify-between items-center overflow-hidden pt-12 pb-4"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 z-10 flex-1 flex flex-col justify-center items-center">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-400 text-xs font-mono mb-2"
          >
            <Sparkles size={12} />
            <span>PREMIERE SHOWCASE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-heading font-black tracking-tight uppercase"
          >
            <span className="gradient-text-white">FINAL </span>
            <span className="gradient-text-gold">VIDEO RESUME</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm text-slate-400 mt-1 font-normal"
          >
            Scan to watch the completed video resume
          </motion.p>
        </div>

        {/* Center Premium QR Code Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md rounded-3xl glass-card p-6 sm:p-8 flex flex-col items-center text-center border border-slate-700/80 shadow-2xl shadow-amber-500/10 hover:border-amber-500/40 transition-all duration-300 relative group"
        >
          {/* Card Top Badge */}
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 mb-3">
            <QrCode size={13} />
            <span>PREMIERE SHOWCASE</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-slate-100 mb-1">
            FINAL VIDEO RESUME
          </h3>
          <p className="text-xs sm:text-sm font-medium text-amber-400/90 mb-5 flex items-center gap-1.5">
            <Smartphone size={14} />
            <span>Scan to Watch</span>
          </p>

          {/* Large High-Definition QR Code on White Backdrop */}
          <div 
            onClick={handleQrClick}
            className={`p-4 sm:p-5 bg-white rounded-2xl shadow-2xl border-2 border-amber-500/30 transition-transform duration-300 group-hover:scale-105 mb-4 flex items-center justify-center ${
              isExternal ? 'cursor-pointer hover:border-amber-400' : ''
            }`}
            title={isExternal ? 'Click to open external link' : 'Scan with your device to watch'}
          >
            {finalVideo?.qrMode === 'custom' && finalVideo?.customQrUrl ? (
              <img
                src={`${finalVideo.customQrUrl}?t=${finalVideo.qrUpdatedAt ? new Date(finalVideo.qrUpdatedAt).getTime() : Date.now()}`}
                alt="Final Video Custom QR Code"
                className="w-[190px] h-[190px] object-contain rounded"
              />
            ) : (
              <QRCodeSVG
                id="final-video-public-qr"
                value={publicUrl}
                size={190}
                level="H"
                includeMargin={false}
              />
            )}
          </div>

          {/* Scannable instruction */}
          <p className="text-xs sm:text-sm text-slate-300 font-medium mb-4">
            Scan the QR code to watch the final video
          </p>

          {/* Public URL Box with Real Clickable Link and Copy Button */}
          <div className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-left gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-amber-400 shrink-0">🔗</span>
              <a
                href={publicUrl}
                target={isExternal ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="text-xs font-mono text-slate-300 hover:text-amber-300 hover:underline truncate block"
                title={publicUrl}
              >
                {publicUrl}
              </a>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <a
                href={publicUrl}
                target={isExternal ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Open Link"
              >
                <ExternalLink size={14} />
              </a>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all active:scale-95"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copied ? 'Link copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer at bottom of Page 4 */}
      <footer className="w-full max-w-6xl mx-auto px-4 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-mono mt-2">
        <div className="flex items-center gap-2">
          <CutmLogo size={18} glow={false} />
          <span>© 2026 Team 03</span>
          <span className="hidden md:inline">• Centurion University of Technology and Management</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="text-amber-400/80">Video Resume Project</span>
          <span>•</span>
          <span>Shubham • Priyatam • Jisu</span>
        </div>
      </footer>
    </section>
  );
};
