import React, { memo } from 'react';
import { TreatmentStep, BedState, BedStatus } from '../types';
import { BedStepColumn } from './BedStepColumn';

interface BedContentProps {
  steps: TreatmentStep[];
  bed: BedState;
  queue: number[];
  onSwapRequest?: (id: number, idx: number) => void;
  swapSourceIndex?: number | null;
  onUpdateMemo?: (id: number, idx: number, val: string | null) => void;
}

export const BedContent: React.FC<BedContentProps> = memo(({ 
  steps, 
  bed, 
  onSwapRequest,
  swapSourceIndex,
  onUpdateMemo 
}) => {
  const isCompleted = bed.status === BedStatus.COMPLETED;

  return (
    <div className="w-full h-full flex flex-row divide-x divide-gray-200 dark:divide-slate-700 overflow-hidden">
      {steps.map((step, idx) => {
        const isActive = idx === bed.currentStepIndex && bed.status === BedStatus.ACTIVE;
        const isPast = !isCompleted && idx < bed.currentStepIndex;
        const memo = bed.memos?.[idx];
        const isSelectedForSwap = swapSourceIndex === idx;
        
        return (
          <BedStepColumn
            key={step.id || idx}
            step={step}
            index={idx}
            isActive={isActive}
            isPast={isPast}
            isCompleted={isCompleted}
            isSelectedForSwap={isSelectedForSwap}
            memo={memo}
            bedId={bed.id}
            onSwapRequest={onSwapRequest}
            onUpdateMemo={onUpdateMemo}
          />
        );
      })}
    </div>
  );
}, (prevProps, nextProps) => {
  // CRITICAL OPTIMIZATION:
  // Do NOT re-render if only 'remainingTime', 'startTime', 'originalDuration' changed.
  // These props change every second due to the timer, but BedContent visualization
  // only cares about which step is active, the status, and memos.
  
  const pBed = prevProps.bed;
  const nBed = nextProps.bed;

  const isBedEqual = 
    pBed.id === nBed.id &&
    pBed.status === nBed.status &&
    pBed.currentStepIndex === nBed.currentStepIndex &&
    pBed.currentPresetId === nBed.currentPresetId &&
    pBed.customPreset === nBed.customPreset &&
    pBed.memos === nBed.memos && // Reference check is usually enough here
    pBed.queue === nBed.queue;

  const isOtherPropsEqual = 
    prevProps.steps === nextProps.steps &&
    prevProps.swapSourceIndex === nextProps.swapSourceIndex;

  return isBedEqual && isOtherPropsEqual;
});