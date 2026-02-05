import React, { useState, useRef, useEffect } from 'react';
import { TOTAL_BEDS } from '../../constants';
import { Edit3, PlayCircle, X, ChevronRight, Hash } from 'lucide-react';

interface BedSelectorCellProps {
  value: number | null;
  onMove: (newBedId: number) => void;
  onAssign: (newBedId: number) => void;
  className?: string;
  onUpdateLogOnly?: (newBedId: number) => void; 
}

export const BedSelectorCell: React.FC<BedSelectorCellProps> = ({ 
  value, 
  onMove, 
  onAssign,
  className,
  onUpdateLogOnly
}) => {
  const [mode, setMode] = useState<'view' | 'menu' | 'edit_log' | 'edit_assign'>('view');
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ((mode === 'edit_log' || mode === 'edit_assign') && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [mode]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    let x = e.clientX;
    let y = e.clientY;
    
    if (x > window.innerWidth - 250) x = window.innerWidth - 260;
    if (y > window.innerHeight - 200) y = window.innerHeight - 210;

    setMenuPos({ x, y });
    setMode('menu');
  };

  const handleCommit = (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
      if (mode === 'view' || mode === 'menu') return;

      const target = e.currentTarget;
      const newVal = parseInt(target.value);

      if (!isNaN(newVal) && newVal > 0) {
          if (mode === 'edit_log' && onUpdateLogOnly) {
              onUpdateLogOnly(newVal);
          } 
          else if (mode === 'edit_assign') {
              if (value && newVal !== value) {
                  onMove(newVal);
              } else if (!value) {
                  onAssign(newVal);
              }
          }
      }
      setMode('view');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          handleCommit(e);
      } else if (e.key === 'Escape') {
          setMode('view');
      }
  };

  const closeMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      setMode('view');
  };

  const renderMenu = () => {
      if (mode !== 'menu' && mode !== 'edit_log' && mode !== 'edit_assign') return null;

      return (
        <div 
            className="fixed inset-0 z-[9999] bg-transparent"
            onClick={closeMenu}
        >
           <div 
             className="absolute bg-white dark:bg-slate-800 w-64 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-150 origin-top-left"
             style={{ top: menuPos.y, left: menuPos.x }}
             onClick={(e) => e.stopPropagation()}
           >
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                  <span className="font-bold text-gray-800 dark:text-white text-xs">
                      {mode === 'menu' ? `방 번호 수정 (현재: ${value || '-'})` : (mode === 'edit_log' ? '단순 표기 수정' : '배드 배정/이동')}
                  </span>
                  <button onClick={closeMenu} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                  </button>
              </div>

              {mode === 'menu' ? (
                  <div className="p-2 flex flex-col gap-1">
                      <button 
                        onClick={() => setMode('edit_log')}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-left group"
                      >
                          <div className="p-2 bg-gray-100 dark:bg-slate-600 rounded-full group-hover:bg-white dark:group-hover:bg-slate-500 shadow-sm">
                              <Edit3 className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                          </div>
                          <div>
                              <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">단순 수정</span>
                              <span className="block text-[10px] text-gray-500 dark:text-gray-400">로그만 변경 (배드 미작동)</span>
                          </div>
                      </button>

                      <button 
                        onClick={() => setMode('edit_assign')}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors text-left group"
                      >
                          <div className="p-2 bg-brand-100 dark:bg-brand-900 rounded-full group-hover:bg-white dark:group-hover:bg-brand-800 shadow-sm">
                              <PlayCircle className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                          </div>
                          <div>
                              <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">배드 배정/이동</span>
                              <span className="block text-[10px] text-gray-500 dark:text-gray-400">배드 활성화 및 환자 이동</span>
                          </div>
                      </button>
                  </div>
              ) : (
                  <div className="p-4">
                      <div className="flex items-center gap-2 border-2 border-brand-500 rounded-lg p-1 focus-within:ring-2 focus-within:ring-brand-200 transition-all">
                          <Hash className="w-5 h-5 text-gray-400 ml-1" />
                          <input
                            ref={inputRef}
                            type="number"
                            defaultValue={value || ''}
                            onBlur={handleCommit}
                            onKeyDown={handleKeyDown}
                            className="w-full text-lg font-bold bg-transparent outline-none p-1 text-gray-900 dark:text-white"
                            placeholder="번호 입력..."
                          />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2 text-center">
                          엔터(Enter)를 누르면 저장됩니다.
                      </p>
                  </div>
              )}
           </div>
        </div>
      );
  };

  return (
    <>
        <div 
        onDoubleClick={handleDoubleClick}
        className={`w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors group select-none ${className}`}
        title="더블클릭하여 수정/배정 메뉴 열기"
        >
        {value ? (
            <span className="text-base sm:text-lg xl:text-[12px] font-black text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform">
            {value}
            </span>
        ) : (
            <span className="text-gray-300 dark:text-gray-600 text-sm xl:text-[12px] font-bold">-</span>
        )}
        </div>
        {renderMenu()}
    </>
  );
};