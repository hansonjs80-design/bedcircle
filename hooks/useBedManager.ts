import { useEffect, useCallback, useState, useRef } from 'react';
import { BedState, BedStatus, Preset, TreatmentStep, PatientVisit, QuickTreatment } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { TOTAL_BEDS } from '../constants';
import { supabase, isOnlineMode } from '../lib/supabase';
import { useBedTimer } from './useBedTimer';
import { useBedRealtime } from './useBedRealtime';
import { useWakeLock } from './useWakeLock';
import { mapBedToDbPayload, calculateRemainingTime } from '../utils/bedLogic';
import { getAbbreviation, generateTreatmentString, parseTreatmentString } from '../utils/bedUtils';
import { 
  createCustomPreset, 
  createQuickStep, 
  createSwappedPreset, 
  createTractionPreset 
} from '../utils/treatmentFactories';

interface SelectPresetOptions {
  isInjection?: boolean;
  isFluid?: boolean;
  isTraction?: boolean;
  isESWT?: boolean;
  isManual?: boolean;
}

export const useBedManager = (
  presets: Preset[],
  quickTreatments: QuickTreatment[],
  isSoundEnabled: boolean, 
  onAddVisit?: (data: Partial<PatientVisit>) => void, 
  onUpdateLog?: (bedId: number, data: Partial<PatientVisit>) => void
) => {
  const [localBeds, setLocalBeds] = useLocalStorage<BedState[]>('physio-beds-v8', 
    Array.from({ length: TOTAL_BEDS }, (_, i) => ({
      id: i + 1,
      status: BedStatus.IDLE,
      currentPresetId: null,
      currentStepIndex: 0,
      queue: [],
      remainingTime: 0,
      startTime: null,
      isPaused: false,
      isInjection: false,
      isFluid: false,
      isTraction: false,
      isESWT: false,
      isManual: false,
      memos: {}
    }))
  );

  const [beds, setBeds] = useState<BedState[]>(localBeds);
  const bedsRef = useRef(beds);
  
  useEffect(() => {
    bedsRef.current = beds;
  }, [beds]);

  // Pass 'beds' to useBedTimer so it can sync with the Web Worker
  useBedTimer(setBeds, presets, isSoundEnabled, beds);
  
  const { realtimeStatus } = useBedRealtime(setBeds, setLocalBeds);

  // Activate Wake Lock if any bed is ACTIVE to prevent screen sleep
  const hasActiveBeds = beds.some(b => b.status === BedStatus.ACTIVE && !b.isPaused);
  useWakeLock(hasActiveBeds);

  useEffect(() => {
    if (!isOnlineMode()) setBeds(localBeds);
  }, [localBeds]);

  const updateBedState = useCallback(async (bedId: number, updates: Partial<BedState>) => {
    const timestamp = Date.now();
    const updateWithTimestamp = { ...updates, lastUpdateTimestamp: timestamp };
    
    setBeds(prev => prev.map(b => b.id === bedId ? { ...b, ...updateWithTimestamp } : b));
    setLocalBeds(prev => prev.map(b => b.id === bedId ? { ...b, ...updateWithTimestamp } : b));

    if (isOnlineMode() && supabase) {
      const dbPayload = mapBedToDbPayload(updates);
      const { error } = await supabase.from('beds').update(dbPayload).eq('id', bedId);
      if (error) console.error(`[BedManager] DB Update Failed:`, error.message);
    }
  }, [setLocalBeds]);

  const selectPreset = useCallback((bedId: number, presetId: string, options?: SelectPresetOptions) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    const firstStep = preset.steps[0];
    
    updateBedState(bedId, {
      status: BedStatus.ACTIVE,
      currentPresetId: presetId,
      customPreset: null as any,
      currentStepIndex: 0,
      queue: [],
      startTime: Date.now(),
      remainingTime: firstStep.duration,
      originalDuration: firstStep.duration,
      isPaused: false,
      isInjection: options?.isInjection || false,
      isFluid: options?.isFluid || false,
      isTraction: options?.isTraction || false,
      isESWT: options?.isESWT || false,
      isManual: options?.isManual || false,
      memos: {}
    });

    if (onAddVisit) {
      onAddVisit({
        bed_id: bedId,
        treatment_name: generateTreatmentString(preset.steps),
        is_injection: options?.isInjection,
        is_fluid: options?.isFluid,
        is_traction: options?.isTraction,
        is_eswt: options?.isESWT,
        is_manual: options?.isManual,
      });
    }

  }, [presets, updateBedState, onAddVisit]);

  const startCustomPreset = useCallback((bedId: number, name: string, steps: TreatmentStep[], options?: SelectPresetOptions) => {
    if (steps.length === 0) return;
    
    const customPreset = createCustomPreset(name, steps);
    const firstStep = steps[0];

    updateBedState(bedId, {
      status: BedStatus.ACTIVE,
      currentPresetId: customPreset.id,
      customPreset: customPreset,
      currentStepIndex: 0,
      queue: [],
      startTime: Date.now(),
      remainingTime: firstStep.duration,
      originalDuration: firstStep.duration,
      isPaused: false,
      isInjection: options?.isInjection || false,
      isFluid: options?.isFluid || false,
      isTraction: options?.isTraction || false,
      isESWT: options?.isESWT || false,
      isManual: options?.isManual || false,
      memos: {}
    });

    if (onAddVisit) {
      onAddVisit({
        bed_id: bedId,
        treatment_name: generateTreatmentString(steps),
        is_injection: options?.isInjection,
        is_fluid: options?.isFluid,
        is_traction: options?.isTraction,
        is_eswt: options?.isESWT,
        is_manual: options?.isManual,
      });
    }

  }, [updateBedState, onAddVisit]);

  const startQuickTreatment = useCallback((bedId: number, template: QuickTreatment, options?: SelectPresetOptions) => {
    const step = createQuickStep(template.name, template.duration, template.enableTimer, template.color);
    startCustomPreset(bedId, template.name, [step], options);
  }, [startCustomPreset]);

  const startTraction = useCallback((bedId: number, durationMinutes: number, options: any) => {
    const tractionPreset = createTractionPreset(durationMinutes);
    const firstStep = tractionPreset.steps[0];

    updateBedState(bedId, {
        status: BedStatus.ACTIVE,
        currentPresetId: tractionPreset.id,
        customPreset: tractionPreset,
        currentStepIndex: 0,
        queue: [],
        startTime: Date.now(),
        remainingTime: firstStep.duration,
        originalDuration: firstStep.duration,
        isPaused: false,
        ...options,
        memos: {}
    });

    if (onAddVisit) {
      onAddVisit({
        bed_id: bedId,
        treatment_name: '견인',
        is_injection: options?.isInjection,
        is_fluid: options?.isFluid,
        is_traction: true, 
        is_eswt: options?.isESWT,
        is_manual: options?.isManual,
      });
    }

  }, [updateBedState, onAddVisit]);

  const nextStep = useCallback((bedId: number) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed || bed.status === BedStatus.IDLE) return;
    
    const preset = bed.customPreset || presets.find(p => p.id === bed.currentPresetId);
    if (!preset) return;
    
    const nextIndex = bed.currentStepIndex + 1;
    
    if (nextIndex < preset.steps.length) {
      const nextStepItem = preset.steps[nextIndex];
      updateBedState(bedId, {
        currentStepIndex: nextIndex,
        queue: [],
        startTime: Date.now(),
        remainingTime: nextStepItem.duration,
        originalDuration: nextStepItem.duration,
        isPaused: false
      });
    } else {
      updateBedState(bedId, { status: BedStatus.COMPLETED, remainingTime: 0, isPaused: false });
    }
  }, [presets, updateBedState]);

  const prevStep = useCallback((bedId: number) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed || bed.status !== BedStatus.ACTIVE) return;
    
    const preset = bed.customPreset || presets.find(p => p.id === bed.currentPresetId);
    if (!preset) return;

    const prevIndex = bed.currentStepIndex - 1;
    
    if (prevIndex >= 0) {
      const prevStepItem = preset.steps[prevIndex];
      updateBedState(bedId, {
        currentStepIndex: prevIndex,
        startTime: Date.now(),
        remainingTime: prevStepItem.duration,
        originalDuration: prevStepItem.duration,
        isPaused: false
      });
    }
  }, [presets, updateBedState]);

  const swapSteps = useCallback((bedId: number, idx1: number, idx2: number) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed) return;

    const swapResult = createSwappedPreset(
      bed.customPreset, 
      bed.currentPresetId, 
      presets, 
      idx1, 
      idx2
    );

    if (!swapResult) return;

    const updates: Partial<BedState> = {
       customPreset: swapResult.preset,
       memos: {
         ...bed.memos,
         [idx1]: bed.memos[idx2],
         [idx2]: bed.memos[idx1]
       }
    };
    
    if (bed.status === BedStatus.ACTIVE && (bed.currentStepIndex === idx1 || bed.currentStepIndex === idx2)) {
       const currentStepItem = swapResult.steps[bed.currentStepIndex];
       updates.remainingTime = currentStepItem.duration;
       updates.originalDuration = currentStepItem.duration;
       updates.startTime = Date.now();
       updates.isPaused = false;
    }

    updateBedState(bedId, updates);
    
    if (onUpdateLog) {
        const newTreatmentName = generateTreatmentString(swapResult.steps);
        onUpdateLog(bedId, { treatment_name: newTreatmentName });
    }

  }, [presets, updateBedState, onUpdateLog]);

  const togglePause = useCallback((bedId: number) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed || bed.status !== BedStatus.ACTIVE) return;

    if (!bed.isPaused) {
      const currentRemaining = calculateRemainingTime(bed, presets);
      updateBedState(bedId, { 
        isPaused: true, 
        remainingTime: currentRemaining 
      });
    } else {
      updateBedState(bedId, { 
        isPaused: false, 
        startTime: Date.now(),
        originalDuration: bed.remainingTime 
      });
    }
  }, [presets, updateBedState]);

  const clearBed = useCallback((bedId: number) => {
    updateBedState(bedId, {
      status: BedStatus.IDLE,
      currentPresetId: null,
      customPreset: null as any,
      currentStepIndex: 0,
      queue: [],
      startTime: null,
      originalDuration: undefined,
      remainingTime: 0,
      isPaused: false,
      isInjection: false,
      isFluid: false,
      isTraction: false,
      isESWT: false,
      isManual: false,
      memos: {}
    });
  }, [updateBedState]);

  const toggleFlag = useCallback((bedId: number, flag: keyof BedState) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (bed) {
        const newValue = !bed[flag];
        updateBedState(bedId, { [flag]: newValue });
        
        if (onUpdateLog) {
            let logKey: keyof PatientVisit | undefined;
            if (flag === 'isInjection') logKey = 'is_injection';
            else if (flag === 'isFluid') logKey = 'is_fluid';
            else if (flag === 'isTraction') logKey = 'is_traction';
            else if (flag === 'isESWT') logKey = 'is_eswt';
            else if (flag === 'isManual') logKey = 'is_manual';

            if (logKey) {
                onUpdateLog(bedId, { [logKey]: newValue });
            }
        }
    }
  }, [updateBedState, onUpdateLog]);

  const updateBedSteps = useCallback((bedId: number, steps: TreatmentStep[]) => {
      const bed = bedsRef.current.find(b => b.id === bedId);
      if (!bed) return;
      
      const newCustomPreset = { id: 'custom', name: '치료', steps };
      updateBedState(bedId, { customPreset: newCustomPreset });

      if (onUpdateLog) {
          const newTreatmentName = generateTreatmentString(steps);
          onUpdateLog(bedId, { treatment_name: newTreatmentName });
      }
  }, [updateBedState, onUpdateLog]);

  const overrideBedFromLog = useCallback((bedId: number, logData: Partial<PatientVisit>, forceRestart: boolean = false) => {
     const bed = bedsRef.current.find(b => b.id === bedId);
     if (!bed) return;

     // 1. Prepare Status Flags Updates
     const flagsUpdate: Partial<BedState> = {};
     if (logData.is_injection !== undefined) flagsUpdate.isInjection = logData.is_injection;
     if (logData.is_fluid !== undefined) flagsUpdate.isFluid = logData.is_fluid;
     if (logData.is_traction !== undefined) flagsUpdate.isTraction = logData.is_traction;
     if (logData.is_eswt !== undefined) flagsUpdate.isESWT = logData.is_eswt;
     if (logData.is_manual !== undefined) flagsUpdate.isManual = logData.is_manual;
     
     // 2. Parse Treatment Steps if provided
     const newSteps = logData.treatment_name ? parseTreatmentString(logData.treatment_name, quickTreatments) : [];

     // Scenario A: Bed is IDLE or Forced Restart -> Full Reset/Start
     if (bed.status === BedStatus.IDLE || forceRestart) {
         if (newSteps.length > 0) {
             const newCustomPreset = { id: `log-auto-${Date.now()}`, name: '환자 처방', steps: newSteps };
             const firstStep = newSteps[0];
             
             updateBedState(bedId, {
                 status: BedStatus.ACTIVE,
                 currentPresetId: newCustomPreset.id,
                 customPreset: newCustomPreset,
                 currentStepIndex: 0,
                 queue: [],
                 startTime: Date.now(),
                 remainingTime: firstStep.duration,
                 originalDuration: firstStep.duration,
                 isPaused: false,
                 memos: {}, 
                 ...flagsUpdate
             });
         } else if (forceRestart) {
             // If forcing restart but no steps, clear it
             clearBed(bedId);
         }
     } 
     // Scenario B: Bed is ACTIVE -> Smart Update
     else {
         const updates: Partial<BedState> = { ...flagsUpdate };
         
         // Only update steps/timer if the treatment name ACTUALLY changed
         if (logData.treatment_name !== undefined) {
             const currentString = generateTreatmentString(bed.customPreset?.steps || presets.find(p=>p.id===bed.currentPresetId)?.steps || []);
             
             if (currentString !== logData.treatment_name) {
                 if (newSteps.length > 0) {
                     const newCustomPreset = { id: `synced-${Date.now()}`, name: '로그 동기화', steps: newSteps };
                     updates.customPreset = newCustomPreset;
                     updates.currentStepIndex = 0;
                     updates.remainingTime = newSteps[0].duration;
                     updates.originalDuration = newSteps[0].duration;
                     updates.startTime = Date.now();
                     updates.isPaused = false;
                 }
             }
         }

         if (Object.keys(updates).length > 0) {
             updateBedState(bedId, updates);
         }
     }
  }, [updateBedState, presets, clearBed, quickTreatments]);

  const moveBedState = useCallback(async (fromId: number, toId: number) => {
    const sourceBed = bedsRef.current.find(b => b.id === fromId);
    if (!sourceBed || sourceBed.status === BedStatus.IDLE) return;

    // 1. Calculate current remaining time
    const currentRemaining = calculateRemainingTime(sourceBed, presets);
    
    // 2. Prepare Target State (Copy of Source)
    const targetUpdates: Partial<BedState> = {
      status: sourceBed.status,
      currentPresetId: sourceBed.currentPresetId,
      customPreset: sourceBed.customPreset,
      currentStepIndex: sourceBed.currentStepIndex,
      queue: sourceBed.queue,
      remainingTime: currentRemaining,
      originalDuration: sourceBed.originalDuration,
      startTime: Date.now(), 
      isPaused: sourceBed.isPaused,
      isInjection: sourceBed.isInjection,
      isFluid: sourceBed.isFluid,
      isTraction: sourceBed.isTraction,
      isESWT: sourceBed.isESWT,
      isManual: sourceBed.isManual,
      memos: { ...sourceBed.memos }
    };

    // 3. Clear Source Bed
    const sourceUpdates: Partial<BedState> = {
      status: BedStatus.IDLE,
      currentPresetId: null,
      customPreset: null as any,
      currentStepIndex: 0,
      queue: [],
      startTime: null,
      remainingTime: 0,
      isPaused: false,
      isInjection: false,
      isFluid: false,
      isTraction: false,
      isESWT: false,
      isManual: false,
      memos: {}
    };

    // 4. Update Local State (Optimistic)
    setBeds(prev => prev.map(b => {
      if (b.id === toId) return { ...b, ...targetUpdates, lastUpdateTimestamp: Date.now() };
      if (b.id === fromId) return { ...b, ...sourceUpdates, lastUpdateTimestamp: Date.now() };
      return b;
    }));
    
    // 5. DB Sync (Explicit calls for reliability)
    if (isOnlineMode() && supabase) {
       await supabase.from('beds').update(mapBedToDbPayload(targetUpdates)).eq('id', toId);
       await supabase.from('beds').update(mapBedToDbPayload(sourceUpdates)).eq('id', fromId);
    }

  }, [presets, setLocalBeds]);


  const movePatientToBed = useCallback((oldBedId: number | null, newBedId: number, logData: Partial<PatientVisit>) => {
      if (oldBedId) clearBed(oldBedId);

      const steps = parseTreatmentString(logData.treatment_name || '', quickTreatments);
      if (steps.length > 0) {
          startCustomPreset(newBedId, '이동된 환자', steps, {
              isInjection: logData.is_injection,
              isFluid: logData.is_fluid,
              isTraction: logData.is_traction,
              isESWT: logData.is_eswt,
              isManual: logData.is_manual
          });
      } else {
          clearBed(newBedId);
      }
  }, [clearBed, startCustomPreset, quickTreatments]);


  return { 
    beds, 
    selectPreset, 
    startCustomPreset, 
    startQuickTreatment,
    startTraction,
    nextStep,
    prevStep,
    swapSteps, 
    togglePause,
    jumpToStep: (bedId: number, stepIndex: number) => {},
    toggleInjection: (id: number) => toggleFlag(id, 'isInjection'),
    toggleFluid: (id: number) => toggleFlag(id, 'isFluid'),
    toggleTraction: (id: number) => toggleFlag(id, 'isTraction'),
    toggleESWT: (id: number) => toggleFlag(id, 'isESWT'),
    toggleManual: (id: number) => toggleFlag(id, 'isManual'),
    updateMemo: (bedId: number, idx: number, memo: string | null) => {
      const bed = bedsRef.current.find(b => b.id === bedId);
      if (!bed) return;
      const newMemos = { ...bed.memos };
      if (!memo) delete newMemos[idx]; else newMemos[idx] = memo;
      updateBedState(bedId, { memos: newMemos });
    },
    updateBedDuration: (bedId: number, dur: number) => updateBedState(bedId, { startTime: Date.now(), remainingTime: dur, originalDuration: dur, isPaused: false }),
    updateBedSteps,
    clearBed, 
    resetAll: () => bedsRef.current.forEach(bed => clearBed(bed.id)),
    overrideBedFromLog,
    movePatientToBed, 
    moveBedState, 
    realtimeStatus 
  };
};