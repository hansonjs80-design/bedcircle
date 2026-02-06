
import React, { useState, useRef, useEffect } from 'react';
import { Edit3, PlayCircle, Hash, ArrowRightLeft } from 'lucide-react';
import { ContextMenu } from '../common/ContextMenu';

interface BedSelectorCellProps {
  value: number | null;
  onMove: (newBedId: number) => void;
  onAssign: (newBedId: number) => void;
  className?: string;
  onUpdateLogOnly?: (newBedId: number) => void; 
  rowStatus?: 'active' | 'completed' | 'none';
  hasTreatment?: boolean;
}

export const BedSelectorCell: React.FC<BedSelectorCellProps> = ({ 
  value, 
  onMove, 
  onAssign,
  className,
  onUpdateLogOnly,
  rowStatus = 'none',
  hasTreatment = true
}) => {
  const [mode, setMode] = useState<'view' | 'menu' | 'edit_log' | 'edit_assign' | 'select_target'>('view');
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

    setMenuPos({ x: e.clientX, y: e.clientY });

    // 1. If Bed is NOT assigned (empty cell), open selection immediately
    if (!value) {
        setMode('select_target');
        return;
    }

    // 2. If Treatment is empty, open selection immediately (Logic for quick setup)
    if (!hasTreatment) {
        setMode('select_target');
        return;
    }

    // 3. SPECIAL LOGIC: Active Bed Double Click -> Confirm then Select
    if (rowStatus === 'active') {
        if (window.confirm("방번호를 변경하시겠습니까?")) {
            setMode('select_target');
        }
        return;
    }

    // 4. Default behavior for assigned beds (Context Menu)
    setMode('menu');
  };

  const handleCommit = (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
      if (mode === 'view' || mode === 'menu' || mode === 'select_target') return;

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

  const renderContent = () => {
    // 1. Target Selection Mode (Grid 1-10 + 11(T))
    if (mode === 'select_target') {
        return (
            <ContextMenu
                title="배드 선택 (1~10, T)"
                position={menuPos}
                onClose={() => setMode('view')}
                width={220}
            >
                <div className="p-2">
                    <div className="grid grid-cols-5 gap-1.5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => (
                            <button
                                key={num}
                                onClick={() => {
                                    if (value && num !== value) {
                                        onMove(num);
                                    } else if (!value || value !== num) {
                                        onAssign(num);
                                    }
                                    setMode('view');
                                }}
                                className={`
                                    h-8 flex items-center justify-center rounded-lg font-black text-xs sm:text-sm border transition-all active:scale-95
                                    ${value === num 
                                        ? 'bg-brand-600 text-white border-brand-700 shadow-inner cursor-default opacity-50' 
                                        : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-slate-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200'
                                    }
                                `}
                                disabled={value === num}
                            >
                                {num === 11 ? 'T' : num}
                            </button>
                        ))}
                    </div>
                </div>
            </ContextMenu>
        );
    }

    // 2. Input Mode (Log or Assign) - Legacy fallback or manual menu trigger
    if (mode === 'edit_log' || mode === 'edit_assign') {
        return (
            <ContextMenu
                title={mode === 'edit_log' ? '단순 표기 수정' : '배드 배정/이동'}
                position={menuPos}
                onClose={() => setMode('view')}
            >
                <div className="p-2">
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
            </ContextMenu>
        );
    }

    // 3. Default Menu (for assigned, non-active beds)
    if (mode === 'menu') {
        return (
            <ContextMenu
                title={`방 번호 수정 (현재: ${value === 11 ? 'T' : value || '-'})`}
                position={menuPos}
                onClose={() => setMode('view')}
            >
                <button 
                    onClick={() => setMode('select_target')}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors text-left group"
                >
                    <div className="p-2 bg-brand-100 dark:bg-brand-900 rounded-full group-hover:bg-white dark:group-hover:bg-brand-800 shadow-sm">
                        <PlayCircle className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">배드 선택 (이동/배정)</span>
                        <span className="block text-[10px] text-gray-500 dark:text-gray-400">목록에서 번호 선택</span>
                    </div>
                </button>

                <button 
                    onClick={() => setMode('edit_log')}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-left group"
                >
                    <div className="p-2 bg-gray-100 dark:bg-slate-600 rounded-full group-hover:bg-white dark:group-hover:bg-slate-500 shadow-sm">
                        <Edit3 className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">단순 수정 (텍스트)</span>
                        <span className="block text-[10px] text-gray-500 dark:text-gray-400">로그만 변경 (배드 미작동)</span>
                    </div>
                </button>
            </ContextMenu>
        );
    }
    return null;
  };

  return (
    <>
        <div 
        onDoubleClick={handleDoubleClick}
        className={`w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors group select-none ${className}`}
        title={!value ? "더블클릭하여 배드 선택" : (rowStatus === 'active' ? "더블클릭하여 방번호 변경" : "더블클릭하여 수정/배정 메뉴 열기")}
        >
        {value ? (
            <span className={`text-base sm:text-lg xl:text-[12px] font-black group-hover:scale-110 transition-transform ${value === 11 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
            {value === 11 ? 'T' : value}
            </span>
        ) : (
            <span className="text-gray-300 dark:text-gray-600 text-sm xl:text-[12px] font-bold">-</span>
        )}
        </div>
        {renderContent()}
    </>
  );
};
