import React, { useState, useRef, useEffect } from 'react';
import { Edit3, RefreshCw, X } from 'lucide-react';

interface EditableCellProps {
  value: string | number | null;
  onCommit: (val: string, skipSync: boolean) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  className?: string;
  menuTitle?: string;
  directEdit?: boolean; // If true, skips menu and goes straight to edit (implies skipSync=true)
}

export const EditableCell: React.FC<EditableCellProps> = ({ 
  value, 
  onCommit, 
  type = 'text', 
  placeholder, 
  className,
  menuTitle = '수정 옵션',
  directEdit = false
}) => {
  const [mode, setMode] = useState<'view' | 'menu' | 'edit'>('view');
  const [skipSync, setSkipSync] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [localValue, setLocalValue] = useState(value === null ? '' : String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'edit') {
      setLocalValue(value === null ? '' : String(value));
      if (inputRef.current) {
        inputRef.current.focus();
        // Move cursor to end
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    }
  }, [mode, value]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // If directEdit is enabled (e.g. no bed ID), skip menu
    if (directEdit) {
      setSkipSync(true); // No bed to sync with, so logically skipSync is true
      setMode('edit');
      return;
    }
    
    let x = e.clientX;
    let y = e.clientY;
    
    // Prevent menu from going off-screen (Responsive adjustment)
    const menuWidth = 260;
    const menuHeight = 210;
    if (x > window.innerWidth - menuWidth) x = window.innerWidth - menuWidth - 10;
    if (y > window.innerHeight - menuHeight) y = window.innerHeight - menuHeight - 10;

    setMenuPos({ x, y });
    setMode('menu');
  };

  const handleOptionClick = (shouldSkipSync: boolean) => {
    setSkipSync(shouldSkipSync);
    setMode('edit');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    // Only commit if still in edit mode (avoid committing when switching to menu)
    if (mode === 'edit') {
      setMode('view');
      if (localValue !== String(value || '')) {
        onCommit(localValue, skipSync);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
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
                    {menuTitle}
                </span>
                <button onClick={closeMenu} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-2 flex flex-col gap-1">
                <button 
                  onClick={() => handleOptionClick(true)}
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
                  onClick={() => handleOptionClick(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors text-left group"
                >
                    <div className="p-2 bg-brand-100 dark:bg-brand-900 rounded-full group-hover:bg-white dark:group-hover:bg-brand-800 shadow-sm">
                        <RefreshCw className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">배드 적용 수정</span>
                        <span className="block text-[10px] text-gray-500 dark:text-gray-400">변경 사항 배드 동기화</span>
                    </div>
                </button>
            </div>
         </div>
      </div>
    );
  };

  if (mode === 'edit') {
    return (
      <input
        ref={inputRef}
        type={type}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full h-full bg-white dark:bg-slate-700 px-2 py-1 outline-none border-2 border-brand-500 rounded-sm text-sm text-center !text-gray-900 dark:!text-gray-100 ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <>
      <div 
        onDoubleClick={handleDoubleClick}
        className={`w-full h-full px-2 py-1 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-sm truncate ${!value ? 'text-gray-300 italic' : ''} ${className}`}
        title={directEdit ? "더블클릭하여 수정" : "더블클릭하여 수정 옵션 열기"}
      >
        {value || placeholder}
      </div>
      {renderMenu()}
    </>
  );
};