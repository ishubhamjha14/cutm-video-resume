import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/common/Navbar';
import { ScrollIndicator } from './components/common/ScrollIndicator';
import { BackgroundOrbs } from './components/common/BackgroundOrbs';
import { HeroSection } from './components/sections/HeroSection';
import { CvSection } from './components/sections/CvSection';
import { RawVideosSection } from './components/sections/RawVideosSection';
import { FinalVideoSection } from './components/sections/FinalVideoSection';
import { CvViewerModal } from './components/viewers/CvViewerModal';
import { VideoPlayerModal } from './components/viewers/VideoPlayerModal';
import { PublicRawVideoPage } from './components/viewers/PublicRawVideoPage';
import { PublicFinalVideoPage } from './components/viewers/PublicFinalVideoPage';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard, AdminTabType } from './components/admin/AdminDashboard';
import { TeamMemberCV, RawVideoItem, FinalVideoItem, QrCodeResponse } from './types';
import { cvApi, videoApi, qrApi } from './services/api';
import { useAuth } from './context/AuthContext';

// Standard Route Constants
export const SECTION_PATHS = ['/', '/team-cvs', '/raw-videos', '/final-video'] as const;

export const ADMIN_TAB_TO_PATH: Record<AdminTabType, string> = {
  overview: '/admin',
  cvs: '/admin/cvs',
  rawVideos: '/admin/raw-videos',
  finalVideo: '/admin/final-video',
  qrCodes: '/admin/qr-codes',
};

export const PATH_TO_ADMIN_TAB: Record<string, AdminTabType> = {
  '/admin': 'overview',
  '/admin/': 'overview',
  '/admin/overview': 'overview',
  '/admin/cvs': 'cvs',
  '/admin/cv': 'cvs',
  '/admin/raw-videos': 'rawVideos',
  '/admin/raw': 'rawVideos',
  '/admin/rawVideos': 'rawVideos',
  '/admin/final-video': 'finalVideo',
  '/admin/final': 'finalVideo',
  '/admin/finalVideo': 'finalVideo',
  '/admin/qr-codes': 'qrCodes',
  '/admin/qr': 'qrCodes',
  '/admin/qrCodes': 'qrCodes',
};

export type RouteState =
  | { type: 'section'; sectionIndex: number; path: string }
  | { type: 'raw-viewer'; slotId: number; path: string }
  | { type: 'final-viewer'; path: string }
  | { type: 'admin'; tab: AdminTabType; path: string };

export function parseRouteFromLocation(): RouteState {
  const pathname = window.location.pathname.replace(/\/$/, '') || '/';
  const hash = window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '');

  // 1. Standalone Raw Viewer: /raw/1 or /raw/2 (or #raw/1)
  const rawMatch = pathname.match(/^\/raw\/([12])$/) || hash.match(/^raw\/([12])$/);
  if (rawMatch) {
    const slotId = Number(rawMatch[1]);
    return { type: 'raw-viewer', slotId, path: `/raw/${slotId}` };
  }

  // 2. Standalone Final Video Watch Viewer: /final-video/watch or /watch/final
  if (
    pathname === '/final-video/watch' ||
    pathname === '/watch/final' ||
    hash === 'final-video/watch' ||
    hash === 'watch/final'
  ) {
    return { type: 'final-viewer', path: '/final-video/watch' };
  }

  // 3. Admin routes: /admin, /admin/cvs, /admin/raw-videos, /admin/final-video, /admin/qr-codes
  if (pathname === '/admin' || pathname.startsWith('/admin/') || hash === 'admin' || hash.startsWith('admin/')) {
    const key = pathname.startsWith('/admin') ? pathname : `/${hash}`;
    const tab = PATH_TO_ADMIN_TAB[key] || 'overview';
    return { type: 'admin', tab, path: ADMIN_TAB_TO_PATH[tab] };
  }

  // 4. Main Section routes
  if (
    pathname === '/team-cvs' ||
    pathname === '/cvs' ||
    pathname === '/resumes' ||
    pathname === '/team' ||
    hash === 'team-cvs' ||
    hash === 'cvs' ||
    hash === 'resumes' ||
    hash === 'cv'
  ) {
    return { type: 'section', sectionIndex: 1, path: '/team-cvs' };
  }

  if (
    pathname === '/raw-videos' ||
    pathname === '/raw' ||
    pathname === '/uncut' ||
    hash === 'raw-videos' ||
    hash === 'raw'
  ) {
    return { type: 'section', sectionIndex: 2, path: '/raw-videos' };
  }

  if (
    pathname === '/final-video' ||
    pathname === '/final' ||
    pathname === '/final-video-resume' ||
    hash === 'final-video' ||
    hash === 'final'
  ) {
    return { type: 'section', sectionIndex: 3, path: '/final-video' };
  }

  // Default to Section 0 (Home)
  return { type: 'section', sectionIndex: 0, path: '/' };
}

