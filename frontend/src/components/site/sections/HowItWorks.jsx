import SpotlightCard from '../../reactbits/SpotlightCard.jsx';
import Reveal from '../../common/Reveal.jsx';
import { STEPS } from '../../../lib/catalog.js';

export default function HowItWorks() {
  return (
    <section
      id="como"
      className="relative scroll-mt-24 border-y border-[color:var(--line)] bg-white/[0.012] py-24"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <p className="eyebrow">Cómo funciona</p>
          <h2 className="mt-4 max-w-2xl font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] text-paper">
            Cuatro pasos, de un problema difuso a un plan.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <SpotlightCard className="h-full p-7">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-sm text-accent-soft">{s.n}</span>
                  <h3 className="font-display text-2xl text-paper">{s.title}</h3>
                </div>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-dim">
                  {s.body}
                </p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
