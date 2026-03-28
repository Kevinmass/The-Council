const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const config = require('../config');

class MultiModelOllamaService {
  constructor() {
    this.baseUrl = config.ollama.baseUrl;
    this.models = {
      frontend: 'qwen3:4b',  // Modelo para frontend
      backend: 'gemma3:4b',  // Modelo para backend
      devops: 'qwen3:4b',    // Modelo para devops
      seguridad: 'gemma3:4b' // Modelo para seguridad
    };
  }

  /**
   * Genera una respuesta usando el modelo correspondiente a la especialización
   * @param {string} prompt - Prompt a enviar
   * @param {string} specialization - Especialización del agente
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Resultado de la generación
   */
  async generate(prompt, specialization, options = {}) {
    try {
      // Obtener modelo basado en especialización
      const model = this.models[specialization] || config.ollama.model;
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false,
          ...options
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        content: data.response,
        model: data.model,
        total_duration: data.total_duration,
        load_duration: data.load_duration,
        prompt_eval_count: data.prompt_eval_count,
        eval_count: data.eval_count,
        eval_duration: data.eval_duration
      };
    } catch (error) {
      console.error('Error calling Ollama API:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene información de los modelos disponibles
   * @returns {Promise<Object>} Información de modelos
   */
  async getModelInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        models: data.models || [],
        availableModels: Object.values(this.models)
      };
    } catch (error) {
      console.error('Error getting model info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async checkConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('Error connecting to Ollama:', error);
      return false;
    }
  }
}

module.exports = MultiModelOllamaService;