export const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef<boolean>(false);

  // Active view states
  const [activeSection, setActiveSection] = useState<number>(() => {
    const r = parseRouteFromLocation();
    return r.type === 'section' ? r.sectionIndex : 0;
  });

  const [activeRawRouteSlot, setActiveRawRouteSlot] = useState<number | null>(() => {
    const r = parseRouteFromLocation();
    return r.type === 'raw-viewer' ? r.slotId : null;
  });

  const [isFinalViewerOpen, setIsFinalViewerOpen] = useState<boolean>(() => {
    const r = parseRouteFromLocation();
    return r.type === 'final-viewer';
  });

  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<AdminTabType>('overview');

  // Data states
  const [cvs, setCvs] = useState<TeamMemberCV[]>([]);
  const [rawVideos, setRawVideos] = useState<RawVideoItem[]>([]);
  const [finalVideo, setFinalVideo] = useState<FinalVideoItem | null>(null);
  const [rawQr, setRawQr] = useState<QrCodeResponse | null>(null);
  const [finalQr, setFinalQr] = useState<QrCodeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [selectedCv, setSelectedCv] = useState<TeamMemberCV | null>(null);
  const [isCvModalOpen, setIsCvModalOpen] = useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = useState<RawVideoItem | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  const { isAuthenticated } = useAuth();

  // Load project data
  const loadData = async () => {
    try {
      const [cvRes, rawRes, finalRes, rawQrRes, finalQrRes] = await Promise.all([
        cvApi.getAll(),
        videoApi.getRawVideos(),
        videoApi.getFinalVideo(),
        qrApi.getRawVideosQR(),
        qrApi.getFinalVideoQR(),
      ]);

      if (cvRes.success) setCvs(cvRes.data);
      if (rawRes.success) setRawVideos(rawRes.data);
      if (finalRes.success) setFinalVideo(finalRes.data);
      setRawQr(rawQrRes);
      setFinalQr(finalQrRes);
    } catch (err) {
      console.error('Error fetching project data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll container to section with retry for reliable initial render
  const scrollToContainerSection = useCallback((index: number, smooth: boolean = true) => {
    isProgrammaticScrollRef.current = true;

    const doScroll = () => {
      if (!containerRef.current) return;
      const height = containerRef.current.clientHeight || window.innerHeight;
      containerRef.current.scrollTo({
        top: index * height,
        behavior: smooth ? 'smooth' : 'auto',
      });
    };

    doScroll();
    requestAnimationFrame(doScroll);
    setTimeout(doScroll, 60);
    setTimeout(doScroll, 200);

    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 700);
  }, []);

  // Apply route state to UI
  const applyRoute = useCallback(
    (route: RouteState, isInitial: boolean = false) => {
      if (route.type === 'raw-viewer') {
        setActiveRawRouteSlot(route.slotId);
        setIsFinalViewerOpen(false);
        setIsAdminDashboardOpen(false);
        setIsAdminLoginOpen(false);
        return;
      }

      if (route.type === 'final-viewer') {
        setIsFinalViewerOpen(true);
        setActiveRawRouteSlot(null);
        setIsAdminDashboardOpen(false);
        setIsAdminLoginOpen(false);
        return;
      }

      if (route.type === 'admin') {
        setActiveRawRouteSlot(null);
        setIsFinalViewerOpen(false);
        setAdminTab(route.tab);
        if (isAuthenticated) {
          setIsAdminDashboardOpen(true);
          setIsAdminLoginOpen(false);
        } else {
          setIsAdminLoginOpen(true);
          setIsAdminDashboardOpen(false);
        }
        return;
      }

      // Section route: / or /team-cvs or /raw-videos or /final-video
      setActiveRawRouteSlot(null);
      setIsFinalViewerOpen(false);
      setIsAdminDashboardOpen(false);
      setIsAdminLoginOpen(false);
      setActiveSection(route.sectionIndex);

      scrollToContainerSection(route.sectionIndex, !isInitial);
    },
    [isAuthenticated, scrollToContainerSection]
  );

  // Central SPA navigation dispatcher
  const navigateTo = useCallback(
    (targetPath: string, options?: { replace?: boolean }) => {
      const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
      const cleanTarget = targetPath.replace(/\/$/, '') || '/';

      if (options?.replace) {
        window.history.replaceState(null, '', targetPath);
      } else if (currentPath !== cleanTarget || window.location.hash) {
        window.history.pushState(null, '', targetPath);
      }

      const nextRoute = parseRouteFromLocation();
      applyRoute(nextRoute, false);
    },
    [applyRoute]
  );

  // Initial load and popstate (Back/Forward) listener
  useEffect(() => {
    loadData();

    const handlePopState = () => {
      const route = parseRouteFromLocation();
      applyRoute(route, false);
    };

    window.addEventListener('popstate', handlePopState);

    // Run initial route apply
    const initialRoute = parseRouteFromLocation();
    applyRoute(initialRoute, true);

    return () => window.removeEventListener('popstate', handlePopState);
  }, [applyRoute]);

  // Handle scroll events on main container: replaceState only when section changes
  const handleScroll = () => {
    if (!containerRef.current || isProgrammaticScrollRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const height = containerRef.current.clientHeight || window.innerHeight;
    const newSection = Math.round(scrollTop / height);

    if (newSection !== activeSection && newSection >= 0 && newSection <= 3) {
      setActiveSection(newSection);
      // Synchronize URL in address bar without spamming history entries
      window.history.replaceState(null, '', SECTION_PATHS[newSection]);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeRawRouteSlot || isFinalViewerOpen) return;
      if (isCvModalOpen || isVideoModalOpen || isAdminLoginOpen || isAdminDashboardOpen) return;
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement).tagName?.toLowerCase())) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        const next = Math.min(activeSection + 1, 3);
        navigateTo(SECTION_PATHS[next]);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const prev = Math.max(activeSection - 1, 0);
        navigateTo(SECTION_PATHS[prev]);
      } else if (e.key === 'Home') {
        e.preventDefault();
        navigateTo(SECTION_PATHS[0]);
      } else if (e.key === 'End') {
        e.preventDefault();
        navigateTo(SECTION_PATHS[3]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeSection,
    activeRawRouteSlot,
    isFinalViewerOpen,
    isCvModalOpen,
    isVideoModalOpen,
    isAdminLoginOpen,
    isAdminDashboardOpen,
    navigateTo,
  ]);

  // Touch Swipe Gesture Detection for Mobile
  useEffect(() => {
    if (activeRawRouteSlot || isFinalViewerOpen) return;

    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY = e.changedTouches[0].screenY;
      const diff = touchStartY - touchEndY;
      const threshold = 60;

      if (isCvModalOpen || isVideoModalOpen || isAdminLoginOpen || isAdminDashboardOpen) return;

      if (diff > threshold) {
        const next = Math.min(activeSection + 1, 3);
        navigateTo(SECTION_PATHS[next]);
      } else if (diff < -threshold) {
        const prev = Math.max(activeSection - 1, 0);
        navigateTo(SECTION_PATHS[prev]);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [
    activeSection,
    activeRawRouteSlot,
    isFinalViewerOpen,
    isCvModalOpen,
    isVideoModalOpen,
    isAdminLoginOpen,
    isAdminDashboardOpen,
    navigateTo,
  ]);

  // Modals & Viewer Handlers
  const handleOpenCvModal = (cv: TeamMemberCV) => {
    setSelectedCv(cv);
    setIsCvModalOpen(true);
  };

  const handleOpenRawViewer = (slotId: number) => {
    navigateTo(`/raw/${slotId}`);
  };

  const handleBackToMainFromRaw = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('/raw-videos');
    }
  };

  const handleBackToMainFromFinal = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('/final-video');
    }
  };

  const handleAdminTrigger = () => {
    navigateTo('/admin');
  };

  const handleAdminTabChange = (tab: AdminTabType) => {
    setAdminTab(tab);
    navigateTo(ADMIN_TAB_TO_PATH[tab]);
  };

  const handleAdminClose = () => {
    setIsAdminDashboardOpen(false);
    setIsAdminLoginOpen(false);
    loadData();
    navigateTo(SECTION_PATHS[activeSection] || '/');
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoginOpen(false);
    setIsAdminDashboardOpen(true);
    navigateTo(ADMIN_TAB_TO_PATH[adminTab || 'overview']);
  };

  const handleAdminLoginClose = () => {
    setIsAdminLoginOpen(false);
    navigateTo(SECTION_PATHS[activeSection] || '/');
  };

  // If viewing standalone /final-video/watch or /watch/final
  if (isFinalViewerOpen) {
    return <PublicFinalVideoPage onBackToMain={handleBackToMainFromFinal} />;
  }

  // If viewing standalone /raw/1 or /raw/2
  if (activeRawRouteSlot) {
    return (
      <PublicRawVideoPage
        slotId={activeRawRouteSlot}
        onBackToMain={handleBackToMainFromRaw}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07090E] text-slate-100 select-none">
      {/* Dynamic Background Ambient Orbs */}
      <BackgroundOrbs />

      {/* Global Fixed Navbar */}
      <Navbar
        onOpenAdmin={handleAdminTrigger}
        activeSection={activeSection}
        onNavigate={(idx) => navigateTo(SECTION_PATHS[idx])}
      />

      {/* Right-Side Vertical Pagination Indicator */}
      <ScrollIndicator
        activeSection={activeSection}
        totalSections={4}
        onSelectSection={(idx) => navigateTo(SECTION_PATHS[idx])}
      />

      {/* Vertical Full-Screen Snap Container */}
      <main
        ref={containerRef}
        onScroll={handleScroll}
        className="snap-scroll-container"
      >
        {/* Page 1: Hero Section */}
        <HeroSection
          onExplore={() => navigateTo('/team-cvs')}
          onWatchVideo={() => navigateTo('/final-video')}
        />

        {/* Page 2: Team CVs / Resumes */}
        <CvSection
          cvs={cvs}
          isLoading={isLoading}
          onOpenCvModal={handleOpenCvModal}
        />

        {/* Page 3: Redesigned QR-First Raw Videos & Quick Access */}
        <RawVideosSection
          videos={rawVideos}
          onOpenRawViewer={handleOpenRawViewer}
        />

        {/* Page 4: Final Video Resume Showcase & Footer */}
        <FinalVideoSection
          finalVideo={finalVideo}
          qrData={finalQr}
        />
      </main>

      {/* Modals & Popups */}
      {/* 1. CV Document Viewer Modal */}
      <CvViewerModal
        isOpen={isCvModalOpen}
        onClose={() => setIsCvModalOpen(false)}
        cv={selectedCv}
      />

      {/* 2. Video Player Modal (for admin previews) */}
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        video={selectedVideo}
      />

      {/* 3. Admin Login Dialog */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={handleAdminLoginClose}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* 4. Admin Management Dashboard */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        currentTab={adminTab}
        onTabChange={handleAdminTabChange}
        onClose={handleAdminClose}
        onPreviewCv={handleOpenCvModal}
        onPreviewVideo={(vid) => {
          setSelectedVideo(vid);
          setIsVideoModalOpen(true);
        }}
      />
    </div>
  );
};
