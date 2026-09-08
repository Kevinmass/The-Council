import RichText from '../../lib/richtext.jsx';
import QualityMeter from './QualityMeter.jsx';

function Block({ title, children }) {
  return (
    <div>
      <h4 className="eyebrow mb-2 text-dim">{title}</h4>
      <div className="text-[0.95rem] text-dim">{children}</div>
    </div>
  );
}

function List({ items, ordered }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag
      className={`space-y-1.5 pl-5 ${ordered ? 'list-decimal' : 'list-disc'} marker:text-faint`}
    >
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </Tag>
  );
}

export default function Synthesis({ synthesis }) {
  if (!synthesis || synthesis.enabled === false) {
    return (
      <div className="surface p-6 text-sm text-dim">
        No se pudo generar la síntesis final
        {synthesis?.error ? ` — ${synthesis.error}` : ''}.
      </div>
    );
  }

  const {
    summary,
    keyPoints = [],
    agreementsDisagreements,
    recommendations = [],
    actionPlan = [],
    model,
    mock,
    quality,
  } = synthesis;

  return (
    <div className="surface overflow-hidden">
      <div className="pointer-events-none h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="font-display text-2xl text-paper">Síntesis final</h3>
          <div className="flex items-center gap-2 font-mono text-xs text-faint">
            {mock && (
              <span className="rounded-full border border-warn/40 px-2 py-0.5 text-warn">
                simulada
              </span>
            )}
            {model && <span>{model}</span>}
          </div>
        </div>

        <div className="mt-5">
          <QualityMeter score={quality?.score ?? 0} passed={quality?.passed} />
        </div>

        <div className="hairline my-7" />

        <div className="space-y-7">
          {summary && summary !== 'No disponible' && (
            <Block title="Resumen general">
              <RichText text={summary} />
            </Block>
          )}
          {keyPoints.length > 0 && (
            <Block title="Puntos clave">
              <List items={keyPoints} />
            </Block>
          )}
          {agreementsDisagreements &&
            agreementsDisagreements !== 'No disponible' && (
              <Block title="Acuerdos y desacuerdos">
                <RichText text={agreementsDisagreements} />
              </Block>
            )}
          {recommendations.length > 0 && (
            <Block title="Recomendaciones">
              <List items={recommendations} />
            </Block>
          )}
          {actionPlan.length > 0 && (
            <Block title="Plan de acción">
              <List items={actionPlan} ordered />
            </Block>
          )}
        </div>
      </div>
    </div>
  );
}
