
import React, { useState, Suspense } from 'react';
import { useTreatmentContext } from '../contexts/TreatmentContext';
import { PatientLogPrintView } from './patient-log/PatientLogPrintView';
import { BedStatus } from '../types';
import { PatientLogHeader } from './patient-log/PatientLogHeader';
import { PatientLogTable } from './patient-log/PatientLogTable';
import { Loader2 } from 'lucide-react';

// Lazy Load Print Modal (Contains heavy html2pdf.js)
const PrintPreviewModal = React.lazy(() => import('./modals/PrintPreviewModal').then(module => ({ default: module.PrintPreviewModal })));

interface PatientLogPanelProps {
  onClose?: () => void;
}

export const PatientLogPanel: React.FC<PatientLogPanelProps> = ({ onClose }) => {
  const { logState, setSelectingLogId, beds, movePatient } = useTreatmentContext();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const {
    currentDate,
    setCurrentDate,
    visits,
    addVisit,
    updateVisit,
    deleteVisit,
    changeDate
  } = logState;

  const handlePrintClick = () => {
    setIsPreviewOpen(true);
  };

  // Helper to determine the status of the row based on Bed State
  const getRowStatus = (visitId: string, bedId: number | null): 'active' | 'completed' | 'none' => {
    if (!bedId) return 'none';
    
    // 1. Find the bed
    const bed = beds.find(b => b.id === bedId);
    if (!bed) return 'none';

    // 2. Bed must be Occupied (Active or Completed)
    // If IDLE, the patient has left, so no highlight.
    if (bed.status === BedStatus.IDLE) return 'none';

    // 3. This visit must be the LATEST one for this bed
    // (Prevents highlighting old history rows for the same bed on the same day)
    const visitsForBed = visits.filter(v => v.bed_id === bedId);
    visitsForBed.sort((a, b) => (new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()));
    const latestVisit = visitsForBed[visitsForBed.length - 1];

    if (latestVisit?.id !== visitId) return 'none';

    // 4. Return specific status
    return bed.status === BedStatus.COMPLETED ? 'completed' : 'active';
  };

  const handleMovePatient = (visitId: string, currentBedId: number, newBedId: number) => {
      movePatient(currentBedId, newBedId);
  };

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
          onUpdate={updateVisit}
          onDelete={deleteVisit}
          onCreate={addVisit}
          onSelectLog={setSelectingLogId}
          onMovePatient={handleMovePatient}
        />

        {/* Footer (Simplified) */}
        <div className="p-2 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 shrink-0 text-center">
          <p className="text-[10px] text-gray-400">
            * 빈 행에 내용을 입력하면 자동으로 추가됩니다.
          </p>
        </div>
      </div>

      {/* Actual Print Content (Always rendered but hidden via CSS until print media query active) */}
      {/* Use a different ID here to avoid collision with the Modal's ID used by html2pdf */}
      <PatientLogPrintView 
        id="native-print-target" 
        visits={visits} 
        currentDate={currentDate} 
      />

      {/* Print Preview Modal (Lazy Loaded) */}
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
