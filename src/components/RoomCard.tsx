import { Lock, Users, MapPin, Wrench } from 'lucide-react';
import type { Room } from '@/types';
import { minutesToLabel } from '@/utils';

interface RoomCardProps {
  room: Room;
  selected: boolean;
  onSelect: () => void;
}

export function RoomCard({ room, selected, onSelect }: RoomCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        'w-full text-left rounded-2xl border p-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400',
        selected
          ? 'border-teal-500 bg-teal-50 shadow-md ring-1 ring-teal-200'
          : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm',
        room.blocked ? 'opacity-80' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 truncate">{room.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {room.building}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {room.capacity}
            </span>
          </div>
        </div>
        {room.blocked && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">
            <Lock className="h-3.5 w-3.5" /> Blocked
          </span>
        )}
      </div>

      {room.equipment.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {room.equipment.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
            >
              <Wrench className="h-3 w-3 text-slate-400" /> {item}
            </span>
          ))}
        </div>
      )}

      {room.bookings.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Today's bookings
          </p>
          <ul className="mt-1.5 space-y-1">
            {room.bookings.map((b) => (
              <li key={b.id} className="text-xs text-slate-600">
                <span className="font-medium text-slate-700">{minutesToLabel(b.start)}–{minutesToLabel(b.end)}</span>
                <span className="text-slate-400"> · {b.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </button>
  );
}
