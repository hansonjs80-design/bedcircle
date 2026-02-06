
import React, { memo } from 'react';
import { PatientVisit, BedState, Preset } from '../../types';
import { PatientLogRow } from './PatientLogRow';
import { PatientLogTableHeader } from './PatientLogTableHeader';
import { mapBgToTextClass } from '../../utils/styleUtils';

interface PatientLogTableProps {
  visits: PatientVisit[];
  beds: BedState[];
  presets: Preset[];
  getRowStatus: (visitId: string, bedId: number | null) => 'active' | 'completed' | 'none';
  onUpdate: (id: string, updates: Partial<PatientVisit>, skipBedSync?: boolean) => void;
  onDelete: (id: string) => void;
  onCreate: (updates: Partial<PatientVisit>) => Promise<string>;
  onSelectLog: (id: string, bedId?: number | null) => void;
  onMovePatient: (visitId: string, currentBedId: number, newBedId: number) => void;
  onEditActive?: (bedId: number) => void;
  onNextStep?: (bedId: number) => void;
  onPrevStep?: (bedId: number) => void;
}

export const PatientLogTable: React.FC<PatientLogTableProps> = memo(({
  visits,
  beds,
  presets,
  getRowStatus,
  onUpdate,
  onDelete,
  onCreate,
  onSelectLog,
  onMovePatient,
  onEditActive,
  onNextStep,
  onPrevStep
}) => {
  // 항상 10개의 빈 행을 유지하여 연속 입력 편의성 제공
  const EMPTY_ROWS_COUNT = 10;

  // Active Bed Ids for grid selection highlight
  const activeBedIds = beds.filter(b => b.status !== 'IDLE').map(b => b.id);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
      <table className="w-full border-collapse table-fixed">
        <PatientLogTableHeader />
        <tbody className="divide-y divide-gray-300 dark:divide-slate-600">
          {visits.map((visit) => {
            const rowStatus = getRowStatus(visit.id, visit.bed_id);
            
            // --- Active Step Logic ---
            let activeStepColorClass: string | undefined = undefined;
            let activeStepIndex: number = -1;
            let handleNextStep: (() => void) | undefined = undefined;
            let handlePrevStep: (() => void) | undefined = undefined;

            if (rowStatus === 'active' && visit.bed_id) {
               const bed = beds.find(b => b.id === visit.bed_id);
               if (bed) {
                  // Find current step color
                  const preset = bed.customPreset || presets.find(p => p.id === bed.currentPresetId);
                  const step = preset?.steps[bed.currentStepIndex];
                  
                  if (step) {
                     activeStepColorClass = mapBgToTextClass(step.color);
                     activeStepIndex = bed.currentStepIndex;
                     
                     // If onNextStep provided, create handler
                     if (onNextStep) {
                        handleNextStep = () => onNextStep(bed.id);
                     }
                     if (onPrevStep) {
                        handlePrevStep = () => onPrevStep(bed.id);
                     }
                  }
               }
            }

            return (
              <PatientLogRow 
                key={visit.id}
                visit={visit}
                isDraft={false}
                rowStatus={rowStatus}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onSelectLog={onSelectLog}
                onMovePatient={onMovePatient}
                onEditActive={onEditActive}
                activeBedIds={activeBedIds}
                activeStepColor={activeStepColorClass}
                activeStepIndex={activeStepIndex}
                onNextStep={handleNextStep}
                onPrevStep={handlePrevStep}
              />
            );
          })}
          
          {/* Always render multiple phantom/draft rows at the bottom */}
          {Array.from({ length: EMPTY_ROWS_COUNT }).map((_, index) => (
            <PatientLogRow 
              key={`draft-${index}`}
              isDraft={true}
              onCreate={onCreate}
              onSelectLog={(id) => onSelectLog(id, null)} // Draft doesn't have assignment logic yet
              activeBedIds={activeBedIds}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});
