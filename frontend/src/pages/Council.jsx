import Backdrop from '../components/site/Backdrop.jsx';
import Navbar from '../components/site/Navbar.jsx';
import Footer from '../components/site/Footer.jsx';
import ModeBadge from '../components/council/ModeBadge.jsx';
import ProblemField from '../components/council/ProblemField.jsx';
import RoundsSlider from '../components/council/RoundsSlider.jsx';
import AgentRail from '../components/council/AgentRail.jsx';
import RunProgress from '../components/council/RunProgress.jsx';
import Results from '../components/council/Results.jsx';
import useCouncil from '../hooks/useCouncil.js';

export default function Council() {
  const c = useCouncil();
  const running = c.status === 'running';

  return (
    <div className="relative min-h-screen">
      <Backdrop intensity="soft" />
      <Navbar variant="app" />

      <main className="mx-auto max-w-5xl px-5 pb-24 pt-28 md:px-8">
        <header className="mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">La herramienta</p>
              <h1 className="mt-2 font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-none text-paper">
                El Consejo
              </h1>
            </div>
            <ModeBadge health={c.health} />
          </div>
          <p className="mt-4 max-w-prose2 text-dim">
            Definí el problema, armá el panel de agentes y mandá a deliberar. La
            síntesis final llega al pie.
          </p>
        </header>

        {/* Configuración */}
        <section className="surface p-5 md:p-7">
          <div className="grid gap-7 lg:grid-cols-[1.4fr_1fr]">
            <ProblemField
              value={c.problem}
              onChange={c.setProblem}
              disabled={running}
            />
            <RoundsSlider
              value={c.rounds}
              min={c.limits.minRounds}
              max={c.limits.maxRounds}
              onChange={c.setRounds}
              disabled={running}
            />
          </div>

          <div className="hairline my-7" />

          <AgentRail
            agents={c.agents}
            personalities={c.personalities}
            specializations={c.specializations}
            limits={c.limits}
            onChange={c.updateAgent}
            onAdd={c.addAgent}
            onRemove={c.removeAgent}
            running={running}
          />

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={c.run}
              disabled={!c.validation.ok || running}
              className="btn-solid px-6 py-3 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {running ? 'Deliberando…' : 'Iniciar el consejo'}
            </button>
            {(c.status === 'done' || c.status === 'error') && (
              <button
                type="button"
                onClick={c.reset}
                className="btn-ghost px-5 py-3"
              >
                Nuevo consejo
              </button>
            )}
            {!c.validation.ok && !running && (
              <span className="text-sm text-faint">{c.validation.why}</span>
            )}
          </div>
        </section>

        {/* Progreso */}
        {running && (
          <section className="mt-6">
            <RunProgress progress={c.progress} phase={c.phase} />
          </section>
        )}

        {/* Error */}
        {c.status === 'error' && (
          <section className="mt-6">
            <div className="rounded-xl border border-bad/30 bg-bad/[0.06] p-5 text-sm text-bad/90">
              {c.error || 'Algo salió mal al ejecutar el consejo.'}
            </div>
          </section>
        )}

        {/* Resultados */}
        {c.status === 'done' && c.result && (
          <section className="mt-10">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="font-display text-2xl text-paper">Deliberación</h2>
              <span className="font-mono text-xs text-faint">
                {c.result.configuration?.totalAgents ?? c.agents.length} agentes ·{' '}
                {c.result.configuration?.rounds ?? c.rounds} rondas
              </span>
            </div>
            <Results result={c.result} />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
