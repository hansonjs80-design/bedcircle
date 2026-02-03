import React, { useState, useRef, useEffect } from 'react';
import { Edit3, List, X, Activity, CheckCircle } from 'lucide-react';
import { PatientStatusIcons } from './PatientStatusIcons';
import { PatientVisit } from '../../types';

interface TreatmentSelectorCellProps {
  visit?: PatientVisit;
  value: string;
  placeholder?: string;
  rowStatus?: 'active' | 'completed' | 'none';
  onCommitText: (val: string) => void;
  onOpenSelector: () => void;
  directSelector?: boolean; // If true, skips menu and goes straight to selector
}

export const TreatmentSelectorCell: React.FC<TreatmentSelectorCellProps> = ({ 
  visit,
  value, 
  placeholder,
  rowStatus = 'none',
  onCommitText, 
  onOpenSelector,
  directSelector = false
}) => {
  const [mode, setMode] = useState<'view' | 'menu' | 'edit_text'>('view');
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'edit_text' && inputRef.current) {
      inputRef.current.focus();
      // 커서를 끝으로 이동
      inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
    }
  }, [mode]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // If directSelector is enabled (e.g. no bed ID), skip menu and open selector directly
    if (directSelector) {
        onOpenSelector();
        return;
    }
    
    // 화면 경계 체크하여 메뉴 위치 조정 (Responsive)
    let x = e.clientX;
    let y = e.clientY;
    const menuWidth = 260;
    const menuHeight = 210;
    
    if (x > window.innerWidth - menuWidth) x = window.innerWidth - menuWidth - 10;
    if (y > window.innerHeight - menuHeight) y = window.innerHeight - menuHeight - 10;

    setMenuPos({ x, y });
    setMode('menu');
  };

  const handleTextCommit = (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
      const target = e.currentTarget;
      // 값이 변경되었을 때만 커밋
      if (target.value !== value) {
          onCommitText(target.value);
      }
      setMode('view');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          inputRef.current?.blur(); // Triggers onBlur which handles commit
      } else if (e.key === 'Escape') {
          setMode('view');
      }
  };

  const closeMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      setMode('view');
  };

  const renderMenu = () => {
      if (mode !== 'menu') return null;

      return (
        <div 
            className="fixed inset-0 z-[9999] bg-transparent"
            onClick={closeMenu}
        >
           <div 
             className="absolute bg-white dark:bg-slate-800 w-64 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-150 origin-top-left"
             style={{ top: menuPos.y, left: menuPos.x }}
             onClick={(e) => e.stopPropagation()}
             onDoubleClick={(e) => e.stopPropagation()}
           >
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                  <span className="font-bold text-gray-800 dark:text-white text-xs">
                      처방 목록 수정
                  </span>
                  <button onClick={closeMenu} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                  </button>
              </div>

              <div className="p-2 flex flex-col gap-1">
                  <button 
                    onClick={() => setMode('edit_text')}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-left group"
                  >
                      <div className="p-2 bg-gray-100 dark:bg-slate-600 rounded-full group-hover:bg-white dark:group-hover:bg-slate-500 shadow-sm">
                          <Edit3 className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                      </div>
                      <div>
                          <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">단순 텍스트 수정</span>
                          <span className="block text-[10px] text-gray-500 dark:text-gray-400">로그만 변경 (배드 미작동)</span>
                      </div>
                  </button>

                  <button 
                    onClick={() => {
                        onOpenSelector();
                        setMode('view');
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors text-left group"
                  >
                      <div className="p-2 bg-brand-100 dark:bg-brand-900 rounded-full group-hover:bg-white dark:group-hover:bg-brand-800 shadow-sm">
                          <List className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      </div>
                      <div>
                          <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">처방 변경 및 동기화</span>
                          <span className="block text-[10px] text-gray-500 dark:text-gray-400">프리셋 선택 & 배드 상태 반영</span>
                      </div>
                  </button>
              </div>
           </div>
        </div>
      );
  };

  return (
    <>
        <div 
          className="relative w-full h-full"
          onDoubleClick={handleDoubleClick}
        >
            {mode === 'edit_text' ? (
                <input
                    ref={inputRef}
                    type="text"
                    defaultValue={value}
                    onBlur={handleTextCommit}
                    onKeyDown={handleKeyDown}
                    className="w-full h-full bg-white dark:bg-slate-700 px-2 py-1 outline-none border-2 border-brand-500 rounded-sm text-xs sm:text-sm text-center !text-gray-900 dark:!text-gray-100"
                    placeholder={placeholder}
                />
            ) : (
                <div 
                    className="flex items-center w-full h-full cursor-pointer px-2 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                    title={directSelector ? "더블클릭하여 처방 선택" : "더블클릭하여 수정 옵션 열기"}
                >
                    {/* Status Icons */}
                    {visit && <PatientStatusIcons visit={visit} />}

                    {/* Text Content */}
                    <div className="flex-1 min-w-0 flex justify-center">
                         <span className={`text-xs sm:text-sm font-medium truncate pointer-events-none text-center w-full ${!value ? 'text-gray-400 italic' : 'text-gray-700 dark:text-gray-300'}`}>
                             {value || placeholder}
                         </span>
                    </div>
                    
                    {/* Active/Completed Indicator */}
                    {rowStatus === 'completed' && (
                        <div className="absolute right-2 text-gray-400 pointer-events-none">
                        <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                    )}
                    {rowStatus === 'active' && (
                        <div className="absolute right-2 text-brand-500 animate-pulse pointer-events-none">
                        <Activity className="w-3.5 h-3.5" />
                        </div>
                    )}
                </div>
            )}
        </div>
        {renderMenu()}
    </>
  );
};