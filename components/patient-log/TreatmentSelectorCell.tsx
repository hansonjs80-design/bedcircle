
import React, { useState, useRef, useEffect, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { Edit3, List, Activity, CheckCircle, SkipForward, SkipBack, Check, X, LogOut } from 'lucide-react';
import { PatientVisit } from '../../types';
import { ContextMenu } from '../common/ContextMenu';

interface TreatmentSelectorCellProps {
  visit?: PatientVisit;
  value: string;
  placeholder?: string;
  rowStatus?: 'active' | 'completed' | 'none';
  onCommitText: (val: string) => void;
  onOpenSelector: () => void;
  directSelector?: boolean;
  activeStepColor?: string; // Color class for the active step text
  activeStepIndex?: number; // The index of the currently active step
  isLastStep?: boolean;
  onNextStep?: () => void; // Handler for next step button
  onPrevStep?: () => void; // Handler for prev step button
  onClearBed?: () => void; // Handler for clearing bed
}

export const TreatmentSelectorCell: React.FC<TreatmentSelectorCellProps> = ({ 
  visit,
  value, 
  placeholder,
  rowStatus = 'none',
  onCommitText, 
  onOpenSelector,
  directSelector = false,
  activeStepColor,
  activeStepIndex = -1,
  isLastStep = false,
  onNextStep,
  onPrevStep,
  onClearBed
}) => {
  const [mode, setMode] = useState<'view' | 'menu' | 'edit_text'>('view');
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  
  // Compact Popup State
  const [popupState, setPopupState] = useState<{ type: 'prev' | 'next' | 'clear', x: number, y: number } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'edit_text' && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
    }
  }, [mode]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // 1. Explicit direct selector override
    if (directSelector) {
        onOpenSelector();
        return;
    }

    // 2. Active Row -> Live Edit 
    if ((rowStatus as string) === 'active') {
        onOpenSelector();
        return;
    }

    // 3. Log Edit Mode
    // If the row has content (value exists) but is NOT active, treat as Log Edit Mode
    if (value && (rowStatus as string) !== 'active') {
        onOpenSelector();
        return;
    }
    
    // 4. Fallback -> Show Menu
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMode('menu');
  };

  const handleStepButtonClick = (e: React.MouseEvent, type: 'prev' | 'next' | 'clear') => {
    e.stopPropagation();
    
    // 마우스 커서 바로 위 위치 계산
    const x = e.clientX;
    const y = e.clientY;
    
    setPopupState({ type, x, y });
  };

  const executeStepAction = () => {
    if (popupState?.type === 'next' && onNextStep) {
        onNextStep();
    } else if (popupState?.type === 'prev' && onPrevStep) {
        onPrevStep();
    } else if (popupState?.type === 'clear' && onClearBed) {
        onClearBed();
    }
    setPopupState(null);
  };

  const handleTextCommit = (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
      const target = e.currentTarget;
      if (target.value !== value) {
          onCommitText(target.value);
      }
      setMode('view');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          inputRef.current?.blur(); 
      } else if (e.key === 'Escape') {
          setMode('view');
      }
  };

  const getTitle = () => {
      if (directSelector || (rowStatus as string) === 'active') return "더블클릭하여 처방 수정";
      if (value && (rowStatus as string) !== 'active') return "더블클릭하여 로그 수정 (배드 미작동)";
      return "더블클릭하여 수정 옵션 열기";
  };

  const getPopupMessage = () => {
      switch (popupState?.type) {
          case 'next': return isLastStep ? '치료를 완료할까요?' : '다음 단계로?';
          case 'prev': return '이전 단계로?';
          case 'clear': return '침상 비우시겠습니까?';
          default: return '';
      }
  };

  const renderContent = () => {
    if (!value) {
      return (
        <span className="text-gray-400 italic font-bold">
          {placeholder}
        </span>
      );
    }

    if ((rowStatus as string) === 'active' && activeStepIndex >= 0) {
      const parts = value.split('/');
      return (
        <>
          {parts.map((part, i) => (
            <Fragment key={i}>
              <span className={i === activeStepIndex ? `${activeStepColor} transition-colors duration-300` : 'text-gray-700 dark:text-gray-300'}>
                {part.trim()}
              </span>
              {i < parts.length - 1 && <span className="text-gray-400 mx-0.5">/</span>}
            </Fragment>
          ))}
        </>
      );
    }

    return (
      <span className={activeStepColor || 'text-gray-700 dark:text-gray-300'}>
        {value}
      </span>
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
                    className="flex items-center w-full h-full cursor-pointer px-1 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors relative"
                    title={getTitle()}
                >
                    {/* Active/Completed Control Group (Left Side) */}
                    {(rowStatus === 'active' || rowStatus === 'completed') && (
                       <div className="absolute left-0 z-10 flex items-center h-full gap-0.5 px-0.5 bg-gradient-to-r from-white via-white to-transparent dark:from-slate-900 dark:via-slate-900">
                          
                          {/* Prev Button (Only Active) */}
                          {rowStatus === 'active' && onPrevStep && activeStepIndex > 0 && (
                            <button 
                                onClick={(e) => handleStepButtonClick(e, 'prev')}
                                className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-400 hover:text-brand-600 transition-all active:scale-95"
                                title="이전 단계"
                            >
                                <SkipBack className="w-3.5 h-3.5 fill-current" />
                            </button>
                          )}

                          {/* Next/Complete Button (Only Active) */}
                          {rowStatus === 'active' && onNextStep && (
                            <button 
                                onClick={(e) => handleStepButtonClick(e, 'next')}
                                className={`p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-all active:scale-95 ${
                                    isLastStep ? 'text-red-600 hover:text-red-700' : 'text-gray-400 hover:text-brand-600'
                                }`}
                                title={isLastStep ? "치료 완료" : "다음 단계"}
                            >
                                {isLastStep ? (
                                    <SkipForward className="w-3.5 h-3.5 fill-current" />
                                ) : (
                                    <SkipForward className="w-3.5 h-3.5 fill-current" />
                                )}
                            </button>
                          )}

                          {/* Clear Button (Only Completed) - Moved from right to left */}
                          {rowStatus === 'completed' && onClearBed && (
                             <button
                                onClick={(e) => handleStepButtonClick(e, 'clear')}
                                className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-400 hover:text-red-600 transition-all active:scale-95"
                                title="침상 비우기"
                             >
                                <CheckCircle className="w-3.5 h-3.5" />
                             </button>
                          )}
                       </div>
                    )}

                    <div className="flex-1 min-w-0 flex justify-center pl-10 pr-5">
                         <span className="text-xs sm:text-sm xl:text-[11px] font-bold truncate pointer-events-none text-center w-full">
                             {renderContent()}
                         </span>
                    </div>
                    
                    {rowStatus === 'active' && (
                        <div className="absolute right-1 text-brand-500 animate-pulse pointer-events-none">
                        <Activity className="w-3.5 h-3.5" />
                        </div>
                    )}
                </div>
            )}
        </div>
        
        {/* Compact Confirmation Popup */}
        {popupState && createPortal(
            <div className="fixed inset-0 z-[9999]" onClick={() => setPopupState(null)}>
                <div 
                    className="absolute bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-600 p-2 animate-in zoom-in-95 duration-150 origin-bottom"
                    style={{ 
                        top: popupState.y - 70, // 70px above cursor
                        left: popupState.x - 70, // Centered (approx)
                        width: 140
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <p className="text-[10px] font-bold text-center text-gray-600 dark:text-gray-300 mb-1.5 whitespace-nowrap">
                        {getPopupMessage()}
                    </p>
                    <div className="flex gap-1">
                        <button 
                            onClick={executeStepAction}
                            className={`flex-1 py-1 text-white rounded text-[10px] font-bold flex items-center justify-center gap-0.5 ${
                                popupState.type === 'clear' || (popupState.type === 'next' && isLastStep) 
                                    ? 'bg-red-600 hover:bg-red-700' 
                                    : 'bg-brand-600 hover:bg-brand-700'
                            }`}
                        >
                            <Check className="w-3 h-3" /> 예
                        </button>
                        <button 
                            onClick={() => setPopupState(null)}
                            className="flex-1 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded text-[10px] font-bold hover:bg-gray-200 flex items-center justify-center gap-0.5"
                        >
                            <X className="w-3 h-3" /> 취소
                        </button>
                    </div>
                    {/* Arrow Indicator */}
                    <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white dark:bg-slate-800 border-b border-r border-gray-200 dark:border-slate-600 rotate-45 transform"></div>
                </div>
            </div>,
            document.body
        )}

        {mode === 'menu' && (
            <ContextMenu
                title="처방 목록 수정"
                position={menuPos}
                onClose={() => setMode('view')}
            >
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
            </ContextMenu>
        )}
    </>
  );
};
