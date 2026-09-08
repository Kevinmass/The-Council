import AgentCard from './AgentCard.jsx';

export default function AgentRail({
  agents,
  personalities,
  specializations,
  limits,
  onChange,
  onAdd,
  onRemove,
  running,
}) {
  const full = agents.length >= limits.maxAgents;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-dim">
          Agentes del consejo
        </span>
        <span className="font-mono text-xs text-faint">
          {agents.length} / {limits.maxAgents}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {agents.map((a, i) => (
          <AgentCard
            key={a.id}
            agent={a}
            index={i}
            personalities={personalities}
            specializations={specializations}
            onChange={onChange}
            onRemove={onRemove}
            canRemove={agents.length > limits.minAgents}
            thinking={running}
            disabled={running}
          />
        ))}

        {!running && (
          <button
            type="button"
            onClick={onAdd}
            disabled={full}
            className="flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[color:var(--line-strong)] text-dim transition hover:border-accent/50 hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[color:var(--line-strong)]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3v10M3 8h10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="text-sm">
              {full ? 'Máximo alcanzado' : 'Sumar agente'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
