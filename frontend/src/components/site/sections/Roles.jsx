import Reveal from '../../common/Reveal.jsx';
import TiltedCard from '../../reactbits/TiltedCard.jsx';
import { PERSONALITIES, SPECIALIZATIONS, specAccent } from '../../../lib/catalog.js';

export default function Roles() {
  return (
    <section id="roles" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 md:px-8">
      <Reveal>
        <p className="eyebrow">Roles</p>
        <h2 className="mt-4 max-w-2xl font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] text-paper">
          Cada agente es una personalidad por una especialidad.
        </h2>
        <p className="mt-5 max-w-prose2 text-dim">
          Las combinás como quieras. Un pesimista de seguridad y un creativo de
          frontend sobre el mismo problema no dicen lo mismo — y esa es la idea.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <div>
          <h3 className="eyebrow mb-5 text-dim">Personalidades</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {PERSONALITIES.map((p, i) => (
              <Reveal key={p.name} delay={i * 60}>
                <div className="surface h-full p-5">
                  <div className="font-display text-xl text-paper">{p.label}</div>
                  <p className="mt-2 text-sm leading-relaxed text-dim">{p.blurb}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div>
          <h3 className="eyebrow mb-5 text-dim">Especialidades</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {SPECIALIZATIONS.map((s, i) => (
              <Reveal key={s.name} delay={i * 60}>
                <TiltedCard className="h-full rounded-xl">
                  <div className="surface h-full p-5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: specAccent(s.name) }}
                      />
                      <span className="font-display text-xl text-paper">
                        {s.label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-dim">
                      {s.blurb}
                    </p>
                    <p className="mt-3 font-mono text-[0.7rem] text-faint">
                      modelo · {s.model}
                    </p>
                  </div>
                </TiltedCard>
              </Reveal>
            ))}
            <Reveal delay={SPECIALIZATIONS.length * 60}>
              <div className="flex h-full items-center rounded-xl border border-dashed border-[color:var(--line-strong)] p-5 text-sm text-dim">
                <span>
                  <span className="text-paper">+ Personalizada.</span> Escribís la
                  tuya —{' '}
                  <span className="font-mono text-faint">legal, growth, apicultor</span>{' '}
                  — y el agente la adopta.
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
