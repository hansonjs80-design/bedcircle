
import React from 'react';

export const PatientLogTableHeader: React.FC = () => {
  return (
    <thead className="sticky top-0 bg-gray-200 dark:bg-slate-700 z-10 shadow-sm border-b border-gray-300 dark:border-slate-600">
      <tr>
        <th className="py-3 px-1 text-xs font-black text-black dark:text-white uppercase tracking-wider w-[32px] md:w-[36px] text-center">
          No.
        </th>
        {/* 모바일 너비 최적화: 이름/부위/메모 너비를 조금씩 줄여서 상태 열 공간 확보 */}
        <th className="py-3 px-1 text-sm font-black text-black dark:text-white uppercase tracking-wider w-[55px] md:w-[110px] xl:w-[63px] text-center">
          이름
        </th>
        <th className="py-3 px-1 text-sm font-black text-black dark:text-white uppercase tracking-wider w-[55px] md:w-[120px] xl:w-[70px] text-center">
          부위
        </th>
        <th className="py-3 px-1 text-sm font-black text-black dark:text-white uppercase tracking-wider text-center">
          처방 목록
        </th>
        {/* 새로 추가된 상태 열 */}
        <th className="py-3 px-1 text-sm font-black text-black dark:text-white uppercase tracking-wider w-[40px] md:w-[60px] xl:w-[45px] text-center">
          상태
        </th>
        <th className="py-3 px-1 text-sm font-black text-black dark:text-white uppercase tracking-wider w-[55px] md:w-[160px] xl:w-[70px] text-center">
          메모
        </th>
        <th className="py-3 px-1 text-xs font-black text-black dark:text-white uppercase tracking-wider w-[35px] md:w-[60px] xl:w-[35px] text-center">
          작성
        </th>
        <th className="py-3 px-1 w-[20px]"></th>
      </tr>
    </thead>
  );
};
