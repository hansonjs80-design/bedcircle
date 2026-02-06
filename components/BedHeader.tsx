
import React, { memo, useState } from 'react';
import { CheckCircle, Settings, Pause, Play } from 'lucide-react';
import { BedState, BedStatus, TreatmentStep } from '../types';
import { formatTime } from '../utils/bedUtils';
import { getBedHeaderStyles, getBedNumberColor } from '../utils/styleUtils';
import { BedTrashButton } from './BedTrashButton';
import { useTreatmentContext } from '../contexts/TreatmentContext';
import { PopupEditor } from './common/PopupEditor';

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
  
  // 팝업 에디터 상태
  const [isEditingTimer, setIsEditingTimer] = useState(false);

  const isTimerActive = bed.status === BedStatus.ACTIVE && !!currentStep?.enableTimer;
  const isOvertime = isTimerActive && bed.remainingTime <= 0;
  const isNearEnd = isTimerActive && bed.remainingTime > 0 && bed.remainingTime < 60;
  
  const isBedT = bed.id === 11;
  
  const handleTimerDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isTimerActive || !onUpdateDuration) return;

    setIsEditingTimer(true);
  };

  const handleTimerSave = (val: string) => {
    if (!onUpdateDuration) return;
    const newMinutes = parseInt(val.trim());
    if (!isNaN(newMinutes) && newMinutes > 0) {
      onUpdateDuration(bed.id, newMinutes * 60);
    }
    setIsEditingTimer(false);
  };

  const handleTogglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePause?.(bed.id);
  };

  const handleBedNumberDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setMovingPatientState({
        bedId: bed.id,
        x: e.clientX,
        y: e.clientY
    });
  };

  return (
    <>
      <div className={`h-8 sm:h-12 landscape:h-[34px] sm:landscape:h-[30px] lg:landscape:h-11 w-full flex items-center px-2 sm:px-2 border-b border-black/10 shrink-0 gap-2 sm:gap-2 relative transition-colors ${getBedHeaderStyles(bed)}`}>
        {/* Bed ID Indicator */}
        <div 
          className="flex items-center justify-center min-w-[2rem] sm:min-w-[3rem] h-full -ml-0.5 landscape:-ml-3 lg:landscape:-ml-0.5 cursor-pointer touch-manipulation active:scale-95 transition-transform select-none -translate-x-[5px] sm:-translate-x-2 landscape:-translate-x-[8px] lg:landscape:-translate-x-2"
          onDoubleClick={handleBedNumberDoubleClick}
          title="더블클릭하여 환자 이동"
        >
          <span className={`font-black leading-none tracking-tighter ${getBedNumberColor(bed)} text-2xl sm:text-4xl xl:text-5xl landscape:text-3xl sm:landscape:text-base lg:landscape:text-3xl`}>
            {isBedT ? 'T' : bed.id}
          </span>
        </div>

        <div className="flex-1 flex items-center gap-1 sm:gap-2 min-w-0">
          {isTimerActive && (
            <>
              {/* Timer Display */}
              <div 
                onDoubleClick={handleTimerDoubleClick}
                className={`flex items-center gap-0.5 font-mono font-black text-xl sm:text-4xl landscape:text-3xl sm:landscape:text-base lg:landscape:text-2xl leading-none cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 rounded px-1 py-0.5 select-none transition-colors touch-manipulation -translate-x-[10px] sm:-translate-x-[10px] landscape:-translate-x-[10px] lg:landscape:-translate-x-[10px] ${
                  isOvertime ? 'animate-pulse text-red-600 dark:text-red-500' : 
                  isNearEnd ? 'text-red-400 dark:text-red-300' :
                  'text-gray-500 dark:text-gray-400'
                } ${bed.isPaused ? 'opacity-40 grayscale-[0.5]' : ''}`}
                title="더블클릭하여 시간 수정"
              >
                {isOvertime ? <span>+{formatTime(bed.remainingTime)}</span> : <span>{formatTime(bed.remainingTime)}</span>}
              </div>

              {/* Pause Button */}
              <button 
                onClick={handleTogglePause}
                className={`p-1 landscape:p-0.5 sm:p-2 rounded-lg transition-all active:scale-90 flex items-center justify-center -translate-x-[13px] sm:-translate-x-[10px] landscape:-translate-x-[10px] lg:landscape:-translate-x-[10px] ${
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

      {/* Timer Edit Popup (Centered) */}
      {isEditingTimer && (
        <PopupEditor
          title={`${bed.id === 11 ? '견인치료기' : `${bed.id}번 배드`} 시간 설정`}
          initialValue={Math.ceil(Math.max(0, bed.remainingTime) / 60)}
          type="number"
          centered={true}
          suffix="분"
          onConfirm={handleTimerSave}
          onCancel={() => setIsEditingTimer(false)}
        />
      )}
    </>
  );
});
