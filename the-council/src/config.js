// Configuración del sistema
const config = {
  // Ollama configuration
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama2'
  },
  
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  
  // Database configuration
  database: {
    path: process.env.DB_PATH || './data/council.db'
  }
};

module.exports = config;