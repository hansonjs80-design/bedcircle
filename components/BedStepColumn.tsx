
import React, { memo, useState } from 'react';
import { TreatmentStep, BedStatus } from '../types';
import { getAbbreviation } from '../utils/bedUtils';
import { getStepColor } from '../utils/styleUtils';
import { PopupEditor } from './common/PopupEditor';
import { ArrowRightLeft } from 'lucide-react';

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
        className={`
          flex-1 flex flex-col h-full min-w-0 group/col relative transition-all duration-200
          ${isSelectedForSwap 
            ? 'z-20 scale-95 ring-4 ring-indigo-500 dark:ring-indigo-400 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)] bg-indigo-50 dark:bg-indigo-900/20 overflow-hidden' 
            : ''
          }
        `}
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
            
            {/* Explicit Swap Indicator Overlay */}
            {isSelectedForSwap && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] animate-pulse">
                 <ArrowRightLeft className="w-5 h-5 landscape:w-4 landscape:h-4 lg:landscape:w-6 lg:landscape:h-6 text-white drop-shadow-md" />
              </div>
            )}
        </div>

        {/* Bottom Half: Memo Field */}
        <div 
          className={`
            w-full h-[17px] sm:h-8 landscape:h-[16px] sm:landscape:h-[20px] lg:landscape:h-10 shrink-0 border-t flex items-center justify-center px-0.5 cursor-pointer transition-colors group touch-manipulation select-none overflow-hidden
            ${isSelectedForSwap 
                ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700' 
                : 'bg-gray-50 dark:bg-slate-800/90 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
            }
          `}
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
