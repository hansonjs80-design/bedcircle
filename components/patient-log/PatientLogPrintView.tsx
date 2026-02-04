
import React from 'react';
import { PatientVisit } from '../../types';

interface PatientLogPrintViewProps {
  visits: PatientVisit[];
  currentDate: string;
  className?: string; // Allow overriding styles for Preview mode
  id?: string; // Allow dynamic ID to prevent collisions
}

export const PatientLogPrintView: React.FC<PatientLogPrintViewProps> = ({ 
  visits, 
  currentDate,
  className = "hidden print-only-visible print:block", // Default: Hidden on screen, visible on print
  id = "print-target-content"
}) => {
  return (
    <div id={id} className={`${className} bg-white text-black p-10`}>
      {/* Header: Flexbox for Left Title / Right Info */}
      <div className="flex justify-between items-end mb-8 pb-4 border-b-2 border-black">
         <h1 className="text-4xl font-black text-black leading-normal tracking-tight">환자 현황</h1>
         <div className="flex items-center gap-4 text-sm font-bold text-gray-600 mb-1.5">
            <span className="text-gray-500">{currentDate}</span>
            <span className="w-px h-3 bg-gray-300"></span>
            <span className="text-black text-base font-black">
              총 {visits.length}명
            </span>
         </div>
      </div>

      {/* Multi-column Layout for Density */}
      <div className="columns-2 gap-16 w-full">
         {visits.map((visit, index) => (
           <div 
             key={visit.id} 
             className="break-inside-avoid page-break-inside-avoid border-b border-gray-200 py-4 flex items-center gap-4 text-sm leading-relaxed"
           >
              {/* No. (Room Number) - Larger Font */}
              <div className="w-8 shrink-0 font-black text-gray-900 text-center text-lg leading-normal">
                 {visit.bed_id || (index + 1)}
              </div>
              
              {/* Name - Increased width & Font size */}
              <div className="w-20 shrink-0 font-bold text-base text-gray-900 truncate leading-normal py-0.5">
                 {visit.patient_name || "-"}
              </div>
              
              {/* Body Part - Increased width */}
              <div className="w-16 shrink-0 font-bold text-gray-500 truncate text-center leading-normal py-0.5">
                 {visit.body_part || "-"}
              </div>
              
              {/* Treatment - Flex-1 to take available space */}
              <div className="flex-1 truncate text-gray-800 font-medium leading-normal py-0.5">
                 {visit.treatment_name || "-"}
              </div>
              
              {/* Memo (Visible if present) */}
              <div className="w-16 shrink-0 text-xs text-gray-400 truncate text-right leading-normal py-0.5">
                 {visit.memo || ""}
              </div>
           </div>
         ))}
         
         {/* 빈 줄 채우기 (종이 느낌) - Optional */}
         {Array.from({ length: Math.max(0, 24 - visits.length) }).map((_, i) => (
           <div key={`empty-${i}`} className="break-inside-avoid border-b border-gray-100 py-5"></div>
         ))}
      </div>
      
      <div className="fixed bottom-6 left-0 w-full text-center text-[8pt] text-gray-300 uppercase tracking-wider">
        PhysioTrack Pro - Printed on {new Date().toLocaleString()}
      </div>
    </div>
  );
};
