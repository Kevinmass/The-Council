export default function ProblemField({ value, onChange, disabled }) {
  return (
    <div>
      <label
        htmlFor="problem"
        className="mb-2 block text-sm font-medium text-dim"
      >
        ¿Qué problema querés poner sobre la mesa?
      </label>
      <textarea
        id="problem"
        rows={3}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ej: Diseñar la sincronización offline de una app de notas multiplataforma…"
        className="field resize-none leading-relaxed disabled:opacity-50"
      />
      <p className="mt-1.5 text-xs text-faint">
        Cuanto más concreto, mejor debate. {value.trim().length} caracteres.
      </p>
    </div>
  );
}
