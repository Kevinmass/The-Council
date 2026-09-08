import { Link } from 'react-router-dom';
import SplitText from '../../reactbits/SplitText.jsx';
import CountUp from '../../reactbits/CountUp.jsx';
import Magnetic from '../../reactbits/Magnetic.jsx';
import Reveal from '../../common/Reveal.jsx';
import CouncilDiagram from '../CouncilDiagram.jsx';

const STATS = [
  { to: 4, label: 'personalidades' },
  { to: 5, label: 'especialidades' },
  { to: 10, label: 'agentes por consejo', suffix: '' },
  { to: 10, label: 'rondas de debate' },
];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative mx-auto max-w-6xl px-5 pb-20 pt-36 md:px-8 md:pb-28 md:pt-44"
    >
      <Reveal>
        <p className="eyebrow">Consejo multi-agente de IA</p>
      </Reveal>

      <h1 className="mt-5 font-display text-[clamp(2.7rem,7vw,5.25rem)] font-normal leading-[0.98] tracking-tightest text-paper">
        <SplitText
          as="span"
          className="block"
          text="Un consejo de IAs"
          delay={34}
          duration={0.6}
        />
        <SplitText
          as="span"
          className="block italic text-dim"
          text="para decisiones difíciles."
          delay={24}
          duration={0.6}
        />
      </h1>

      <Reveal delay={60}>
        <p className="mt-7 max-w-prose2 text-lg leading-relaxed text-dim">
          Sumás varios agentes, cada uno con una{' '}
          <span className="text-paper">personalidad</span> y una{' '}
          <span className="text-paper">especialidad</span>. Debaten tu problema en
          rondas, se leen entre ellos y un agente neutral cierra con una{' '}
          <span className="text-paper">síntesis accionable</span> — no con cuatro
          opiniones sueltas.
        </p>
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Magnetic>
            <Link to="/app" className="btn-solid px-6 py-3 text-[0.95rem]">
              Abrir el Consejo
            </Link>
          </Magnetic>
          <a href="#como" className="btn-ghost px-6 py-3 text-[0.95rem]">
            Ver cómo funciona
          </a>
        </div>
      </Reveal>

      <Reveal delay={280}>
        <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-[color:var(--line)] pt-10 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <dd className="font-display text-4xl text-paper">
                <CountUp to={s.to} />
                {s.suffix ?? ''}
              </dd>
              <dt className="mt-1 text-sm text-faint">{s.label}</dt>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal delay={200} className="mt-16">
        <div className="surface overflow-hidden p-4 md:p-8">
          <CouncilDiagram className="h-auto w-full text-paper" />
        </div>
      </Reveal>
    </section>
  );
}
