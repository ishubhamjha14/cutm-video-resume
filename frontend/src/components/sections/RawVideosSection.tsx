import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RawVideoItem } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { Film, Sparkles, Smartphone, Zap, Download, Copy, Check, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { normalizeUrl, isExternalUrl } from '../../utils/urlHelper';

interface RawVideosSectionProps {
  videos: RawVideoItem[];
  onOpenRawViewer?: (slotId: number) => void;
}

export const RawVideosSection: React.FC<RawVideosSectionProps> = ({
  videos,
  onOpenRawViewer,
}) => {
  const [copiedSlot, setCopiedSlot] = useState<number | null>(null);

  // Filter ONLY uploaded raw videos for slots 1 and 2 (ignoring slot 3 or any empty video)
  const uploadedVideos = [1, 2]
    .map(slotNum => videos.find(v => Number(v.slotId) === slotNum && !!v.fileUrl))
    .filter((v): v is RawVideoItem => !!v);

  const getPublicUrl = (video: RawVideoItem) => {
    if (video.publicUrl && video.publicUrl.trim()) {
      return normalizeUrl(video.publicUrl);
    }
    const origin = window.location.origin;
    return `${origin}/raw/${video.slotId}`;
  };

  const handleCopy = (slotId: number, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedSlot(slotId);
    setTimeout(() => setCopiedSlot(null), 2000);
  };

  const handleCardClick = (video: RawVideoItem) => {
    const url = getPublicUrl(video);
    if (isExternalUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      if (onOpenRawViewer) {
        onOpenRawViewer(video.slotId);
      } else {
        window.location.href = url;
      }
    }
  };

  return (
    <section 
      id="raw-videos" 
      className="snap-section relative flex flex-col justify-center items-center overflow-hidden py-10"
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-cyan-400 text-xs font-mono mb-2 shadow-sm"
          >
            <Film size={13} />
            <span>BEHIND THE SCENES</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-heading font-black tracking-tight uppercase"
          >
            <span className="gradient-text-white">RAW & UNCUT </span>
            <span className="gradient-text-cyan">VIDEOS</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base text-slate-400 mt-2 font-normal"
          >
            Original recordings — scan the QR codes to watch
          </motion.p>
        </div>

        {/* Main Grid: Uploaded Raw Video Cards (Max 2) + Quick Access Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch justify-center">
          {/* Render ONLY uploaded raw video cards */}
          {uploadedVideos.map((video) => {
            const slotNum = video.slotId;
            const publicUrl = getPublicUrl(video);
            const isExternal = isExternalUrl(publicUrl);
            const isCopied = copiedSlot === slotNum;

            if (process.env.NODE_ENV !== 'production') {
              console.log(`[Raw Video 0${slotNum}] QR Target URL:`, publicUrl, `(External: ${isExternal})`);
            }

            return (
              <motion.div
                key={slotNum}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: slotNum * 0.15 }}
                className="group rounded-2xl glass-card p-6 sm:p-7 flex flex-col justify-between border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 shadow-xl"
              >
                <div>
                  {/* Top Bar: VIDEO 01 / 02 and HD 1080p */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                      VIDEO 0{slotNum}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300 bg-black/50 px-2.5 py-0.5 rounded border border-cyan-500/30">
                      HD 1080p
                    </span>
                  </div>

                  {/* Center: Large, Scannable Dynamic or Custom QR Code */}
                  <div className="flex flex-col items-center text-center mb-5">
                    <div 
                      onClick={() => handleCardClick(video)}
                      className="relative p-4 bg-white rounded-2xl shadow-2xl shadow-cyan-500/10 border-2 border-cyan-500/40 group-hover:border-cyan-400 transition-transform duration-300 group-hover:scale-105 cursor-pointer glow-cyan w-[207px] h-[207px] flex items-center justify-center"
                      title={isExternal ? 'Click to open external link' : 'Click to open video viewer'}
                    >
                      {video.qrMode === 'custom' && video.customQrUrl ? (
                        <img
                          src={`${video.customQrUrl}?t=${video.qrUpdatedAt ? new Date(video.qrUpdatedAt).getTime() : Date.now()}`}
                          alt={`Raw Video 0${slotNum} QR`}
                          className="w-[175px] h-[175px] object-contain rounded"
                        />
                      ) : (
                        <QRCodeSVG
                          value={publicUrl}
                          size={175}
                          level="H"
                          includeMargin={false}
                        />
                      )}
                    </div>
                  </div>

                  {/* Below QR Details */}
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-heading font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {video.title || `Raw Video 0${slotNum}`}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                      Scan the QR code to directly watch the original raw recording.
                    </p>
                  </div>

                  {/* Clean URL Box with Real Clickable Link & Copy Button */}
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-left mb-3">
                    <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                      <LinkIcon size={13} className="text-cyan-400 shrink-0" />
                      <a
                        href={publicUrl}
                        target={isExternal ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (!isExternal) {
                            e.preventDefault();
                            handleCardClick(video);
                          }
                        }}
                        className="text-[11px] font-mono text-slate-300 hover:text-cyan-300 hover:underline truncate block"
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
                        onClick={(e) => {
                          if (!isExternal) {
                            e.preventDefault();
                            handleCardClick(video);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        title="Open Link"
                      >
                        <ExternalLink size={13} />
                      </a>

                      <button
                        onClick={(e) => handleCopy(slotNum, publicUrl, e)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Copy Public Link"
                      >
                        {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Action / Prompt */}
                <div className="pt-3 border-t border-slate-800/80 text-center">
                  <button
                    onClick={() => handleCardClick(video)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    <span>Scan the QR code or click the link to watch</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {/* If 0 videos uploaded, display a sleek notification banner instead of empty card slots */}
          {uploadedVideos.length === 0 && (
            <div className="md:col-span-2 rounded-2xl glass-card p-8 text-center flex flex-col items-center justify-center border border-slate-800/80 my-auto">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-3">
                <Film size={26} />
              </div>
              <h3 className="text-lg font-heading font-bold text-slate-200 mb-1">
                Raw Video Recordings
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
                Behind-the-scenes recording QR codes will be published here as soon as they are uploaded.
              </p>
            </div>
          )}

          {/* Quick Access / Information Card on Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-2xl glass-card p-6 sm:p-7 flex flex-col justify-between border border-slate-800 hover:border-cyan-500/30 transition-all shadow-xl bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-slate-950/80"
          >
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 mb-3">
                <Sparkles size={12} />
                <span>QUICK ACCESS</span>
              </div>

              <h3 className="text-xl font-heading font-bold text-slate-100 mb-1">
                Watch on Any Device
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Scan the QR codes to directly open the raw videos on your phone.
              </p>

              {/* Three Information Rows */}
              <div className="space-y-4 mb-6">
                {/* Row 1 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                    <Smartphone size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">Mobile Friendly</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Works on all devices</p>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                    <Zap size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">Instant Access</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">No login required</p>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Download size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">Download Option</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Watch or download anytime</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Information Box */}
            <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-center">
              <p className="text-[11px] font-mono text-cyan-300">
                These are unedited, original recordings from our project journey.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
