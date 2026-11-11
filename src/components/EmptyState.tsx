import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
      <SearchX className="mx-auto h-10 w-10 text-slate-300" />
      <p className="mt-3 text-sm font-semibold text-slate-600">
        No rooms match your filters
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Try lowering the attendee count or removing some equipment requirements.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        <RotateCcw className="h-4 w-4" />Clear filters
      </button>
    </div>
  );
}
