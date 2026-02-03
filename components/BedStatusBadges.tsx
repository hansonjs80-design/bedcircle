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
    <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 landscape:bottom-0.5 landscape:right-0.5 lg:landscape:bottom-1 lg:landscape:right-1 flex flex-wrap justify-end gap-1 z-20 pointer-events-none max-w-full sm:max-w-[80%] landscape:max-w-full scale-90 sm:scale-100 landscape:scale-[0.80] lg:landscape:scale-100 origin-bottom-right">
      {activeBadges.map((badge) => (
        <div 
          key={badge.label} 
          className={`flex items-center gap-1 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded shadow-sm border animate-in slide-in-from-right-2 ${badge.colorClass} ${badge.borderClass}`}
        >
          <span className="text-[9px] sm:text-[10px] lg:text-xs font-black">{badge.label}</span>
          <badge.icon className={`w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 ${badge.iconClass}`} />
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