import Reveal from '../../common/Reveal.jsx';
import { STAGES } from '../../../lib/catalog.js';

export default function Roadmap() {
  return (
    <section
      id="roadmap"
      className="relative scroll-mt-24 border-t border-[color:var(--line)] bg-white/[0.012] py-24"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <p className="eyebrow">Roadmap</p>
          <h2 className="mt-4 max-w-2xl font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] text-paper">
            El proyecto avanza por etapas. Estas ya están.
          </h2>
        </Reveal>

        <ol className="mt-14 border-l border-[color:var(--line-strong)]">
          {STAGES.map((s, i) => (
            <Reveal key={s.tag} as="li" delay={i * 50} className="relative pb-9 pl-8 last:pb-0">
              <span
                className={`absolute -left-[6.5px] top-1.5 h-3 w-3 rounded-full border ${
                  s.done
                    ? 'border-accent bg-accent'
                    : 'border-[color:var(--line-strong)] bg-ink'
                }`}
              />
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-widest text-faint">
                  {s.tag}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[0.65rem] font-medium ${
                    s.done
                      ? 'border-good/40 text-good'
                      : 'border-[color:var(--line)] text-faint'
                  }`}
                >
                  {s.done ? 'implementada' : 'próxima'}
                </span>
              </div>
              <h3 className="mt-2 font-display text-xl text-paper">{s.title}</h3>
              <p className="mt-1 max-w-prose2 text-sm leading-relaxed text-dim">
                {s.body}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
