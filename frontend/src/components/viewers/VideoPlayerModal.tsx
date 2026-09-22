import React, { useRef, useState } from 'react';
import { Modal } from '../common/Modal';
import { RawVideoItem } from '../../types';
import { Play, Pause, Volume2, VolumeX, Download, Maximize, ExternalLink, Film } from 'lucide-react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: RawVideoItem | null;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ isOpen, onClose, video }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  if (!video) return null;

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={video.title}
      subtitle={video.description || 'Behind the scenes raw footage • Centurion University Team 03'}
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col gap-4">
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center group">
          {video.fileUrl ? (
            <>
              <video
                ref={videoRef}
                src={video.fileUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onClick={togglePlay}
                autoPlay
              />

              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center shadow-xl shadow-cyan-500/40 hover:scale-110 active:scale-95 transition-all z-20"
                >
                  <Play size={24} className="fill-slate-950 ml-1" />
                </button>
              )}

              {/* Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 z-20 opacity-90 group-hover:opacity-100 transition-opacity">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={togglePlay}
                      className="p-1 rounded text-slate-200 hover:text-cyan-400"
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} className="fill-current" />}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="p-1 rounded text-slate-200 hover:text-cyan-400"
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <span className="text-xs font-mono text-slate-300">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={video.fileUrl}
                      download={video.fileName || `${video.title}.mp4`}
                      className="p-1 rounded text-slate-200 hover:text-cyan-400"
                      title="Download Video"
                    >
                      <Download size={16} />
                    </a>
                    <button
                      onClick={handleFullscreen}
                      className="p-1 rounded text-slate-200 hover:text-cyan-400"
                      title="Fullscreen"
                    >
                      <Maximize size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-8">
              <Film size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Video content not available.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
