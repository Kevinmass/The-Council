import { useCallback, useEffect, useRef, useState } from 'react';
import { getConfig, getHealth, runCouncil } from '../lib/api.js';
import {
  PERSONALITIES,
  SPECIALIZATIONS,
  CUSTOM_SPEC,
} from '../lib/catalog.js';

const LIMITS = { minAgents: 2, maxAgents: 10, minRounds: 1, maxRounds: 10 };

let seq = 0;
const mkAgent = (personality, specialization) => ({
  id: ++seq,
  personality,
  specialization,
  custom: '',
});

export default function useCouncil() {
  const [health, setHealth] = useState(null);
  const [personalities, setPersonalities] = useState(PERSONALITIES);
  const [specializations, setSpecializations] = useState([
    ...SPECIALIZATIONS,
    CUSTOM_SPEC,
  ]);
  const [limits, setLimits] = useState(LIMITS);

  const [problem, setProblem] = useState('');
  const [rounds, setRounds] = useState(2);
  const [agents, setAgents] = useState(() => [
    mkAgent('optimista', 'frontend'),
    mkAgent('pesimista', 'backend'),
  ]);

  const [status, setStatus] = useState('idle'); // idle | running | done | error
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const timers = useRef([]);

  useEffect(() => {
    let alive = true;
    getHealth().then((h) => alive && setHealth(h));
    getConfig().then((cfg) => {
      if (!alive || !cfg) return;
      if (Array.isArray(cfg.personalities) && cfg.personalities.length) {
        setPersonalities(
          cfg.personalities.map((p) => ({
            name: p.name,
            label: p.name[0].toUpperCase() + p.name.slice(1),
            blurb: p.description || '',
          })),
        );
      }
      if (Array.isArray(cfg.specializations) && cfg.specializations.length) {
        const list = cfg.specializations.map((s) => ({
          name: s.name,
          label: s.name[0].toUpperCase() + s.name.slice(1),
          model: s.model || '',
          blurb: s.description || '',
        }));
        if (!list.find((s) => s.name === 'custom')) list.push(CUSTOM_SPEC);
        setSpecializations(list);
      }
      if (cfg.limits) setLimits({ ...LIMITS, ...cfg.limits });
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const addAgent = useCallback(() => {
    setAgents((prev) => {
      if (prev.length >= limits.maxAgents) return prev;
      const pool = personalities.map((p) => p.name);
      const specPool = specializations
        .filter((s) => s.name !== 'custom')
        .map((s) => s.name);
      return [
        ...prev,
        mkAgent(
          pool[prev.length % pool.length],
          specPool[prev.length % specPool.length],
        ),
      ];
    });
  }, [limits.maxAgents, personalities, specializations]);

  const removeAgent = useCallback(
    (id) =>
      setAgents((prev) =>
        prev.length <= limits.minAgents ? prev : prev.filter((a) => a.id !== id),
      ),
    [limits.minAgents],
  );

  const updateAgent = useCallback(
    (id, patch) =>
      setAgents((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      ),
    [],
  );

  const validation = (() => {
    if (!problem.trim()) return { ok: false, why: 'Describí el problema a analizar.' };
    if (agents.length < limits.minAgents)
      return { ok: false, why: `Se necesitan al menos ${limits.minAgents} agentes.` };
    for (const a of agents) {
      if (a.specialization === 'custom' && !a.custom.trim())
        return { ok: false, why: 'Completá la especialización personalizada.' };
    }
    return { ok: true };
  })();

  const run = useCallback(async () => {
    if (!validation.ok || status === 'running') return;
    setStatus('running');
    setError(null);
    setResult(null);
    setProgress(4);
    setPhase('Preparando consejo…');

    timers.current.forEach(clearTimeout);
    timers.current = [];
    // progreso simulado: el POST /api/council es sincrónico (no streamea)
    const totalTicks = rounds * agents.length + 2;
    let tick = 0;
    const stepEvery = 700;
    const schedule = () => {
      tick += 1;
      const r = Math.min(Math.ceil(tick / agents.length), rounds);
      setProgress(Math.min(92, Math.round((tick / totalTicks) * 100)));
      setPhase(
        tick >= totalTicks - 1
          ? 'Redactando la síntesis final…'
          : `Ronda ${r} · agente ${((tick - 1) % agents.length) + 1}/${agents.length}`,
      );
      if (tick < totalTicks - 1) {
        timers.current.push(setTimeout(schedule, stepEvery));
      }
    };
    timers.current.push(setTimeout(schedule, 500));

    const payload = {
      packageText: problem.trim(),
      rounds,
      agents: agents.map((a) => ({
        personality: a.personality,
        specialization:
          a.specialization === 'custom'
            ? a.custom.trim() || 'custom'
            : a.specialization,
      })),
    };

    const res = await runCouncil(payload);
    timers.current.forEach(clearTimeout);
    timers.current = [];

    if (res.ok) {
      setProgress(100);
      setPhase('Completado');
      setResult(res.data);
      setStatus('done');
      // refrescar health (por si cambió el modo mock)
      getHealth().then(setHealth);
    } else {
      setError(res.error + (res.details ? ` — ${[].concat(res.details).join('; ')}` : ''));
      setStatus('error');
      setPhase('');
    }
  }, [validation.ok, status, rounds, agents, problem]);

  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setStatus('idle');
    setResult(null);
    setError(null);
    setProgress(0);
    setPhase('');
  }, []);

  return {
    health,
    personalities,
    specializations,
    limits,
    problem,
    setProblem,
    rounds,
    setRounds,
    agents,
    addAgent,
    removeAgent,
    updateAgent,
    validation,
    status,
    progress,
    phase,
    result,
    error,
    run,
    reset,
  };
}
