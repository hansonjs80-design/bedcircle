import React from 'react';
import { Play, ChevronUp, ChevronDown, Minus, Plus, PlusCircle, Trash2 } from 'lucide-react';
import { Preset, TreatmentStep, QuickTreatment } from '../../types';
import { useTreatmentContext } from '../../contexts/TreatmentContext';

interface TreatmentPreviewProps {
  preset: Preset;
  setPreset: React.Dispatch<React.SetStateAction<Preset | null>>;
  onConfirm: () => void;
}

export const TreatmentPreview: React.FC<TreatmentPreviewProps> = ({ preset, setPreset, onConfirm }) => {
  const { quickTreatments } = useTreatmentContext();

  const updateDuration = (idx: number, change: number) => {
    const newSteps = [...preset.steps];
    const newDur = Math.max(60, newSteps[idx].duration + (change * 60));
    newSteps[idx] = { ...newSteps[idx], duration: newDur };
    setPreset({ ...preset, steps: newSteps });
  };

  const moveStep = (idx: number, direction: 'up' | 'down') => {
    const newSteps = [...preset.steps];
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= newSteps.length) return;
    [newSteps[idx], newSteps[target]] = [newSteps[target], newSteps[idx]];
    setPreset({ ...preset, steps: newSteps });
  };

  const removeStep = (idx: number) => {
    const newSteps = preset.steps.filter((_, i) => i !== idx);
    setPreset({ ...preset, steps: newSteps });
  };

  const addTreatment = (template: QuickTreatment) => {
    const newStep: TreatmentStep = {
      id: crypto.randomUUID(),
      name: template.name,
      duration: template.duration * 60,
      enableTimer: template.enableTimer,
      color: template.color
    };
    setPreset({ 
      ...preset, 
      name: preset.steps.length === 0 ? template.name : preset.name,
      steps: [...preset.steps, newStep] 
    });
  };

  return (
    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
      <div className="bg-brand-50 dark:bg-brand-900/20 p-3 rounded-xl border border-brand-100 dark:border-brand-800">
        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest block mb-1">선택된 치료 구성</span>
        <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
          {preset.steps.length > 0 ? preset.name : "치료를 선택해주세요"}
        </h4>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">치료 순서 및 시간 수정</p>
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar min-h-[60px]">
          {preset.steps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-2xl">
              <span className="text-xs font-bold">목록이 비어 있습니다</span>
            </div>
          ) : (
            preset.steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm transition-all hover:bg-white dark:hover:bg-slate-700/50">
                
                {/* 순서 변경 컨트롤 (좌측) */}
                <div className="flex flex-col bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm shrink-0">
                  <button 
                    onClick={() => moveStep(idx, 'up')} 
                    disabled={idx === 0} 
                    className="p-2 text-gray-400 disabled:opacity-10 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors active:scale-90"
                    aria-label="위로 이동"
                  >
                    <ChevronUp className="w-4 h-4" strokeWidth={3} />
                  </button>
                  <div className="h-px bg-gray-100 dark:bg-slate-700" />
                  <button 
                    onClick={() => moveStep(idx, 'down')} 
                    disabled={idx === preset.steps.length - 1} 
                    className="p-2 text-gray-400 disabled:opacity-10 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors active:scale-90"
                    aria-label="아래로 이동"
                  >
                    <ChevronDown className="w-4 h-4" strokeWidth={3} />
                  </button>
                </div>

                {/* 색상 표시 바 */}
                <div className={`w-1.5 h-10 rounded-full shrink-0 ${step.color}`} />
                
                {/* 치료 명칭 (가운데) */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-800 dark:text-gray-100 truncate tracking-tight">{step.name}</p>
                </div>

                {/* 시간 조정기 (우측) */}
                <div className="flex items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl p-1 shadow-inner shrink-0 gap-1">
                  <div className="flex items-center">
                    <button 
                      onClick={() => updateDuration(idx, -1)} 
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 transition-colors active:scale-90"
                    >
                      <Minus className="w-3 h-3" strokeWidth={3} />
                    </button>
                    
                    <div className="px-1 min-w-[44px] flex flex-col items-center justify-center leading-none">
                      <span className="text-sm font-black text-brand-600 dark:text-brand-400">
                        {Math.floor(step.duration / 60)}
                      </span>
                      <span className="text-[8px] font-bold text-gray-400">분</span>
                    </div>

                    <button 
                      onClick={() => updateDuration(idx, 1)} 
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-brand-600 transition-colors active:scale-90"
                    >
                      <Plus className="w-3 h-3" strokeWidth={3} />
                    </button>
                  </div>
                  
                  {/* 삭제 버튼 추가 */}
                  <div className="w-px h-4 bg-gray-100 dark:bg-slate-700 mx-0.5" />
                  <button 
                    onClick={() => removeStep(idx)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <button 
        onClick={onConfirm}
        disabled={preset.steps.length === 0}
        className="w-full py-4 bg-brand-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-brand-500/20 hover:bg-brand-700 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all mt-4 mb-2 disabled:opacity-50 disabled:pointer-events-none"
      >
        <Play className="w-6 h-6 fill-current" />
        설정 확인 및 치료 시작
      </button>

      {/* 추가 치료 선택 섹션 */}
      <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-slate-700">
        <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 flex items-center gap-1.5">
          <PlusCircle className="w-3.5 h-3.5" />
          치료 추가 (Quick Add)
        </p>
        <div className="flex flex-wrap gap-1.5 px-1">
          {quickTreatments.map((item) => (
            <button
              key={item.id}
              onClick={() => addTreatment(item)}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-full text-[10px] font-black text-gray-600 dark:text-gray-300 hover:border-brand-500 hover:text-brand-600 transition-all active:scale-95 flex items-center gap-1 shadow-sm"
            >
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};