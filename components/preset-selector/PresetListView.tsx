import React, { useState, useMemo } from 'react';
import { Play, ArrowUpDown, Filter } from 'lucide-react';
import { Preset } from '../../types';
import { getAbbreviation } from '../../utils/bedUtils';

interface PresetListViewProps {
  presets: Preset[];
  onSelect: (preset: Preset) => void;
}

export const PresetListView: React.FC<PresetListViewProps> = ({ presets, onSelect }) => {
  const [filterStep, setFilterStep] = useState<'all' | number>('all');
  // 기본 정렬을 'none'으로 설정하여 설정 탭의 순서(Rank)를 그대로 따르도록 함
  const [sortDir, setSortDir] = useState<'none' | 'asc' | 'desc'>('none');

  const processedPresets = useMemo(() => {
    let result = [...presets];

    if (filterStep !== 'all') {
      result = result.filter(p => p.steps.length === filterStep);
    }

    // 정렬이 활성화된 경우에만 단계 수 기준으로 정렬
    if (sortDir !== 'none') {
      result.sort((a, b) => {
        const diff = a.steps.length - b.steps.length;
        return sortDir === 'asc' ? diff : -diff;
      });
    }

    return result;
  }, [presets, filterStep, sortDir]);

  const toggleSort = () => setSortDir(prev => {
    if (prev === 'none') return 'desc';
    if (prev === 'desc') return 'asc';
    return 'none';
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
          <Filter className="w-3 h-3" />
          처방 목록 (Presets)
        </p>

        <div className="flex items-center gap-1.5">
          <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-0.5">
            <button 
              onClick={() => setFilterStep('all')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${filterStep === 'all' ? 'bg-white dark:bg-slate-600 text-brand-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:text-gray-400'}`}
            >
              ALL
            </button>
            <button 
              onClick={() => setFilterStep(2)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${filterStep === 2 ? 'bg-white dark:bg-slate-600 text-brand-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:text-gray-400'}`}
            >
              2
            </button>
            <button 
              onClick={() => setFilterStep(3)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${filterStep === 3 ? 'bg-white dark:bg-slate-600 text-brand-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:text-gray-400'}`}
            >
              3
            </button>
          </div>

          <button 
            onClick={toggleSort}
            title={sortDir === 'none' ? "단계 수 정렬" : (sortDir === 'desc' ? "단계 많은 순" : "단계 적은 순")}
            className={`p-1 rounded-lg transition-colors flex items-center gap-1 ${sortDir !== 'none' ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-700'}`}
          >
            <ArrowUpDown className="w-3 h-3" />
            {sortDir !== 'none' && <span className="text-[9px] font-bold">{sortDir === 'desc' ? '▼' : '▲'}</span>}
          </button>
        </div>
      </div>

      {/* 
        Container Height Update:
        - Mobile: max-h-[290px]
        - Tablet/Desktop (sm+): max-h-[360px] (Increased from 260px to fill larger modal)
      */}
      <div className="grid gap-1 max-h-[290px] sm:max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
        {processedPresets.length === 0 ? (
           <div className="text-center py-6 text-gray-400 border border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
             <span className="text-xs">조건에 맞는 처방이 없습니다.</span>
           </div>
        ) : (
          processedPresets.map(preset => (
            <button
              key={preset.id}
              onClick={() => onSelect(preset)}
              className="w-full px-2 py-1.5 flex items-center justify-between bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-brand-300 dark:hover:border-slate-500 hover:bg-brand-50/50 dark:hover:bg-slate-700/50 transition-all group active:scale-[0.99] shadow-sm"
            >
              <div className="flex flex-row items-center min-w-0 flex-1 gap-2">
                <div className="flex items-center gap-2 shrink-0">
                   <span className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">
                     {preset.name}
                   </span>
                </div>
                
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-1 min-w-0">
                  {preset.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center">
                      <span className={`text-[9px] px-1 py-0.5 rounded-sm font-black text-white ${step.color.replace('bg-', 'bg-opacity-90 bg-')}`}>
                        {getAbbreviation(step.name)}
                      </span>
                      {idx < preset.steps.length - 1 && (
                        <div className="w-2 h-px bg-gray-300 dark:bg-slate-600 mx-0.5" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 
                 Updated Layout:
                 - Duration moved to left of button
                 - Using flex-row instead of flex-col
                 - Added gap-1.5
              */}
              <div className="pl-2 flex flex-row items-center gap-1.5 shrink-0">
                 <span className="text-[10px] font-bold text-gray-400 group-hover:text-brand-600 transition-colors">
                   {Math.floor(preset.steps.reduce((acc, s) => acc + s.duration, 0) / 60)}분
                 </span>
                 <div className="h-5 w-5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                 </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};