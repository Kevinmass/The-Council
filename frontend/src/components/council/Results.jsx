import RichText from '../../lib/richtext.jsx';
import Reveal from '../common/Reveal.jsx';
import Synthesis from './Synthesis.jsx';
import { specAccent } from '../../lib/catalog.js';

function ResponseCard({ resp }) {
  const spec = resp.agent?.specialization || 'neutral';
  const accent = specAccent(spec);

  if (resp.error) {
    return (
      <div className="rounded-lg border border-bad/30 bg-bad/[0.06] p-4">
        <div className="mb-1 flex items-center gap-2 text-xs">
          <span className="font-mono text-bad">error</span>
          <span className="text-dim">{resp.agent?.name}</span>
        </div>
        <p className="text-sm text-bad/90">{resp.error}</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border border-[color:var(--line)] bg-white/[0.015] p-4"
      style={{ borderLeft: `2px solid ${accent}` }}
    >
      <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-medium text-paper">{resp.agent?.personality}</span>
        <span className="text-faint">·</span>
        <span className="text-dim" style={{ color: accent }}>
          {resp.agent?.specialization}
        </span>
        <span className="ml-auto flex items-center gap-2 font-mono text-[0.7rem] text-faint">
          {resp.metadata?.mock && (
            <span className="rounded border border-warn/40 px-1 text-warn">sim</span>
          )}
          {resp.metadata?.model}
        </span>
      </div>
      <RichText text={resp.response} className="text-sm text-dim" />
    </div>
  );
}

export default function Results({ result }) {
  const rounds = result?.results || [];

  return (
    <div className="space-y-6">
      {rounds.map((round, i) => (
        <Reveal key={round.round ?? i} delay={i * 60}>
          <div className="surface p-5 md:p-6">
            <div className="mb-4 flex items-center gap-3 border-b border-[color:var(--line)] pb-3">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-[color:var(--line-strong)] font-mono text-sm text-paper">
                {round.round}
              </span>
              <div>
                <div className="font-display text-lg text-paper">
                  Ronda {round.round}
                </div>
                <div className="text-xs text-faint">
                  {round.responses.length} intervenciones
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {round.responses.map((r, j) => (
                <ResponseCard key={j} resp={r} />
              ))}
            </div>
          </div>
        </Reveal>
      ))}

      <Reveal delay={80}>
        <Synthesis synthesis={result?.synthesis} />
      </Reveal>
    </div>
  );
}
