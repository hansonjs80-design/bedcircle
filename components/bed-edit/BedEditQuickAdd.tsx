import React from 'react';
import { TreatmentStep, QuickTreatment } from '../../types';
import { Plus } from 'lucide-react';
import { useTreatmentContext } from '../../contexts/TreatmentContext';

interface BedEditQuickAddProps {
  bedId: number;
  steps: TreatmentStep[];
  onUpdateSteps?: (bedId: number, steps: TreatmentStep[]) => void;
}

export const BedEditQuickAdd: React.FC<BedEditQuickAddProps> = ({ bedId, steps, onUpdateSteps }) => {
  const { quickTreatments } = useTreatmentContext();

  const handleAddStandardStep = (template: QuickTreatment) => {
    if (!onUpdateSteps) return;
    const newStep: TreatmentStep = {
      id: crypto.randomUUID(),
      name: template.name,
      duration: template.duration * 60,
      enableTimer: template.enableTimer,
      color: template.color
    };
    onUpdateSteps(bedId, [...steps, newStep]);
  };

  const handleAddCustomStep = () => {
    if (!onUpdateSteps) return;
    const newStep: TreatmentStep = {
        id: crypto.randomUUID(),
        name: '직접 입력',
        duration: 10 * 60, // 10 min default
        enableTimer: true,
        color: 'bg-gray-500'
    };
    onUpdateSteps(bedId, [...steps, newStep]);
  };

  return (
    <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-slate-700 shrink-0">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1">
           <Plus className="w-3 h-3" />
           빠른 추가 (Quick Add)
        </span>
      </div>
      
      <div className="grid grid-cols-4 gap-1.5">
        {quickTreatments.map((item) => (
          <button
            key={item.id}
            onClick={() => handleAddStandardStep(item)}
            className="group flex flex-col items-center justify-center py-2 px-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-500/30 rounded-lg transition-all active:scale-95 shadow-sm"
          >
            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 whitespace-nowrap">{item.label}</span>
            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 group-hover:text-blue-600/70">{item.duration}분</span>
          </button>
        ))}
        {/* 직접 추가 버튼 */}
        <button
            onClick={handleAddCustomStep}
            className="flex flex-col items-center justify-center py-2 px-1 border border-dashed border-gray-300 dark:border-slate-500 text-gray-400 dark:text-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-400 transition-all active:scale-95"
        >
            <Plus className="w-3.5 h-3.5 mb-0.5" />
            <span className="text-[9px] font-bold whitespace-nowrap">직접</span>
        </button>
      </div>
    </div>
  );
};