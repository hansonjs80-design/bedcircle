import React from 'react';
import { ChevronUp, ChevronDown, X, Minus, Plus, Clock, RefreshCw } from 'lucide-react';
import { TreatmentStep } from '../../types';
import { ColorPicker } from '../common/ColorPicker';

interface BedEditStepRowProps {
  step: TreatmentStep;
  index: number;
  isActive: boolean;
  totalSteps: number;
  onMove: (idx: number, direction: 'up' | 'down') => void;
  onRemove: (idx: number) => void;
  onChange: (idx: number, updates: Partial<TreatmentStep>) => void;
  onDurationChange: (idx: number, changeMinutes: number) => void;
  onApplyDuration?: (duration: number) => void;
}

export const BedEditStepRow: React.FC<BedEditStepRowProps> = ({
  step,
  index,
  isActive,
  totalSteps,
  onMove,
  onRemove,
  onChange,
  onDurationChange,
  onApplyDuration
}) => {
  const minutes = Math.floor(step.duration / 60);

  const handleMinuteInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      const newDuration = val * 60;
      onChange(index, { duration: newDuration });
    }
  };

  return (
    <div className={`group flex flex-col gap-2 p-2 sm:p-3 rounded-xl border transition-all ${
      isActive 
        ? 'bg-blue-50/70 border-blue-200 shadow-sm dark:bg-blue-900/30 dark:border-blue-800' 
        : 'bg-white border-gray-100 hover:border-gray-200 dark:bg-slate-800 dark:border-slate-700'
    }`}>
      <div className="flex items-center gap-2.5">
        <div className="flex flex-col -space-y-0.5 shrink-0">
           <button 
             onClick={() => onMove(index, 'up')} 
             disabled={index === 0} 
             className="text-gray-300 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 disabled:opacity-20 transition-colors"
           >
             <ChevronUp className="w-4 h-4" strokeWidth={3} />
           </button>
           <button 
             onClick={() => onMove(index, 'down')} 
             disabled={index === totalSteps - 1} 
             className="text-gray-300 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 disabled:opacity-20 transition-colors"
           >
             <ChevronDown className="w-4 h-4" strokeWidth={3} />
           </button>
        </div>

        <div className={`flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-black shrink-0 shadow-sm ${
          isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400'
        }`}>
           {index + 1}
        </div>
        
        <div className="flex-1 min-w-0">
          <input 
            type="text" 
            value={step.name}
            onChange={(e) => onChange(index, { name: e.target.value })}
            className={`w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0 outline-none truncate ${
              isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'
            }`}
          />
        </div>

        {/* 시간 설정 UI (우측 -/+ 버튼 배치) */}
        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-900/40 rounded-lg p-1 border border-gray-100 dark:border-slate-700 shrink-0">
           <div className="flex items-center pl-1.5">
             <input 
               type="number" 
               value={minutes} 
               onChange={handleMinuteInput}
               className="w-7 text-right bg-transparent text-sm font-black text-gray-800 dark:text-gray-100 outline-none p-0 border-none focus:ring-0"
             />
             <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 ml-0.5">분</span>
           </div>
           
           <div className="flex items-center gap-1 ml-0.5">
             <button 
               onClick={() => onDurationChange(index, -1)} 
               className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-md text-gray-600 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-slate-600 active:scale-90 transition-all"
             >
               <Minus className="w-3.5 h-3.5" strokeWidth={3} />
             </button>
             <button 
               onClick={() => onDurationChange(index, 1)} 
               className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-md text-gray-600 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-slate-600 active:scale-90 transition-all"
             >
               <Plus className="w-3.5 h-3.5" strokeWidth={3} />
             </button>
           </div>
        </div>

        <button 
          onClick={() => onRemove(index)} 
          className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between pl-[44px] pr-1">
         <div className="flex items-center gap-2">
            {isActive && onApplyDuration && step.enableTimer && (
              <button 
                onClick={() => onApplyDuration(step.duration)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 text-white rounded-md text-[10px] font-bold shadow-md hover:bg-blue-700 active:scale-95 transition-all animate-pulse"
              >
                <RefreshCw className="w-3 h-3" />
                적용
              </button>
            )}
            
            <button
                onClick={() => onChange(index, { enableTimer: !step.enableTimer })}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${
                  step.enableTimer 
                    ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800' 
                    : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-100'
                }`}
            >
                <Clock className="w-3 h-3" />
                {step.enableTimer ? '타이머 ON' : '타이머 OFF'}
            </button>
         </div>

         <div className="min-w-[100px]">
             <ColorPicker 
                value={step.color}
                onChange={(color) => onChange(index, { color })}
             />
         </div>
      </div>
    </div>
  );
};