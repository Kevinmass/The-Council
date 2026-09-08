export default function RoundsSlider({ value, min = 1, max = 10, onChange, disabled }) {
  return (
    <div>
      <div className="mb-2 flex items-end justify-between">
        <label htmlFor="rounds" className="text-sm font-medium text-dim">
          Rondas de debate
        </label>
        <span className="font-display text-3xl leading-none text-paper">
          {value}
        </span>
      </div>
      <input
        id="rounds"
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full disabled:opacity-50"
      />
      <div className="mt-1.5 flex justify-between font-mono text-[0.7rem] text-faint">
        <span>1 · rápido</span>
        <span>5 · balanceado</span>
        <span>10 · profundo</span>
      </div>
    </div>
  );
}
