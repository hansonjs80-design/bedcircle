
import React, { memo } from 'react';
import { Syringe, Hand, Zap, ArrowUpFromLine, Droplet, LucideIcon } from 'lucide-react';
import { BedState, BedStatus } from '../types';

interface BedStatusBadgesProps {
  bed: BedState;
}

interface BadgeConfig {
  key: keyof BedState;
  label: string;
  icon: LucideIcon;
  colorClass: string;
  iconClass: string;
  borderClass: string;
}

const BADGES: BadgeConfig[] = [
  { 
    key: 'isInjection', label: '주사', icon: Syringe, 
    colorClass: 'bg-red-100/90 dark:bg-red-900/90 text-red-700 dark:text-red-200', 
    iconClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-200 dark:border-red-800'
  },
  { 
    key: 'isFluid', label: '수액', icon: Droplet, 
    colorClass: 'bg-cyan-100/90 dark:bg-cyan-900/90 text-cyan-700 dark:text-cyan-200', 
    iconClass: 'text-cyan-600 dark:text-cyan-400',
    borderClass: 'border-cyan-200 dark:border-cyan-800'
  },
  { 
    key: 'isManual', label: '도수', icon: Hand, 
    colorClass: 'bg-violet-100/90 dark:bg-violet-900/90 text-violet-700 dark:text-violet-200', 
    iconClass: 'text-violet-600 dark:text-violet-400',
    borderClass: 'border-violet-200 dark:border-violet-800'
  },
  { 
    key: 'isESWT', label: '충격파', icon: Zap, 
    colorClass: 'bg-blue-100/90 dark:bg-blue-900/90 text-blue-700 dark:text-blue-200', 
    iconClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-200 dark:border-blue-800'
  },
  { 
    key: 'isTraction', label: '견인', icon: ArrowUpFromLine, 
    colorClass: 'bg-orange-100/90 dark:bg-orange-900/90 text-orange-700 dark:text-orange-200', 
    iconClass: 'text-orange-600 dark:text-orange-400',
    borderClass: 'border-orange-200 dark:border-orange-800'
  }
];

export const BedStatusBadges: React.FC<BedStatusBadgesProps> = memo(({ bed }) => {
  if (bed.status === BedStatus.IDLE) return null;
  
  const activeBadges = BADGES.filter(b => bed[b.key]);
  if (activeBadges.length === 0) return null;

  return (
    <div className={`
      flex flex-wrap justify-end gap-1 z-20 pointer-events-none
      
      /* Mobile Portrait (Default): Reduced height from 18px to 11px (~40%), removed vertical padding/margin */
      relative w-full px-1 py-0 min-h-[11px] mt-0 items-center
      
      /* Mobile Landscape (<640px): Reduced height by ~30% (30px -> 21px) */
      landscape:static landscape:w-full landscape:max-w-none landscape:scale-100 landscape:px-2 landscape:py-0 landscape:min-h-[21px] landscape:mt-0.5 landscape:items-center
      
      /* Tablet/Desktop Portrait (sm:): Standard Flow */
      sm:static sm:w-full sm:max-w-none sm:scale-100 sm:px-2 sm:py-1 sm:origin-center sm:mt-0 sm:min-h-0
      
      /* Mobile/Tablet Landscape (sm:landscape): Static below memo, Reduced height (18px -> 13px) */
      sm:landscape:static sm:landscape:w-full sm:landscape:px-2 sm:landscape:py-0 sm:landscape:min-h-[13px] sm:landscape:mt-0 sm:landscape:items-center
      
      /* Large Desktop Landscape (lg:landscape): Revert to Absolute Overlay */
      lg:landscape:absolute lg:landscape:bottom-1 lg:landscape:right-1 lg:landscape:w-auto lg:landscape:scale-100 lg:landscape:min-h-0
    `}>
      {activeBadges.map((badge) => (
        <div 
          key={badge.label} 
          className={`flex items-center gap-1 backdrop-blur-sm px-1.5 py-0.5 landscape:py-0 rounded shadow-sm border animate-in slide-in-from-right-2 ${badge.colorClass} ${badge.borderClass}`}
        >
          {/* Mobile Text: 10px (Reduced from 11px for compact fit) */}
          <span className="text-[10px] sm:text-xs font-black leading-tight">{badge.label}</span>
          {/* Mobile Icon: w-3 h-3 (Reduced from 3.5) */}
          <badge.icon className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 ${badge.iconClass}`} />
        </div>
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // CRITICAL OPTIMIZATION: Ignore timer ticks
  const pBed = prevProps.bed;
  const nBed = nextProps.bed;

  return (
    pBed.status === nBed.status &&
    pBed.isInjection === nBed.isInjection &&
    pBed.isFluid === nBed.isFluid &&
    pBed.isManual === nBed.isManual &&
    pBed.isESWT === nBed.isESWT &&
    pBed.isTraction === nBed.isTraction
  );
});
