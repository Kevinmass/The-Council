const MAP = {
  mock: { dot: '#D9A86A', text: 'Modo simulado', hint: 'MOCK_LLM activo — respuestas ficticias' },
  'mock-fallback': {
    dot: '#D9A86A',
    text: 'Modo simulado',
    hint: 'Ollama no responde — usando respuestas simuladas',
  },
  ollama: { dot: '#4FAF87', text: 'Ollama conectado', hint: 'Respuestas generadas por IA local' },
  unavailable: {
    dot: '#D98A6A',
    text: 'Ollama no disponible',
    hint: 'Las llamadas fallarán (LLM_FALLBACK_MOCK=false)',
  },
};

export default function ModeBadge({ health }) {
  if (!health) return null;
  const info = MAP[health.mode] || MAP.ollama;
  return (
    <span
      title={info.hint}
      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white/[0.03] px-3 py-1 text-xs text-dim"
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: info.dot, boxShadow: `0 0 8px ${info.dot}66` }}
      />
      {info.text}
    </span>
  );
}
