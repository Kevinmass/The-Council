const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const config = require('../config');
const { mockOllamaResponse, isConnectionError } = require('./mockLLMService');

class OllamaService {
  constructor() {
    this.baseUrl = config.ollama.baseUrl;
    this.model = config.ollama.model;
  }

  async generate(prompt, options = {}) {
    // Modo simulado forzado: no se contacta a Ollama.
    if (config.llm.mock) {
      return this._format(mockOllamaResponse(this.model, options.specialization, prompt));
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          ...options
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this._format(data);
    } catch (error) {
      if (config.llm.fallbackToMockOnError) {
        const reason = isConnectionError(error)
          ? 'Ollama no está disponible'
          : `Ollama devolvió un error (${error.message})`;
        console.warn(`[LLM] ${reason}. Usando respuesta simulada. Desactivá con LLM_FALLBACK_MOCK=false.`);
        return this._format(mockOllamaResponse(this.model, options.specialization, prompt));
      }
      console.error('Error calling Ollama API:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  _format(data) {
    return {
      success: true,
      content: data.response,
      model: data.model,
      mock: !!data.mock,
      total_duration: data.total_duration,
      load_duration: data.load_duration,
      prompt_eval_count: data.prompt_eval_count,
      eval_count: data.eval_count,
      eval_duration: data.eval_duration
    };
  }

  async checkConnection() {
    if (config.llm.mock) return false; // no hay Ollama real detrás
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

module.exports = OllamaService;
