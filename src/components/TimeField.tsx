interface TimeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  id: string;
}

export function TimeField({ label, value, onChange, hint, error, id }: TimeFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={[
          'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2',
          error
            ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200'
            : 'border-slate-200 focus:border-teal-400 focus:ring-teal-200',
        ].join(' ')}
      />
      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-600" role="alert">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
}
