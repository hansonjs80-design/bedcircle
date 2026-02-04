
import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';

interface BedTrashButtonProps {
  trashState: 'idle' | 'confirm' | 'deleting';
  onClick: (e: React.MouseEvent) => void;
}

export const BedTrashButton: React.FC<BedTrashButtonProps> = ({ trashState, onClick }) => {
  return (
    <button 
      onClick={onClick}
      disabled={trashState === 'deleting'}
      className={`p-1.5 sm:p-2 landscape:p-1 sm:landscape:p-0.5 lg:landscape:p-1 rounded-lg transition-all duration-200 flex items-center gap-1 overflow-hidden ${
        trashState === 'idle' ? 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30' :
        trashState === 'confirm' ? 'bg-red-600 text-white w-auto px-3 landscape:px-2' :
        'bg-gray-100 text-gray-500 w-auto px-3 landscape:px-2'
      } active:scale-90`}
    >
      {trashState === 'idle' && <Trash2 className="w-4 h-4 sm:w-[24px] sm:h-[24px] landscape:w-4 landscape:h-4 sm:landscape:w-[14px] sm:landscape:h-[14px] lg:landscape:w-[22px] lg:landscape:h-[22px]" />}
      {trashState === 'confirm' && <span className="text-sm sm:text-base landscape:text-xs font-bold whitespace-nowrap">삭제</span>}
      {trashState === 'deleting' && <Loader2 className="w-4 h-4 sm:w-[24px] sm:h-[24px] landscape:w-4 landscape:h-4 sm:landscape:w-[14px] sm:landscape:h-[14px] lg:landscape:w-[22px] lg:landscape:h-[22px] animate-spin" />}
    </button>
  );
};
