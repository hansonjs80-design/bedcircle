
import React, { memo, useState } from 'react';
import { TreatmentStep, BedStatus } from '../types';
import { getAbbreviation } from '../utils/bedUtils';
import { getStepColor } from '../utils/styleUtils';
import { PopupEditor } from './common/PopupEditor';

interface BedStepColumnProps {
  step: TreatmentStep;
  index: number;
  isActive: boolean;
  isPast: boolean;
  isCompleted: boolean;
  isSelectedForSwap: boolean;
  memo: string | undefined;
  bedId: number;
  onSwapRequest?: (id: number, idx: number) => void;
  onUpdateMemo?: (id: number, idx: number, val: string | null) => void;
}

export const BedStepColumn: React.FC<BedStepColumnProps> = memo(({
  step,
  index,
  isActive,
  isPast,
  isCompleted,
  isSelectedForSwap,
  memo,
  bedId,
  onSwapRequest,
  onUpdateMemo
}) => {
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const colorClass = getStepColor(step, isActive, isPast, false, isCompleted);

  const handleMemoDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onUpdateMemo) return;
    
    setIsEditingMemo(true);
  };

  const handleMemoSave = (val: string) => {
    if (onUpdateMemo) {
      onUpdateMemo(bedId, index, val === "" ? null : val);
    }
    setIsEditingMemo(false);
  };

  return (
    <>
      <div 
        className={`flex-1 flex flex-col h-full min-w-0 group/col relative transition-all ${isSelectedForSwap ? 'ring-2 ring-inset ring-brand-500 bg-brand-50/50 dark:bg-brand-900/20 z-10' : ''}`}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onSwapRequest && onSwapRequest(bedId, index);
        }}
      >
        {/* Top Half: Step Indicator */}
        <div 
          className={`
            flex-none h-[23px] sm:flex-1
            landscape:flex-none landscape:h-[25px] sm:landscape:h-[32px]
            lg:landscape:flex-none lg:landscape:h-[60%] 
            flex flex-col items-center justify-center p-0.5 relative overflow-hidden transition-all cursor-pointer ${colorClass}
            ${isSelectedForSwap ? 'opacity-90' : ''}
          `}
        >
            <span className={`font-black text-sm xs:text-base sm:text-3xl landscape:text-[12px] sm:landscape:text-base lg:landscape:text-xl text-center leading-none break-all px-0.5 ${isActive ? 'scale-110' : 'opacity-80'}`}>
              {getAbbreviation(step.name)}
            </span>
            
            {isActive && <div className="absolute bottom-0 w-full h-1 bg-white/50 animate-pulse" />}
            
            {isSelectedForSwap && (
              <div className="absolute inset-0 border-2 border-brand-400 border-dashed animate-pulse pointer-events-none" />
            )}
        </div>

        {/* Bottom Half: Memo Field */}
        <div 
          className="w-full h-[17px] sm:h-8 landscape:h-[16px] sm:landscape:h-[20px] lg:landscape:h-10 shrink-0 bg-gray-50 dark:bg-slate-800/90 border-t border-gray-200 dark:border-slate-700 flex items-center justify-center px-0.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group touch-manipulation select-none overflow-hidden"
          onDoubleClick={handleMemoDoubleClick}
        >
          {memo ? (
            <span className="text-[9px] sm:text-xs landscape:text-[10px] sm:landscape:text-[11px] lg:landscape:text-sm leading-none text-center font-bold text-gray-800 dark:text-gray-200 break-words line-clamp-2 w-full pointer-events-none px-0.5">
              {memo}
            </span>
          ) : (
            <span className="text-[10px] sm:text-sm text-gray-300 dark:text-slate-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none">
              +
            </span>
          )}
        </div>
      </div>

      {/* Memo Edit Popup (Centered) */}
      {isEditingMemo && (
        <PopupEditor
          title={`${getAbbreviation(step.name)} 메모 입력`}
          initialValue={memo || ""}
          type="text"
          centered={true}
          onConfirm={handleMemoSave}
          onCancel={() => setIsEditingMemo(false)}
        />
      )}
    </>
  );
});
