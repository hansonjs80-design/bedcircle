import React, { useEffect, useRef } from 'react';
import { BedState, Preset, BedStatus } from '../types';
import { calculateRemainingTime } from '../utils/bedLogic';
import { playAlarmPattern } from '../utils/alarm';
import { getAbbreviation } from '../utils/bedUtils';

export const useBedTimer = (
  setBeds: React.Dispatch<React.SetStateAction<BedState[]>>,
  presets: Preset[],
  isSoundEnabled: boolean,
  beds: BedState[] // Current beds state needed for sync
) => {
  const workerRef = useRef<Worker | null>(null);

  // 1. Initialize Web Worker
  useEffect(() => {
    // Vite worker import syntax
    workerRef.current = new Worker(new URL('../workers/timerWorker.ts', import.meta.url), { type: 'module' });

    workerRef.current.onmessage = (e) => {
      const { type, bedId } = e.data;

      if (type === 'TICK') {
        // Update UI every tick based on real-time calculation
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
        // Trigger Alarm
        setBeds((currentBeds) => {
            const bed = currentBeds.find(b => b.id === bedId);
            if (!bed) return currentBeds;

            // Find current step info for notification
            const preset = bed.customPreset || presets.find(p => p.id === bed.currentPresetId);
            const currentStep = preset?.steps[bed.currentStepIndex];
            const stepName = currentStep ? getAbbreviation(currentStep.name) : '';
            
            // Trigger Sound/Vibration/Notification
            // isSoundEnabled가 true면 소리 재생, false면 무음 알림
            playAlarmPattern(bed.id, stepName, !isSoundEnabled);

            return currentBeds;
        });
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []); // Run once on mount

  // 2. Sync Bed State to Worker
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

  }, [beds, presets]); // Re-sync when bed state or presets change
};