import { useCallback, useMemo, useState } from 'react';
import { ROOMS } from '@/data';
import { collectEquipment, filterRooms } from '@/filter';
import {
  checkAvailability,
  parseTimeField,
  pastStartIssue,
  type CheckResult,
} from '@/utils';
import type { FilterCriteria } from '@/types';

const DEFAULT_CRITERIA: FilterCriteria = { attendees: 0, equipment: [] };
const DEFAULT_START = '11:00';
const DEFAULT_END = '12:00';

// Centralizes all availability-session state and the F5 result-invalidation
// rule: any change to room, time, or filters clears the stale result.
export function useAvailabilitySession(currentTime: number) {
  const [criteria, setCriteria] = useState<FilterCriteria>(DEFAULT_CRITERIA);
  const [roomId, setRoomId] = useState<string>('');
  const [startTime, setStartTime] = useState(DEFAULT_START);
  const [endTime, setEndTime] = useState(DEFAULT_END);
  const [result, setResult] = useState<CheckResult | null>(null);

  const equipmentOptions = useMemo(() => collectEquipment(ROOMS), []);
  const visibleRooms = useMemo(() => filterRooms(ROOMS, criteria), [criteria]);

  const selectedRoom = useMemo(
    () => ROOMS.find((r) => r.id === roomId) ?? null,
    [roomId],
  );

  // F5: if the selected room is no longer visible (hidden by a filter), drop the
  // selection and result rather than silently pointing at a filtered-out room.
  const selectedStillVisible = selectedRoom
    ? visibleRooms.some((r) => r.id === selectedRoom.id)
    : true;
  const effectiveRoom = selectedStillVisible ? selectedRoom : null;

  const startMin = parseTimeField(startTime);
  const endMin = parseTimeField(endTime);

  const startError = startTime
    ? pastStartIssue(startMin, currentTime)?.message
    : undefined;

  const check = useCallback(() => {
    setResult(checkAvailability(effectiveRoom, startMin, endMin, currentTime));
  }, [effectiveRoom, startMin, endMin, currentTime]);

  // One single invalidation point for F5: room switch, time change, filter change.
  const selectRoom = useCallback((id: string) => {
    setRoomId(id);
    setResult(null);
  }, []);

  const setStart = useCallback((value: string) => {
    setStartTime(value);
    setResult(null);
  }, []);

  const setEnd = useCallback((value: string) => {
    setEndTime(value);
    setResult(null);
  }, []);

  const updateCriteria = useCallback((next: FilterCriteria) => {
    setCriteria(next);
    setResult(null);
  }, []);

  const resetFilters = useCallback(() => setCriteria(DEFAULT_CRITERIA), []);

  const resetAll = useCallback(() => {
    setResult(null);
    setRoomId('');
    setStartTime(DEFAULT_START);
    setEndTime(DEFAULT_END);
    setCriteria(DEFAULT_CRITERIA);
  }, []);

  return {
    criteria,
    equipmentOptions,
    visibleRooms,
    roomId,
    selectedRoom: effectiveRoom,
    startTime,
    endTime,
    startMin,
    endMin,
    startError,
    result,
    check,
    selectRoom,
    setStart,
    setEnd,
    updateCriteria,
    resetFilters,
    resetAll,
  };
}
