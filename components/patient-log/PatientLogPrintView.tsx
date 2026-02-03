import React from 'react';
import { PatientVisit } from '../../types';

interface PatientLogPrintViewProps {
  visits: PatientVisit[];
  currentDate: string;
}

export const PatientLogPrintView: React.FC<PatientLogPrintViewProps> = ({ visits, currentDate }) => {
  return (
    <div className="hidden print-only-visible print:block bg-white text-black p-8">
      <div className="text-center mb-6 pb-4 border-b-2 border-black">
         <h1 className="text-2xl font-black mb-1">환자 현황 (Patient Status)</h1>
         <p className="text-sm font-medium text-gray-600">{currentDate}</p>
      </div>

      {/* Multi-column Layout for Density */}
      <div className="columns-2 gap-8 w-full">
         {visits.map((visit, index) => (
           <div 
             key={visit.id} 
             className="break-inside-avoid page-break-inside-avoid border-b border-gray-300 py-1.5 flex items-center gap-2 text-[10pt]"
           >
              {/* No. (Room Number) */}
              <div className="w-8 shrink-0 font-bold text-gray-500 text-center">
                 {visit.bed_id || (index + 1)}
              </div>
              
              {/* Name */}
              <div className="w-16 shrink-0 font-bold truncate">
                 {visit.patient_name || "-"}
              </div>
              
              {/* Body Part */}
              <div className="w-12 shrink-0 text-xs text-gray-600 truncate text-center">
                 {visit.body_part || "-"}
              </div>
              
              {/* Treatment */}
              <div className="flex-1 truncate text-gray-700 text-[9pt]">
                 {visit.treatment_name || "-"}
              </div>
              
              {/* Memo (Visible if present) */}
              <div className="w-12 shrink-0 text-[8pt] text-gray-500 truncate text-right">
                 {visit.memo || ""}
              </div>

              {/* Author */}
              <div className="w-10 shrink-0 text-right text-[8pt] text-gray-400 truncate">
                 {visit.author}
              </div>
           </div>
         ))}
         
         {/* 빈 줄 채우기 (종이 느낌) - Optional */}
         {Array.from({ length: Math.max(0, 30 - visits.length) }).map((_, i) => (
           <div key={`empty-${i}`} className="break-inside-avoid border-b border-gray-200 py-3"></div>
         ))}
      </div>
      
      <div className="fixed bottom-4 left-0 w-full text-center text-[8pt] text-gray-400">
        PhysioTrack Pro - Printed on {new Date().toLocaleString()}
      </div>
    </div>
  );
};