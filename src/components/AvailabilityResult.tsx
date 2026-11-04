import { CheckCircle2, XCircle, Clock, Info } from 'lucide-react';
import type { CheckResult } from '@/utils';
import type { Room } from '@/types';
import { minutesToLabel } from '@/utils';

interface AvailabilityResultProps {
  result: CheckResult | null;
  room: Room | null;
  start: number;
  end: number;
}

export function AvailabilityResult({ result, room, start, end }: AvailabilityResultProps) {
  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
        <Info className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-2 text-sm text-slate-400">
          Select a room and time interval, then check availability.
        </p>
      </div>
    );
  }

  const available = result.available;

  return (
    <div
      className={[
        'rounded-2xl border p-6 transition-all duration-300',
        available
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-rose-200 bg-rose-50',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        {available ? (
          <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="h-7 w-7 shrink-0 text-rose-600" />
        )}
        <div>
          <p
            className={[
              'text-lg font-bold',
              available ? 'text-emerald-800' : 'text-rose-800',
            ].join(' ')}
          >
            {available ? 'Available' : 'Unavailable'}
          </p>
          <p className="text-sm text-slate-600">
            {room ? room.name : 'No room selected'} · {minutesToLabel(start)}–{minutesToLabel(end)}
          </p>
        </div>
      </div>

      {available && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/70 p-3 text-sm text-emerald-800">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            This room is free for the requested interval and meets all booking rules.
            No booking has been created — existing schedule is unchanged.
          </span>
        </div>
      )}

      {!available && result.issues.length > 0 && (
        <ul className="mt-4 space-y-2">
          {result.issues.map((issue) => (
            <li
              key={issue.code}
              className="flex items-start gap-2 rounded-xl bg-white/70 p-3 text-sm text-rose-800"
            >
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{issue.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
