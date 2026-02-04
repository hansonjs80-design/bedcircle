
import { BedState, BedStatus, Preset, TreatmentStep, QuickTreatment } from '../types';
import { STANDARD_TREATMENTS } from '../constants';

// --- Formatters ---

export const formatTime = (seconds: number): string => {
  const absSeconds = Math.abs(seconds);
  const m = Math.floor(absSeconds / 60);
  const s = absSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const getAbbreviation = (name: string): string => {
  const upper = name.toUpperCase();
  if (upper.includes('HOT PACK') || upper.includes('핫팩')) return 'HP';
  if (upper.includes('ICT')) return 'ICT';
  if (upper.includes('MAGNETIC') || upper.includes('자기장')) return 'Mg';
  if (upper.includes('TRACTION') || upper.includes('견인')) return '견인';
  if (upper.includes('IR') || upper.includes('적외선')) return 'IR';
  if (upper.includes('TENS')) return 'TENS';
  if (upper.includes('LASER') || upper.includes('레이저')) return 'La';
  if (upper.includes('SHOCKWAVE') || upper.includes('충격파')) return 'ESWT';
  if (upper.includes('EXERCISE') || upper.includes('운동')) return '운동';
  if (upper.includes('ION') || upper.includes('이온')) return 'ION';
  if (upper.includes('COLD') || upper.includes('콜드') || upper.includes('ICE')) return 'Ice';
  if (upper.includes('MICRO') || upper.includes('마이크로') || upper.includes('MW')) return 'MW';
  if (upper.includes('CRYO') || upper.includes('크라이오')) return 'Cryo';
  if (upper.includes('MANUAL') || upper.includes('도수')) return '도수';
  
  if (name.includes('(')) return name.split('(')[0].trim().substring(0, 3);
  return name.substring(0, 3);
};

export const generateTreatmentString = (steps: TreatmentStep[]) => {
  return steps.map(s => getAbbreviation(s.name)).join('/');
};

/**
 * Log String(e.g., "HP/ICT")을 분석하여 TreatmentStep 배열로 변환합니다.
 */
export const parseTreatmentString = (treatmentString: string | null, customTreatments: QuickTreatment[] = []): TreatmentStep[] => {
  if (!treatmentString) return [];

  const referenceList = customTreatments.length > 0 ? customTreatments : STANDARD_TREATMENTS;

  const parts = treatmentString.split('/').map(s => s.trim());
  const reconstructedSteps: TreatmentStep[] = [];
  
  for (const part of parts) {
      if (!part) continue;
      
      const match = referenceList.find(t => 
          t.label.toUpperCase() === part.toUpperCase() || 
          getAbbreviation(t.name).toUpperCase() === part.toUpperCase() ||
          t.name.toUpperCase().includes(part.toUpperCase())
      );

      if (match) {
          reconstructedSteps.push({
              id: crypto.randomUUID(),
              name: match.name,
              duration: match.duration * 60,
              enableTimer: match.enableTimer,
              color: match.color
          });
      } else {
          reconstructedSteps.push({
              id: crypto.randomUUID(),
              name: part,
              duration: 600, // Default 10 min
              enableTimer: true,
              color: 'bg-gray-500'
          });
      }
  }
  return reconstructedSteps;
};

/**
 * Log String과 일치하는 Preset을 찾거나 복원합니다.
 */
export const findMatchingPreset = (presets: Preset[], treatmentString: string | null): Preset | undefined => {
  if (!treatmentString) return undefined;

  // 1. Exact Match
  const exactMatch = presets.find(p => generateTreatmentString(p.steps) === treatmentString);
  if (exactMatch) return exactMatch;

  // 2. Reconstruct from string
  const reconstructedSteps = parseTreatmentString(treatmentString);

  if (reconstructedSteps.length > 0) {
      return {
          id: `restored-${Date.now()}`,
          name: '치료 구성 (수정)',
          steps: reconstructedSteps
      };
  }

  return undefined;
};

// --- Visual Logic ---

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

export const getBedCardStyles = (bed: BedState, isOvertime: boolean): string => {
  let base = "relative flex flex-col h-full rounded-lg shadow-md border-[1.5px] border-black dark:border-slate-200 overflow-hidden select-none transition-all duration-300 ";
  const heightClasses = "min-h-[144px] sm:min-h-[200px] landscape:min-h-[130px] sm:landscape:min-h-[130px] lg:landscape:min-h-[216px] ";

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
