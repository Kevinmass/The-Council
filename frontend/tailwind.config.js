/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#08080A',
          50: '#0E0F12',
          100: '#141519',
          200: '#1B1D22',
          300: '#25272E',
        },
        paper: '#ECEDEF',
        dim: '#9A9CA3',
        faint: '#62646B',
        // acento contenido (oro antiguo) — se usa como filo, no como relleno
        accent: {
          DEFAULT: '#C9A227',
          soft: '#D9BC63',
        },
        good: '#4FAF87',
        warn: '#D9A86A',
        bad: '#D98A6A',
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      maxWidth: {
        prose2: '68ch',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'grain-shift': {
          '0%,100%': { transform: 'translate(0,0)' },
          '10%': { transform: 'translate(-3%,-2%)' },
          '30%': { transform: 'translate(2%,-4%)' },
          '50%': { transform: 'translate(-1%,3%)' },
          '70%': { transform: 'translate(3%,1%)' },
          '90%': { transform: 'translate(-2%,2%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-150% 0' },
          '100%': { backgroundPosition: '250% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
};
