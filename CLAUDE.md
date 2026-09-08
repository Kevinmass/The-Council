# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"The Council" (El Consejo) — a multi-agent AI system where several local LLM "agents", each with a
**personality** and a **specialization**, debate a prompt over N rounds, after which a neutral
synthesizer agent produces a structured conclusion. Backend is Node.js + Express; models run locally
via **Ollama**; conversations persist to **SQLite**. A dependency-free vanilla-JS frontend is served
statically by the same Express process.

The codebase (comments, prompts, error messages, docs) is in **Spanish**. The roadmap is organized as
numbered "ETAPA" stages — see `README.md`. Implemented: rounds (3), synthesis (4), specialization (5),
user control / N agents (6), web UI (11).

## Project layout

```
src/            backend (Express server)
  index.js      entrypoint — requires ./app and ./config, starts the listener
  app.js        Express app: CORS, static frontend/dist, /api index, SPA fallback, error handlers
  config.js     single config object, all values from env vars
  routes/api.js every /api/* endpoint
  services/     ollamaService, multiModelOllamaService, personalityService,
                agentService, databaseService, mockLLMService
frontend/       React + Vite SPA (its own package.json); `vite build` -> frontend/dist
  src/pages/    Landing.jsx (/) · Council.jsx (/app)
  src/components/reactbits/  Aurora/SplitText/CountUp/... adapted from reactbits.dev
scripts/        start-mock.js (sets MOCK_LLM=true then requires src/index.js)
tests/          standalone integration scripts (test-*.js)
  fixtures/     sample JSON request bodies
docs/           design notes, technical audit, sample council output
data/           SQLite DB file (auto-created at runtime)
```

Run the backend from the repo root — `frontend/dist` and `data/` are resolved relative to `__dirname`/cwd.

## Commands

```bash
npm start                # backend -> http://0.0.0.0:3000 (entry: src/index.js)
npm run start:test       # same, forced to PORT=3000 HOST=127.0.0.1
npm run start:mock       # start with MOCK_LLM=true (no Ollama needed)

npm run frontend:install # npm install inside frontend/
npm run frontend:build   # vite build -> frontend/dist (Express then serves it at /)
npm run frontend:dev     # vite dev server :5173, proxies /api to :3000 (hot reload)

docker compose up --build                 # app only (frontend built in-image), mock fallback
docker compose --profile full up --build  # app + ollama/ollama container

npm test                 # runs every tests/test-*.js file sequentially (test:all)
npm run test:council     # single suite; also: test:rondas test:sintesis test:contexto
                         # test:identificacion test:colaboracion test:config
```

The **backend** has no linter and no test framework. The `tests/test-*.js` files are
integration scripts that `fetch` the HTTP API and `console.log` results — they do not assert or set
exit codes. Running any of them requires **both** a live server on `127.0.0.1:3000` **and** a running
Ollama with the `qwen3:4b` and `gemma3:4b` models pulled. Start the server in one shell, run the test
in another. Note: `test-colaboracion-agentes.js` and `test-etapa5-identificacion.js` `require('axios')`,
which is not a declared dependency — they will not run without an `npm install axios` first.

CI (`.github/workflows/ci.yml`) only boots the server and hits `/api/health`; it does **not** execute
the `test-*.js` files despite `test:ci` existing.

## Configuration

All runtime config funnels through `src/config.js`, read from env vars (see `.env.example`):
`PORT`, `HOST`, `OLLAMA_BASE_URL` (default `http://127.0.0.1:11434`), `OLLAMA_MODEL` (default
`gemma3:4b`, used as fallback), `DB_PATH` (default `./data/council.db`), plus `MOCK_LLM` and
`LLM_FALLBACK_MOCK` (see below). No `.env` loader is wired in — env vars must be exported by the
shell/CI (Docker Compose passes them via the `environment:` block).

## Offline / mock LLM mode

The server has always booted without Ollama; what was added is that **LLM calls no longer hard-fail**
when Ollama is down or the model isn't pulled:

