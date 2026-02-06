
import React, { useState } from 'react';
import { Syringe, Hand, Zap, ArrowUpFromLine, Droplet, MoreHorizontal } from 'lucide-react';
import { PatientVisit } from '../../types';
import { ContextMenu } from '../common/ContextMenu';
import { PatientStatusIcons } from './PatientStatusIcons';

interface PatientStatusCellProps {
  visit?: PatientVisit;
  rowStatus?: 'active' | 'completed' | 'none';
  onUpdate: (id: string, updates: Partial<PatientVisit>, skipBedSync?: boolean) => void;
  isDraft?: boolean;
  onCreate?: (updates: Partial<PatientVisit>) => Promise<string>;
}

export const PatientStatusCell: React.FC<PatientStatusCellProps> = ({ 
  visit, 
  rowStatus = 'none',
  onUpdate,
  isDraft,
  onCreate
}) => {
  const [menuPos, setMenuPos] = useState<{x: number, y: number} | null>(null);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  const toggleStatus = async (key: keyof PatientVisit) => {
    const currentVal = visit ? !!visit[key] : false;
    const newVal = !currentVal;

    if (isDraft && onCreate) {
        await onCreate({ [key]: newVal });
    } else if (visit) {
        // If row is active, sync with bed (skipBedSync = false).
        // Otherwise, simple record (skipBedSync = true).
        const skipSync = rowStatus !== 'active';
        onUpdate(visit.id, { [key]: newVal }, skipSync);
    }
  };

  const statusOptions = [
    { key: 'is_injection', label: '주사 (Injection)', icon: Syringe, color: 'text-red-500' },
    { key: 'is_fluid', label: '수액 (Fluid)', icon: Droplet, color: 'text-cyan-500' },
    { key: 'is_manual', label: '도수 (Manual)', icon: Hand, color: 'text-violet-500' },
    { key: 'is_eswt', label: '충격파 (ESWT)', icon: Zap, color: 'text-blue-500' },
    { key: 'is_traction', label: '견인 (Traction)', icon: ArrowUpFromLine, color: 'text-orange-500' },
  ];

  const menuTitle = rowStatus === 'active' ? "상태 변경 (배드 연동)" : "상태 변경 (단순 기록)";

  return (
    <>
        <div 
            className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            onDoubleClick={handleDoubleClick}
            title={`더블클릭하여 상태 변경 (${rowStatus === 'active' ? '배드 연동' : '로그만 수정'})`}
        >
            {visit ? (
                <PatientStatusIcons visit={visit} />
            ) : (
                <div className="opacity-0 group-hover:opacity-50">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>
            )}
        </div>

        {menuPos && (
            <ContextMenu
                title={menuTitle}
                position={menuPos}
                onClose={() => setMenuPos(null)}
            >
                {statusOptions.map((opt) => {
                    const isActive = visit ? !!visit[opt.key as keyof PatientVisit] : false;
                    return (
                        <button
                            key={opt.key}
                            onClick={() => toggleStatus(opt.key as keyof PatientVisit)}
                            className={`flex items-center justify-between p-2 rounded-lg transition-colors text-xs font-bold w-full ${
                                isActive 
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <opt.icon className={`w-4 h-4 ${isActive ? opt.color : 'text-gray-400'}`} />
                                <span>{opt.label}</span>
                            </div>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                        </button>
                    );
                })}
            </ContextMenu>
        )}
    </>
  );
};
