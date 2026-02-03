import React, { createContext, useContext, ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import { BedState, Preset, TreatmentStep, PatientVisit, BedStatus, QuickTreatment } from '../types';
import { usePresetManager } from '../hooks/usePresetManager';
import { useQuickTreatmentManager } from '../hooks/useQuickTreatmentManager';
import { useBedManager } from '../hooks/useBedManager';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { usePatientLog } from '../hooks/usePatientLog'; 
import { STANDARD_TREATMENTS } from '../constants';
import { useNotificationBridge } from '../hooks/useNotificationBridge';

interface TreatmentContextType {
  beds: BedState[];
  presets: Preset[];
  updatePresets: (presets: Preset[]) => void;
  quickTreatments: QuickTreatment[];
  updateQuickTreatments: (items: QuickTreatment[]) => void;
  
  // Settings
  isSoundEnabled: boolean;
  toggleSound: () => void;
  isBackgroundKeepAlive: boolean;
  toggleBackgroundKeepAlive: () => void;

  // Patient Log (Moved here for shared access)
  logState: {
    currentDate: string;
    setCurrentDate: (date: string) => void;
    visits: PatientVisit[];
    addVisit: (data?: Partial<PatientVisit>) => Promise<string>;
    updateVisit: (id: string, updates: Partial<PatientVisit>, skipBedSync?: boolean) => Promise<void>;
    deleteVisit: (id: string) => Promise<void>;
    changeDate: (offset: number) => void;
  };

  // UI State for Modals
  selectingBedId: number | null;
  setSelectingBedId: (id: number | null) => void;
  selectingLogId: string | null; 
  setSelectingLogId: (id: string | null) => void;
  editingBedId: number | null;
  setEditingBedId: (id: number | null) => void;
  
  // Actions
  selectPreset: (bedId: number, presetId: string, options: any) => void;
  startCustomPreset: (bedId: number, name: string, steps: TreatmentStep[], options: any) => void;
  startQuickTreatment: (bedId: number, template: QuickTreatment, options: any) => void;
  startTraction: (bedId: number, duration: number, options: any) => void;
  nextStep: (bedId: number) => void;
  prevStep: (bedId: number) => void;
  swapSteps: (bedId: number, idx1: number, idx2: number) => void;
  togglePause: (bedId: number) => void;
  jumpToStep: (bedId: number, stepIndex: number) => void;
  toggleInjection: (bedId: number) => void;
  toggleFluid: (bedId: number) => void;
  toggleTraction: (bedId: number) => void;
  toggleESWT: (bedId: number) => void;
  toggleManual: (bedId: number) => void;
  updateBedSteps: (bedId: number, steps: TreatmentStep[]) => void;
  updateMemo: (bedId: number, stepIndex: number, memo: string | null) => void;
  updateBedDuration: (bedId: number, duration: number) => void;
  clearBed: (bedId: number) => void;
  resetAll: () => void;
  movePatient: (fromBedId: number, toBedId: number) => Promise<void>;
}

const TreatmentContext = createContext<TreatmentContextType | undefined>(undefined);

export const TreatmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { presets, updatePresets } = usePresetManager();
  const { quickTreatments, updateQuickTreatments } = useQuickTreatmentManager();
  
  // Settings persisted in localStorage
  const [isSoundEnabled, setIsSoundEnabled] = useLocalStorage<boolean>('physio-sound-enabled', false);
  const [isBackgroundKeepAlive, setIsBackgroundKeepAlive] = useLocalStorage<boolean>('physio-bg-keep-alive', true);
  
  // Initialize Patient Log logic at Provider level
  const patientLog = usePatientLog();
  
  // Use ref to access latest visits inside callback without adding it to dependencies
  const visitsRef = useRef(patientLog.visits);
  useEffect(() => {
    visitsRef.current = patientLog.visits;
  }, [patientLog.visits]);

  // Handler to sync bed status changes (Bed -> Log)
  const handleLogUpdate = useCallback((bedId: number, updates: Partial<PatientVisit>) => {
     const currentVisits = visitsRef.current;
     const bedVisits = currentVisits.filter(v => v.bed_id === bedId);
     
     // Sort by created_at to guarantee we pick the latest session
     bedVisits.sort((a, b) => (new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()));

     if (bedVisits.length > 0) {
        const lastVisit = bedVisits[bedVisits.length - 1];
        patientLog.updateVisit(lastVisit.id, updates);
     }
  }, [patientLog.updateVisit]);

  // Bed Manager
  const bedManager = useBedManager(
      presets,
      quickTreatments,
      isSoundEnabled, 
      patientLog.addVisit, 
      handleLogUpdate
  );

  // Keep a ref to beds to access latest state in callbacks without re-triggering them
  const bedsRef = useRef(bedManager.beds);
  useEffect(() => {
    bedsRef.current = bedManager.beds;
  }, [bedManager.beds]);

  // --- LOG TO BED SYNC INTERCEPTOR ---
  const handleUpdateVisitWithSync = useCallback(async (id: string, updates: Partial<PatientVisit>, skipBedSync: boolean = false) => {
      // 0. Pre-check: Get existing data
      const oldVisit = visitsRef.current.find(v => v.id === id);
      if (!oldVisit) return;

      let shouldForceRestart = false;

      // 1. Conflict Check: Is the target bed already ACTIVE? (Only if NOT skipping sync)
      const targetBedId = updates.bed_id !== undefined ? updates.bed_id : oldVisit.bed_id;
      
      if (!skipBedSync && targetBedId) {
         const isBedAssignmentChange = updates.bed_id !== undefined && updates.bed_id !== oldVisit.bed_id;
         
         // Only ask for confirmation if the user is changing the BED ID to an occupied one.
         // If they are just editing the treatment content of the SAME bed, assume it's a desired update.
         if (isBedAssignmentChange) {
             const targetBed = bedsRef.current.find(b => b.id === targetBedId);
             if (targetBed && targetBed.status === BedStatus.ACTIVE) {
                 const confirmMsg = `${targetBedId}번 배드는 현재 활성화(치료 중) 상태입니다.\n\n새로운 환자로 덮어쓰시겠습니까?`;
                 if (!window.confirm(confirmMsg)) {
                     return; // User cancelled
                 }
                 shouldForceRestart = true;
             }
         }
      }

      // 2. Perform Log Update (Database/State)
      await patientLog.updateVisit(id, updates);

      // 3. Bed Sync Logic (Skipped if requested)
      if (skipBedSync) return;

      const mergedVisit = { ...oldVisit, ...updates };

      // Scenario: Bed Removal (bed_id set to null)
      if (oldVisit.bed_id && updates.bed_id === null) {
          bedManager.clearBed(oldVisit.bed_id); 
          return;
      }

      // Scenario: Bed Update (Assigning or Updating content)
      if (mergedVisit.bed_id) {
          // If we moved beds, clear the old one
          if (oldVisit.bed_id && updates.bed_id && oldVisit.bed_id !== updates.bed_id) {
             bedManager.clearBed(oldVisit.bed_id);
             shouldForceRestart = true;
          }

          // Sync content to active bed or start IDLE bed
          // If the bed is active and ID didn't change, this will trigger the 'Smart Update' logic in bedManager
          bedManager.overrideBedFromLog(mergedVisit.bed_id, mergedVisit, shouldForceRestart);
      }

  }, [patientLog.updateVisit, bedManager]);
  
  const [selectingBedId, setSelectingBedId] = useState<number | null>(null);
  const [selectingLogId, setSelectingLogId] = useState<string | null>(null);
  const [editingBedId, setEditingBedId] = useState<number | null>(null);

  const toggleSound = () => setIsSoundEnabled(prev => !prev);
  const toggleBackgroundKeepAlive = () => setIsBackgroundKeepAlive(prev => !prev);

  useNotificationBridge(bedManager.nextStep);

  const movePatient = useCallback(async (fromBedId: number, toBedId: number) => {
    // 1. Target Bed Check
    const targetBed = bedsRef.current.find(b => b.id === toBedId);
    if (targetBed && targetBed.status === BedStatus.ACTIVE) {
        if (!window.confirm(`${toBedId}번 배드는 현재 활성화 되어있습니다. 그래도 진행하시겠습니까?\n(기존 내용을 비우고 해당 항목으로 변경됩니다)`)) {
            return;
        }
    }

    const sourceBed = bedsRef.current.find(b => b.id === fromBedId);
    const isSourceActive = sourceBed && sourceBed.status === BedStatus.ACTIVE;

    const visitsForBed = visitsRef.current.filter(v => v.bed_id === fromBedId);
    visitsForBed.sort((a, b) => (new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()));
    const latestVisit = visitsForBed[visitsForBed.length - 1];

    if (isSourceActive) {
      await bedManager.moveBedState(fromBedId, toBedId);
      if (latestVisit) {
        await patientLog.updateVisit(latestVisit.id, { bed_id: toBedId });
      }
    } else if (latestVisit) {
      await patientLog.updateVisit(latestVisit.id, { bed_id: toBedId });
      const updatedVisit = { ...latestVisit, bed_id: toBedId };
      bedManager.overrideBedFromLog(toBedId, updatedVisit, true);
      bedManager.clearBed(fromBedId);
    } else {
       alert("이동할 환자 정보가 없습니다.");
    }
  }, [bedManager, patientLog.updateVisit]);

  const value = {
    presets,
    updatePresets,
    quickTreatments,
    updateQuickTreatments,
    isSoundEnabled,
    toggleSound,
    isBackgroundKeepAlive,
    toggleBackgroundKeepAlive,
    logState: {
      currentDate: patientLog.currentDate,
      setCurrentDate: patientLog.setCurrentDate,
      visits: patientLog.visits,
      addVisit: patientLog.addVisit,
      updateVisit: handleUpdateVisitWithSync,
      deleteVisit: patientLog.deleteVisit,
      changeDate: patientLog.changeDate
    },
    ...bedManager,
    selectingBedId,
    setSelectingBedId,
    selectingLogId,
    setSelectingLogId,
    editingBedId,
    setEditingBedId,
    movePatient 
  };

  return (
    <TreatmentContext.Provider value={value}>
      {children}
    </TreatmentContext.Provider>
  );
};

export const useTreatmentContext = () => {
  const context = useContext(TreatmentContext);
  if (context === undefined) {
    throw new Error('useTreatmentContext must be used within a TreatmentProvider');
  }
  return context;
};