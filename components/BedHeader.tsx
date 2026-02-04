import React, { memo } from 'react';
import { CheckCircle, Settings, Pause, Play } from 'lucide-react';
import { BedState, BedStatus, TreatmentStep } from '../types';
import { formatTime } from '../utils/bedUtils';
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
  
  const isOvertime = bed.status === BedStatus.ACTIVE && !!currentStep?.enableTimer && bed.remainingTime <= 0;
  const isBedT = bed.id === 11;
  
  const handleTimerDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (bed.status !== BedStatus.ACTIVE || !currentStep?.enableTimer || !onUpdateDuration) return;

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

  // 헤더 배경색 결정 로직
  const getHeaderBgClass = () => {
    if (bed.status === BedStatus.COMPLETED) {
      return 'bg-gray-300/50 dark:bg-slate-800/50';
    }
    if (isBedT) {
      return 'bg-blue-300 dark:bg-blue-800 border-b-blue-400 dark:border-b-blue-700';
    }
    return 'bg-gray-50 dark:bg-slate-700';
  };

  return (
    <div className={`h-8 sm:h-12 landscape:h-[28px] sm:landscape:h-[30px] lg:landscape:h-11 w-full flex items-center px-1.5 sm:px-2 border-b border-black/10 shrink-0 gap-1 sm:gap-2 relative transition-colors ${getHeaderBgClass()}`}>
      {/* 
        Bed ID Indicator
        - Double Click to Move Patient
      */}
      <div 
        className="flex items-center justify-center min-w-[1.5rem] sm:min-w-[3rem] h-full -ml-0.5 landscape:-ml-3 lg:landscape:-ml-0.5 cursor-pointer touch-manipulation active:scale-95 transition-transform select-none"
        onDoubleClick={handleBedNumberDoubleClick}
        title="더블클릭하여 환자 이동"
      >
        <span className={`font-black leading-none tracking-tighter ${
           bed.status === BedStatus.COMPLETED 
           ? 'text-gray-400 dark:text-gray-600' 
           : isBedT 
             ? 'text-blue-900 dark:text-blue-100'
             : 'text-slate-900 dark:text-white'
        } text-lg sm:text-4xl landscape:text-sm sm:landscape:text-base lg:landscape:text-2xl`}>
          {isBedT ? 'T' : bed.id}
        </span>
      </div>

      <div className="flex-1 flex items-center gap-1 sm:gap-2 min-w-0">
        {bed.status === BedStatus.ACTIVE && currentStep?.enableTimer && (
          <>
             <div 
               onDoubleClick={handleTimerDoubleClick}
               className={`flex items-center gap-0.5 font-mono font-black text-lg sm:text-4xl landscape:text-sm sm:landscape:text-base lg:landscape:text-2xl leading-none cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 rounded px-1 py-0.5 select-none transition-colors touch-manipulation ${
                 isOvertime ? 'animate-pulse text-red-600 dark:text-red-500' : isBedT ? 'text-blue-900 dark:text-blue-100' : 'text-slate-800 dark:text-slate-200'
               } ${bed.isPaused ? 'opacity-40 grayscale-[0.5]' : ''}`}
               title="더블클릭하여 시간 수정"
             >
               {isOvertime ? <span>+{formatTime(bed.remainingTime)}</span> : <span>{formatTime(bed.remainingTime)}</span>}
             </div>

             <button 
               onClick={handleTogglePause}
               className={`p-0.5 sm:p-2 rounded-lg transition-all active:scale-90 flex items-center justify-center ${
                 bed.isPaused 
                   ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' 
                   : isBedT 
                     ? 'text-blue-700 hover:text-blue-900 hover:bg-blue-100/50' 
                     : 'text-gray-400 hover:text-brand-600 hover:bg-brand-50'
               }`}
             >
               {bed.isPaused ? (
                 <Play className="w-3.5 h-3.5 sm:w-6 sm:h-6 fill-current" />
               ) : (
                 <Pause className="w-3.5 h-3.5 sm:w-6 sm:h-6 fill-current" />
               )}
             </button>
          </>
        )}
         {bed.status === BedStatus.COMPLETED && (
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-bold text-[10px] sm:text-base landscape:text-[9px] sm:landscape:text-[10px] lg:landscape:text-xs bg-slate-200/50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
             <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5" />
             <span>완료</span>
          </div>
        )}
      </div>

      {bed.status !== BedStatus.IDLE && (
        <div className="flex items-center gap-0.5 sm:gap-2 lg:landscape:ml-[20px]">
          <button 
             onClick={(e) => { e.stopPropagation(); onEditClick?.(bed.id); }}
             className={`p-1 sm:p-2 rounded-lg transition-all duration-200 active:scale-90 ${
               isBedT 
                 ? 'text-blue-600 hover:text-blue-900 hover:bg-blue-100/50' 
                 : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-600'
             }`}
          >
             <Settings className="w-3.5 h-3.5 sm:w-6 sm:h-6" />
          </button>

          <BedTrashButton trashState={trashState} onClick={onTrashClick} />
        </div>
      )}
    </div>
  );
});