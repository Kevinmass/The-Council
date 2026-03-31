const PersonalityService = require('./personalityService');
const DatabaseService = require('./databaseService');
const MultiModelOllamaService = require('./multiModelOllamaService');

class AgentService {
  constructor() {
    this.personalityService = new PersonalityService();
    this.dbService = new DatabaseService();
    this.multiModelOllamaService = new MultiModelOllamaService();
    
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
   * @param {string} originalInput - Input original del usuario (para evitar "teléfono descompuesto")
   * @returns {string} Prompt completo para enviar a Ollama
   */
  generateAgentPrompt(packageInput, personalityName, specializationName, context = '', originalInput = '') {
    const personality = this.personalityService.getPersonality(personalityName);
    const specialization = this.getSpecialization(specializationName);
    
    let prompt = '';
    
    // Añadir contexto del consejo
    prompt += `Contexto del Consejo de Agentes:\n`;
    prompt += `Eres parte de un consejo de agentes de IA especializados en desarrollo de software.\n`;
    prompt += `Estás colaborando con otros agentes para proporcionar una respuesta integral a un problema de desarrollo.\n`;
    prompt += `Tu rol es aportar tu perspectiva técnica basada en tu especialización y personalidad.\n\n`;
    
    // Añadir especialización
    if (specialization) {
      prompt += `${specialization.prompt}\n\n`;
    }
    
    // Añadir personalidad
    if (personality) {
      prompt += `${personality.prompt}\n\n`;
    }
    
    // Añadir input original para evitar "teléfono descompuesto"
    if (originalInput.trim()) {
      prompt += `Input Original del Usuario:\n${originalInput}\n\n`;
    }
    
    // Añadir contexto de rondas anteriores
    if (context.trim()) {
      prompt += `Contexto de Rondas Anteriores:\n${context}\n\n`;
    }
    
    // Añadir input actual (puede ser el mismo o una continuación)
    prompt += `Input Actual: ${packageInput}`;
    
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
   * Ejecuta una ronda completa de conversación entre agentes
   * @param {Array} agents - Array de agentes configurados
   * @param {string} packageInput - Input del usuario
   * @param {number} conversationId - ID de la conversación
   * @param {string} context - Contexto de rondas anteriores
   * @param {number} roundNumber - Número de la ronda actual
   * @returns {Promise<Array>} Array de respuestas de los agentes en esta ronda
   */
  async executeRound(agents, packageInput, conversationId, context = '', roundNumber = 1) {
    const roundResponses = [];
    
    // Guardar inicio de la ronda en la base de datos
    await this.dbService.saveMessage(
      conversationId, 
      'system', 
      `INICIO RONDA ${roundNumber} - Contexto acumulado: ${context ? 'Sí' : 'No'}`
    );
    
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      
      // Generar prompt para este agente con el contexto actual
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
        `Agente: ${agent.name} (${agent.personality} + ${agent.specialization}) - Ronda ${roundNumber}`
      );
      
      // Guardar el prompt generado (para debugging)
      await this.dbService.saveMessage(
        conversationId, 
        'user', 
        prompt, 
        agent.name,
        { round: roundNumber, agent: agent.name }
      );
      
      roundResponses.push({
        agent: agent,
        prompt: prompt,
        round: roundNumber,
        agentOrder: i + 1
      });
    }
    
    return roundResponses;
  }

