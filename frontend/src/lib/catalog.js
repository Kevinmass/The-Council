// Catálogo estático — refleja el backend (personalityService / agentService) y
// sirve de fallback cuando /api/config no está disponible (p. ej. landing sin server).

export const PERSONALITIES = [
  {
    name: 'optimista',
    label: 'Optimista',
    blurb: 'Busca la ruta viable. Enfoca oportunidades y soluciones prácticas.',
  },
  {
    name: 'pesimista',
    label: 'Pesimista',
    blurb: 'Anticipa riesgos y peores escenarios antes de avanzar.',
  },
  {
    name: 'creativo',
    label: 'Creativo',
    blurb: 'Piensa fuera de lo convencional. Propone enfoques disruptivos.',
  },
  {
    name: 'obsesivo',
    label: 'Obsesivo',
    blurb: 'No deja nada al azar: detalles, edge cases y consistencia.',
  },
];

export const SPECIALIZATIONS = [
  { name: 'frontend', label: 'Frontend', model: 'qwen3:4b', blurb: 'UI/UX, frameworks, interfaces.' },
  { name: 'backend', label: 'Backend', model: 'gemma3:4b', blurb: 'APIs, datos, arquitectura.' },
  { name: 'devops', label: 'DevOps', model: 'qwen3:4b', blurb: 'Deploy, CI/CD, performance, infra.' },
  { name: 'seguridad', label: 'Seguridad', model: 'gemma3:4b', blurb: 'Vulnerabilidades, best practices.' },
  { name: 'neutral', label: 'Neutral', model: 'qwen3:4b', blurb: 'Análisis objetivo, sin sesgo.' },
];

// especialización "custom": el usuario escribe la suya (apicultor, legal, growth…)
export const CUSTOM_SPEC = { name: 'custom', label: 'Personalizada…', model: 'gemma3:4b' };

export const STEPS = [
  {
    n: '01',
    title: 'Configurás el consejo',
    body: 'Describís el problema y sumás de 2 a 10 agentes. Cada uno lleva una personalidad y una especialidad — predefinida o inventada por vos.',
  },
  {
    n: '02',
    title: 'Debaten en rondas',
    body: 'En cada ronda, todos los agentes hablan una vez y leen lo que dijeron los anteriores. El contexto se acumula ronda a ronda.',
  },
  {
    n: '03',
    title: 'Síntesis final',
    body: 'Un agente neutral resume todo: puntos clave, acuerdos y desacuerdos, recomendaciones y un plan de acción, con una métrica de calidad.',
  },
  {
    n: '04',
    title: 'Accionás',
    body: 'Te quedás con una conclusión estructurada y lista para ejecutar — no con cuatro respuestas sueltas que hay que reconciliar a mano.',
  },
];

export const STAGES = [
  { tag: 'Etapa 3', title: 'Sistema de rondas', done: true, body: 'Parámetro rounds = N, contexto acumulado entre rondas.' },
  { tag: 'Etapa 4', title: 'Síntesis final', done: true, body: 'Conclusión estructurada con métricas de calidad y fallback robusto.' },
  { tag: 'Etapa 5', title: 'Especialización', done: true, body: 'Rol técnico por agente + modelo asignado + identificación progresiva.' },
  { tag: 'Etapa 6', title: 'Control del usuario', done: true, body: 'De 2 a 10 agentes, validación y endpoint de configuración.' },
  { tag: 'Etapa 11', title: 'Interfaz', done: true, body: 'La que estás viendo: landing + herramienta del consejo.' },
  { tag: 'Etapa 7', title: 'Rotación de personalidades', done: false, body: 'Los roles rotan por ronda: el mismo agente cambia de enfoque en el tiempo.' },
  { tag: 'Etapa 9', title: 'Multi-provider', done: false, body: 'Agentes sobre distintos proveedores (Ollama, Groq, Together) para un consejo heterogéneo.' },
  { tag: 'Etapa 10', title: 'Moderador / Juez', done: false, body: 'Un agente global que evalúa y dicta un veredicto sobre la mejor propuesta.' },
];

export const SPEC_ACCENT = {
  frontend: '#8FA6C8',
  backend: '#C8A98F',
  devops: '#8FC8BE',
  seguridad: '#9FC88F',
  neutral: '#B4B4BC',
  custom: '#C0A0C8',
};

export function specAccent(name) {
  return SPEC_ACCENT[name] || SPEC_ACCENT.custom;
}
