
import React from 'react';
import { Syringe, Hand, Zap, ArrowUpFromLine, Droplet } from 'lucide-react';
import { BedState } from '../../types';

interface BedEditFlagsProps {
  bed: BedState;
  onToggleInjection?: (bedId: number) => void;
  onToggleFluid?: (bedId: number) => void;
  onToggleManual?: (bedId: number) => void;
  onToggleESWT?: (bedId: number) => void;
  onToggleTraction?: (bedId: number) => void;
}

export const BedEditFlags: React.FC<BedEditFlagsProps> = ({ 
  bed, 
  onToggleInjection, 
  onToggleFluid,
  onToggleManual, 
  onToggleESWT, 
  onToggleTraction 
}) => {
  return (
    <div className="flex flex-col gap-1.5 shrink-0">
       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">상태 표시 (Status)</span>
       <div className="grid grid-cols-5 gap-1.5">
           {/* Injection Toggle */}
           <button 
             onClick={() => onToggleInjection && onToggleInjection(bed.id)}
             className={`flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer shadow-sm transition-all active:scale-95 ${bed.isInjection ? 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800' : 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-600 hover:bg-gray-50'}`}
           >
              <Syringe className={`w-4 h-4 mb-1 ${bed.isInjection ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`} />
              <span className={`text-[10px] font-bold leading-none ${bed.isInjection ? 'text-red-700 dark:text-red-200' : 'text-gray-500'}`}>주사</span>
              <div className={`w-1 h-1 rounded-full mt-1 ${bed.isInjection ? 'bg-red-500' : 'bg-transparent'}`} />
           </button>

           {/* Fluid Toggle */}
           <button 
             onClick={() => onToggleFluid && onToggleFluid(bed.id)}
             className={`flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer shadow-sm transition-all active:scale-95 ${bed.isFluid ? 'bg-cyan-50 border-cyan-200 dark:bg-cyan-900/30 dark:border-cyan-800' : 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-600 hover:bg-gray-50'}`}
           >
              <Droplet className={`w-4 h-4 mb-1 ${bed.isFluid ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-400'}`} />
              <span className={`text-[10px] font-bold leading-none ${bed.isFluid ? 'text-cyan-700 dark:text-cyan-200' : 'text-gray-500'}`}>수액</span>
              <div className={`w-1 h-1 rounded-full mt-1 ${bed.isFluid ? 'bg-cyan-500' : 'bg-transparent'}`} />
           </button>

           {/* Manual Therapy (Do-su) Toggle */}
           <button 
             onClick={() => onToggleManual && onToggleManual(bed.id)}
             className={`flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer shadow-sm transition-all active:scale-95 ${bed.isManual ? 'bg-violet-50 border-violet-200 dark:bg-violet-900/30 dark:border-violet-800' : 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-600 hover:bg-gray-50'}`}
           >
              <Hand className={`w-4 h-4 mb-1 ${bed.isManual ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400'}`} />
              <span className={`text-[10px] font-bold leading-none ${bed.isManual ? 'text-violet-700 dark:text-violet-200' : 'text-gray-500'}`}>도수</span>
              <div className={`w-1 h-1 rounded-full mt-1 ${bed.isManual ? 'bg-violet-500' : 'bg-transparent'}`} />
           </button>

           {/* ESWT Toggle */}
           <button 
             onClick={() => onToggleESWT && onToggleESWT(bed.id)}
             className={`flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer shadow-sm transition-all active:scale-95 ${bed.isESWT ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800' : 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-600 hover:bg-gray-50'}`}
           >
              <Zap className={`w-4 h-4 mb-1 ${bed.isESWT ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
              <span className={`text-[10px] font-bold leading-none ${bed.isESWT ? 'text-blue-700 dark:text-blue-200' : 'text-gray-500'}`}>충격파</span>
              <div className={`w-1 h-1 rounded-full mt-1 ${bed.isESWT ? 'bg-blue-500' : 'bg-transparent'}`} />
           </button>

           {/* Traction Toggle */}
           <button 
             onClick={() => onToggleTraction && onToggleTraction(bed.id)}
             className={`flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer shadow-sm transition-all active:scale-95 ${bed.isTraction ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800' : 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-600 hover:bg-gray-50'}`}
           >
              <ArrowUpFromLine className={`w-4 h-4 mb-1 ${bed.isTraction ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`} />
              <span className={`text-[10px] font-bold leading-none ${bed.isTraction ? 'text-orange-700 dark:text-orange-200' : 'text-gray-500'}`}>견인</span>
              <div className={`w-1 h-1 rounded-full mt-1 ${bed.isTraction ? 'bg-orange-500' : 'bg-transparent'}`} />
           </button>
       </div>
    </div>
  );
};