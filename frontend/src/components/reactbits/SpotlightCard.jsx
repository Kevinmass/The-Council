import { useRef } from 'react';

// Adaptado de reactbits.dev/components/spotlight-card
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(201, 162, 39, 0.14)',
}) {
  const ref = useRef(null);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={`group relative overflow-hidden surface ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), ${spotlightColor}, transparent 72%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
