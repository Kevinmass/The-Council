const config = require('../config');

class PersonalityService {
  constructor() {
    this.personalities = {
      optimista: {
        name: 'optimista',
        description: 'Enfoque positivo y constructivo',
        prompt: 'Eres un agente optimista que siempre busca soluciones viables y enfoques positivos. Analiza el problema desde una perspectiva constructiva, enfocándote en oportunidades y soluciones prácticas.'
      },
      pesimista: {
        name: 'pesimista', 
        description: 'Enfoque crítico y preventivo',
        prompt: 'Eres un agente pesimista que identifica riesgos, problemas potenciales y escenarios negativos. Siempre busca los posibles fallos y considera los peores casos para prevenir problemas.'
      },
      creativo: {
        name: 'creativo',
        description: 'Enfoque innovador y fuera de lo común',
        prompt: 'Eres un agente creativo que piensa fuera de los límites convencionales. Busca soluciones innovadoras, enfoques no tradicionales y ideas disruptivas.'
      },
      obsesivo: {
        name: 'obsesivo',
        description: 'Enfoque detallado y exhaustivo',
        prompt: 'Eres un agente obsesivo que considera todos los detalles, edge cases y aspectos técnicos. No dejas nada al azar y analizas cada posible escenario con minuciosidad.'
      },
      neutral: {
        name: 'neutral',
        description: 'Enfoque analítico y objetivo para síntesis',
        prompt: 'Eres un agente neutral y analítico especializado en síntesis de información. Tu tarea es analizar de manera objetiva todas las respuestas previas, identificar puntos clave, acuerdos, desacuerdos y generar conclusiones prácticas. Sé objetivo, estructurado y enfócate en proporcionar recomendaciones accionables basadas en el análisis de todas las ideas presentadas.'
      }
    };
  }

  /**
   * Obtiene una personalidad por su nombre
   * @param {string} personalityName - Nombre de la personalidad
   * @returns {Object|null} Objeto de personalidad o null si no existe
   */
  getPersonality(personalityName) {
    if (!personalityName) {
      return null;
    }
    
    const normalized = personalityName.toLowerCase();
    return this.personalities[normalized] || null;
  }

  /**
   * Genera el prompt completo con la personalidad aplicada
   * @param {string} packageInput - Input del usuario
   * @param {string} personalityName - Nombre de la personalidad
   * @returns {string} Prompt completo para enviar a Ollama
   */
  generatePrompt(packageInput, personalityName) {
    const personality = this.getPersonality(personalityName);
    
    if (!personality) {
      // Si no hay personalidad, devuelve el input tal cual
      return packageInput;
    }

    return `${personality.prompt}\n\nInput: ${packageInput}`;
  }

  /**
   * Obtiene todas las personalidades disponibles
   * @returns {Array} Array de nombres de personalidades
   */
  getAvailablePersonalities() {
    return Object.keys(this.personalities);
  }

  /**
   * Valida si una personalidad es válida
   * @param {string} personalityName - Nombre de la personalidad a validar
   * @returns {boolean} True si es válida, false si no
   */
  isValidPersonality(personalityName) {
    return this.getPersonality(personalityName) !== null;
  }
}

module.exports = PersonalityService;