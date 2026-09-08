/**
 * mockLLMService — genera respuestas simuladas con la MISMA forma que la
 * respuesta de `/api/generate` de Ollama (modo stream:false).
 *
 * Se usa cuando:
 *   - `MOCK_LLM=true`            -> nunca se contacta a Ollama
 *   - Ollama no responde / el modelo no está instalado y `LLM_FALLBACK_MOCK`
 *     no es "false" (valor por defecto) -> se responde simulado en vez de fallar
 *
 * Objetivo: poder levantar y usar TODO el flujo (consejo + síntesis + frontend)
 * en un equipo nuevo, sin Ollama corriendo ni modelos descargados.
 */

const SPECIALIZATION_BLURBS = {
  frontend: 'Desde frontend priorizaría una interfaz clara, accesible y con componentes reutilizables; ' +
    'validaría el flujo principal con un prototipo antes de pulir estilos.',
  backend: 'Desde backend definiría una API REST versionada, con validación de entrada, manejo de errores ' +
    'consistente y una capa de persistencia desacoplada.',
  devops: 'Desde DevOps arrancaría contenerizando la app, con un pipeline de CI que corra pruebas y una ' +
    'estrategia simple de despliegue y observabilidad.',
  seguridad: 'Desde seguridad revisaría el OWASP Top 10, la gestión de secretos, la autenticación/autorización ' +
    'y el registro de auditoría antes de exponer nada a producción.',
  neutral: 'De forma objetiva, el problema tiene aristas técnicas y de producto; conviene separar lo ' +
    'imprescindible del MVP de lo que puede esperar.',
};

function personalityTone(prompt = '') {
  const p = String(prompt).toLowerCase();
  if (p.includes('optimista')) return 'Veo una oportunidad clara y una ruta viable para avanzar ya.';
  if (p.includes('pesimista')) return 'Antes de avanzar conviene anticipar los riesgos y los peores escenarios.';
  if (p.includes('creativo')) return 'Propongo explorar un enfoque poco convencional para diferenciarnos.';
  if (p.includes('obsesivo')) return 'Repasemos cada detalle y cada edge case antes de dar algo por cerrado.';
  return '';
}

function mockAgentContent(specialization, prompt) {
  const blurb = SPECIALIZATION_BLURBS[specialization] ||
    `Como especialista en ${specialization || 'el tema planteado'}, aporto mi perspectiva al consejo.`;
  return [
    '[Respuesta simulada — modo offline, sin Ollama]',
    '',
    blurb,
    personalityTone(prompt),
    '',
    'Este texto es un placeholder determinista para poder desarrollar el frontend sin depender de un ' +
    'modelo real. Al iniciar Ollama con los modelos descargados, las respuestas vuelven a generarse con IA ' +
    'automáticamente.',
  ].filter(Boolean).join('\n');
}

function mockSynthesisContent() {
  // El formato debe coincidir con AgentService.parseSynthesisResponse()
  return [
    'Resumen: Síntesis simulada generada en modo offline (sin Ollama). Los agentes analizaron el problema ' +
      'desde sus especialidades y coincidieron en un enfoque incremental.',
    '',
    'Puntos clave:',
    '1. La solución es viable técnicamente con las herramientas actuales.',
    '2. Los principales riesgos son de integración y de alcance.',
    '3. La experiencia de usuario debe validarse temprano con un prototipo.',
    '',
    'Acuerdos/Desacuerdos:',
    'Hay acuerdo en el objetivo general y en priorizar un MVP; el desacuerdo está en cuánta ' +
      'infraestructura montar desde el inicio.',
    '',
    'Recomendaciones:',
    '1. Construir un prototipo del flujo principal antes de comprometer la arquitectura.',
    '2. Definir métricas de éxito medibles.',
    '3. Automatizar el entorno de desarrollo y el despliegue desde el día uno.',
    '',
    'Plan de acción:',
    '1. Preparar el entorno y las dependencias del proyecto.',
    '2. Implementar un MVP del recorrido principal del usuario.',
    '3. Recoger feedback y ajustar el alcance.',
    '4. Endurecer seguridad y performance antes de producción.',
  ].join('\n');
}

/**
 * Devuelve un objeto con la forma de la respuesta JSON de Ollama `/api/generate`.
 * @param {string} model - nombre del modelo que se habría usado
 * @param {string} [specialization] - especialización del agente ('sintetizador' => síntesis)
 * @param {string} [prompt] - prompt original (se usa para inferir tono/tipo)
 */
function mockOllamaResponse(model, specialization, prompt = '') {
  const isSynthesis = specialization === 'sintetizador' || /s[íi]ntesis\s+final/i.test(prompt);
  const response = isSynthesis ? mockSynthesisContent() : mockAgentContent(specialization, prompt);
  return {
    model: model || 'mock',
    created_at: new Date().toISOString(),
    response,
    done: true,
    total_duration: 250000000,
    load_duration: 10000000,
    prompt_eval_count: Math.round(String(prompt).length / 4),
    eval_count: Math.round(response.length / 4),
    eval_duration: 200000000,
    mock: true,
  };
}

/** Heurística: ¿este error significa "no pude contactar a Ollama"? */
function isConnectionError(err) {
  if (!err) return false;
  const code = err.code || err.errno || '';
  if (['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT', 'ECONNRESET'].includes(code)) return true;
  return /ECONNREFUSED|ENOTFOUND|EAI_AGAIN|failed,\s*reason|fetch failed|network|socket hang up/i
    .test(err.message || '');
}

module.exports = { mockOllamaResponse, isConnectionError };