- `config.llm.mock` (`MOCK_LLM=true`) — never contacts Ollama; every call returns a deterministic
  simulated response from `src/services/mockLLMService.js`.
- `config.llm.fallbackToMockOnError` (`LLM_FALLBACK_MOCK`, **default `true`**) — on any error from the
  Ollama call (connection refused, 404 model-not-found, …), fall back to a mock response instead of
  returning `{success:false}`.

`mockLLMService.mockOllamaResponse(model, specialization, prompt)` returns an object shaped like
Ollama's `/api/generate` JSON (`{response, model, eval_count, …, mock:true}`). For `specialization ===
'sintetizador'` it emits text in the exact section format `parseSynthesisResponse` expects, so the
synthesis pipeline produces a passing (score ≥60) structured result offline.

Both `ollamaService` and `multiModelOllamaService` funnel through this; the `mock:true` flag
propagates to `result.mock`, into per-response `metadata.mock` in the `/api/council` payload, into
`synthesis.mock`, and `GET /api/health` reports `mode: "mock" | "mock-fallback" | "ollama" |
"unavailable"`.

## Docker

`Dockerfile` — multi-stage on `node:22-bookworm-slim`. `deps` stage installs `python3/make/g++` (fallback
toolchain for `sqlite3@6`, which does `prebuild-install || node-gyp rebuild`) and runs `npm ci
--omit=dev --build-from-source=sqlite3` (published prebuilds need newer glibc than bookworm). `frontend`
stage runs `npm ci && npm run build` inside `frontend/`. `runtime` stage copies backend `node_modules` +
`src` + `--from=frontend /fe/dist` into `frontend/dist`, runs as `node` user, `HEALTHCHECK` hits
`/api/health`. `.dockerignore` keeps out `**/node_modules`, `**/dist`, `tests/`, `docs/`, `data/`, `*.md`.

`docker-compose.yml` — `app` service always; `ollama` and `pull-models` are behind Compose profiles
(`full`/`ollama` and `setup`). No `depends_on` from `app` to `ollama`, so `docker compose up` runs the
app alone in mock-fallback mode. SQLite persists in volume `council-data`, Ollama models in
`ollama-models`. `DB_PATH` is set to `/app/data/council.db` in the container.

## Architecture

Request flow: `src/index.js` → `src/app.js` (Express, CORS, static `frontend/dist`, then `/api/*` routes,
then an SPA fallback that serves `frontend/dist/index.html` for any non-`/api` GET without a `.` — so
`/app` and other client routes survive a reload; falls back to an inline "run the build" page if `dist`
is missing) → `src/routes/api.js` (all endpoints, instantiates one of each service) → `src/services/*`.
The old root welcome JSON now lives at `GET /api`, not `/`.

### Services (`src/services/`)

- **`ollamaService.js`** — single-model Ollama client. Used only by `POST /api/generate` (one agent,
  one personality).
- **`multiModelOllamaService.js`** — Ollama client that picks the model **by specialization**
  (`frontend`/`devops`/`sintetizador` → `qwen3:4b`; `backend`/`seguridad` → `gemma3:4b`; anything else
  → `config.ollama.model`). Used by the council flow. Also appends a `[Modelo: X | Anterior: Y]` footer
  when asked, tracking the previous model **in-memory per process** (`this.previousModels`, keyed by
  `conversationId-agentName`) — lost on restart, not persisted.
- **`personalityService.js`** — static registry: `optimista`, `pesimista`, `creativo`, `obsesivo`,
  plus internal `neutral` (synthesis). Each has a `prompt` string.
- **`agentService.js`** — the orchestrator. Owns the specialization registry (`frontend`, `backend`,
  `devops`, `seguridad`, `neutral`, `sintetizador`), `validateAgents` (2–10 agents, valid personality,
  non-empty specialization; **custom/unknown specializations are allowed** and get a generic prompt),
  `generateAgentPrompt` (assembles council-context + specialization + personality + prior responses),
  `executeRounds`/`executeRound`, and the synthesis pipeline: `generateSynthesisPrompt` →
  `executeSynthesis` → `parseSynthesisResponse` (regex section parser, tolerant of format drift) →
  `validateSynthesisQuality` (score out of 100, ≥60 passes).
- **`databaseService.js`** — SQLite. **Constructor auto-creates** the data dir, opens the DB, and runs
  `CREATE TABLE IF NOT EXISTS` for `conversations` and `messages`. `messages.metadata` is a
  `JSON.stringify`-ed blob. No migrations.

### Council execution — important split of responsibility

`agentService.executeRounds()` does **not** call the LLM. It builds the per-round/per-agent skeleton,
writes `system`/`user` log rows to SQLite, and returns a structure with placeholder context. The
**actual LLM calls and real context accumulation happen in the `POST /api/council` handler** in
`src/routes/api.js`: it loops the returned rounds, calls `multiModelOllamaService.generate()` per agent,
threads each agent's answer into `roundContext` (visible to later agents in the same round) and rolls
finished rounds into `accumulatedContext` (visible to the next round), then runs synthesis. When
editing council behavior, expect logic in **both** files.

### Key endpoints

`POST /api/council` (main; `{package, agents:[{personality,specialization}], rounds}`),
`GET /api/config` (personalities + specializations + limits + defaults, consumed by the frontend),
`GET /api/council/:id/status` (polling; infers progress by pattern-matching logged `system` messages),
`POST /api/generate`, `GET /api/health`, `GET /api/personalities`, `GET /api/specializations`,
`GET /api/models`, `GET /api/conversations/:id/history`.

### Frontend (`frontend/` — separate Vite project, own `package.json` + `package-lock.json`)

React 18 + `react-router-dom` + Vite 6 + Tailwind v3 (PostCSS). Extra deps: `ogl` (WebGL background),
`gsap` (text animations). **No framer-motion.** Build output `frontend/dist` is git-ignored; the
backend serves it, CI and Docker build it.

- `src/App.jsx` — routes: `/` → `pages/Landing.jsx`, `/app` → `pages/Council.jsx`, `*` → redirect `/`.
- Landing nav is a **`LineSidebar`** (fixed scroll-spy rail of short lines, `lg`+ only) — the top
  `Navbar` deliberately has no in-page anchor links. Section ids: `top`, `que-es`, `como`, `roles`,
  `roadmap`.
- `src/components/reactbits/` — components adapted from reactbits.dev (MIT), rewritten for this repo:
  `Aurora` (ogl shader), `SplitText` (gsap, plays immediately if already on-screen else via
  IntersectionObserver), `CountUp`, `ShinyText`, `SpotlightCard`, `TiltedCard`, `Magnetic`.
- `src/hooks/useCouncil.js` — all `/app` state. Loads `/api/config` + `/api/health` (falls back to
  `src/lib/catalog.js` static data). `run()` POSTs `/api/council` (synchronous — no streaming) and
  drives a **simulated** stepped progress bar while awaiting.
- `src/lib/api.js` — `getHealth`, `getConfig`, `runCouncil`. `src/lib/richtext.jsx` — safe minimal
  markdown renderer (no `dangerouslySetInnerHTML`).
- Visual system in `src/index.css` + `tailwind.config.js`: near-black `ink`, `paper` text, one
  contained gold `accent`, `Instrument Serif` display + `Geist` sans. `.surface` / `.btn-solid` /
  `.btn-ghost` / `.field` component classes. Respects `prefers-reduced-motion`.
- `ModeBadge` reads `health.mode` (`mock` / `mock-fallback` / `ollama` / `unavailable`); per-response
  `metadata.mock` and `synthesis.mock` drive "sim"/"simulada" chips.

Dev loop: `npm run frontend:dev` (:5173, proxies `/api` to :3000) alongside `npm start`. For a
production check, `npm run frontend:build` then load `http://localhost:3000`.
