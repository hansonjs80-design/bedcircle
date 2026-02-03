import React, { memo, useState, useEffect, useMemo } from 'react';
import { BedState, BedStatus, Preset } from '../types';
import { BedHeader } from './BedHeader';
import { BedContent } from './BedContent';
import { BedFooter } from './BedFooter';
import { BedEmptyState } from './BedEmptyState';
import { BedStatusBadges } from './BedStatusBadges';
import { getBedCardStyles } from '../utils/bedUtils';
import { useTreatmentContext } from '../contexts/TreatmentContext';

interface BedCardProps {
  bed: BedState;
  presets: Preset[];
  isCompact: boolean;
}

export const BedCard: React.FC<BedCardProps> = memo(({ 
  bed, 
  presets, 
  isCompact
}) => {
  const {
    setSelectingBedId,
    setEditingBedId,
    nextStep,
    prevStep,
    togglePause,
    swapSteps,
    clearBed,
    updateMemo,
    updateBedDuration
  } = useTreatmentContext();

  const currentPreset = bed.customPreset || presets.find(p => p.id === bed.currentPresetId);
  const currentStep = currentPreset?.steps[bed.currentStepIndex];
  const steps = currentPreset?.steps || [];
  const isOvertime = bed.status === BedStatus.ACTIVE && !!currentStep?.enableTimer && bed.remainingTime <= 0;
  
  const [trashState, setTrashState] = useState<'idle' | 'confirm' | 'deleting'>('idle');
  const [swapSourceIndex, setSwapSourceIndex] = useState<number | null>(null);

  useEffect(() => {
    if (bed.status === BedStatus.IDLE) {
      setTrashState('idle');
      setSwapSourceIndex(null);
    }
  }, [bed.status]);

  const handleTrashClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (trashState === 'idle') {
      setTrashState('confirm');
      setTimeout(() => setTrashState(prev => prev === 'confirm' ? 'idle' : prev), 3000);
    } else if (trashState === 'confirm') {
      setTrashState('deleting');
      requestAnimationFrame(() => {
        clearBed(bed.id);
      });
    }
  };

  const handleSwapRequest = (bedId: number, idx: number) => {
    if (swapSourceIndex === null) {
      // First click: Select source
      setSwapSourceIndex(idx);
    } else {
      // Second click: Execute swap or cancel if same
      if (swapSourceIndex !== idx) {
        swapSteps(bedId, swapSourceIndex, idx);
      }
      setSwapSourceIndex(null);
    }
  };

  const containerClass = useMemo(() => getBedCardStyles(bed, isOvertime), [
    bed.status, bed.isInjection, bed.isFluid, bed.isESWT, bed.isTraction, bed.isManual, isOvertime
  ]);

  return (
    <div className={`${containerClass} transform transition-transform duration-200 active:scale-[0.99]`}>
      <BedHeader 
        bed={bed} 
        currentStep={currentStep} 
        onTrashClick={handleTrashClick} 
        trashState={trashState}
        onEditClick={setEditingBedId}
        onTogglePause={togglePause}
        onUpdateDuration={updateBedDuration}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full min-h-0 relative bg-white/40 dark:bg-slate-800/20 backdrop-blur-xs">
        <div className="flex-1 flex flex-row w-full min-h-0">
          {bed.status === BedStatus.IDLE ? (
            <BedEmptyState onOpenSelector={() => setSelectingBedId(bed.id)} />
          ) : (
            <div 
              className="w-full h-full min-h-0"
              onDoubleClick={(e) => setEditingBedId(bed.id)}
            >
              <BedContent 
                steps={steps}
                bed={bed}
                queue={[]} // Queue visual removed
                onSwapRequest={handleSwapRequest}
                swapSourceIndex={swapSourceIndex}
                onUpdateMemo={updateMemo}
              />
            </div>
          )}
        </div>

        {/* Status badges overlay at bottom-right */}
        <BedStatusBadges bed={bed} />
      </div>

      {bed.status !== BedStatus.IDLE && (
        <BedFooter 
          bed={bed} 
          steps={steps} 
          onNext={nextStep} 
          onPrev={prevStep}
          onClear={clearBed} 
        />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.bed.remainingTime === nextProps.bed.remainingTime &&
    prevProps.bed.status === nextProps.bed.status &&
    prevProps.bed.currentStepIndex === nextProps.bed.currentStepIndex &&
    prevProps.bed.isPaused === nextProps.bed.isPaused &&
    prevProps.bed.isInjection === nextProps.bed.isInjection &&
    prevProps.bed.isFluid === nextProps.bed.isFluid && // Added missing check
    prevProps.bed.isManual === nextProps.bed.isManual &&
    prevProps.bed.isESWT === nextProps.bed.isESWT &&
    prevProps.bed.isTraction === nextProps.bed.isTraction &&
    prevProps.bed.customPreset === nextProps.bed.customPreset && 
    prevProps.presets === nextProps.presets && // Added missing check
    prevProps.isCompact === nextProps.isCompact
  );
});