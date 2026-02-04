
import React from 'react';
import { Syringe, Hand, Zap, ArrowUpFromLine, Droplet } from 'lucide-react';

interface OptionTogglesProps {
  options: { isInjection: boolean; isManual: boolean; isESWT: boolean; isTraction: boolean; isFluid?: boolean };
  setOptions: React.Dispatch<React.SetStateAction<any>>;
}

export const OptionToggles: React.FC<OptionTogglesProps> = ({ options, setOptions }) => {
  const toggle = (key: string) => {
    setOptions((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const buttons = [
    { key: 'isInjection', label: '주사', icon: Syringe, color: 'red' },
    { key: 'isFluid', label: '수액', icon: Droplet, color: 'cyan' },
    { key: 'isManual', label: '도수', icon: Hand, color: 'violet' },
    { key: 'isESWT', label: '충격파', icon: Zap, color: 'blue' },
    { key: 'isTraction', label: '견인', icon: ArrowUpFromLine, color: 'orange' },
  ];

  return (
    <div className="p-1 sm:px-4 sm:py-2 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 grid grid-cols-5 gap-1 sm:gap-2 shrink-0">
      {buttons.map(({ key, label, icon: Icon, color }) => {
        const isActive = options[key as keyof typeof options];
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`flex flex-col items-center justify-center py-1.5 sm:py-2.5 rounded-md sm:rounded-lg border transition-all active:scale-95 ${
              isActive 
                ? `bg-${color}-50 border-${color}-200 text-${color}-600 dark:bg-${color}-900/30 dark:border-${color}-800 dark:text-${color}-400` 
                : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-600'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5 ${isActive ? 'animate-bounce' : ''}`} />
            <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap leading-none">{label}</span>
          </button>
        );
      })}
    </div>
  );
};
