import React from 'react';
import { BedState, TreatmentStep } from '../../types';
import { BedEditStepRow } from './BedEditStepRow';

interface BedEditStepListProps {
  bed: BedState;
  steps: TreatmentStep[];
  onUpdateSteps?: (bedId: number, steps: TreatmentStep[]) => void;
  onUpdateDuration?: (bedId: number, duration: number) => void;
}

export const BedEditStepList: React.FC<BedEditStepListProps> = ({ 
  bed, 
  steps, 
  onUpdateSteps,
  onUpdateDuration 
}) => {
  const handleMoveStep = (idx: number, direction: 'up' | 'down') => {
    if (!onUpdateSteps) return;
    const newSteps = [...steps];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newSteps.length) return;
    
    [newSteps[idx], newSteps[swapIdx]] = [newSteps[swapIdx], newSteps[idx]];
    onUpdateSteps(bed.id, newSteps);
  };

  const handleRemoveStep = (idx: number) => {
    if (!onUpdateSteps) return;
    const newSteps = steps.filter((_, i) => i !== idx);
    onUpdateSteps(bed.id, newSteps);
  };

  const handleStepChange = (idx: number, updates: Partial<TreatmentStep>) => {
    if (!onUpdateSteps) return;
    const newSteps = [...steps];
    newSteps[idx] = { ...newSteps[idx], ...updates };
    onUpdateSteps(bed.id, newSteps);
  };

  const handleDurationChange = (idx: number, changeMinutes: number) => {
    if (!onUpdateSteps) return;
    const newSteps = [...steps];
    const currentSeconds = newSteps[idx].duration;
    const newSeconds = currentSeconds + (changeMinutes * 60);

    if (newSeconds >= 60) {
      newSteps[idx] = { ...newSteps[idx], duration: newSeconds };
      onUpdateSteps(bed.id, newSteps);
    }
  };
  
  const handleApplyDuration = (duration: number) => {
    if (onUpdateDuration) {
        onUpdateDuration(bed.id, duration);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0">처방 순서 및 수정 (Steps)</span>
      
      <div className="space-y-2">
        {steps.length === 0 && (
          <div className="text-center py-6 text-gray-400 text-sm italic bg-gray-50 dark:bg-slate-900 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
            등록된 치료가 없습니다.
            <br/>
            <span className="text-xs opacity-70">아래에서 처방을 추가해주세요.</span>
          </div>
        )}
        {steps.map((step, idx) => (
           <BedEditStepRow 
             key={step.id || idx}
             step={step}
             index={idx}
             isActive={idx === bed.currentStepIndex}
             totalSteps={steps.length}
             onMove={handleMoveStep}
             onRemove={handleRemoveStep}
             onChange={handleStepChange}
             onDurationChange={handleDurationChange}
             onApplyDuration={idx === bed.currentStepIndex ? handleApplyDuration : undefined}
           />
        ))}
      </div>
    </div>
  );
};