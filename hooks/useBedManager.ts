
import { useEffect, useCallback, useState, useRef } from 'react';
import { BedState, BedStatus, Preset, TreatmentStep, QuickTreatment, PatientVisit } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { TOTAL_BEDS, STANDARD_TREATMENTS } from '../constants';
import { supabase, isOnlineMode } from '../lib/supabase';
import { useBedTimer } from './useBedTimer';
import { useBedRealtime } from './useBedRealtime';
import { useWakeLock } from './useWakeLock';
import { useAudioWakeLock } from './useAudioWakeLock';
import { mapBedToDbPayload, calculateRemainingTime } from '../utils/bedLogic';
import { 
  createCustomPreset, 
  createQuickStep, 
  createSwappedPreset, 
  createTractionPreset 
} from '../utils/treatmentFactories';
import { findMatchingPreset, parseTreatmentString, generateTreatmentString } from '../utils/bedUtils';

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
  isBackgroundKeepAlive: boolean,
  onAddVisit?: (data?: Partial<PatientVisit>) => Promise<string>,
  onUpdateVisit?: (bedId: number, updates: Partial<PatientVisit>) => void
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

  useBedTimer(setBeds, presets, isSoundEnabled, beds);
  
  const { realtimeStatus } = useBedRealtime(setBeds, setLocalBeds);

  const hasActiveBeds = beds.some(b => b.status === BedStatus.ACTIVE && !b.isPaused);
  useWakeLock(hasActiveBeds);
  useAudioWakeLock(hasActiveBeds, isBackgroundKeepAlive);

  useEffect(() => {
    if (!isOnlineMode()) setBeds(localBeds);
  }, [localBeds]);

  const updateBedState = useCallback(async (bedId: number, updates: Partial<BedState>) => {
    const timestamp = Date.now();
    const updateWithTimestamp = { ...updates, lastUpdateTimestamp: timestamp };
    
    setBeds((prev: BedState[]) => prev.map(b => b.id === bedId ? { ...b, ...updateWithTimestamp } : b));
    setLocalBeds((prev: BedState[]) => prev.map((b) => b.id === bedId ? { ...b, ...updateWithTimestamp } : b));

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
    
    if (onAddVisit) {
        onAddVisit({
            bed_id: bedId,
            treatment_name: generateTreatmentString(preset.steps),
            is_injection: options?.isInjection || false,
            is_fluid: options?.isFluid || false,
            is_traction: options?.isTraction || false,
            is_eswt: options?.isESWT || false,
            is_manual: options?.isManual || false,
        });
    }

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
  }, [presets, updateBedState, onAddVisit]);

  const startCustomPreset = useCallback((bedId: number, name: string, steps: TreatmentStep[], options?: SelectPresetOptions) => {
    if (steps.length === 0) return;
    
    const customPreset = createCustomPreset(name, steps);
    const firstStep = steps[0];

    if (onAddVisit) {
        onAddVisit({
            bed_id: bedId,
            treatment_name: generateTreatmentString(steps),
            is_injection: options?.isInjection || false,
            is_fluid: options?.isFluid || false,
            is_traction: options?.isTraction || false,
            is_eswt: options?.isESWT || false,
            is_manual: options?.isManual || false,
        });
    }

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
  }, [updateBedState, onAddVisit]);

  const startQuickTreatment = useCallback((bedId: number, template: typeof STANDARD_TREATMENTS[0], options?: SelectPresetOptions) => {
    const step = createQuickStep(template.name, template.duration, template.enableTimer, template.color);
    startCustomPreset(bedId, template.name, [step], options);
  }, [startCustomPreset]);

  const startTraction = useCallback((bedId: number, durationMinutes: number, options: any) => {
    const tractionPreset = createTractionPreset(durationMinutes);
    const firstStep = tractionPreset.steps[0];

    if (onAddVisit) {
        onAddVisit({
            bed_id: bedId,
            treatment_name: '견인', 
            is_traction: true, 
            is_injection: options?.isInjection || false,
            is_fluid: options?.isFluid || false,
            is_eswt: options?.isESWT || false,
            is_manual: options?.isManual || false,
        });
    }

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
  }, [presets, updateBedState]);

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
        const newVal = !bed[flag];
        updateBedState(bedId, { [flag]: newVal });
        
        if (onUpdateVisit) {
            const map: Record<string, keyof PatientVisit> = {
                'isInjection': 'is_injection',
                'isFluid': 'is_fluid',
                'isTraction': 'is_traction',
                'isESWT': 'is_eswt',
                'isManual': 'is_manual'
            };
            const logKey = map[flag as string];
            if (logKey) {
                onUpdateVisit(bedId, { [logKey]: newVal });
            }
        }
    }
  }, [updateBedState, onUpdateVisit]);

  const overrideBedFromLog = useCallback((bedId: number, visit: PatientVisit, forceRestart: boolean) => {
    const treatmentName = visit.treatment_name || "";
    const matchingPreset = findMatchingPreset(presets, treatmentName);
    
    let steps: TreatmentStep[] = [];
    let currentPresetId: string | null = null;
    let customPreset: any = null;

    if (matchingPreset) {
      steps = matchingPreset.steps;
      if (!matchingPreset.id.startsWith('restored-')) {
          currentPresetId = matchingPreset.id;
      } else {
          customPreset = matchingPreset;
      }
    } else {
        steps = parseTreatmentString(treatmentName, quickTreatments);
        if (steps.length > 0) {
            customPreset = { id: `log-restore-${Date.now()}`, name: treatmentName, steps };
        }
    }

    if (steps.length === 0) return;

    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed) return;

    const currentSteps = bed.customPreset?.steps || presets.find(p => p.id === bed.currentPresetId)?.steps || [];
    const isStepsChanged = JSON.stringify(steps) !== JSON.stringify(currentSteps);

    const updates: Partial<BedState> = {
        isInjection: visit.is_injection || false,
        isFluid: visit.is_fluid || false,
        isTraction: visit.is_traction || false,
        isESWT: visit.is_eswt || false,
        isManual: visit.is_manual || false,
    };

    if (forceRestart || bed.status !== BedStatus.ACTIVE || isStepsChanged) {
        const firstStep = steps[0];
        updates.status = BedStatus.ACTIVE;
        updates.currentPresetId = currentPresetId;
        updates.customPreset = customPreset;
        updates.currentStepIndex = 0;
        updates.queue = [];
        updates.startTime = Date.now();
        updates.remainingTime = firstStep ? firstStep.duration : 0;
        updates.originalDuration = firstStep ? firstStep.duration : 0;
        updates.isPaused = false;
        updates.memos = {};
    }

    updateBedState(bedId, updates);
  }, [presets, quickTreatments, updateBedState]);

  const moveBedState = useCallback(async (fromBedId: number, toBedId: number) => {
    const fromBed = bedsRef.current.find(b => b.id === fromBedId);
    if (!fromBed) return;

    const stateToMove: Partial<BedState> = {
        status: fromBed.status,
        currentPresetId: fromBed.currentPresetId,
        customPreset: fromBed.customPreset,
        currentStepIndex: fromBed.currentStepIndex,
        queue: fromBed.queue,
        startTime: fromBed.startTime,
        remainingTime: fromBed.remainingTime,
        originalDuration: fromBed.originalDuration,
        isPaused: fromBed.isPaused,
        isInjection: fromBed.isInjection,
        isFluid: fromBed.isFluid,
        isTraction: fromBed.isTraction,
        isESWT: fromBed.isESWT,
        isManual: fromBed.isManual,
        memos: fromBed.memos
    };

    await updateBedState(toBedId, stateToMove);
    clearBed(fromBedId);
  }, [updateBedState, clearBed]);

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
    updateBedSteps: (bedId: number, steps: TreatmentStep[]) => {
      const bed = bedsRef.current.find(b => b.id === bedId);
      if (!bed) return;
      updateBedState(bedId, { customPreset: { id: 'custom', name: '치료', steps } });
      
      if (onUpdateVisit) {
          onUpdateVisit(bedId, { treatment_name: generateTreatmentString(steps) });
      }
    },
    clearBed, 
    resetAll: () => bedsRef.current.forEach(bed => clearBed(bed.id)),
    realtimeStatus,
    overrideBedFromLog,
    moveBedState
  };
};
