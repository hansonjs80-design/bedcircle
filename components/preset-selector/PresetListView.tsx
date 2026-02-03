import React, { useState, useMemo } from 'react';
import { Play, ArrowUpDown } from 'lucide-react';
import { Preset } from '../../types';

interface PresetListViewProps {
  presets: Preset[];
  onSelect: (preset: Preset) => void;
}

export const PresetListView: React.FC<PresetListViewProps> = ({ presets, onSelect }) => {
  const [filterStep, setFilterStep] = useState<'all' | number>('all');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const processedPresets = useMemo(() => {
    let result = [...presets];

    // Filter by step count
    if (filterStep !== 'all') {
      result = result.filter(p => p.steps.length === filterStep);
    }

    // Sort by step count
    result.sort((a, b) => {
      const diff = a.steps.length - b.steps.length;
      return sortDir === 'asc' ? diff : -diff;
    });

    return result;
  }, [presets, filterStep, sortDir]);

  const toggleSort = () => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          처방 프리셋 (Presets)
        </p>

        <div className="flex items-center gap-2">
          {/* Filter Segmented Control */}
          <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-0.5">
            <button 
              onClick={() => setFilterStep('all')}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${filterStep === 'all' ? 'bg-white dark:bg-slate-600 text-brand-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              ALL
            </button>
            <button 
              onClick={() => setFilterStep(2)}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${filterStep === 2 ? 'bg-white dark:bg-slate-600 text-brand-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              2단계
            </button>
            <button 
              onClick={() => setFilterStep(3)}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${filterStep === 3 ? 'bg-white dark:bg-slate-600 text-brand-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              3단계
            </button>
          </div>

          {/* Sort Button */}
          <button 
            onClick={toggleSort}
            className={`p-1.5 rounded-lg transition-colors ${sortDir === 'desc' ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400'}`}
            title={sortDir === 'asc' ? '단계 적은 순' : '단계 많은 순'}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
        {processedPresets.length === 0 ? (
           <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
             <span className="text-xs">조건에 맞는 처방이 없습니다.</span>
           </div>
        ) : (
          processedPresets.map(preset => (
            <button
              key={preset.id}
              onClick={() => onSelect(preset)}
              className="w-full p-4 flex items-center justify-between bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-brand-50 hover:border-brand-200 dark:hover:bg-slate-700 dark:hover:border-slate-600 transition-all group active:scale-[0.98]"
            >
              <div className="flex flex-col items-start text-left">
                <div className="flex items-center gap-2">
                   <span className="font-bold text-gray-800 dark:text-gray-100 text-lg group-hover:text-brand-700 dark:group-hover:text-brand-300">
                     {preset.name}
                   </span>
                   <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${preset.steps.length >= 3 ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300' : 'bg-gray-100 text-gray-500 dark:bg-slate-900 dark:text-gray-400'}`}>
                     {preset.steps.length}단계
                   </span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[200px]">
                  {preset.steps.map(s => s.name).join(' + ')}
                </span>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900">
                <Play className="w-4 h-4 text-gray-400 group-hover:text-brand-600 fill-current" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};