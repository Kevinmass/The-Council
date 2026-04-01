const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const config = require('../config');

class MultiModelOllamaService {
  constructor() {
    this.baseUrl = config.ollama.baseUrl;
    this.models = {
      frontend: 'qwen3:4b',  // Modelo para frontend
      backend: 'gemma3:4b',  // Modelo para backend
      devops: 'qwen3:4b',    // Modelo para devops
      seguridad: 'gemma3:4b', // Modelo para seguridad
      sintetizador: 'qwen3:4b' // Modelo para síntesis final
    };
    
    // Tracking de modelos anteriores por agente (por conversationId + agentName)
    this.previousModels = {};
  }

  /**
   * Obtiene el modelo anterior usado por un agente en una conversación
   * @param {string} conversationId - ID de la conversación
   * @param {string} agentName - Nombre del agente
   * @returns {string|null} Modelo anterior o null si es la primera vez
   */
  getPreviousModel(conversationId, agentName) {
    const key = `${conversationId}-${agentName}`;
    return this.previousModels[key] || null;
  }

  /**
   * Guarda el modelo usado por un agente para tracking futuro
   * @param {string} conversationId - ID de la conversación
   * @param {string} agentName - Nombre del agente
   * @param {string} model - Modelo usado
   */
  saveModelUsage(conversationId, agentName, model) {
    const key = `${conversationId}-${agentName}`;
    this.previousModels[key] = model;
  }

  /**
   * Genera identificación de modelo para agregar al final de la respuesta
   * @param {string} currentModel - Modelo actual
   * @param {string|null} previousModel - Modelo anterior
   * @returns {string} String de identificación
   */
  generateModelIdentification(currentModel, previousModel) {
    const previousModelStr = previousModel || 'N/A (primera ronda)';
    return `\n\n---\n[Modelo: ${currentModel} | Anterior: ${previousModelStr}]`;
  }

  /**
   * Genera una respuesta usando el modelo correspondiente a la especialización
   * @param {string} prompt - Prompt a enviar
   * @param {string} specialization - Especialización del agente
   * @param {Object} options - Opciones adicionales
   * @param {string} options.conversationId - ID de la conversación (para tracking)
   * @param {string} options.agentName - Nombre del agente (para tracking)
   * @param {boolean} options.includeModelIdentification - Si true, agrega identificación del modelo al final
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
      let content = data.response;
      
      // Variable para el modelo anterior (definida antes del bloque condicional)
      let previousModel = null;
      
      // Si se solicita identificación de modelo, agregarla al final
      if (options.includeModelIdentification && options.conversationId && options.agentName) {
        previousModel = this.getPreviousModel(options.conversationId, options.agentName);
        const modelIdentification = this.generateModelIdentification(model, previousModel);
        content += modelIdentification;
        
        // Guardar el modelo actual para la próxima ronda
        this.saveModelUsage(options.conversationId, options.agentName, model);
      }
      
      return {
        success: true,
        content: content,
        model: model,
        previousModel: previousModel,
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