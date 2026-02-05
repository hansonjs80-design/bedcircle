import React, { useState, useEffect, memo } from 'react';
import { X, Play, ChevronLeft, Eraser } from 'lucide-react';
import { Preset, TreatmentStep, QuickTreatment } from '../types';
import { OptionToggles } from './preset-selector/OptionToggles';
import { PresetListView } from './preset-selector/PresetListView';
import { QuickStartGrid } from './preset-selector/QuickStartGrid';
import { TreatmentPreview } from './preset-selector/TreatmentPreview';

interface PresetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: Preset[];
  onSelect: (bedId: number, presetId: string, options: any) => void;
  onCustomStart: (bedId: number, name: string, steps: TreatmentStep[], options: any) => void;
  onQuickStart: (bedId: number, template: QuickTreatment, options: any) => void;
  onStartTraction: (bedId: number, duration: number, options: any) => void;
  onClearLog?: () => void;
  targetBedId: number | null;
  initialOptions?: {
    isInjection: boolean;
    isManual: boolean;
    isESWT: boolean;
    isTraction: boolean;
    isFluid: boolean;
  };
  initialPreset?: Preset;
}

export const PresetSelectorModal: React.FC<PresetSelectorModalProps> = memo(({
  isOpen,
  onClose,
  presets,
  onSelect,
  onCustomStart,
  onQuickStart,
  onStartTraction,
  onClearLog,
  targetBedId,
  initialOptions,
  initialPreset
}) => {
  const [tractionDuration, setTractionDuration] = useState(15);
  const [previewPreset, setPreviewPreset] = useState<Preset | null>(null);
  
  const [options, setOptions] = useState({
    isInjection: false,
    isManual: false,
    isESWT: false,
    isTraction: false,
    isFluid: false
  });

  useEffect(() => {
    if (isOpen) {
      if (initialOptions) {
        setOptions(initialOptions);
      } else {
        setOptions({ isInjection: false, isManual: false, isESWT: false, isTraction: false, isFluid: false });
      }
      
      if (initialPreset) {
        setPreviewPreset(JSON.parse(JSON.stringify(initialPreset)));
      } else {
        setPreviewPreset(null);
      }
    }
  }, [isOpen, initialOptions, initialPreset]);

  if (!isOpen || targetBedId === null) return null;

  const isTractionBed = targetBedId === 11;
  const isLogMode = targetBedId === 0;

  const handleTractionStart = () => {
    onStartTraction(targetBedId, tractionDuration, options);
    onClose();
  };

  const handleConfirmStart = () => {
    if (previewPreset) {
      onCustomStart(targetBedId, previewPreset.name, previewPreset.steps, options);
      onClose();
    }
  };

  const handleQuickItemClick = (template: QuickTreatment) => {
    const initialStep: TreatmentStep = {
      id: crypto.randomUUID(),
      name: template.name,
      duration: template.duration * 60,
      enableTimer: template.enableTimer,
      color: template.color
    };

    setPreviewPreset({
      id: `temp-${Date.now()}`,
      name: template.name,
      steps: [initialStep]
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:w-[520px] max-h-[90vh] sm:max-h-[95vh] bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2">
            {previewPreset && (
              <button 
                onClick={() => setPreviewPreset(null)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors mr-1"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            )}
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                {previewPreset ? '치료 구성 확인' : (isTractionBed ? '견인 치료 설정' : (isLogMode ? '처방 수정' : '설정 및 시작'))}
              </span>
              <h3 className="font-black text-lg sm:text-xl text-gray-800 dark:text-white leading-none">
                {isLogMode ? '환자 처방 수정' : (targetBedId === 11 ? '견인기' : `BED ${targetBedId}`)}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-gray-200 dark:bg-slate-700 rounded-full hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        <OptionToggles options={options} setOptions={setOptions} />

        {/* Content Area: Reduced padding on mobile (p-2) to allow 4-col grid to fit better */}
        <div className="p-2 sm:p-5 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
          {previewPreset ? (
             <TreatmentPreview 
               preset={previewPreset} 
               setPreset={setPreviewPreset} 
               onConfirm={handleConfirmStart} 
             />
          ) : isTractionBed ? (
            <div className="flex flex-col gap-6 py-4">
              <div className="flex flex-col items-center gap-2">
                <label className="text-sm font-bold text-gray-500 dark:text-gray-400">시간 설정 (분)</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setTractionDuration(Math.max(1, tractionDuration - 1))} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xl font-bold">-</button>
                  <div className="w-24 text-center"><span className="text-5xl font-black text-brand-600 dark:text-brand-400">{tractionDuration}</span></div>
                  <button onClick={() => setTractionDuration(tractionDuration + 1)} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xl font-bold">+</button>
                </div>
              </div>
              <button onClick={handleTractionStart} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"><Play className="w-6 h-6 fill-current" /> 치료 시작</button>
            </div>
          ) : (
            <>
              <PresetListView 
                presets={presets} 
                onSelect={(p) => setPreviewPreset(JSON.parse(JSON.stringify(p)))} 
              />
              <div className="h-px bg-gray-100 dark:bg-slate-700 my-1" />
              <QuickStartGrid 
                onQuickStart={handleQuickItemClick} 
              />
            </>
          )}
        </div>
        
        <div className="p-3 sm:px-5 sm:pb-5 bg-gray-50 dark:bg-slate-900/50 text-center border-t border-gray-100 dark:border-slate-700 shrink-0 flex gap-2">
           {isLogMode && onClearLog && (
             <button 
               onClick={() => { onClearLog(); onClose(); }} 
               className="flex-1 py-2.5 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-xl transition-colors flex items-center justify-center gap-1"
             >
               <Eraser className="w-4 h-4" />
               내용 비우기
             </button>
           )}
           <button 
             onClick={onClose} 
             className={`${isLogMode ? 'flex-1' : 'w-full'} py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-colors`}
           >
             취소
           </button>
        </div>
      </div>
    </div>
  );
});