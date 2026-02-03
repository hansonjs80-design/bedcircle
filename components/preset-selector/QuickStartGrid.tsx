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
      <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
        <Plus className="w-3.5 h-3.5" />
        단일 치료 즉시 시작 (Quick Start)
      </p>
      <div className="grid grid-cols-3 gap-2">
        {quickTreatments.map((item) => (
          <button
            key={item.id}
            onClick={() => onQuickStart(item)}
            className="flex flex-col items-center justify-center py-3 px-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all active:scale-95 group"
          >
            <span className="text-sm font-black text-gray-800 dark:text-gray-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">{item.label}</span>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">{item.duration}분</span>
            <div className={`w-4 h-1 rounded-full mt-1.5 ${item.color}`} />
          </button>
        ))}
      </div>
    </div>
  );
};