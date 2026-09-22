import React, { useEffect, useState, useRef } from 'react';
import { FinalVideoItem } from '../../types';
import { videoApi } from '../../services/api';
import { CutmLogo } from '../common/CutmLogo';
import { Play, Pause, Volume2, VolumeX, Maximize, Download, ArrowLeft, Video, Sparkles, Award } from 'lucide-react';

interface PublicFinalVideoPageProps {
  onBackToMain?: () => void;
}

export const PublicFinalVideoPage: React.FC<PublicFinalVideoPageProps> = ({ onBackToMain }) => {
  const [video, setVideo] = useState<FinalVideoItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    const fetchFinalVideo = async () => {
      setIsLoading(true);
      try {
        const res = await videoApi.getFinalVideo();
        if (res.success && res.data) {
          setVideo(res.data);
        } else {
          setError('Final video is not available yet.');
        }
      } catch (err: any) {
        setError('Final Video Resume has not been uploaded yet or is unavailable.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinalVideo();
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleBack = () => {
    if (onBackToMain) {
      onBackToMain();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      window.history.pushState(null, '', '/final-video');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="min-h-screen min-h-dvh bg-[#07090E] text-slate-100 flex flex-col justify-between selection:bg-amber-500/30">
      {/* Background Subtle Gradient Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.12),rgba(255,255,255,0))] pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="px-4 sm:px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CutmLogo size={36} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-sm sm:text-base tracking-wider text-slate-100">
                CUTM VIDEO RESUME
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                TEAM 03
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Centurion University of Technology and Management
            </p>
          </div>
        </div>

        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back to Presentation</span>
        </button>
      </header>

      {/* Main Video Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-mono text-amber-400">Loading master video resume...</p>
          </div>
        ) : error || !video?.fileUrl ? (
          <div className="text-center p-8 rounded-2xl glass-card border border-slate-800 max-w-md w-full my-auto">
            <div className="w-14 h-14 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center mx-auto mb-3 border border-slate-800">
              <Video size={26} />
            </div>
            <h3 className="text-lg font-heading font-bold text-slate-100 mb-1">
              Final Video Coming Soon
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              The completed video resume presentation for Centurion University is being compiled and will be uploaded shortly by Team 03.
            </p>
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
            >
              <ArrowLeft size={14} />
              <span>Return to Main Website</span>
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4">
            {/* Title & Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 mb-1.5">
                  <Award size={12} />
                  <span>PREMIERE SHOWCASE</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-slate-100">
                  {video.title || 'FINAL VIDEO RESUME'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Completed Team Video Resume
                </p>
              </div>

              {video.fileUrl && (
                <a
                  href={video.fileUrl}
                  download={video.fileName || 'CUTM_Team03_Final_Video_Resume.mp4'}
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors shadow-sm"
                >
                  <Download size={14} />
                  <span>Download Video</span>
                </a>
              )}
            </div>

            {/* Mobile-Friendly Cinematic Video Player */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center group">
              <video
                ref={videoRef}
                src={video.fileUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onClick={togglePlay}
                playsInline
                autoPlay
              />

              {/* Center Play/Pause button overlay */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center justify-center shadow-2xl shadow-amber-500/40 transform transition-all hover:scale-110 active:scale-95 z-20"
                  title="Play Presentation"
                >
                  <Play size={26} className="fill-slate-950 ml-1" />
                </button>
              )}

              {/* Custom Controls Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-2 z-20 opacity-90 group-hover:opacity-100 transition-opacity">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-1.5 rounded-lg text-slate-200 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} className="fill-current" />}
                    </button>

                    <button
                      onClick={toggleMute}
                      className="p-1.5 rounded-lg text-slate-200 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                    >
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>

                    <span className="text-xs font-mono text-slate-300">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFullscreen}
                      className="p-1.5 rounded-lg text-slate-200 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                      title="Fullscreen"
                    >
                      <Maximize size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Footnote */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Completed Team Video Resume</span>
              <span>1080p Master Cut • Centurion University</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-4 py-3 border-t border-slate-800/60 text-center text-xs text-slate-500 font-mono">
        © 2026 Team 03 • Centurion University of Technology and Management
      </footer>
    </div>
  );
};
