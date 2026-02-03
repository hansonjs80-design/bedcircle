import React, { useState, useRef, useEffect } from 'react';
import { useHeaderScroll } from '../hooks/useHeaderScroll';
import { AppHeader } from './AppHeader';
import { BedLayoutContainer } from './BedLayoutContainer';
import { useTreatmentContext } from '../contexts/TreatmentContext';
import { GlobalModals } from './GlobalModals';
import { PatientLogPanel } from './PatientLogPanel';

export const MainLayout: React.FC = () => {
  const { beds, presets } = useTreatmentContext();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setDarkMode] = useState(false);
  const [isLogOpen, setLogOpen] = useState(false);
  
  const mainRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  useHeaderScroll(mainRef, headerRef);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-gray-100 dark:bg-slate-950 landscape:bg-transparent relative">
      {/* 
        Header Wrapper
        - Mobile: Absolute (Scroll-away)
        - Desktop (md+): Relative (Sticky/Fixed flow)
      */}
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
        />
      </div>

      {/* 
        Main Content Area Wrapper
        - Handles Split Layout for Desktop (Bed List | Patient Log)
      */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Bed List Container */}
        <main 
          ref={mainRef}
          className="
            flex-1 overflow-x-auto overflow-y-auto scroll-smooth touch-pan-x touch-pan-y overscroll-contain 
            bg-gray-200 dark:bg-slate-950 landscape:bg-transparent
            
            /* Base Padding (Mobile Portrait) */
            px-0 
            pt-[calc(3.5rem+env(safe-area-inset-top)+1rem)] 
            pb-[calc(env(safe-area-inset-bottom)+1.5rem)]
            
            /* Tablet/Large Phone Portrait */
            sm:px-2 
            
            /* Desktop/Tablet Defaults (md+) */
            md:p-4 
            md:pt-2 
            
            /* Mobile Landscape Overrides */
            landscape:px-0 
            landscape:pt-[calc(2.5rem+env(safe-area-inset-top))]
            landscape:pb-[env(safe-area-inset-bottom)]
            
            /* 
              Critical Fix: MD+ Landscape (e.g. iPhone Max, Tablets) 
              - Reset horizontal padding to 0 to remove gray bars
              - Reset top padding to 2 (0.5rem) since header is relative here
            */
            md:landscape:px-0
            md:landscape:pt-2
            md:landscape:pb-[env(safe-area-inset-bottom)]
          "
        >
          <BedLayoutContainer beds={beds} presets={presets} />
        </main>

        {/* Right: Patient Log Sidebar (Visible only on XL screens e.g., 1280px+) */}
        {/* Width increased by ~10% (400->440, 460->506) to fit Memo column */}
        <aside className="hidden xl:block w-[440px] 2xl:w-[506px] shrink-0 h-full relative z-30">
           <PatientLogPanel />
        </aside>

        {/* Mobile/Tablet Patient Log Overlay (Visible on < XL screens) */}
        {/* Changed to fixed z-[100] to cover everything including header */}
        <div className={`
          fixed inset-0 z-[100] bg-white dark:bg-slate-900 transition-transform duration-300 xl:hidden flex flex-col
          ${isLogOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
           <div className="flex-1 w-full h-full relative pb-[env(safe-area-inset-bottom)]">
              {/* Padding handled inside PatientLogHeader for top safe area */}
              <PatientLogPanel onClose={() => setLogOpen(false)} />
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