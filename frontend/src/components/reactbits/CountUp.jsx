import { useEffect, useRef, useState } from 'react';

// Adaptado de reactbits.dev/text-animations/count-up
// Cuenta de `from` a `to` con ease-out cúbico, al entrar en viewport.
export default function CountUp({
  to,
  from = 0,
  duration = 1.6,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = '',
  className = '',
}) {
  const ref = useRef(null);
  const [val, setVal] = useState(from);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(to);
      return;
    }

    let raf;
    let startTime = null;
    const run = (t) => {
      if (startTime === null) startTime = t;
      const p = Math.min((t - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(run);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          raf = requestAnimationFrame(run);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, from, duration, decimals]);

  const fixed = val.toFixed(decimals);
  const shown = separator
    ? fixed.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    : fixed;

  return (
    <span ref={ref} className={className}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}
