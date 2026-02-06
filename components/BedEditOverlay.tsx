
import React, { memo } from 'react';
import { TreatmentStep, BedState } from '../types';
import { BedEditHeader } from './bed-edit/BedEditHeader';
import { BedEditFlags } from './bed-edit/BedEditFlags';
import { BedEditStepList } from './bed-edit/BedEditStepList';
import { BedEditQuickAdd } from './bed-edit/BedEditQuickAdd';

interface BedEditOverlayProps {
  bed: BedState;
  steps: TreatmentStep[];
  onClose: () => void;
  onToggleInjection?: (bedId: number) => void;
  onToggleFluid?: (bedId: number) => void;
  onToggleTraction?: (bedId: number) => void;
  onToggleESWT?: (bedId: number) => void;
  onToggleManual?: (bedId: number) => void;
  onUpdateSteps?: (bedId: number, steps: TreatmentStep[]) => void;
  onUpdateDuration?: (bedId: number, duration: number) => void;
}

export const BedEditOverlay: React.FC<BedEditOverlayProps> = memo(({
  bed,
  steps,
  onClose,
  onToggleInjection,
  onToggleFluid,
  onToggleTraction,
  onToggleESWT,
  onToggleManual,
  onUpdateSteps,
  onUpdateDuration
}) => {
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-lg bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[85vh] border border-gray-200 dark:border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <BedEditHeader bedId={bed.id} onClose={onClose} />

        {/* Main Content Area - Scrollable as a whole */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 scroll-smooth">
           <BedEditFlags 
             bed={bed} 
             onToggleInjection={onToggleInjection}
             onToggleFluid={onToggleFluid}
             onToggleManual={onToggleManual}
             onToggleESWT={onToggleESWT}
             onToggleTraction={onToggleTraction}
           />

           <div className="shrink-0">
             <BedEditStepList 
               bed={bed} 
               steps={steps} 
               onUpdateSteps={onUpdateSteps}
               onUpdateDuration={onUpdateDuration}
             />
           </div>

           <div className="shrink-0 pb-6">
             <BedEditQuickAdd 
               bedId={bed.id} 
               steps={steps} 
               onUpdateSteps={onUpdateSteps} 
             />
           </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 shrink-0 pb-6 sm:pb-4">
           <button onClick={onClose} className="w-full py-3.5 bg-brand-600 dark:bg-brand-600 text-white text-sm rounded-xl font-bold shadow-lg shadow-brand-500/20 dark:shadow-none active:scale-[0.98] transition-transform hover:bg-brand-700 dark:hover:bg-brand-500">
             수정 완료
           </button>
        </div>
      </div>
    </div>
  );
});
