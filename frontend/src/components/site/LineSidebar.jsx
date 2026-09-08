import { useCallback, useEffect, useState } from 'react';

// Nav de secciones estilo "line sidebar" (reactbits.dev/components/line-sidebar):
// un riel vertical de líneas cortas, scroll-spy, la activa se alarga y toma el oro;
// las etiquetas aparecen al pasar el mouse por el riel. Reemplaza al header con
// links de ancla (que grita "plantilla").

const SECTIONS = [
  { id: 'top', label: 'Inicio' },
  { id: 'que-es', label: 'Qué es' },
  { id: 'como', label: 'Cómo funciona' },
  { id: 'roles', label: 'Roles' },
  { id: 'roadmap', label: 'Roadmap' },
];

export default function LineSidebar() {
  const [active, setActive] = useState('top');

  useEffect(() => {
    const targets = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
        else if (window.scrollY < window.innerHeight * 0.4) setActive('top');
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.6, 1] },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const go = useCallback((id) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 40;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  return (
    <nav
      aria-label="Secciones de la página"
      className="group fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-4 lg:flex xl:left-7"
    >
      {SECTIONS.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => go(s.id)}
            aria-current={isActive ? 'true' : undefined}
            className="group/item flex items-center gap-3 py-1"
          >
            <span
              className={`h-px shrink-0 rounded-full transition-all duration-300 ease-out ${
                isActive
                  ? 'w-10 bg-accent'
                  : 'w-5 bg-white/25 group-hover/item:w-8 group-hover/item:bg-white/60'
              }`}
            />
            <span
              className={`whitespace-nowrap font-mono text-[0.68rem] uppercase tracking-[0.18em] transition-all duration-300 ${
                isActive
                  ? 'translate-x-0 text-paper opacity-100'
                  : '-translate-x-1 text-faint opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover/item:text-dim'
              }`}
            >
              {s.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
