export default function RunProgress({ progress, phase }) {
  return (
    <div className="surface p-6">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2.5 text-dim">
          <svg
            className="h-4 w-4 animate-spin text-accent-soft"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="3"
            />
            <path
              d="M21 12a9 9 0 0 0-9-9"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          {phase || 'Procesando…'}
        </span>
        <span className="font-mono tabular-nums text-paper">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-soft transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-faint">
        El consejo responde en una sola llamada; el progreso es estimado.
      </p>
    </div>
  );
}
