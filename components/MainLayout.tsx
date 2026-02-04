
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Minimize } from 'lucide-react';
import { useHeaderScroll } from '../hooks/useHeaderScroll';
import { AppHeader } from './AppHeader';
import { BedLayoutContainer } from './BedLayoutContainer';
import { useTreatmentContext } from '../contexts/TreatmentContext';
import { GlobalModals } from './GlobalModals';

// Code Splitting for performance
const PatientLogPanel = React.lazy(() => import('./PatientLogPanel').then(module => ({ default: module.PatientLogPanel })));

export const MainLayout: React.FC = () => {
  const { beds, presets } = useTreatmentContext();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setDarkMode] = useState(false);
  const [isLogOpen, setLogOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const mainRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  useHeaderScroll(mainRef, headerRef);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Dynamic class generation for main content area to handle Full Screen transitions
  // Added +8px to top padding in full screen mode as requested
  const mainContentPadding = isFullScreen 
    ? 'pt-[calc(env(safe-area-inset-top)+8px)]' 
    : `
      pt-[calc(3.5rem+env(safe-area-inset-top)+1rem)] 
      landscape:pt-[calc(2.5rem+env(safe-area-inset-top))]
      md:pt-2 
      md:landscape:pt-2
    `;

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-gray-100 dark:bg-slate-950 landscape:bg-transparent relative">
      {/* 
        Header Wrapper
        - Mobile: Absolute (Scroll-away)
        - Desktop (md+): Relative (Sticky/Fixed flow)
        - Hidden when isFullScreen is true
      */}
      {!isFullScreen && (
        <div 
          ref={headerRef}
          className="
            w-full z-40 will-change-transform
            h-[calc(3.5rem+env(safe-area-inset-top))]
            landscape:h-[calc(2.5rem+env(safe-area-inset-top))]
            absolute top-0 left-0 right-0
            md:relative md:top-auto md:left-auto md:right-auto md:shrink-0
          "
        >
          <AppHeader 
            onOpenMenu={() => setMenuOpen(true)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setDarkMode(!isDarkMode)}
            onToggleLog={() => setLogOpen(prev => !prev)}
            onToggleFullScreen={() => setIsFullScreen(true)}
          />
        </div>
      )}

      {/* 
        Main Content Area Wrapper
        - Handles Split Layout for Desktop (Bed List | Patient Log)
      */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Bed List Container */}
        <main 
          ref={mainRef}
          className={`
            flex-1 overflow-x-auto overflow-y-auto scroll-smooth touch-pan-x touch-pan-y overscroll-contain 
            bg-gray-200 dark:bg-slate-950 landscape:bg-transparent
            
            /* Base Padding */
            px-0 
            ${mainContentPadding}
            pb-[calc(env(safe-area-inset-bottom)+1.5rem)]
            
            /* Tablet/Large Phone Portrait */
            sm:px-2 
            
            /* Desktop/Tablet Defaults (md+) */
            md:p-4 
            
            /* Mobile Landscape Overrides */
            landscape:px-0 
            landscape:pb-[env(safe-area-inset-bottom)]
            
            /* 
              Critical Fix: MD+ Landscape (e.g. iPhone Max, Tablets) 
              - Reset horizontal padding to 0 to remove gray bars
            */
            md:landscape:px-0
            md:landscape:pb-[env(safe-area-inset-bottom)]
          `}
        >
          <BedLayoutContainer beds={beds} presets={presets} />
        </main>

        {/* Exit Full Screen Button - Visible only in Full Screen Mode */}
        {isFullScreen && (
          <button
            onClick={() => setIsFullScreen(false)}
            className="fixed top-4 right-4 z-[60] p-2 bg-black/30 dark:bg-white/10 text-gray-500 dark:text-gray-300 hover:text-white hover:bg-black/50 dark:hover:bg-white/20 rounded-full backdrop-blur-md shadow-lg transition-all active:scale-95"
            title="전체 화면 종료"
          >
            <Minimize className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Right: Patient Log Sidebar (Visible only on XL screens e.g., 1280px+) */}
        {/* Hidden in Full Screen Mode */}
        <aside className={`hidden xl:block w-[440px] 2xl:w-[506px] shrink-0 h-full relative z-30 ${isFullScreen ? 'hidden' : ''}`}>
           <Suspense fallback={<div className="w-full h-full bg-white dark:bg-slate-900 animate-pulse" />}>
             <PatientLogPanel />
           </Suspense>
        </aside>

        {/* Mobile/Tablet Patient Log Overlay (Visible on < XL screens) */}
        <div className={`
          fixed inset-0 z-[100] bg-white dark:bg-slate-900 transition-transform duration-300 xl:hidden flex flex-col
          ${isLogOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
           <div className="flex-1 w-full h-full relative pb-[env(safe-area-inset-bottom)]">
             <Suspense fallback={<div className="w-full h-full bg-white dark:bg-slate-900 flex items-center justify-center"><span className="text-gray-400 font-bold">로딩 중...</span></div>}>
                <PatientLogPanel onClose={() => setLogOpen(false)} />
             </Suspense>
           </div>
        </div>
      </div>

      <GlobalModals 
        isMenuOpen={isMenuOpen} 
        onCloseMenu={() => setMenuOpen(false)} 
        presets={presets}
      />
    </div>
  );
};
