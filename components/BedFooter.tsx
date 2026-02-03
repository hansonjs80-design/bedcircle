import React, { memo } from 'react';
import { SkipForward, SkipBack, CheckCircle } from 'lucide-react';
import { BedState, BedStatus, TreatmentStep } from '../types';

interface BedFooterProps {
  bed: BedState;
  steps: TreatmentStep[];
  onNext: (bedId: number) => void;
  onPrev?: (bedId: number) => void;
  onClear: (bedId: number) => void;
}

export const BedFooter = memo(({ bed, steps, onNext, onPrev, onClear }: BedFooterProps) => {
  const isLastStep = bed.currentStepIndex === (steps.length || 0) - 1;

  return (
    <div className="border-t border-black/10 shrink-0">
     {bed.status === BedStatus.COMPLETED ? (
       <button 
         onClick={() => onClear(bed.id)}
         className="w-full py-2 sm:py-3 landscape:py-1 lg:landscape:py-2 bg-slate-600 dark:bg-slate-600 text-white font-black text-[10px] sm:text-sm landscape:text-[8px] lg:landscape:text-xs hover:bg-slate-700 transition-colors uppercase tracking-widest whitespace-nowrap"
       >
         침상 비우기 (Clear)
       </button>
     ) : (
      <div className="flex w-full">
         <button 
           onClick={() => onPrev && onPrev(bed.id)}
           disabled={bed.currentStepIndex <= 0}
           className="w-[30%] py-2 sm:py-3 landscape:py-[2px] lg:landscape:py-2 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-bold text-[10px] sm:text-sm landscape:text-[8px] lg:landscape:text-xs flex items-center justify-center gap-1 hover:bg-gray-200 dark:hover:bg-slate-700 border-r border-gray-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
         >
           <SkipBack className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> 
           <span>이전</span>
         </button>
         
         <button 
           onClick={() => onNext(bed.id)}
           className={`flex-1 py-2 sm:py-3 landscape:py-[2px] lg:landscape:py-2 font-black text-[10px] sm:text-sm landscape:text-[8px] lg:landscape:text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
             isLastStep 
               ? 'bg-slate-800 text-white hover:bg-slate-900' 
               : 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800'
           }`}
         >
           {isLastStep ? (
             <>
               <CheckCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> <span>치료 완료</span>
             </>
           ) : (
             <>
               <SkipForward className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> <span>다음 단계</span>
             </>
           )}
         </button>
      </div>
     )}
    </div>
  );
}, (prevProps, nextProps) => {
  // CRITICAL OPTIMIZATION: Ignore timer ticks (remainingTime)
  const pBed = prevProps.bed;
  const nBed = nextProps.bed;

  return (
    pBed.id === nBed.id &&
    pBed.status === nBed.status &&
    pBed.currentStepIndex === nBed.currentStepIndex &&
    // Status flags might disable buttons or change styling in future, so we keep them
    pBed.isPaused === nBed.isPaused && 
    prevProps.steps === nextProps.steps
  );
});