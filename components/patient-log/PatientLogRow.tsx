import React, { memo } from 'react';
import { Trash2 } from 'lucide-react';
import { EditableCell } from './EditableCell';
import { BedSelectorCell } from './BedSelectorCell';
import { TreatmentSelectorCell } from './TreatmentSelectorCell'; 
import { PatientVisit } from '../../types';

interface PatientLogRowProps {
  visit?: PatientVisit;
  isDraft?: boolean;
  rowStatus?: 'active' | 'completed' | 'none';
  onUpdate?: (id: string, updates: Partial<PatientVisit>, skipBedSync?: boolean) => void;
  onDelete?: (id: string) => void;
  onCreate?: (updates: Partial<PatientVisit>) => Promise<string>;
  onSelectLog?: (id: string) => void;
  onMovePatient?: (visitId: string, currentBedId: number, newBedId: number) => void;
}

export const PatientLogRow: React.FC<PatientLogRowProps> = memo(({
  visit,
  isDraft = false,
  rowStatus = 'none',
  onUpdate,
  onDelete,
  onCreate,
  onSelectLog,
  onMovePatient
}) => {
  
  const handleAssign = async (newBedId: number) => {
    if (isDraft && onCreate) {
       await onCreate({ bed_id: newBedId });
    } else if (!isDraft && visit && onUpdate) {
       onUpdate(visit.id, { bed_id: newBedId });
    }
  };

  const handleMove = (newBedId: number) => {
    if (!isDraft && visit && visit.bed_id && onMovePatient) {
        onMovePatient(visit.id, visit.bed_id, newBedId);
    }
  };

  const handleUpdateLogOnly = (newBedId: number) => {
      if (!isDraft && visit && onUpdate) {
          onUpdate(visit.id, { bed_id: newBedId }, true);
      }
  };

  const handleChange = async (field: keyof PatientVisit, value: string, skipSync: boolean) => {
     if (isDraft && onCreate) {
        await onCreate({ [field]: value });
     } else if (!isDraft && visit && onUpdate) {
        onUpdate(visit.id, { [field]: value }, skipSync);
     }
  };

  // Treatment Text Only Update (Skip Bed Sync)
  const handleTreatmentTextCommit = async (val: string) => {
     if (isDraft && onCreate) {
        await onCreate({ treatment_name: val });
     } else if (!isDraft && visit && onUpdate) {
        // Pass 'true' for skipBedSync to only update the log text
        onUpdate(visit.id, { treatment_name: val }, true);
     }
  };

  // Treatment Selector (Full Sync)
  const handleTreatmentSelectorOpen = async () => {
     if (isDraft && onCreate) {
        const newId = await onCreate({});
        if (onSelectLog) onSelectLog(newId);
     } else if (!isDraft && visit && onSelectLog) {
        onSelectLog(visit.id);
     }
  };

  // 10% Reduced height: h-8 (32px) -> h-[29px]
  let rowClasses = 'group transition-colors border-l-4 h-[29px] '; 
  if (rowStatus === 'active') {
    rowClasses += 'bg-blue-50 dark:bg-blue-900/20 border-l-brand-500';
  } else if (rowStatus === 'completed') {
    rowClasses += 'bg-gray-100 dark:bg-slate-800 border-l-gray-400 dark:border-l-slate-500';
  } else {
    rowClasses += 'hover:bg-gray-50 dark:hover:bg-slate-800/50 border-l-transparent';
  }

  if (isDraft) {
      rowClasses += ' opacity-80';
  }

  // Check if bedId is missing (Draft or Log-only entry)
  // If missing, we enable direct edit mode (skipping menus)
  const isNoBedAssigned = !visit?.bed_id;

  return (
    <tr className={rowClasses}>
      {/* 1. Bed ID */}
      <td className="border-r border-gray-100 dark:border-slate-800 p-0 relative">
        <BedSelectorCell 
          value={visit?.bed_id || null}
          onMove={handleMove}
          onAssign={handleAssign}
          onUpdateLogOnly={handleUpdateLogOnly}
          className={isDraft ? "opacity-50 hover:opacity-100" : ""}
        />
        {rowStatus !== 'none' && (
          <div className="absolute top-1 right-1 pointer-events-none">
            {rowStatus === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse shadow-sm" />}
            {rowStatus === 'completed' && <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
          </div>
        )}
      </td>

      {/* 2. Patient Name */}
      <td className="border-r border-gray-100 dark:border-slate-800 p-0">
        <EditableCell 
          value={visit?.patient_name || ''} 
          placeholder={isDraft ? "새 환자" : "이름"}
          menuTitle="이름 수정 옵션"
          className={`bg-transparent justify-center text-center ${
            !visit?.patient_name 
              ? 'font-normal text-gray-300 dark:text-gray-600' 
              : 'font-black text-gray-800 dark:text-gray-100'
          } ${isDraft ? 'placeholder-gray-300 font-normal' : ''} text-sm sm:text-base xl:text-[11px]`}
          onCommit={(val, skipSync) => handleChange('patient_name', val || '', skipSync)}
          directEdit={isNoBedAssigned}
        />
      </td>

      {/* 3. Body Part - Added font-bold and 11px */}
      <td className="border-r border-gray-100 dark:border-slate-800 p-0">
        <EditableCell 
          value={visit?.body_part || ''} 
          placeholder={isDraft ? "부위" : ""}
          menuTitle="치료 부위 수정"
          className="text-gray-600 dark:text-gray-400 font-bold bg-transparent justify-center text-center text-xs sm:text-sm xl:text-[11px]"
          onCommit={(val, skipSync) => handleChange('body_part', val || '', skipSync)}
          directEdit={isNoBedAssigned}
        />
      </td>

      {/* 4. Treatment - Selector Cell */}
      <td className="border-r border-gray-100 dark:border-slate-800 p-0 relative">
        <TreatmentSelectorCell
          visit={visit}
          value={visit?.treatment_name || ''}
          placeholder="처방 입력..." 
          rowStatus={rowStatus}
          onCommitText={handleTreatmentTextCommit}
          onOpenSelector={handleTreatmentSelectorOpen}
          directSelector={isNoBedAssigned}
        />
      </td>

      {/* 5. Memo - Added font-bold and 11px */}
      <td className="border-r border-gray-100 dark:border-slate-800 p-0">
        <EditableCell 
          value={visit?.memo || ''} 
          placeholder=""
          menuTitle="메모 수정 옵션"
          className="text-gray-500 dark:text-gray-400 font-bold bg-transparent justify-center text-center text-xs sm:text-sm xl:text-[11px]"
          onCommit={(val, skipSync) => handleChange('memo', val || '', skipSync)}
          directEdit={isNoBedAssigned}
        />
      </td>

      {/* 6. Author - Added font-bold and 11px */}
      <td className="border-r border-gray-100 dark:border-slate-800 p-0">
        <EditableCell 
          value={visit?.author || ''} 
          placeholder="-"
          menuTitle="작성자 수정"
          className="text-center justify-center text-gray-500 font-bold bg-transparent text-xs sm:text-sm xl:text-[11px]"
          onCommit={(val, skipSync) => handleChange('author', val || '', skipSync)}
          directEdit={isNoBedAssigned}
        />
      </td>

      {/* 7. Delete Action */}
      <td className="p-0 text-center">
        {!isDraft && visit && onDelete && (
          <div className="flex justify-center items-center h-full">
            <button 
              onClick={() => onDelete(visit.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all active:scale-90 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              title="삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
});