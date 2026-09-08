import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Adaptado de reactbits.dev/text-animations/split-text
// Divide el texto en palabras o caracteres y los revela con stagger (GSAP),
// disparado por IntersectionObserver (sin plugin ScrollTrigger).
export default function SplitText({
  text,
  as: Tag = 'div',
  className = '',
  splitType = 'words', // 'words' | 'chars'
  delay = 45, // ms de stagger
  duration = 0.8,
  ease = 'power3.out',
  from = { yPercent: 115, opacity: 0 },
  to = { yPercent: 0, opacity: 1 },
  threshold = 0.25,
  onLetterAnimationComplete,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const units =
      splitType === 'chars' ? Array.from(text) : text.split(/(\s+)/);

    el.textContent = '';
    const targets = [];
    units.forEach((u) => {
      if (/^\s+$/.test(u)) {
        el.appendChild(document.createTextNode(u));
        return;
      }
      const outer = document.createElement('span');
      outer.style.display = 'inline-block';
      outer.style.overflow = 'hidden';
      outer.style.verticalAlign = 'top';
      outer.style.padding = '0.05em 0'; // aire para descendentes de la serif
      const inner = document.createElement('span');
      inner.style.display = 'inline-block';
      inner.style.willChange = 'transform';
      inner.textContent = u;
      outer.appendChild(inner);
      el.appendChild(outer);
      targets.push(inner);
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(targets, to);
      onLetterAnimationComplete?.();
      return;
    }

    gsap.set(targets, from);
    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      gsap.to(targets, {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        onComplete: onLetterAnimationComplete,
      });
    };

    // Si ya está en pantalla al montar, animar de inmediato (sin flash del hero).
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      requestAnimationFrame(play);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            play();
            io.disconnect();
          }
        });
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, splitType]);

  return <Tag ref={ref} className={className} aria-label={text} />;
}
