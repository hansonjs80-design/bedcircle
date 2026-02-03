import React, { useState, useEffect } from 'react';
import { BedState, BedStatus } from '../types';
import { supabase, isOnlineMode } from '../lib/supabase';
import { mapRowToBed, shouldIgnoreServerUpdate } from '../utils/bedLogic';

export const useBedRealtime = (
  setBeds: React.Dispatch<React.SetStateAction<BedState[]>>,
  setLocalBeds: (value: BedState[] | ((val: BedState[]) => BedState[])) => void
) => {
  // Supabase의 subscribe 상태인 'TIMED_OUT'을 포함하도록 타입 확장
  const [realtimeStatus, setRealtimeStatus] = useState<'OFFLINE' | 'CONNECTING' | 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'CLOSED' | 'TIMED_OUT'>('OFFLINE');

  useEffect(() => {
    // Local capture to satisfy TypeScript null checks in closures
    const client = supabase;
    if (!isOnlineMode() || !client) {
      setRealtimeStatus('OFFLINE');
      return;
    }

    setRealtimeStatus('CONNECTING');

    const fetchBeds = async () => {
      const { data, error } = await client.from('beds').select('*').order('id');
      if (!error && data) {
        const serverBeds: BedState[] = data.map(row => mapRowToBed(row) as BedState);
        setBeds((currentBeds) => {
          return serverBeds.map(serverBed => {
            const localBed = currentBeds.find(b => b.id === serverBed.id);
            if (localBed && shouldIgnoreServerUpdate(localBed, serverBed)) return localBed;
            return serverBed;
          });
        });
      }
    };

    fetchBeds();

    const channel = client
      .channel('public:beds')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beds' }, (payload) => {
        const updatedBedFields = mapRowToBed(payload.new);
        
        setBeds((prev) => {
          const newBeds = prev.map((bed) => {
            if (bed.id === updatedBedFields.id) {
              // 1. 타임스탬프 기반 최신 데이터 확인
              if (shouldIgnoreServerUpdate(bed, updatedBedFields)) return bed;
              
              // 2. 좀비 방지: 로컬에서 방금 비웠는데 서버가 Active로 오면 무시
              if (bed.status === BedStatus.IDLE && updatedBedFields.status === BedStatus.ACTIVE) {
                 const timeSinceClear = Date.now() - (bed.lastUpdateTimestamp || 0);
                 if (timeSinceClear < 10000) return bed; 
              }

              // 3. 처방 데이터 증발 방지 (Smart Merge)
              // 상태 표시 버튼 클릭 시 서버에서 처방 데이터가 누락되어 오는 경우 기존 데이터 유지
              const mergedBed = { ...bed, ...updatedBedFields };
              
              const isTargetActive = mergedBed.status !== BedStatus.IDLE;
              const hasLocalPrescription = !!bed.customPreset || !!bed.currentPresetId;
              const serverHasNoPrescription = !mergedBed.customPreset && !mergedBed.currentPresetId;

              if (isTargetActive && hasLocalPrescription && serverHasNoPrescription) {
                mergedBed.customPreset = bed.customPreset;
                mergedBed.currentPresetId = bed.currentPresetId;
                mergedBed.queue = bed.queue;
                mergedBed.remainingTime = bed.remainingTime;
              }

              // IDLE인 경우 확실히 초기화
              if (mergedBed.status === BedStatus.IDLE) {
                mergedBed.remainingTime = 0;
                mergedBed.customPreset = undefined;
                mergedBed.currentPresetId = null;
                mergedBed.queue = [];
              }

              return mergedBed;
            }
            return bed;
          });
          
          setLocalBeds(newBeds);
          return newBeds;
        });
      })
      .subscribe((status) => {
        // 타입 안전성을 위해 status를 직접 할당
        setRealtimeStatus(status as any);
      });

    return () => { client.removeChannel(channel); };
  }, [setBeds, setLocalBeds]);

  return { realtimeStatus };
};