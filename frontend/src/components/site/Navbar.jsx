import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import Magnetic from '../reactbits/Magnetic.jsx';

export default function Navbar({ variant = 'landing' }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-[color:var(--line)] bg-ink/70 backdrop-blur-xl'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-[1.35rem] leading-none text-paper">
            The Council
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Kevinmass/The-Council"
            target="_blank"
            rel="noreferrer"
            className="hidden text-sm text-dim transition-colors hover:text-paper sm:block"
          >
            GitHub
          </a>
          {variant === 'landing' ? (
            <Magnetic>
              <Link to="/app" className="btn-solid">
                Abrir el Consejo
              </Link>
            </Magnetic>
          ) : (
            <Link to="/" className="btn-ghost">
              ← Volver
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
