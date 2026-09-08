import { specAccent } from '../../lib/catalog.js';

export default function AgentCard({
  agent,
  index,
  personalities,
  specializations,
  onChange,
  onRemove,
  canRemove,
  thinking,
  disabled,
}) {
  const accent = specAccent(agent.specialization);

  return (
    <div
      className="surface relative flex flex-col gap-3 p-4"
      style={{
        boxShadow: thinking
          ? `0 0 0 1px ${accent}55, 0 0 26px -6px ${accent}66`
          : undefined,
      }}
    >
      <span
        className="absolute left-0 top-4 h-8 w-[3px] rounded-r"
        style={{ background: accent }}
      />

      <div className="flex items-center justify-between pl-2">
        <span className="font-mono text-xs text-faint">
          Agente {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex items-center gap-2">
          {thinking && (
            <span className="flex items-center gap-1.5 text-[0.7rem] text-dim">
              <span
                className="h-1.5 w-1.5 animate-ping rounded-full"
                style={{ background: accent }}
              />
              pensando
            </span>
          )}
          {canRemove && !disabled && (
            <button
              type="button"
              onClick={() => onRemove(agent.id)}
              aria-label={`Quitar agente ${index + 1}`}
              className="grid h-6 w-6 place-items-center rounded-full border border-[color:var(--line)] text-faint transition hover:border-bad/50 hover:text-bad"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 2l8 8M10 2l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-2 pl-2">
        <select
          className="field"
          value={agent.personality}
          disabled={disabled}
          onChange={(e) => onChange(agent.id, { personality: e.target.value })}
        >
          {personalities.map((p) => (
            <option key={p.name} value={p.name}>
              {p.label}
            </option>
          ))}
        </select>

        <select
          className="field"
          value={agent.specialization}
          disabled={disabled}
          onChange={(e) =>
            onChange(agent.id, {
              specialization: e.target.value,
              custom: e.target.value === 'custom' ? agent.custom : '',
            })
          }
        >
          {specializations.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name === 'custom' ? 'Personalizada…' : s.label}
            </option>
          ))}
        </select>

        {agent.specialization === 'custom' && (
          <input
            type="text"
            autoFocus
            className="field"
            placeholder="ej: legal, growth, apicultor"
            value={agent.custom}
            disabled={disabled}
            onChange={(e) => onChange(agent.id, { custom: e.target.value })}
          />
        )}
      </div>
    </div>
  );
}
