import { useMemo, useState } from 'react';
import { Clock, Building2, CalendarCheck, RotateCcw } from 'lucide-react';
import { ROOMS } from '@/data';
import { RoomCard } from '@/components/RoomCard';
import { TimeField } from '@/components/TimeField';
import { AvailabilityResult } from '@/components/AvailabilityResult';
import { FilterBar } from '@/components/FilterBar';
import { EmptyState } from '@/components/EmptyState';
import { collectEquipment, filterRooms } from '@/filter';
import {
  checkAvailability,
  pastStartIssue,
  timeToMinutes,
  minutesToLabel,
  type CheckResult,
} from '@/utils';
import type { FilterCriteria } from '@/types';

const DEFAULT_CRITERIA: FilterCriteria = { attendees: 0, equipment: [] };

function App() {
  // Current time in minutes — starts at 10:00 AM for demo convenience
  const [currentTime, setCurrentTime] = useState(600);
  const [criteria, setCriteria] = useState<FilterCriteria>(DEFAULT_CRITERIA);
  const [roomId, setRoomId] = useState<string>('');
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:00');
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

  const startMin = timeToMinutes(startTime) ?? 0;
  const endMin = timeToMinutes(endTime) ?? 0;

  // Live field feedback (AC6) uses the same AC1 rule as checkAvailability.
  const startError = startTime
    ? pastStartIssue(startMin, currentTime)?.message
    : undefined;

  const handleCheck = () => {
    setResult(checkAvailability(effectiveRoom, startMin, endMin, currentTime));
  };

  const resetFilters = () => setCriteria(DEFAULT_CRITERIA);

  const handleReset = () => {
    setResult(null);
    setRoomId('');
    setStartTime('11:00');
    setEndTime('12:00');
    setCriteria(DEFAULT_CRITERIA);
  };

  const handleCriteriaChange = (next: FilterCriteria) => {
    setCriteria(next);
    setResult(null);
  };

  const handleRoomSelect = (id: string) => {
    setRoomId(id);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-5 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 sm:text-xl">
              Smart Campus Room Availability
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              Check if a campus room is free for your time slot.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Current time banner */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="h-4 w-4 text-teal-600" />
            <span>
              Current campus time: <span className="font-semibold text-slate-800">{minutesToLabel(currentTime)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Building2 className="h-4 w-4 text-teal-600" />
            <span>{visibleRooms.length} of {ROOMS.length} rooms match your filters</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(360px,440px)]">
          {/* Left column: filters + room selection */}
          <section className="flex flex-col gap-5">
            <FilterBar
              criteria={criteria}
              equipmentOptions={equipmentOptions}
              onChange={handleCriteriaChange}
              onReset={resetFilters}
            />

            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                1. Choose a room
              </h2>
              {visibleRooms.length === 0 ? (
                <EmptyState onReset={resetFilters} />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {visibleRooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      selected={room.id === roomId}
                      onSelect={() => handleRoomSelect(room.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Right column: time + check */}
          <section className="flex flex-col gap-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                2. Pick a time interval
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <TimeField
                  id="start-time"
                  label="Start"
                  value={startTime}
                  onChange={(v) => {
                    setStartTime(v);
                    setResult(null);
                  }}
                  error={startError}
                  hint={`After ${minutesToLabel(currentTime)}`}
                />
                <TimeField
                  id="end-time"
                  label="End"
                  value={endTime}
                  onChange={(v) => {
                    setEndTime(v);
                    setResult(null);
                  }}
                  hint="Max 2 hours"
                />
              </div>

              {/* Duration display */}
              <p className="mt-3 text-xs text-slate-500">
                Duration:{' '}
                <span className="font-medium text-slate-700">
                  {startMin < endMin ? `${endMin - startMin} min` : '—'}
                </span>
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCheck}
                  className="flex-1 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 active:scale-[.98]"
                >
                  Check Availability
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                3. Result
              </h2>
              <AvailabilityResult
                result={result}
                room={effectiveRoom}
                start={startMin}
                end={endMin}
              />
            </div>
          </section>
        </div>

        {/* Rules footer */}
        <footer className="mt-10 rounded-2xl border border-slate-200 bg-white/70 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Booking rules
          </p>
          <ul className="mt-2 grid gap-x-6 gap-y-1 text-xs text-slate-500 sm:grid-cols-2">
            <li>· Start must be after the current campus time and before end (00:00–24:00).</li>
            <li>· Maximum booking length is 120 minutes.</li>
            <li>· Blocked rooms cannot be booked.</li>
            <li>· No overlap with existing bookings; touching endpoints are allowed.</li>
          </ul>
        </footer>
      </main>
    </div>
  );
}

export default App;
