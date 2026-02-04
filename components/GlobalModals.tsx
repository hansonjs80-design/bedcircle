
import React, { Suspense, useMemo } from 'react';
import { useTreatmentContext } from '../contexts/TreatmentContext';
import { usePatientLogContext } from '../contexts/PatientLogContext';
import { TreatmentStep, QuickTreatment } from '../types';
import { generateTreatmentString, findMatchingPreset } from '../utils/bedUtils';

// Lazy load heavy components
const SettingsPanel = React.lazy(() => import('./SettingsPanel').then(module => ({ default: module.SettingsPanel })));
const PresetSelectorModal = React.lazy(() => import('./PresetSelectorModal').then(module => ({ default: module.PresetSelectorModal })));
const BedEditOverlay = React.lazy(() => import('./BedEditOverlay').then(module => ({ default: module.BedEditOverlay })));
const BedMoveModal = React.lazy(() => import('./modals/BedMoveModal').then(module => ({ default: module.BedMoveModal })));

interface GlobalModalsProps {
  isMenuOpen: boolean;
  onCloseMenu: () => void;
  presets: any[]; 
}

export const GlobalModals: React.FC<GlobalModalsProps> = ({ isMenuOpen, onCloseMenu }) => {
  const { 
    beds, 
    presets, 
    updatePresets,
    selectingBedId,
    setSelectingBedId,
    selectingLogId,
    setSelectingLogId,
    editingBedId,
    setEditingBedId,
    movingPatientState,
    setMovingPatientState,
    movePatient,
    selectPreset,
    startCustomPreset,
    startQuickTreatment,
    startTraction,
    resetAll,
    toggleInjection,
    toggleFluid,
    toggleTraction,
    toggleESWT,
    toggleManual,
    updateBedSteps,
    updateBedDuration,
    updateVisitWithBedSync
  } = useTreatmentContext();

  // Consume visits from PatientLogContext directly
  const { visits } = usePatientLogContext();

  // Helper to map options to log flags
  const mapOptionsToFlags = (options: any) => ({
    is_injection: options?.isInjection,
    is_fluid: options?.isFluid,
    is_traction: options?.isTraction,
    is_eswt: options?.isESWT,
    is_manual: options?.isManual,
  });

  // Handler wrappers to close modals after action
  const handleSelectPreset = (bedId: number, presetId: string, options: any) => {
    if (selectingLogId) {
      // Logic for Log Editing
      const preset = presets.find(p => p.id === presetId);
      if (preset) {
        updateVisitWithBedSync(selectingLogId, {
          treatment_name: generateTreatmentString(preset.steps),
          ...mapOptionsToFlags(options)
        });
      }
      setSelectingLogId(null);
    } else {
      // Logic for Bed Control
      selectPreset(bedId, presetId, options);
      setSelectingBedId(null);
    }
  };

  const handleCustomStart = (bedId: number, name: string, steps: TreatmentStep[], options: any) => {
    if (selectingLogId) {
       updateVisitWithBedSync(selectingLogId, {
         treatment_name: generateTreatmentString(steps),
         ...mapOptionsToFlags(options)
       });
       setSelectingLogId(null);
    } else {
       startCustomPreset(bedId, name, steps, options);
       setSelectingBedId(null);
    }
  };

  const handleQuickStart = (bedId: number, template: QuickTreatment, options: any) => {
    if (selectingLogId) {
      // Single step treatment
      updateVisitWithBedSync(selectingLogId, {
        treatment_name: template.label || template.name,
        ...mapOptionsToFlags(options)
      });
      setSelectingLogId(null);
    } else {
      startQuickTreatment(bedId, template, options);
      setSelectingBedId(null);
    }
  };
  
  const handleStartTraction = (bedId: number, duration: number, options: any) => {
    if (selectingLogId) {
       // Merge options and force is_traction=true using a new object to avoid duplicate key error
       const { is_traction: _ignored, ...otherFlags } = mapOptionsToFlags(options);
       const updatePayload = {
         treatment_name: '견인',
         ...otherFlags,
         is_traction: true
       };
       updateVisitWithBedSync(selectingLogId, updatePayload);
       setSelectingLogId(null);
    } else {
       startTraction(bedId, duration, options);
       setSelectingBedId(null);
    }
  };
  
  // Log Mode: Clear content
  const handleClearLog = () => {
    if (selectingLogId) {
      updateVisitWithBedSync(selectingLogId, {
        treatment_name: '',
        is_injection: false,
        is_fluid: false,
        is_traction: false,
        is_eswt: false,
        is_manual: false,
      });
      setSelectingLogId(null);
    }
  };

  // Determine active log entry and initial values for the modal
  const activeLogEntry = useMemo(() => {
    if (!selectingLogId) return null;
    return visits.find(v => v.id === selectingLogId) || null;
  }, [selectingLogId, visits]);

  // Memoize initial options to pass correct flags to modal
  const modalInitialOptions = useMemo(() => {
    if (activeLogEntry) {
      return {
        isInjection: !!activeLogEntry.is_injection,
        isFluid: !!activeLogEntry.is_fluid,
        isTraction: !!activeLogEntry.is_traction,
        isESWT: !!activeLogEntry.is_eswt,
        isManual: !!activeLogEntry.is_manual,
      };
    }
    return undefined;
  }, [activeLogEntry]);

  const modalInitialPreset = useMemo(() => {
    if (activeLogEntry) {
      return findMatchingPreset(presets, activeLogEntry.treatment_name);
    }
    return undefined;
  }, [activeLogEntry, presets]);


  // Helper to get editing bed data
  const getBed = (id: number) => beds.find(b => b.id === id) || beds[0];
  const editingBed = editingBedId ? getBed(editingBedId) : null;
  const editingBedSteps = editingBed ? (editingBed.customPreset?.steps || presets.find(p => p.id === editingBed.currentPresetId)?.steps || []) : [];

  const isModalOpen = selectingBedId !== null || selectingLogId !== null;
  // If editing a log, pass a dummy ID (e.g. 0) or handle null inside the modal. 
  const targetBedIdForModal = selectingBedId !== null ? selectingBedId : (selectingLogId ? 0 : null);

  return (
    <Suspense fallback={null}>
      {/* Preset Selector Modal */}
      <PresetSelectorModal 
        isOpen={isModalOpen}
        onClose={() => {
          setSelectingBedId(null);
          setSelectingLogId(null);
        }}
        presets={presets}
        onSelect={handleSelectPreset}
        onCustomStart={handleCustomStart}
        onQuickStart={handleQuickStart}
        onStartTraction={handleStartTraction}
        onClearLog={handleClearLog}
        targetBedId={targetBedIdForModal}
        initialOptions={modalInitialOptions}
        initialPreset={modalInitialPreset}
      />

      {/* Edit Overlay */}
      {editingBed && (
        <BedEditOverlay 
          bed={editingBed}
          steps={editingBedSteps}
          onClose={() => setEditingBedId(null)}
          onToggleInjection={toggleInjection}
          onToggleFluid={toggleFluid}
          onToggleTraction={toggleTraction}
          onToggleESWT={toggleESWT}
          onToggleManual={toggleManual}
          onUpdateSteps={updateBedSteps}
          onUpdateDuration={updateBedDuration}
        />
      )}

      {/* Bed Move Modal (Smart Position) */}
      {movingPatientState !== null && (
        <BedMoveModal 
          fromBedId={movingPatientState.bedId}
          initialPos={{ x: movingPatientState.x, y: movingPatientState.y }}
          onClose={() => setMovingPatientState(null)}
          onConfirm={(toBedId) => movePatient(movingPatientState.bedId, toBedId)}
        />
      )}

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={isMenuOpen} 
        onClose={onCloseMenu}
        presets={presets}
        onUpdatePresets={updatePresets}
        onResetAllBeds={resetAll}
      />

      {/* Backdrop for Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onCloseMenu} />
      )}
    </Suspense>
  );
};
