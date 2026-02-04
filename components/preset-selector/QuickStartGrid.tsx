
import React from 'react';
import { Plus } from 'lucide-react';
import { QuickTreatment } from '../../types';
import { useTreatmentContext } from '../../contexts/TreatmentContext';

interface QuickStartGridProps {
  onQuickStart: (template: QuickTreatment) => void;
}

export const QuickStartGrid: React.FC<QuickStartGridProps> = ({ onQuickStart }) => {
  const { quickTreatments } = useTreatmentContext();

  return (
    <div className="space-y-2">
      <p className="text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        단일 치료 (Quick Start)
      </p>
      {/* 
        Updated to grid-cols-6 for all devices (Mobile/Tablet/Desktop).
        Reduced gap to gap-1 on mobile for tighter fit.
      */}
      <div className="grid grid-cols-6 gap-1 sm:gap-2">
        {quickTreatments.map((item) => (
          <button
            key={item.id}
            onClick={() => onQuickStart(item)}
            className="flex flex-col items-center justify-center py-1.5 px-0.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all active:scale-95 group shadow-sm h-11 sm:h-14"
          >
            <span className="text-[9px] sm:text-xs font-black text-gray-700 dark:text-gray-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 truncate w-full text-center px-0.5 tracking-tight leading-none">
              {item.label}
            </span>
            <div className="flex items-center gap-0.5 mt-1">
               <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${item.color}`} />
               <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 dark:text-gray-500 leading-none">{item.duration}m</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
