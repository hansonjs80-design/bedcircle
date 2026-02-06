
import React, { memo } from 'react';
import { Trash2 } from 'lucide-react';
import { EditableCell } from './EditableCell';
import { BedSelectorCell } from './BedSelectorCell';
import { TreatmentSelectorCell } from './TreatmentSelectorCell'; 
import { PatientStatusCell } from './PatientStatusCell';
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
  onEditActive?: (bedId: number) => void;
  activeBedIds?: number[];
}

export const PatientLogRow: React.FC<PatientLogRowProps> = memo(({
  visit,
  isDraft = false,
  rowStatus = 'none',
  onUpdate,
  onDelete,
  onCreate,
  onSelectLog,
  onMovePatient,
  onEditActive,
  activeBedIds = []
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

  const handleTreatmentTextCommit = async (val: string) => {
     if (isDraft && onCreate) {
        await onCreate({ treatment_name: val });
     } else if (!isDraft && visit && onUpdate) {
        onUpdate(visit.id, { treatment_name: val }, true);
     }
  };

  const handleTreatmentSelectorOpen = async () => {
     // 1. Live Active Row -> Bed Edit Overlay
     if (rowStatus === 'active' && visit && visit.bed_id && onEditActive) {
         onEditActive(visit.bed_id);
         return;
     }

     // 2. Draft or Log Edit -> Preset Modal
     if (isDraft && onCreate) {
        const newId = await onCreate({});
        if (onSelectLog) onSelectLog(newId);
     } else if (!isDraft && visit && onSelectLog) {
        onSelectLog(visit.id);
     }
  };

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

  const isNoBedAssigned = !visit?.bed_id;
  const hasTreatment = !!visit?.treatment_name && visit.treatment_name.trim() !== '';
  
  // LOG EDIT MODE DEFINITION
  // Row has data (Bed & Treatment) AND is NOT currently active (e.g. completed, offline, history)
  const isLogEditMode = !isDraft && !!visit?.bed_id && hasTreatment && rowStatus !== 'active';

  return (
    <tr className={rowClasses}>
      {/* 1. Bed ID */}
      <td className="border-r border-gray-100 dark:border-slate-800 p-0 relative">
        <BedSelectorCell 
          value={visit?.bed_id || null}
          rowStatus={rowStatus}
          hasTreatment={hasTreatment}
          onMove={handleMove}
          onAssign={handleAssign}
          onUpdateLogOnly={handleUpdateLogOnly}
          className={isDraft ? "opacity-50 hover:opacity-100" : ""}
          activeBedIds={activeBedIds}
          isLogEditMode={isLogEditMode}
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
          menuTitle="이름 수정 (로그만 변경)"
          className={`bg-transparent justify-center text-center ${
            !visit?.patient_name 
              ? 'font-normal text-gray-300 dark:text-gray-600' 
              : 'font-black text-gray-800 dark:text-gray-100'
          } ${isDraft ? 'placeholder-gray-300 font-normal' : ''} text-sm sm:text-base xl:text-[11px]`}
          onCommit={(val, skipSync) => handleChange('patient_name', val || '', skipSync)}
          directEdit={true}
          syncOnDirectEdit={false}
        />
      </td>

      {/* 3. Body Part */}
      <td className="border-r border-gray-100 dark:border-slate-800 p-0">
        <EditableCell 
          value={visit?.body_part || ''} 
          placeholder={isDraft ? "부위" : ""}
          menuTitle="치료 부위 수정 (로그만 변경)"
          className="text-gray-600 dark:text-gray-400 font-bold bg-transparent justify-center text-center text-xs sm:text-sm xl:text-[11px]"
          onCommit={(val, skipSync) => handleChange('body_part', val || '', skipSync)}
          directEdit={true}
          syncOnDirectEdit={false}
        />
      </td>

      {/* 4. Treatment */}
      <td className="border-r border-gray-100 dark:border-slate-800 p-0 relative">
        <TreatmentSelectorCell
          visit={visit}
          value={visit?.treatment_name || ''}
          placeholder="처방 입력..." 
          rowStatus={rowStatus}
          onCommitText={handleTreatmentTextCommit}
          onOpenSelector={handleTreatmentSelectorOpen}
          // Enable direct selector on double click for Log Edit Mode
          directSelector={isNoBedAssigned || (!hasTreatment && !!visit?.bed_id) || isLogEditMode}
        />
      </td>

      {/* 5. Status */}
      <td className="border-r border-gray-100 dark:border-slate-800 p-0">
        <PatientStatusCell 
            visit={visit} 
            onUpdate={onUpdate || (() => {})} 
            isDraft={isDraft}
            onCreate={onCreate}
        />
      </td>

      {/* 6. Memo */}
      <td className="border-r border-gray-100 dark:border-slate-800 p-0">
        <EditableCell 
          value={visit?.memo || ''} 
          placeholder=""
          menuTitle="메모 수정 (로그만 변경)"
          className="text-gray-500 dark:text-gray-400 font-bold bg-transparent justify-center text-center text-xs sm:text-sm xl:text-[11px]"
          onCommit={(val, skipSync) => handleChange('memo', val || '', skipSync)}
          directEdit={true}
          syncOnDirectEdit={false}
        />
      </td>

      {/* 7. Author */}
      <td className="border-r border-gray-100 dark:border-slate-800 p-0">
        <EditableCell 
          value={visit?.author || ''} 
          placeholder="-"
          menuTitle="작성자 수정 (로그만 변경)"
          className="text-center justify-center text-gray-500 font-bold bg-transparent text-xs sm:text-sm xl:text-[11px]"
          onCommit={(val, skipSync) => handleChange('author', val || '', skipSync)}
          directEdit={true}
          syncOnDirectEdit={false}
        />
      </td>

      {/* 8. Delete */}
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
