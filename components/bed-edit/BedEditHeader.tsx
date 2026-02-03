import React from 'react';
import { Settings, X } from 'lucide-react';

interface BedEditHeaderProps {
  bedId: number;
  onClose: () => void;
}

export const BedEditHeader: React.FC<BedEditHeaderProps> = ({ bedId, onClose }) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 shrink-0">
     <div className="flex items-center gap-2">
       <div className="p-2 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg">
          <Settings className="w-5 h-5" />
       </div>
       <div>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block">설정 및 수정</span>
          <h3 className="font-black text-lg text-gray-800 dark:text-white leading-none">
            {bedId === 11 ? '견인치료기' : `${bedId}번 배드`}
          </h3>
       </div>
     </div>
     <button 
       onClick={onClose}
       className="p-2 bg-gray-200 dark:bg-slate-700 rounded-full hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
     >
       <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
     </button>
  </div>
);