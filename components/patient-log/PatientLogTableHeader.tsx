import React from 'react';

export const PatientLogTableHeader: React.FC = () => {
  return (
    <thead className="sticky top-0 bg-gray-200 dark:bg-slate-700 z-10 shadow-sm border-b border-gray-300 dark:border-slate-600">
      <tr>
        <th className="py-3 px-2 text-xs font-black text-black dark:text-white uppercase tracking-wider w-[36px] text-center">
          No.
        </th>
        {/* 태블릿(md) 이상에서 너비 확장, 데스크탑(xl) 사이드바 모드에서 다시 축소 */}
        <th className="py-3 px-2 text-sm font-black text-black dark:text-white uppercase tracking-wider w-[63px] md:w-[110px] xl:w-[63px] text-center">
          이름
        </th>
        <th className="py-3 px-2 text-sm font-black text-black dark:text-white uppercase tracking-wider w-[70px] md:w-[120px] xl:w-[70px] text-center">
          부위
        </th>
        <th className="py-3 px-2 text-sm font-black text-black dark:text-white uppercase tracking-wider text-center">
          처방 목록
        </th>
        <th className="py-3 px-2 text-sm font-black text-black dark:text-white uppercase tracking-wider w-[70px] md:w-[160px] xl:w-[70px] text-center">
          메모
        </th>
        <th className="py-3 px-2 text-xs font-black text-black dark:text-white uppercase tracking-wider w-[35px] md:w-[60px] xl:w-[35px] text-center">
          작성
        </th>
        <th className="py-3 px-1 w-[23px]"></th>
      </tr>
    </thead>
  );
};