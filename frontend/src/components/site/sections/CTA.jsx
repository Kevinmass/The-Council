import { Link } from 'react-router-dom';
import Reveal from '../../common/Reveal.jsx';
import Magnetic from '../../reactbits/Magnetic.jsx';
import SplitText from '../../reactbits/SplitText.jsx';

export default function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-28 md:px-8">
      <Reveal>
        <div className="surface relative overflow-hidden px-6 py-16 text-center md:px-16 md:py-24">
          <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          <SplitText
            as="h2"
            className="mx-auto max-w-3xl font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] text-paper"
            text="Reuní tu consejo y que discutan por vos."
            delay={30}
          />
          <p className="mx-auto mt-5 max-w-xl text-dim">
            Arranca en segundos. Si no tenés Ollama instalado, corre igual con
            respuestas simuladas para que puedas probar el flujo completo.
          </p>
          <div className="mt-9 flex justify-center">
            <Magnetic>
              <Link to="/app" className="btn-solid px-7 py-3.5 text-base">
                Abrir el Consejo
              </Link>
            </Magnetic>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
