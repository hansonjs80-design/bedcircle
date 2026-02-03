import { Preset, TreatmentStep } from '../types';

/**
 * 빠른 시작(Quick Start)을 위한 단계 객체 생성
 */
export const createQuickStep = (
  name: string, 
  minutes: number, 
  enableTimer: boolean, 
  color: string
): TreatmentStep => ({
  id: crypto.randomUUID(),
  name,
  duration: minutes * 60,
  enableTimer,
  color
});

/**
 * 커스텀 처방 객체 생성
 */
export const createCustomPreset = (name: string, steps: TreatmentStep[]): Preset => ({
  id: `custom-${Date.now()}`,
  name,
  steps
});

/**
 * 견인 치료 전용 처방 객체 생성
 */
export const createTractionPreset = (durationMinutes: number): Preset => ({
  id: `traction-${Date.now()}`,
  name: '견인 치료',
  steps: [{ 
    id: 'tr', 
    name: '견인 (Traction)', 
    duration: durationMinutes * 60, 
    enableTimer: true, 
    color: 'bg-orange-500' 
  }]
});

/**
 * 단계 순서 변경(Swap) 및 임시 처방 생성 로직
 */
export const createSwappedPreset = (
  originalPreset: Preset | undefined,
  currentPresetId: string | null,
  fallbackPresets: Preset[],
  idx1: number,
  idx2: number
): { preset: Preset; steps: TreatmentStep[] } | null => {
  
  // 원본 단계 배열 복사
  let steps = [...(originalPreset?.steps || fallbackPresets.find(p => p.id === currentPresetId)?.steps || [])];
  
  if (steps.length === 0) return null;
  if (idx1 < 0 || idx1 >= steps.length || idx2 < 0 || idx2 >= steps.length) return null;

  // 순서 교환
  [steps[idx1], steps[idx2]] = [steps[idx2], steps[idx1]];

  const newCustomPreset: Preset = {
     id: originalPreset?.id || `custom-swap-${Date.now()}`,
     name: originalPreset?.name || (fallbackPresets.find(p => p.id === currentPresetId)?.name || 'Custom'),
     steps: steps
  };

  return { preset: newCustomPreset, steps };
};