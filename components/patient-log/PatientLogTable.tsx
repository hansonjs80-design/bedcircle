
import React, { memo } from 'react';
import { PatientVisit } from '../../types';
import { PatientLogRow } from './PatientLogRow';
import { PatientLogTableHeader } from './PatientLogTableHeader';

interface PatientLogTableProps {
  visits: PatientVisit[];
  getRowStatus: (visitId: string, bedId: number | null) => 'active' | 'completed' | 'none';
  onUpdate: (id: string, updates: Partial<PatientVisit>, skipBedSync?: boolean) => void;
  onDelete: (id: string) => void;
  onCreate: (updates: Partial<PatientVisit>) => Promise<string>;
  onSelectLog: (id: string) => void;
  onMovePatient: (visitId: string, currentBedId: number, newBedId: number) => void;
  onEditActive?: (bedId: number) => void;
  activeBedIds?: number[];
}

export const PatientLogTable: React.FC<PatientLogTableProps> = memo(({
  visits,
  getRowStatus,
  onUpdate,
  onDelete,
  onCreate,
  onSelectLog,
  onMovePatient,
  onEditActive,
  activeBedIds = []
}) => {
  // 항상 10개의 빈 행을 유지하여 연속 입력 편의성 제공
  const EMPTY_ROWS_COUNT = 10;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
      <table className="w-full border-collapse table-fixed">
        <PatientLogTableHeader />
        <tbody className="divide-y divide-gray-300 dark:divide-slate-600">
          {visits.map((visit) => (
            <PatientLogRow 
              key={visit.id}
              visit={visit}
              isDraft={false}
              rowStatus={getRowStatus(visit.id, visit.bed_id)}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onSelectLog={onSelectLog}
              onMovePatient={onMovePatient}
              onEditActive={onEditActive}
              activeBedIds={activeBedIds}
            />
          ))}
          
          {/* Always render multiple phantom/draft rows at the bottom */}
          {Array.from({ length: EMPTY_ROWS_COUNT }).map((_, index) => (
            <PatientLogRow 
              key={`draft-${index}`}
              isDraft={true}
              onCreate={onCreate}
              onSelectLog={onSelectLog}
              activeBedIds={activeBedIds}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});
