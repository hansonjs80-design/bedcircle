import React from 'react';
import { PlusCircle } from 'lucide-react';

interface BedEmptyStateProps {
  onOpenSelector: () => void;
}

export const BedEmptyState: React.FC<BedEmptyStateProps> = ({ onOpenSelector }) => {
  return (
    <div 
      onDoubleClick={onOpenSelector}
      className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-all group cursor-pointer"
    >
      <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform landscape:p-1 sm:landscape:p-1 lg:landscape:p-1.5 landscape:mb-1">
        <PlusCircle className="w-8 h-8 opacity-30 group-hover:opacity-100 text-brand-600 landscape:w-4 landscape:h-4 sm:landscape:w-4 sm:landscape:h-4 lg:landscape:w-6 lg:landscape:h-6" />
      </div>
      <span className="text-xl sm:text-2xl font-black text-gray-400 dark:text-gray-500 landscape:text-xs sm:landscape:text-xs lg:landscape:text-base">빈 배드</span>
    </div>
  );
};