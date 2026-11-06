import { Users, Filter } from 'lucide-react';
import type { FilterCriteria } from '@/types';

interface RoomFilterBarProps {
  criteria: FilterCriteria;
  equipmentOptions: string[];
  onChange: (next: FilterCriteria) => void;
  onReset: () => void;
}

export function RoomFilterBar({ criteria, equipmentOptions, onChange, onReset }: RoomFilterBarProps) {
  const toggleEquipment = (item: string) => {
    const has = criteria.equipment.includes(item);
    onChange({
      ...criteria,
      equipment: has
        ? criteria.equipment.filter((e) => e !== item)
        : [...criteria.equipment, item],
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <Filter className="h-4 w-4 text-teal-600" /> Filters
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-teal-600 transition hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-200 rounded-md px-1.5 py-0.5"
        >
          Reset filters
        </button>
      </div>

      <div className="mt-4">
        <label htmlFor="attendees" className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <Users className="h-4 w-4 text-slate-400" /> Minimum attendees
        </label>
        <input
          id="attendees"
          type="number"
          min={0}
          value={criteria.attendees === 0 ? '' : criteria.attendees}
          placeholder="0"
          onChange={(e) => {
            const raw = e.target.value;
            const parsed = raw === '' ? 0 : Math.max(0, parseInt(raw, 10));
            onChange({ ...criteria, attendees: isNaN(parsed) ? 0 : parsed });
          }}
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
        />
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-700">Required equipment</p>
        <p className="text-xs text-slate-400">A room must have all selected items.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {equipmentOptions.map((item) => {
            const active = criteria.equipment.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleEquipment(item)}
                aria-pressed={active}
                className={[
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-200',
                  active
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300',
                ].join(' ')}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
