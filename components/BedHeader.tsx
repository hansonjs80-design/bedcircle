
import React, { memo } from 'react';
import { CheckCircle, Settings, Pause, Play } from 'lucide-react';
import { BedState, BedStatus, TreatmentStep } from '../types';
import { formatTime } from '../utils/bedUtils';
import { getBedHeaderStyles, getBedNumberColor } from '../utils/styleUtils';
import { BedTrashButton } from './BedTrashButton';
import { useTreatmentContext } from '../contexts/TreatmentContext';

interface BedHeaderProps {
  bed: BedState;
  currentStep: TreatmentStep | undefined;
  onTrashClick: (e: React.MouseEvent) => void;
  trashState: 'idle' | 'confirm' | 'deleting';
  onEditClick?: (id: number) => void;
  onTogglePause?: (id: number) => void;
  onUpdateDuration?: (id: number, duration: number) => void;
}

export const BedHeader = memo(({ bed, currentStep, onTrashClick, trashState, onEditClick, onTogglePause, onUpdateDuration }: BedHeaderProps) => {
  const { setMovingPatientState } = useTreatmentContext();
  
  const isTimerActive = bed.status === BedStatus.ACTIVE && !!currentStep?.enableTimer;
  const isOvertime = isTimerActive && bed.remainingTime <= 0;
  // 1분 미만 (0초 초과, 60초 미만) 조건 추가
  const isNearEnd = isTimerActive && bed.remainingTime > 0 && bed.remainingTime < 60;
  
  const isBedT = bed.id === 11;
  
  const handleTimerDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isTimerActive || !onUpdateDuration) return;

    const currentMinutes = Math.ceil(Math.max(0, bed.remainingTime) / 60);
    const newMinutesStr = prompt("타이머 시간 수정 (분):", currentMinutes.toString());
    
    if (newMinutesStr !== null) {
      const newMinutes = parseInt(newMinutesStr.trim());
      if (!isNaN(newMinutes) && newMinutes > 0) {
        onUpdateDuration(bed.id, newMinutes * 60);
      }
    }
  };

  const handleTogglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePause?.(bed.id);
  };

  const handleBedNumberDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Capture coordinates for smart positioning
    setMovingPatientState({
        bedId: bed.id,
        x: e.clientX,
        y: e.clientY
    });
  };

  return (
    <div className={`h-8 sm:h-12 landscape:h-[34px] sm:landscape:h-[30px] lg:landscape:h-11 w-full flex items-center px-2 sm:px-2 border-b border-black/10 shrink-0 gap-2 sm:gap-2 relative transition-colors ${getBedHeaderStyles(bed)}`}>
      {/* 
        Bed ID Indicator
        - Double Click to Move Patient
        - Mobile Portrait: Shifted 5px left (-translate-x-[5px])
        - Mobile Landscape: Shifted 8px left (-translate-x-[8px])
        - Font Size: Landscape increased to text-3xl
      */}
      <div 
        className="flex items-center justify-center min-w-[2rem] sm:min-w-[3rem] h-full -ml-0.5 landscape:-ml-3 lg:landscape:-ml-0.5 cursor-pointer touch-manipulation active:scale-95 transition-transform select-none -translate-x-[5px] sm:translate-x-0 landscape:-translate-x-[8px] lg:landscape:translate-x-0"
        onDoubleClick={handleBedNumberDoubleClick}
        title="더블클릭하여 환자 이동"
      >
        <span className={`font-black leading-none tracking-tighter ${getBedNumberColor(bed)} text-2xl sm:text-4xl landscape:text-3xl sm:landscape:text-base lg:landscape:text-2xl`}>
          {isBedT ? 'T' : bed.id}
        </span>
      </div>

      <div className="flex-1 flex items-center gap-1 sm:gap-2 min-w-0">
        {isTimerActive && (
          <>
             {/* Timer Display: 
                 - Portrait: Shifted 5px left (-translate-x-[5px]) 
                 - Landscape: Shifted 10px left (-translate-x-[10px]), Text Increased (text-3xl)
                 - Color changed based on time remaining:
                   1. Overtime (<= 0): Red + Pulse
                   2. Near End (< 60s): Light Red (text-red-400)
                   3. Normal: Gray
             */}
             <div 
               onDoubleClick={handleTimerDoubleClick}
               className={`flex items-center gap-0.5 font-mono font-black text-xl sm:text-4xl landscape:text-3xl sm:landscape:text-base lg:landscape:text-2xl leading-none cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 rounded px-1 py-0.5 select-none transition-colors touch-manipulation -translate-x-[5px] sm:translate-x-0 landscape:-translate-x-[10px] lg:landscape:translate-x-0 ${
                 isOvertime ? 'animate-pulse text-red-600 dark:text-red-500' : 
                 isNearEnd ? 'text-red-400 dark:text-red-300' :
                 'text-gray-500 dark:text-gray-400'
               } ${bed.isPaused ? 'opacity-40 grayscale-[0.5]' : ''}`}
               title="더블클릭하여 시간 수정"
             >
               {isOvertime ? <span>+{formatTime(bed.remainingTime)}</span> : <span>{formatTime(bed.remainingTime)}</span>}
             </div>

             {/* Pause Button: 
                 - Portrait: Shifted 8px left (-translate-x-[8px])
                 - Landscape: Shifted 10px left (-translate-x-[10px])
             */}
             <button 
               onClick={handleTogglePause}
               className={`p-1 landscape:p-0.5 sm:p-2 rounded-lg transition-all active:scale-90 flex items-center justify-center -translate-x-[8px] sm:translate-x-0 landscape:-translate-x-[10px] lg:landscape:translate-x-0 ${
                 bed.isPaused 
                   ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' 
                   : isBedT 
                     ? 'text-blue-700 hover:text-blue-900 hover:bg-blue-100/50' 
                     : 'text-gray-400 hover:text-brand-600 hover:bg-brand-50'
               }`}
             >
               {bed.isPaused ? (
                 <Play className="w-4 h-4 landscape:w-4 landscape:h-4 sm:w-6 sm:h-6 lg:landscape:w-6 lg:landscape:h-6 fill-current" />
               ) : (
                 <Pause className="w-4 h-4 landscape:w-4 landscape:h-4 sm:w-6 sm:h-6 lg:landscape:w-6 lg:landscape:h-6 fill-current" />
               )}
             </button>
          </>
        )}
         {bed.status === BedStatus.COMPLETED && (
          <div className="flex items-center gap-1 text-white font-bold text-xs sm:text-base landscape:text-[11px] sm:landscape:text-[10px] lg:landscape:text-xs bg-red-600 dark:bg-red-600 px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
             <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
             <span>완료</span>
          </div>
        )}
      </div>

      {bed.status !== BedStatus.IDLE && (
        <div className="flex items-center gap-0.5 sm:gap-2 lg:landscape:ml-[20px]">
          {/* Settings Button: 
              - Portrait: Shifted 5px right (translate-x-[5px])
              - Landscape: Shifted 8px right (translate-x-[8px])
          */}
          <button 
             onClick={(e) => { e.stopPropagation(); onEditClick?.(bed.id); }}
             className={`p-1.5 landscape:p-1 sm:p-2 rounded-lg transition-all duration-200 active:scale-90 translate-x-[5px] sm:translate-x-0 landscape:translate-x-[8px] lg:landscape:translate-x-0 ${
               isBedT 
                 ? 'text-blue-600 hover:text-blue-900 hover:bg-blue-100/50' 
                 : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-600'
             }`}
          >
             <Settings className="w-4 h-4 landscape:w-4 landscape:h-4 sm:w-6 sm:h-6 lg:landscape:w-6 lg:landscape:h-6" />
          </button>

          <BedTrashButton trashState={trashState} onClick={onTrashClick} />
        </div>
      )}
    </div>
  );
});
    