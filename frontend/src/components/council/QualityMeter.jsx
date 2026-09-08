import CountUp from '../reactbits/CountUp.jsx';

export default function QualityMeter({ score = 0, passed }) {
  const clamped = Math.max(0, Math.min(100, score));
  const tone = clamped >= 80 ? '#4FAF87' : clamped >= 60 ? '#D9A86A' : '#D98A6A';
  const label = clamped >= 80 ? 'Alta' : clamped >= 60 ? 'Media' : 'Baja';
  const r = 26;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[68px] w-[68px]">
        <svg viewBox="0 0 68 68" className="h-full w-full -rotate-90">
          <circle
            cx="34"
            cy="34"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="5"
          />
          <circle
            cx="34"
            cy="34"
            r={r}
            fill="none"
            stroke={tone}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (c * clamped) / 100}
            style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center font-mono text-sm text-paper">
          <CountUp to={clamped} />
        </div>
      </div>
      <div>
        <div className="text-sm text-paper">Calidad de la síntesis</div>
        <div className="text-xs text-faint">
          {label} · {clamped}/100{' '}
          {passed === false && <span className="text-warn">· bajo el umbral</span>}
        </div>
      </div>
    </div>
  );
}
