import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="relative border-t border-[color:var(--line)]">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <Logo className="h-6 w-6" />
              <span className="font-display text-xl text-paper">The Council</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-dim">
              Un consejo de agentes de IA con personalidad y especialidad. Debaten
              tu problema en rondas y entregan una síntesis accionable.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div>
              <div className="eyebrow mb-3">Producto</div>
              <ul className="space-y-2 text-dim">
                <li>
                  <Link to="/app" className="hover:text-paper">
                    Abrir el Consejo
                  </Link>
                </li>
                <li>
                  <a href="#como" className="hover:text-paper">
                    Cómo funciona
                  </a>
                </li>
                <li>
                  <a href="#roadmap" className="hover:text-paper">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div className="eyebrow mb-3">Recursos</div>
              <ul className="space-y-2 text-dim">
                <li>
                  <a
                    href="https://github.com/Kevinmass/The-Council"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-paper"
                  >
                    Repositorio
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/Kevinmass/The-Council/issues"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-paper"
                  >
                    Issues
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div className="eyebrow mb-3">Stack</div>
              <ul className="space-y-2 text-dim">
                <li>Node · Express</li>
                <li>Ollama (local)</li>
                <li>React · Vite</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="hairline my-10" />

        <div className="flex flex-col gap-2 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} The Council — proyecto multi-agente.</span>
          <span className="font-mono">
            Funciona offline con respuestas simuladas si no hay Ollama.
          </span>
        </div>
      </div>
    </footer>
  );
}
