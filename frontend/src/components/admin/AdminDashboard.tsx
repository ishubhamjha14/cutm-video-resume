import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TeamMemberCV, RawVideoItem, FinalVideoItem, QrCodeResponse, SystemStats } from '../../types';
import { cvApi, videoApi, qrApi, statsApi } from '../../services/api';
import { CvManager } from './CvManager';
import { RawVideoManager } from './RawVideoManager';
import { FinalVideoManager } from './FinalVideoManager';
import { QrCodeManager } from './QrCodeManager';
import { CutmLogo } from '../common/CutmLogo';
import {
  LayoutDashboard,
  FileText,
  Film,
  Award,
  QrCode,
  LogOut,
  X,
  RefreshCw,
  Server,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export type AdminTabType = 'overview' | 'cvs' | 'rawVideos' | 'finalVideo' | 'qrCodes';

interface AdminDashboardProps {
  isOpen: boolean;
  currentTab?: AdminTabType;
  onTabChange?: (tab: AdminTabType) => void;
  onClose: () => void;
  onPreviewCv: (cv: TeamMemberCV) => void;
  onPreviewVideo: (video: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  currentTab,
  onTabChange,
  onClose,
  onPreviewCv,
  onPreviewVideo,
}) => {
  const { logout, adminUser } = useAuth();
  const [internalTab, setInternalTab] = useState<AdminTabType>('overview');
  const activeTab = currentTab || internalTab;

  const handleSelectTab = (tab: AdminTabType) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const [cvs, setCvs] = useState<TeamMemberCV[]>([]);
  const [rawVideos, setRawVideos] = useState<RawVideoItem[]>([]);
  const [finalVideo, setFinalVideo] = useState<FinalVideoItem | null>(null);
  const [rawQr, setRawQr] = useState<QrCodeResponse | null>(null);
  const [finalQr, setFinalQr] = useState<QrCodeResponse | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [cvRes, rawRes, finalRes, rawQrRes, finalQrRes, statsRes] = await Promise.all([
        cvApi.getAll(),
        videoApi.getRawVideos(),
        videoApi.getFinalVideo(),
        qrApi.getRawVideosQR(),
        qrApi.getFinalVideoQR(),
        statsApi.getSystemStats(),
      ]);

      if (cvRes.success) setCvs(cvRes.data);
      if (rawRes.success) setRawVideos(rawRes.data);
      if (finalRes.success) setFinalVideo(finalRes.data);
      setRawQr(rawQrRes);
      setFinalQr(finalQrRes);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllData();
    }
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  if (!isOpen) return null;

  const tabs: { id: AdminTabType; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'cvs', label: 'CV Management', icon: FileText },
    { id: 'rawVideos', label: 'Raw Videos', icon: Film },
    { id: 'finalVideo', label: 'Final Video', icon: Award },
    { id: 'qrCodes', label: 'QR Codes', icon: QrCode },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#07090E]/95 backdrop-blur-xl flex flex-col overflow-hidden text-slate-100">
      {/* Top Navigation Bar */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <CutmLogo size={36} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-heading font-extrabold tracking-wide text-slate-100">
                Team 03 — Admin Dashboard
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Centurion University of Technology and Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            <ExternalLink size={13} />
            <span>View Public Site</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Dashboard"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Admin Workspace: Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-800/80 p-4 flex flex-row md:flex-col justify-between shrink-0 overflow-x-auto">
          {/* Navigation Links */}
          <nav className="flex md:flex-col gap-1 w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 font-semibold border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon size={17} className={isActive ? 'text-amber-400' : 'text-slate-500'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Admin User Info & Logout Button */}
          <div className="hidden md:flex flex-col gap-3 pt-4 border-t border-slate-800/80 mt-auto">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldCheck size={16} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {adminUser?.username || 'team03'}
                </span>
                <span className="text-[10px] font-mono text-slate-500">Administrator</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#07090E]/60">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-8">
                {/* Header Banner */}
                <div className="relative rounded-2xl glass-card p-6 sm:p-8 border border-slate-800 overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 mb-2">
                        <Sparkles size={12} />
                        <span>CENTURION UNIVERSITY PORTAL</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-heading font-black text-slate-100">
                        Project Status & Overview
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                        Real-time status of Team 03's Video Resume components, assets, and storage.
                      </p>
                    </div>

                    <button
                      onClick={fetchAllData}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                      <span>Refresh Metrics</span>
                    </button>
                  </div>
                </div>

                {/* 4 Overview Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Card 1: CVs */}
                  <div 
                    onClick={() => handleSelectTab('cvs')}
                    className="rounded-2xl glass-card p-5 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                        <FileText size={20} />
                      </div>
                      <span className="text-xs font-mono text-slate-400">Target: 3</span>
                    </div>
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Total CVs</span>
                    <div className="text-2xl font-heading font-black text-slate-100 mt-1 flex items-baseline gap-2">
                      <span>{stats?.cvs.uploaded ?? 0} / 3</span>
                      <span className="text-xs font-mono text-amber-400">Uploaded</span>
                    </div>
                    {/* Progress */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${stats?.cvs.percent ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Card 2: Raw Videos */}
                  <div 
                    onClick={() => handleSelectTab('rawVideos')}
                    className="rounded-2xl glass-card p-5 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                        <Film size={20} />
                      </div>
                      <span className="text-xs font-mono text-slate-400">Target: 2</span>
                    </div>
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Raw Videos</span>
                    <div className="text-2xl font-heading font-black text-slate-100 mt-1 flex items-baseline gap-2">
                      <span>{Math.min(stats?.rawVideos.uploaded ?? 0, 2)} / 2</span>
                      <span className="text-xs font-mono text-cyan-400">Uploaded</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                      <div 
                        className="h-full bg-cyan-400 transition-all duration-500"
                        style={{ width: `${Math.min(Math.round(((stats?.rawVideos.uploaded ?? 0) / 2) * 100), 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Card 3: Final Video */}
                  <div 
                    onClick={() => handleSelectTab('finalVideo')}
                    className="rounded-2xl glass-card p-5 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                        <Award size={20} />
                      </div>
                      <span className="text-xs font-mono text-slate-400">Master</span>
                    </div>
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Final Video</span>
                    <div className="text-2xl font-heading font-black text-slate-100 mt-1 flex items-baseline gap-2">
                      <span>{stats?.finalVideo.status || 'Pending'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 text-xs font-mono text-slate-400">
                      {stats?.finalVideo.uploaded ? (
                        <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12} /> Ready</span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1"><Clock size={12} /> Needs Upload</span>
                      )}
                    </div>
                  </div>

                  {/* Card 4: System Status */}
                  <div className="rounded-2xl glass-card p-5 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Server size={20} />
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Live
                      </span>
                    </div>
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">System Status</span>
                    <div className="text-2xl font-heading font-black text-slate-100 mt-1">
                      Online
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-3 truncate">
                      Engine: {stats?.system.storageEngine || 'Persistent'}
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleSelectTab('cvs')}
                    className="p-4 rounded-xl glass-card border border-slate-800/80 hover:border-amber-500/40 text-left transition-all group"
                  >
                    <h4 className="font-heading font-bold text-slate-200 group-hover:text-amber-300 text-sm">
                      Manage CVs →
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Upload and review PDF resumes for Shubham, Priyatam & Jisu.
                    </p>
                  </button>

                  <button
                    onClick={() => handleSelectTab('rawVideos')}
                    className="p-4 rounded-xl glass-card border border-slate-800/80 hover:border-cyan-500/40 text-left transition-all group"
                  >
                    <h4 className="font-heading font-bold text-slate-200 group-hover:text-cyan-300 text-sm">
                      Manage Raw Videos →
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure behind-the-scenes recording clips 01, 02, and 03.
                    </p>
                  </button>

                  <button
                    onClick={() => handleSelectTab('qrCodes')}
                    className="p-4 rounded-xl glass-card border border-slate-800/80 hover:border-amber-500/40 text-left transition-all group"
                  >
                    <h4 className="font-heading font-bold text-slate-200 group-hover:text-amber-300 text-sm">
                      Download QR Codes →
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Export HD dynamic PNG QR codes for poster and print presentations.
                    </p>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'cvs' && (
              <CvManager
                cvs={cvs}
                onRefresh={fetchAllData}
                onPreviewCv={onPreviewCv}
              />
            )}

            {activeTab === 'rawVideos' && (
              <RawVideoManager
                videos={rawVideos}
                onRefresh={fetchAllData}
                onPreviewVideo={onPreviewVideo}
              />
            )}

            {activeTab === 'finalVideo' && (
              <FinalVideoManager
                finalVideo={finalVideo}
                onRefresh={fetchAllData}
                onPreviewVideo={onPreviewVideo}
              />
            )}

            {activeTab === 'qrCodes' && (
              <QrCodeManager
                rawQr={rawQr}
                finalQr={finalQr}
                rawVideos={rawVideos}
                finalVideo={finalVideo}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
