
import { BedState, BedStatus, TreatmentStep } from '../types';

// --- Bed Header Styles ---

export const getBedHeaderStyles = (bed: BedState): string => {
  const isBedT = bed.id === 11;

  // 1. 완료 상태 (최우선)
  if (bed.status === BedStatus.COMPLETED) {
    return 'bg-gray-300/50 dark:bg-slate-800/50';
  }
  
  // 2. 견인 치료기 (Bed T)
  if (isBedT) {
    return 'bg-blue-300 dark:bg-blue-800 border-b-blue-400 dark:border-b-blue-700';
  }

  // 3. 번호별 색상 그룹
  // 1, 2번: 연한 하늘색
  if (bed.id === 1 || bed.id === 2) {
    return 'bg-sky-100 dark:bg-sky-900/30';
  }
  // 3, 4, 9, 10번: 연한 주황색
  if (bed.id === 3 || bed.id === 4 || bed.id === 9 || bed.id === 10) {
    return 'bg-orange-100 dark:bg-orange-900/30';
  }
  // 5, 6, 7, 8번: 연한 녹색
  if (bed.id >= 5 && bed.id <= 8) {
    return 'bg-emerald-100 dark:bg-emerald-900/30';
  }

  // 4. 기본 (그 외)
  return 'bg-gray-50 dark:bg-slate-700';
};

export const getBedNumberColor = (bed: BedState): string => {
  const isBedT = bed.id === 11;
  if (bed.status === BedStatus.COMPLETED) {
    return 'text-gray-400 dark:text-gray-600';
  }
  if (isBedT) {
    return 'text-blue-900 dark:text-blue-100';
  }
  return 'text-slate-900 dark:text-white';
};

// --- Bed Step Styles ---

export const getStepColor = (
  step: TreatmentStep, 
  isActive: boolean, 
  isPast: boolean, 
  isInQueue: boolean, 
  isCompleted: boolean
): string => {
  if (isCompleted) {
    return 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-slate-400 border-gray-400 dark:border-slate-500';
  }

  if (isPast) return 'bg-gray-600 dark:bg-slate-700 text-white dark:text-gray-300 border-gray-700 dark:border-slate-600';
  
  if (isActive) {
    if (step.color.startsWith('bg-[#')) {
        return `${step.color} text-white border-black/10`;
    }

    if (step.color.includes('red')) return 'bg-red-500 text-white border-red-600';
    if (step.color.includes('blue')) return 'bg-blue-500 text-white border-blue-600';
    if (step.color.includes('purple')) return 'bg-purple-500 text-white border-purple-600';
    if (step.color.includes('orange')) return 'bg-orange-500 text-white border-orange-600';
    if (step.color.includes('green')) return 'bg-emerald-500 text-white border-emerald-600';
    if (step.color.includes('pink')) return 'bg-pink-500 text-white border-pink-600';
    if (step.color.includes('cyan')) return 'bg-cyan-500 text-white border-cyan-600';
    if (step.color.includes('sky')) return 'bg-sky-500 text-white border-sky-600';
    if (step.color.includes('yellow')) return 'bg-yellow-500 text-white border-yellow-600';
    if (step.color.includes('violet')) return 'bg-violet-500 text-white border-violet-600';
    
    return 'bg-gray-800 text-white border-gray-900';
  }

  if (isInQueue) {
     return 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-slate-700';
  }

  return 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-slate-700';
};

// --- Helper: Convert Step BG Color to Text Color ---
export const mapBgToTextClass = (bgClass: string): string => {
  if (bgClass.startsWith('bg-[#')) {
     // For arbitrary colors, we can't easily guess contrast, default to brand or dark
     return 'text-gray-900 dark:text-white';
  }

  if (bgClass.includes('red')) return 'text-red-600 dark:text-red-400';
  if (bgClass.includes('blue')) return 'text-blue-600 dark:text-blue-400';
  if (bgClass.includes('green')) return 'text-emerald-600 dark:text-emerald-400';
  if (bgClass.includes('orange')) return 'text-orange-600 dark:text-orange-400';
  if (bgClass.includes('purple')) return 'text-purple-600 dark:text-purple-400';
  if (bgClass.includes('pink')) return 'text-pink-600 dark:text-pink-400';
  if (bgClass.includes('cyan')) return 'text-cyan-600 dark:text-cyan-400';
  if (bgClass.includes('yellow')) return 'text-yellow-600 dark:text-yellow-400';
  if (bgClass.includes('sky')) return 'text-sky-600 dark:text-sky-400';
  if (bgClass.includes('violet')) return 'text-violet-600 dark:text-violet-400';
  if (bgClass.includes('gray')) return 'text-gray-600 dark:text-gray-400';
  
  return 'text-gray-700 dark:text-gray-300';
};

// --- Bed Card Container Styles ---

export const getBedCardStyles = (bed: BedState, isOvertime: boolean): string => {
  let base = "relative flex flex-col h-full rounded-lg shadow-md border-[1.5px] border-black dark:border-slate-200 overflow-hidden select-none transition-all duration-300 ";
  // Height Logic Adjusted for Mobile Portrait Compactness and Mobile Landscape reduction
  // landscape: 320->310 (Reduced for status badge shrink), sm:landscape: 145->140 (Reduced for status badge shrink)
  // min-h-[128px] used to accommodate increased step/memo height (23+17+padding+footer)
  const heightClasses = "min-h-[128px] sm:min-h-[140px] landscape:min-h-[310px] sm:landscape:min-h-[140px] lg:landscape:min-h-[216px] ";

  const isBedT = bed.id === 11;

  let statusClasses = "";
  if (bed.status === BedStatus.COMPLETED) {
     statusClasses = "bg-gray-300 dark:bg-slate-700 grayscale-[0.2]";
  } else if (isOvertime) {
     statusClasses = "bg-white dark:bg-slate-800 border-red-500 dark:border-red-500 ring-2 ring-red-500 dark:ring-red-500 animate-pulse ";
  } else {
     if (isBedT) {
        statusClasses = "bg-blue-50/60 dark:bg-blue-900/10 ring-1 ring-blue-200/50 dark:ring-blue-900/30 ";
     } else {
        statusClasses = "bg-white dark:bg-slate-800 ";
     }
     
     if (bed.isInjection) statusClasses += 'ring-2 ring-red-100 dark:ring-red-900/20';
     else if (bed.isESWT) statusClasses += 'ring-2 ring-blue-100 dark:ring-blue-900/20';
     else if (bed.isManual) statusClasses += 'ring-2 ring-violet-100 dark:ring-violet-900/20';
     else if (bed.isFluid) statusClasses += 'ring-2 ring-cyan-100 dark:ring-cyan-900/20';
     else if (bed.isTraction && !isBedT) statusClasses += 'ring-2 ring-orange-100 dark:ring-orange-900/20';
  }

  return base + heightClasses + statusClasses;
};
