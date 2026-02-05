
import React, { useState, Suspense, useCallback } from 'react';
import { useTreatmentContext } from '../contexts/TreatmentContext';
import { usePatientLogContext } from '../contexts/PatientLogContext';
import { PatientLogPrintView } from './patient-log/PatientLogPrintView';
import { BedStatus } from '../types';
import { PatientLogHeader } from './patient-log/PatientLogHeader';
import { PatientLogTable } from './patient-log/PatientLogTable';
import { Loader2 } from 'lucide-react';

const PrintPreviewModal = React.lazy(() => import('./modals/PrintPreviewModal').then(module => ({ default: module.PrintPreviewModal })));

interface PatientLogPanelProps {
  onClose?: () => void;
}

export const PatientLogPanel: React.FC<PatientLogPanelProps> = ({ onClose }) => {
  const { setSelectingLogId, beds, movePatient, updateVisitWithBedSync } = useTreatmentContext();
  const { visits, currentDate, setCurrentDate, changeDate, addVisit, deleteVisit } = usePatientLogContext();
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePrintClick = () => {
    setIsPreviewOpen(true);
  };

  // Memoize getRowStatus to stabilize prop if possible, 
  // though 'beds' changes frequently, so this will update frequently.
  const getRowStatus = useCallback((visitId: string, bedId: number | null): 'active' | 'completed' | 'none' => {
    if (!bedId) return 'none';
    
    const bed = beds.find(b => b.id === bedId);
    if (!bed) return 'none';

    if (bed.status === BedStatus.IDLE) return 'none';

    const visitsForBed = visits.filter(v => v.bed_id === bedId);
    visitsForBed.sort((a, b) => (new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()));
    const latestVisit = visitsForBed[visitsForBed.length - 1];

    if (latestVisit?.id !== visitId) return 'none';

    return bed.status === BedStatus.COMPLETED ? 'completed' : 'active';
  }, [beds, visits]);

  const handleMovePatient = useCallback((visitId: string, currentBedId: number, newBedId: number) => {
      movePatient(currentBedId, newBedId);
  }, [movePatient]);

  return (
    <>
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 shadow-xl print:hidden">
        
        <PatientLogHeader 
          totalCount={visits.length}
          currentDate={currentDate}
          onDateChange={changeDate}
          onDateSelect={setCurrentDate}
          onPrint={handlePrintClick}
          onClose={onClose}
        />

        <PatientLogTable 
          visits={visits}
          getRowStatus={getRowStatus}
          onUpdate={updateVisitWithBedSync}
          onDelete={deleteVisit}
          onCreate={addVisit}
          onSelectLog={setSelectingLogId}
          onMovePatient={handleMovePatient}
        />

        <div className="p-2 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 shrink-0 text-center">
          <p className="text-[10px] text-gray-400">
            * 빈 행에 내용을 입력하면 자동으로 추가됩니다.
          </p>
        </div>
      </div>

      <PatientLogPrintView 
        id="native-print-target" 
        visits={visits} 
        currentDate={currentDate} 
      />

      {isPreviewOpen && (
        <Suspense fallback={
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        }>
          <PrintPreviewModal 
            isOpen={isPreviewOpen} 
            onClose={() => setIsPreviewOpen(false)} 
            visits={visits} 
            currentDate={currentDate} 
          />
        </Suspense>
      )}
    </>
  );
};
