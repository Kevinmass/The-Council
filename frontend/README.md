# Frontend — The Council

SPA en **React + Vite**. Dos vistas:

- `/` — landing (hero, explicación, cómo funciona, roles, roadmap, CTA)
- `/app` — la herramienta del consejo (configurar agentes, correr, ver síntesis)

Estética "dark premium": fondo WebGL (Aurora, vía [reactbits.dev](https://reactbits.dev) +
[`ogl`](https://github.com/oframe/ogl)), tipografía protagonista (Instrument Serif + Geist),
acento de oro contenido.

## Desarrollo

```bash
npm install          # una vez
npm run dev          # http://localhost:5173  (proxya /api -> http://127.0.0.1:3000)
```

Necesitás el backend Express corriendo aparte (`npm start` desde la raíz). Con `MOCK_LLM`
o el fallback por defecto, no hace falta Ollama.

```bash
npm run build        # genera dist/  (lo sirve Express en producción)
npm run preview      # sirve dist/ localmente para verificar el build
```

Desde la raíz del repo también: `npm run frontend:dev`, `npm run frontend:build`.

## Estructura

```
src/
├── main.jsx                 raíz React + BrowserRouter
├── App.jsx                  rutas (/ y /app)
├── index.css                Tailwind + tokens + componentes base
├── pages/                   Landing.jsx · Council.jsx
├── components/
│   ├── reactbits/           Aurora, SplitText, CountUp, ShinyText,
│   │                        SpotlightCard, TiltedCard, Magnetic
│   ├── common/              Reveal
│   ├── site/                Navbar (minimal), LineSidebar (scroll-spy de secciones),
│   │                        Footer, Logo, Backdrop, CouncilDiagram,
│   │                        sections/ (Hero, WhatIsIt, HowItWorks, Roles, Roadmap, CTA)
│   └── council/             ProblemField, RoundsSlider, AgentRail/AgentCard,
│                            RunProgress, Results, Synthesis, QualityMeter, ModeBadge
├── hooks/useCouncil.js      estado + orquestación de la llamada a /api/council
└── lib/                     api.js (fetch a /api/*) · catalog.js (fallback estático) ·
                             richtext.jsx (render seguro de markdown ligero)
```

## Notas

- Los componentes de `reactbits/` están adaptados de reactbits.dev (MIT), reescritos para
  este proyecto y sin framer-motion (GSAP + rAF + CSS).
- El fondo respeta `prefers-reduced-motion` (Aurora se congela, las animaciones de texto
  aparecen sin stagger).
- Tailwind v3 vía PostCSS. Sin CSS-in-JS.
