import React from 'react';
import { ChevronLeft, ChevronRight, ClipboardList, CalendarCheck, Printer, X } from 'lucide-react';

interface PatientLogHeaderProps {
  totalCount: number;
  currentDate: string;
  onDateChange: (offset: number) => void;
  onDateSelect: (date: string) => void;
  onPrint: () => void;
  onClose?: () => void;
}

export const PatientLogHeader: React.FC<PatientLogHeaderProps> = ({
  totalCount,
  currentDate,
  onDateChange,
  onDateSelect,
  onPrint,
  onClose
}) => {
  const handleTodayClick = () => {
    // 로컬 시간대 기준 오늘 날짜 계산 (UTC 보정)
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localDate = new Date(now.getTime() - offset).toISOString().split('T')[0];
    onDateSelect(localDate);
  };

  return (
    // 상단 패딩을 넉넉하게 조정 (safe-area + 1.5rem ~ 24px)
    <div className="shrink-0 px-4 pb-4 pt-[calc(1.5rem+env(safe-area-inset-top))] border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex flex-row items-center justify-between gap-2 touch-none">
      <div className="flex items-center gap-3">
        <h3 className="font-black text-lg text-gray-800 dark:text-white flex items-center gap-2 whitespace-nowrap">
          <ClipboardList className="w-5 h-5 text-brand-600" />
          <span className="hidden xs:inline">환자 현황</span>
        </h3>
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-baseline gap-1 select-none">
          총 <span className="text-brand-600 dark:text-brand-400 text-xl font-black leading-none">{totalCount}</span>명
        </span>
      </div>
      
      <div className="flex items-center gap-2">
         {/* Print Button - Hidden on small mobile screens to save space for Date/Close */}
         <button 
           onClick={onPrint}
           className="hidden sm:block p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-gray-500 transition-colors"
           title="리스트 출력 (A4)"
         >
           <Printer className="w-4 h-4" />
         </button>

         <div className="flex items-center bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <button 
            onClick={() => onDateChange(-1)}
            className="p-1 sm:p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors text-gray-500"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <input 
            type="date" 
            value={currentDate}
            onChange={(e) => onDateSelect(e.target.value)}
            className="bg-transparent font-bold text-gray-700 dark:text-gray-200 outline-none text-center cursor-pointer text-xs sm:text-sm w-[75px] xs:w-[85px] landscape:w-[110px] md:w-[110px]"
          />
          
          <button 
            onClick={() => onDateChange(1)}
            className="p-1 sm:p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors text-gray-500"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1 hidden xs:block"></div>

          <button 
            onClick={handleTodayClick}
            className="hidden xs:block p-1.5 hover:bg-brand-50 dark:hover:bg-slate-700 rounded-md transition-colors group"
            title="오늘 날짜로 이동"
          >
            <CalendarCheck className="w-4 h-4 text-gray-400 group-hover:text-brand-600 dark:text-gray-500 dark:group-hover:text-brand-400" />
          </button>
        </div>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 bg-gray-200 dark:bg-slate-700 rounded-full hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors ml-1 shadow-sm active:scale-90"
            title="닫기"
          >
            <X className="w-4.5 h-4.5 text-gray-600 dark:text-gray-300" />
          </button>
        )}
      </div>
    </div>
  );
};