// Configuración del sistema
const bool = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const config = {
  // Ollama configuration
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
    model: process.env.OLLAMA_MODEL || 'gemma3:4b'
  },

  // LLM / modo offline
  llm: {
    // Fuerza respuestas simuladas: nunca se contacta a Ollama.
    mock: bool(process.env.MOCK_LLM, false),
    // Si Ollama no responde o el modelo no está instalado, devolver una
    // respuesta simulada en lugar de fallar. Por defecto activado para que el
    // proyecto arranque y sea usable en un equipo nuevo sin Ollama.
    fallbackToMockOnError: bool(process.env.LLM_FALLBACK_MOCK, true)
  },

  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0'
  },

  // Database configuration
  database: {
    path: process.env.DB_PATH || './data/council.db'
  }
};

module.exports = config;
