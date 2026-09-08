import { useEffect, useRef, useState } from 'react';

// Wrapper de aparición (fade + translateY) al entrar en viewport.
export default function Reveal({
  children,
  as: Tag = 'div',
  className = '',
  delay = 0,
  y = 18,
  threshold = 0.15,
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translateY(${y}px)`,
        transition:
          'opacity .75s cubic-bezier(.16,1,.3,1), transform .75s cubic-bezier(.16,1,.3,1)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}
