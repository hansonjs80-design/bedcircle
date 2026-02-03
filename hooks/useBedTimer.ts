import React, { useEffect, useRef } from 'react';
import { BedState, Preset, BedStatus } from '../types';
import { calculateRemainingTime } from '../utils/bedLogic';
import { playAlarmPattern } from '../utils/alarm';
import { getAbbreviation } from '../utils/bedUtils';

// Web Worker logic embedded as a string to avoid file path/bundling issues
const WORKER_CODE = `
const state = {
  beds: new Map(),
};

self.onmessage = (e) => {
  if (e.data.type === 'UPDATE_BEDS') {
    const currentIds = new Set();

    e.data.beds.forEach((bed) => {
      if (bed.isEnabled && bed.startTime) {
        currentIds.add(bed.id);
        const targetTime = bed.startTime + (bed.duration * 1000);
        
        // Update logic
        let existing = state.beds.get(bed.id);
        if (!existing || existing.targetTime !== targetTime) {
          state.beds.set(bed.id, { 
            targetTime, 
            alerted: false 
          });
        }
      }
    });

    // Cleanup
    for (const id of state.beds.keys()) {
      if (!currentIds.has(id)) {
        state.beds.delete(id);
      }
    }
  }
};

setInterval(() => {
  const now = Date.now();
  
  state.beds.forEach((info, id) => {
    const remainingMs = info.targetTime - now;
    
    if (remainingMs <= 0 && !info.alerted) {
      info.alerted = true;
      self.postMessage({ type: 'ALARM', bedId: id });
    }
  });

  self.postMessage({ type: 'TICK' });

}, 1000);
`;

export const useBedTimer = (
  setBeds: React.Dispatch<React.SetStateAction<BedState[]>>,
  presets: Preset[],
  isSoundEnabled: boolean,
  beds: BedState[]
) => {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Create worker from Blob
    const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    workerRef.current = new Worker(workerUrl);

    workerRef.current.onmessage = (e) => {
      const { type, bedId } = e.data;

      if (type === 'TICK') {
        setBeds((currentBeds) => {
          return currentBeds.map((bed) => {
            const newRemaining = calculateRemainingTime(bed, presets);
            if (newRemaining !== bed.remainingTime) {
              return { ...bed, remainingTime: newRemaining };
            }
            return bed;
          });
        });
      } else if (type === 'ALARM' && bedId) {
        setBeds((currentBeds) => {
            const bed = currentBeds.find(b => b.id === bedId);
            if (!bed) return currentBeds;

            const preset = bed.customPreset || presets.find(p => p.id === bed.currentPresetId);
            const currentStep = preset?.steps[bed.currentStepIndex];
            const stepName = currentStep ? getAbbreviation(currentStep.name) : '';
            
            playAlarmPattern(bed.id, stepName, !isSoundEnabled);

            return currentBeds;
        });
      }
    };

    return () => {
      workerRef.current?.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, []);

  useEffect(() => {
    if (!workerRef.current) return;

    const activeBeds = beds.map(bed => {
      const preset = bed.customPreset || presets.find(p => p.id === bed.currentPresetId);
      const step = preset?.steps[bed.currentStepIndex];
      const duration = bed.originalDuration || step?.duration || 0;
      
      return {
        id: bed.id,
        startTime: bed.startTime,
        duration: duration,
        isEnabled: bed.status === BedStatus.ACTIVE && !bed.isPaused && !!step?.enableTimer,
        presetId: bed.currentPresetId
      };
    });

    workerRef.current.postMessage({
      type: 'UPDATE_BEDS',
      beds: activeBeds
    });

  }, [beds, presets]);
};