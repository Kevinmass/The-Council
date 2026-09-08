import Reveal from '../../common/Reveal.jsx';

const PRINCIPLES = [
  {
    k: 'No es un chat',
    v: 'No hablás con un modelo. Configurás un panel y observás cómo delibera.',
  },
  {
    k: 'El desacuerdo es la función',
    v: 'Un optimista y un pesimista sobre el mismo problema exponen lo que un solo prompt esconde.',
  },
  {
    k: 'Termina en una decisión',
    v: 'La síntesis final entrega puntos clave, acuerdos, recomendaciones y un plan de acción.',
  },
];

export default function WhatIsIt() {
  return (
    <section
      id="que-es"
      className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 md:px-8"
    >
      <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
        <Reveal>
          <p className="eyebrow">Qué es</p>
          <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] text-paper">
            Un formato de deliberación, no otro asistente.
          </h2>
        </Reveal>

        <div>
          <Reveal delay={80}>
            <p className="text-lg leading-relaxed text-dim">
              The Council toma un problema de desarrollo y lo pone frente a un
              grupo de agentes especializados. Cada uno responde desde su
              disciplina y su carácter, leyendo lo que dijeron los demás. El
              contexto se acumula ronda tras ronda hasta que un agente neutral lo
              resume todo.
            </p>
          </Reveal>

          <div className="mt-10 space-y-px overflow-hidden rounded-xl border border-[color:var(--line)]">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.k} delay={120 + i * 70}>
                <div className="grid gap-1 bg-white/[0.02] px-5 py-5 sm:grid-cols-[200px_1fr] sm:gap-6">
                  <div className="font-medium text-paper">{p.k}</div>
                  <div className="text-sm leading-relaxed text-dim">{p.v}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