  /**
   * Ejecuta múltiples rondas de conversación entre agentes (ETAPA 3)
   * @param {Array} agents - Array de agentes configurados
   * @param {string} packageInput - Input del usuario
   * @param {number} conversationId - ID de la conversación
   * @param {number} rounds - Número de rondas a ejecutar
   * @returns {Promise<Object>} Resultado completo con todas las rondas
   */
  async executeRounds(agents, packageInput, conversationId, rounds = 1) {
    const allRoundResults = [];
    let accumulatedContext = '';
    
    // Validar parámetros
    if (rounds < 1) {
      throw new Error('El número de rondas debe ser mayor o igual a 1');
    }
    
    if (!agents || agents.length === 0) {
      throw new Error('Se requiere al menos un agente');
    }
    
    // Guardar configuración de rondas en la base de datos
    await this.dbService.saveMessage(
      conversationId, 
      'system', 
      `CONFIGURACIÓN: ${agents.length} agentes, ${rounds} rondas`
    );
    
    // Ejecutar cada ronda
    for (let round = 1; round <= rounds; round++) {
      console.log(`[ETAPA 3] Ejecutando ronda ${round} de ${rounds}`);
      
      // Ejecutar la ronda actual
      const roundResponses = await this.executeRound(
        agents, 
        packageInput, 
        conversationId, 
        accumulatedContext, 
        round
      );
      
      const roundData = {
        round,
        responses: roundResponses,
        contextBefore: accumulatedContext,
        contextAfter: ''
      };
      
      allRoundResults.push(roundData);
      
      // Actualizar el contexto acumulado para la próxima ronda
      // (esto será actualizado por el servicio que maneja las respuestas de Ollama)
      accumulatedContext = `Rondas anteriores: ${round > 1 ? 'Sí' : 'No'}`;
      
      // Guardar fin de la ronda
      await this.dbService.saveMessage(
        conversationId, 
        'system', 
        `FIN RONDA ${round}`
      );
    }
    
    return {
      rounds: allRoundResults,
      totalRounds: rounds,
      totalAgents: agents.length,
      accumulatedContext: accumulatedContext
    };
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

  /**
   * Genera el prompt para la IA síntesis final
   * @param {string} originalInput - Input original del usuario
   * @param {Array} allRoundResults - Resultados de todas las rondas
   * @returns {string} Prompt para la síntesis
   */
  generateSynthesisPrompt(originalInput, allRoundResults) {
    let prompt = '';
    
    // Contexto de la síntesis
    prompt += `Contexto de la Síntesis Final:\n`;
    prompt += `Eres un agente neutral y analítico especializado en síntesis de información.\n`;
    prompt += `Tu tarea es analizar de manera objetiva todas las respuestas previas de los agentes\n`;
    prompt += `y generar una conclusión práctica y accionable.\n\n`;
    
    // Input original
    prompt += `Input Original del Usuario:\n${originalInput}\n\n`;
    
    // Resultados de todas las rondas
    prompt += `=== RESULTADOS DE TODAS LAS RONDAS ===\n\n`;
    
    allRoundResults.forEach((round, roundIndex) => {
      prompt += `Ronda ${round.round}:\n`;
      round.responses.forEach((response, agentIndex) => {
        if (response.error) {
          prompt += `  Agente ${agentIndex + 1} (${response.agent.name}): ERROR - ${response.error}\n`;
        } else {
          prompt += `  Agente ${agentIndex + 1} (${response.agent.name}):\n`;
          prompt += `    Personalidad: ${response.agent.personality}\n`;
          prompt += `    Especialización: ${response.agent.specialization}\n`;
          prompt += `    Respuesta: ${response.response}\n`;
        }
      });
      prompt += `\n`;
    });
    
    // Instrucciones para la síntesis
    prompt += `=== INSTRUCCIONES PARA LA SÍNTESIS ===\n\n`;
    prompt += `Basado en todas las respuestas anteriores, debes generar:\n\n`;
    prompt += `1. RESUMEN GENERAL: Un resumen conciso de las ideas principales discutidas\n`;
    prompt += `2. PUNTOS CLAVE: Identifica los 3-5 puntos más importantes o relevantes\n`;
    prompt += `3. ACUERDOS Y DESACUERDOS: Qué aspectos coinciden los agentes y en qué difieren\n`;
    prompt += `4. RECOMENDACIONES PRÁCTICAS: Propuestas concretas y accionables\n`;
    prompt += `5. PLAN DE ACCIÓN: Pasos específicos que se podrían seguir\n\n`;
    prompt += `Formato de salida:\n`;
    prompt += `- Resumen: [texto]\n`;
    prompt += `- Puntos clave: [lista numerada]\n`;
    prompt += `- Acuerdos/Desacuerdos: [texto]\n`;
    prompt += `- Recomendaciones: [lista numerada]\n`;
    prompt += `- Plan de acción: [lista numerada paso a paso]\n\n`;
    prompt += `Sé objetivo, estructurado y enfócate en proporcionar conclusiones útiles y prácticas.`;
    
    return prompt;
  }

  /**
   * Ejecuta la IA síntesis final después de todas las rondas
   * @param {string} originalInput - Input original del usuario
   * @param {Array} allRoundResults - Resultados de todas las rondas
   * @param {number} conversationId - ID de la conversación
   * @returns {Promise<Object>} Resultado de la síntesis
   */
  async executeSynthesis(originalInput, allRoundResults, conversationId) {
    try {
      // Generar prompt de síntesis
      const synthesisPrompt = this.generateSynthesisPrompt(originalInput, allRoundResults);
      
      // Guardar inicio de la síntesis en la base de datos
      await this.dbService.saveMessage(
        conversationId, 
        'system', 
        'INICIO SÍNTESIS FINAL - Análisis de todas las rondas'
      );
      
      // Guardar el prompt generado
      await this.dbService.saveMessage(
        conversationId, 
        'user', 
        synthesisPrompt, 
        'sintetizador',
        { type: 'synthesis', round: 'final' }
      );
      
      // Ejecutar síntesis con modelo qwen3 y personalidad neutral
      const result = await this.multiModelOllamaService.generate(
        synthesisPrompt, 
        'sintetizador' // Usaremos un modelo especial para síntesis
      );
      
      if (result.success) {
        // Guardar respuesta de síntesis
        await this.dbService.saveMessage(
          conversationId,
          'assistant',
          result.content,
          'sintetizador',
          {
            personality: 'neutral',
            specialization: 'sintetizador',
            type: 'synthesis'
          }
        );

        // Parsear la respuesta para extraer la estructura
        const parsedSynthesis = this.parseSynthesisResponse(result.content);

        return {
          success: true,
          summary: parsedSynthesis.summary,
          keyPoints: parsedSynthesis.keyPoints,
          agreementsDisagreements: parsedSynthesis.agreementsDisagreements,
          recommendations: parsedSynthesis.recommendations,
          actionPlan: parsedSynthesis.actionPlan,
          fullResponse: result.content,
          model: result.model,
          metadata: {
            total_duration: result.total_duration,
            load_duration: result.load_duration,
            prompt_eval_count: result.prompt_eval_count,
            eval_count: result.eval_count,
            eval_duration: result.eval_duration
          }
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error en la síntesis final:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Parsea la respuesta de síntesis para extraer la estructura
   * @param {string} response - Respuesta completa de la IA
   * @returns {Object} Resultado parseado
   */
  parseSynthesisResponse(response) {
    const lines = response.split('\n');
    let currentSection = '';
    const result = {
      summary: '',
      keyPoints: [],
      agreementsDisagreements: '',
      recommendations: [],
      actionPlan: []
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('Resumen:')) {
        currentSection = 'summary';
        result.summary = trimmedLine.replace('Resumen:', '').trim();
      } else if (trimmedLine.startsWith('Puntos clave:')) {
        currentSection = 'keyPoints';
      } else if (trimmedLine.startsWith('Acuerdos/Desacuerdos:')) {
        currentSection = 'agreementsDisagreements';
      } else if (trimmedLine.startsWith('Recomendaciones:')) {
        currentSection = 'recommendations';
      } else if (trimmedLine.startsWith('Plan de acción:')) {
        currentSection = 'actionPlan';
      } else if (trimmedLine.match(/^\d+\./)) {
        // Líneas numeradas
        const content = trimmedLine.replace(/^\d+\.\s*/, '').trim();
        if (currentSection === 'keyPoints') {
          result.keyPoints.push(content);
        } else if (currentSection === 'recommendations') {
          result.recommendations.push(content);
        } else if (currentSection === 'actionPlan') {
          result.actionPlan.push(content);
        }
      } else if (trimmedLine && currentSection === 'agreementsDisagreements') {
        result.agreementsDisagreements += (result.agreementsDisagreements ? ' ' : '') + trimmedLine;
      }
    }

    return result;
  }
}

module.exports = AgentService;