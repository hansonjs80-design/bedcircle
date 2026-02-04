
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
    <div id={id} className={`${className} bg-white text-black p-8 sm:p-12`}>
      {/* Header: Flexbox for Left Title / Right Info */}
      {/* Increased pb-4 to pb-6 to ensure text stays well above the border line */}
      <div className="flex justify-between items-end mb-4 pb-6 border-b-2 border-black">
         {/* Reduced font size (text-2xl -> text-xl) */}
         <h1 className="text-xl sm:text-2xl font-black text-black leading-snug tracking-tight">환자 현황</h1>
         <div className="flex items-center gap-3 text-sm font-bold text-gray-600 mb-1.5">
            <span className="text-gray-500">{currentDate}</span>
            <span className="w-px h-3 bg-gray-300"></span>
            <span className="text-black text-base font-black">
              총 {visits.length}명
            </span>
         </div>
      </div>

      {/* Single Column Layout (1열) */}
      <div className="w-full flex flex-col">
         {visits.map((visit, index) => (
           <div 
             key={visit.id} 
             // Darkened border from gray-400 to gray-600 (approx 50% darker)
             className="break-inside-avoid page-break-inside-avoid border-b border-gray-600 py-2 flex items-center gap-4 sm:gap-6 text-base"
           >
              {/* No. (Room Number) */}
              <div className="w-10 sm:w-12 shrink-0 font-black text-gray-900 text-center text-lg sm:text-xl">
                 {visit.bed_id || (index + 1)}
              </div>
              
              {/* Name */}
              <div className="w-20 sm:w-24 shrink-0 font-bold text-base sm:text-lg text-gray-900 whitespace-nowrap overflow-visible px-1">
                 {visit.patient_name || "-"}
              </div>
              
              {/* Body Part */}
              <div className="w-20 sm:w-24 shrink-0 font-bold text-gray-600 text-center whitespace-nowrap overflow-visible px-1">
                 {visit.body_part || "-"}
              </div>
              
              {/* Treatment */}
              <div className="flex-1 text-gray-800 font-medium whitespace-nowrap overflow-visible px-1 text-base sm:text-lg">
                 {visit.treatment_name || "-"}
              </div>
              
              {/* Memo */}
              <div className="w-32 sm:w-40 shrink-0 text-sm text-gray-500 text-right whitespace-nowrap overflow-visible px-1">
                 {visit.memo || ""}
              </div>
           </div>
         ))}
         
         {/* Fill empty space for paper feel - Removed border-b to make lines invisible */}
         {Array.from({ length: Math.max(0, 15 - visits.length) }).map((_, i) => (
           <div key={`empty-${i}`} className="break-inside-avoid py-3"></div>
         ))}
      </div>
      
      <div className="fixed bottom-4 left-0 w-full text-center text-[8pt] text-gray-300 uppercase tracking-wider">
        PhysioTrack Pro - Printed on {new Date().toLocaleString()}
      </div>
    </div>
  );
};
