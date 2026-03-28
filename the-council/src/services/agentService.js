const PersonalityService = require('./personalityService');
const DatabaseService = require('./databaseService');

class AgentService {
  constructor() {
    this.personalityService = new PersonalityService();
    this.dbService = new DatabaseService();
    
    // Definición de especializaciones técnicas
    this.specializations = {
      frontend: {
        name: 'frontend',
        description: 'UI/UX, frameworks, interfaces de usuario',
        prompt: 'Eres un experto en desarrollo frontend. Especializado en interfaces de usuario, frameworks modernos, UX/UI y tecnologías front-end.'
      },
      backend: {
        name: 'backend', 
        description: 'APIs, bases de datos, arquitectura',
        prompt: 'Eres un experto en desarrollo backend. Especializado en APIs, bases de datos, arquitectura de sistemas y lógica de negocio.'
      },
      devops: {
        name: 'devops',
        description: 'Deploy, CI/CD, performance, infraestructura',
        prompt: 'Eres un experto en DevOps. Especializado en despliegues, CI/CD, performance, infraestructura y operaciones.'
      },
      seguridad: {
        name: 'seguridad',
        description: 'Best practices, vulnerabilidades, seguridad',
        prompt: 'Eres un experto en seguridad informática. Especializado en buenas prácticas, identificación de vulnerabilidades y seguridad en desarrollo.'
      }
    };
  }

  /**
   * Obtiene una especialización por su nombre
   * @param {string} specializationName - Nombre de la especialización
   * @returns {Object|null} Objeto de especialización o null si no existe
   */
  getSpecialization(specializationName) {
    if (!specializationName) {
      return null;
    }
    
    const normalized = specializationName.toLowerCase();
    return this.specializations[normalized] || null;
  }

  /**
   * Valida si una especialización es válida
   * @param {string} specializationName - Nombre de la especialización a validar
   * @returns {boolean} True si es válida, false si no
   */
  isValidSpecialization(specializationName) {
    return this.getSpecialization(specializationName) !== null;
  }

  /**
   * Obtiene todas las especializaciones disponibles
   * @returns {Array} Array de nombres de especializaciones
   */
  getAvailableSpecializations() {
    return Object.keys(this.specializations);
  }

  /**
   * Genera el prompt completo para un agente con personalidad y especialización
   * @param {string} packageInput - Input del usuario
   * @param {string} personalityName - Nombre de la personalidad
   * @param {string} specializationName - Nombre de la especialización
   * @param {string} context - Contexto de respuestas anteriores (opcional)
   * @returns {string} Prompt completo para enviar a Ollama
   */
  generateAgentPrompt(packageInput, personalityName, specializationName, context = '') {
    const personality = this.personalityService.getPersonality(personalityName);
    const specialization = this.getSpecialization(specializationName);
    
    let prompt = '';
    
    // Añadir especialización
    if (specialization) {
      prompt += `${specialization.prompt}\n\n`;
    }
    
    // Añadir personalidad
    if (personality) {
      prompt += `${personality.prompt}\n\n`;
    }
    
    // Añadir contexto si existe
    if (context.trim()) {
      prompt += `Contexto de la conversación:\n${context}\n\n`;
    }
    
    // Añadir input del usuario
    prompt += `Input: ${packageInput}`;
    
    return prompt;
  }

  /**
   * Crea un agente con personalidad y especialización específicas
   * @param {string} personalityName - Nombre de la personalidad
   * @param {string} specializationName - Nombre de la especialización
   * @returns {Object} Objeto agente configurado
   */
  createAgent(personalityName, specializationName) {
    if (!this.personalityService.isValidPersonality(personalityName)) {
      throw new Error(`Personalidad inválida: ${personalityName}`);
    }
    
    if (!this.isValidSpecialization(specializationName)) {
      throw new Error(`Especialización inválida: ${specializationName}`);
    }

    return {
      personality: personalityName,
      specialization: specializationName,
      name: `${personalityName}-${specializationName}`,
      description: `${this.personalityService.getPersonality(personalityName).description} + ${this.getSpecialization(specializationName).description}`
    };
  }

  /**
   * Ejecuta una ronda de conversación entre agentes
   * @param {Array} agents - Array de agentes configurados
   * @param {string} packageInput - Input del usuario
   * @param {number} conversationId - ID de la conversación
   * @param {string} context - Contexto de rondas anteriores
   * @returns {Promise<Array>} Array de respuestas de los agentes
   */
  async executeRound(agents, packageInput, conversationId, context = '') {
    const responses = [];
    
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      
      // Generar prompt para este agente
      const prompt = this.generateAgentPrompt(
        packageInput, 
        agent.personality, 
        agent.specialization, 
        context
      );
      
      // Guardar mensaje del agente en la base de datos
      await this.dbService.saveMessage(
        conversationId, 
        'system', 
        `Agente: ${agent.name} (${agent.personality} + ${agent.specialization})`
      );
      
      // Guardar el prompt generado (para debugging)
      await this.dbService.saveMessage(
        conversationId, 
        'user', 
        prompt, 
        agent.name
      );
      
      responses.push({
        agent: agent,
        prompt: prompt,
        round: responses.length + 1
      });
    }
    
    return responses;
  }

  /**
   * Valida la configuración de agentes para una conversación
   * @param {Array} agentConfigs - Configuraciones de agentes
   * @returns {Object} Resultado de validación
   */
  validateAgents(agentConfigs) {
    const errors = [];
    const warnings = [];
    
    // Validar que haya al menos 2 agentes (requisito de ETAPA 2)
    if (!agentConfigs || agentConfigs.length < 2) {
      errors.push('Se requieren al menos 2 agentes para el consejo');
    }
    
    // Validar que no haya más de 2 agentes (límite de ETAPA 2)
    if (agentConfigs.length > 2) {
      warnings.push('ETAPA 2 limita a 2 agentes. Considera reducir la cantidad.');
    }
    
    // Validar cada agente
    agentConfigs.forEach((config, index) => {
      if (!config.personality || !this.personalityService.isValidPersonality(config.personality)) {
        errors.push(`Agente ${index + 1}: personalidad inválida "${config.personality}"`);
      }
      
      if (!config.specialization || !this.isValidSpecialization(config.specialization)) {
        errors.push(`Agente ${index + 1}: especialización inválida "${config.specialization}"`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

module.exports = AgentService;