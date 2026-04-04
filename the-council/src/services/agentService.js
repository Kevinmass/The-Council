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
      },
      neutral: {
        name: 'neutral',
        description: 'Análisis objetivo sin sesgo técnico',
        prompt: 'Eres un analista neutral y objetivo. Tu enfoque es imparcial y equilibrado, considerando todos los aspectos de manera justa sin sesgo hacia ninguna área técnica específica. Proporcionas perspectivas balanceadas y fundamentadas.'
      },
      sintetizador: {
        name: 'sintetizador',
        description: 'Análisis objetivo y síntesis de información',
        prompt: 'Eres un analista neutral especializado en sintetizar información de múltiples fuentes. Tu rol es identificar patrones, acuerdos, desacuerdos y generar conclusiones prácticas y accionables.'
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
   * @param {string} context - Contexto de respuestas anteriores (opcional) - incluye rondas anteriores y agentes previos en esta ronda
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
    prompt += `Tu rol es aportar tu perspectiva técnica basada en tu especialización y personalidad.\n`;
    prompt += `**IMPORTANTE**: Debes leer y considerar las respuestas de los otros agentes que ya hablaron antes de dar tu opinión.\n\n`;
    
    // Añadir especialización
    if (specialization) {
      // Especialización predefinida
      prompt += `${specialization.prompt}\n\n`;
    } else {
      // Especialización personalizada - generar prompt genérico
      prompt += `Eres un experto especializado en ${specializationName}. Aporta tu perspectiva única basada en tu experiencia en este campo específico. Tu conocimiento especializado es valioso para el consejo.\n\n`;
    }
    
    // Añadir personalidad
    if (personality) {
      prompt += `${personality.prompt}\n\n`;
    }
    
    // Añadir input original para evitar "teléfono descompuesto"
    if (originalInput.trim()) {
      prompt += `Input Original del Usuario:\n${originalInput}\n\n`;
    }
    
    // Añadir contexto de rondas anteriores y agentes previos en esta ronda
    if (context.trim()) {
      prompt += `=== RESPUESTAS PREVIAS DE OTROS AGENTES (Debes considerar estas opiniones) ===\n${context}\n\n`;
      prompt += `Basándote en lo que dijeron los agentes anteriores, ahora te toca dar tu perspectiva:\n\n`;
    }
    
    // Añadir input actual (puede ser el mismo o una continuación)
    prompt += `Tu turno de responder: ${packageInput}`;
    
    return prompt;
  }

  /**
   * Crea un agente con personalidad y especialización específicas
   * @param {string} personalityName - Nombre de la personalidad
   * @param {string} specializationName - Nombre de la especialización (puede ser predefinida o personalizada)
   * @returns {Object} Objeto agente configurado
   */
  createAgent(personalityName, specializationName) {
    if (!this.personalityService.isValidPersonality(personalityName)) {
      throw new Error(`Personalidad inválida: ${personalityName}`);
    }
    
    // Validar que la especialización no esté vacía
    if (!specializationName || specializationName.trim() === '') {
      throw new Error(`Especialización requerida`);
    }

    // Obtener especialización (puede ser predefinida o personalizada)
    const specialization = this.getSpecialization(specializationName);
    
    // Generar descripción
    let description;
    if (specialization) {
      // Especialización predefinida
      description = `${this.personalityService.getPersonality(personalityName).description} + ${specialization.description}`;
    } else {
      // Especialización personalizada
      description = `${this.personalityService.getPersonality(personalityName).description} + Especialista en ${specializationName}`;
    }

    return {
      personality: personalityName,
      specialization: specializationName,
      name: `${personalityName}-${specializationName}`,
      description: description
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
   * Valida la configuración de agentes para una conversación (ETAPA 6)
   * @param {Array} agentConfigs - Configuraciones de agentes
   * @returns {Object} Resultado de validación
   */
  validateAgents(agentConfigs) {
    const errors = [];
    const warnings = [];
    
    // 🚀 ETAPA 6: Soporte para N agentes (ya no limitado a 2)
    if (!agentConfigs || agentConfigs.length < 2) {
      errors.push('Se requieren al menos 2 agentes para el consejo');
    }
    
    // Validar límite máximo (configurable, por defecto 10)
    if (agentConfigs.length > 10) {
      errors.push('Máximo 10 agentes permitidos para mantener performance');
    }
    
    // Validar cada agente
    agentConfigs.forEach((config, index) => {
      if (!config.personality || !this.personalityService.isValidPersonality(config.personality)) {
        errors.push(`Agente ${index + 1}: personalidad inválida "${config.personality}". Personalidades disponibles: ${this.personalityService.getAvailablePersonalities().join(', ')}`);
      }
      
      // Validar especialización - permitir especializaciones personalizadas (no están en la lista predefinida)
      if (!config.specialization || config.specialization.trim() === '') {
        errors.push(`Agente ${index + 1}: especialización requerida`);
      }
      // Si la especialización no es una de las predefinidas, se considera personalizada (válida)
      
      // Validar que no haya combinaciones duplicadas
      const duplicates = agentConfigs.filter((c, i) => 
        i !== index && 
        c.personality === config.personality && 
        c.specialization === config.specialization
      );
      
      if (duplicates.length > 0 && index < agentConfigs.indexOf(duplicates[0])) {
        warnings.push(`Agente ${index + 1}: Combinación duplicada "${config.personality} + ${config.specialization}"`);
      }
    });
    
    // Warning para configuraciones grandes
    if (agentConfigs.length > 4) {
      warnings.push(`Consejo grande (${agentConfigs.length} agentes). Considerá que el tiempo de procesamiento aumentará significativamente.`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      agentCount: agentConfigs.length
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
    
    // Instrucciones para la síntesis - FORMATO ESTRICTO REQUERIDO
    prompt += `=== INSTRUCCIONES PARA LA SÍNTESIS ===\n\n`;
    prompt += `Basado en todas las respuestas anteriores, debes generar:\n\n`;
    prompt += `1. RESUMEN GENERAL: Un resumen conciso de las ideas principales discutidas (2-3 oraciones)\n`;
    prompt += `2. PUNTOS CLAVE: Identifica los 3-5 puntos más importantes o relevantes\n`;
    prompt += `3. ACUERDOS Y DESACUERDOS: Qué aspectos coinciden los agentes y en qué difieren\n`;
    prompt += `4. RECOMENDACIONES PRÁCTICAS: Propuestas concretas y accionables (2-4 recomendaciones)\n`;
    prompt += `5. PLAN DE ACCIÓN: Pasos específicos que se podrían seguir (3-5 pasos)\n\n`;
    prompt += `=== FORMATO DE SALIDA OBLIGATORIO ===\n`;
    prompt += `DEBES usar EXACTAMENTE este formato, sin desviaciones:\n\n`;
    prompt += `Resumen: [tu resumen aquí]\n\n`;
    prompt += `Puntos clave:\n`;
    prompt += `1. [primer punto clave]\n`;
    prompt += `2. [segundo punto clave]\n`;
    prompt += `3. [tercer punto clave]\n`;
    prompt += `[agrega más si es necesario]\n\n`;
    prompt += `Acuerdos/Desacuerdos: [tu análisis aquí]\n\n`;
    prompt += `Recomendaciones:\n`;
    prompt += `1. [primera recomendación]\n`;
    prompt += `2. [segunda recomendación]\n`;
    prompt += `[agrega más si es necesario]\n\n`;
    prompt += `Plan de acción:\n`;
    prompt += `1. [primer paso]\n`;
    prompt += `2. [segundo paso]\n`;
    prompt += `3. [tercer paso]\n`;
    prompt += `[agrega más si es necesario]\n\n`;
    prompt += `IMPORTANTE: Respeta estrictamente el formato. Cada sección debe comenzar con su título exacto seguido de dos puntos. Las listas deben usar numeración (1., 2., 3., etc.).`;
    
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
   * @returns {Object} Resultado parseado con métricas de calidad
   */
  parseSynthesisResponse(response) {
    const lines = response.split('\n');
    let currentSection = '';
    const result = {
      summary: '',
      keyPoints: [],
      agreementsDisagreements: '',
      recommendations: [],
      actionPlan: [],
      parseQuality: {
        score: 0,
        sectionsFound: 0,
        totalSections: 5,
        warnings: []
      }
    };

    // Patrones regex más flexibles para capturar variaciones
    const sectionPatterns = {
      summary: [/^Resumen:\s*/i, /^RESUMEN:\s*/i, /^##\s*Resumen/i, /^1\.?\s*Resumen/i],
      keyPoints: [/^Puntos clave:/i, /^PUNTOS CLAVE:/i, /^##\s*Puntos/i, /^2\.?\s*Puntos/i, /^Puntos:/i],
      agreementsDisagreements: [/^Acuerdos\/Desacuerdos:/i, /^ACUERDOS\/DESACUERDOS:/i, /^Acuerdos y desacuerdos:/i, /^##\s*Acuerdos/i, /^3\.?\s*Acuerdos/i],
      recommendations: [/^Recomendaciones:/i, /^RECOMENDACIONES:/i, /^##\s*Recomendaciones/i, /^4\.?\s*Recomendaciones/i, /^Recomendaciones prácticas:/i],
      actionPlan: [/^Plan de acción:/i, /^PLAN DE ACCIÓN:/i, /^Plan de accion:/i, /^##\s*Plan/i, /^5\.?\s*Plan/i]
    };

    // Mapeo inverso para saber en qué sección estamos
    const sectionNames = ['summary', 'keyPoints', 'agreementsDisagreements', 'recommendations', 'actionPlan'];
    const sectionsFound = new Set();

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Verificar si es el inicio de una nueva sección
      let sectionMatched = false;
      for (const [sectionName, patterns] of Object.entries(sectionPatterns)) {
        for (const pattern of patterns) {
          if (pattern.test(trimmedLine)) {
            currentSection = sectionName;
            sectionsFound.add(sectionName);
            sectionMatched = true;
            
            // Extraer contenido si está en la misma línea (para Resumen)
            if (sectionName === 'summary') {
              const content = trimmedLine.replace(pattern, '').trim();
              if (content) {
                result.summary = content;
              }
            }
            break;
          }
        }
        if (sectionMatched) break;
      }

      // Si no es inicio de sección, procesar contenido
      if (!sectionMatched) {
        // Líneas numeradas (1., 2., 3., etc.)
        const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)/);
        if (numberedMatch && currentSection) {
          const content = numberedMatch[1].trim();
          if (currentSection === 'keyPoints') {
            result.keyPoints.push(content);
          } else if (currentSection === 'recommendations') {
            result.recommendations.push(content);
          } else if (currentSection === 'actionPlan') {
            result.actionPlan.push(content);
          }
        } 
        // Líneas con guiones (-) también pueden ser listas
        else if (trimmedLine.startsWith('- ') && currentSection) {
          const content = trimmedLine.substring(2).trim();
          if (currentSection === 'keyPoints') {
            result.keyPoints.push(content);
          } else if (currentSection === 'recommendations') {
            result.recommendations.push(content);
          } else if (currentSection === 'actionPlan') {
            result.actionPlan.push(content);
          }
        }
        // Contenido continuo para Acuerdos/Desacuerdos
        else if (trimmedLine && currentSection === 'agreementsDisagreements' && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('=')) {
          result.agreementsDisagreements += (result.agreementsDisagreements ? ' ' : '') + trimmedLine;
        }
      }
    }

    // Calcular métricas de calidad
    result.parseQuality.sectionsFound = sectionsFound.size;
    let qualityScore = 0;
    
    // Ponderar secciones por importancia
    if (result.summary) qualityScore += 20;
    if (result.keyPoints.length > 0) qualityScore += 25;
    if (result.agreementsDisagreements) qualityScore += 15;
    if (result.recommendations.length > 0) qualityScore += 20;
    if (result.actionPlan.length > 0) qualityScore += 20;
    
    result.parseQuality.score = qualityScore;

    // Generar advertencias
    if (!result.summary) {
      result.parseQuality.warnings.push('No se encontró resumen');
    }
    if (result.keyPoints.length === 0) {
      result.parseQuality.warnings.push('No se encontraron puntos clave');
    }
    if (!result.agreementsDisagreements) {
      result.parseQuality.warnings.push('No se encontró sección de acuerdos/desacuerdos');
    }
    if (result.recommendations.length === 0) {
      result.parseQuality.warnings.push('No se encontraron recomendaciones');
    }
    if (result.actionPlan.length === 0) {
      result.parseQuality.warnings.push('No se encontró plan de acción');
    }

    return result;
  }

  /**
   * Valida la calidad de una síntesis parseada
   * @param {Object} parsedSynthesis - Resultado del parseo
   * @returns {Object} Validación con recomendaciones
   */
  validateSynthesisQuality(parsedSynthesis) {
    const validation = {
      passed: false,
      score: parsedSynthesis.parseQuality.score,
      maxScore: 100,
      minRequiredScore: 60,
      warnings: parsedSynthesis.parseQuality.warnings,
      suggestions: []
    };

    // Evaluar calidad mínima
    if (validation.score >= validation.minRequiredScore) {
      validation.passed = true;
    }

    // Generar sugerencias de mejora
    if (parsedSynthesis.keyPoints.length < 3) {
      validation.suggestions.push('Se recomiendan al menos 3 puntos clave');
    }
    if (parsedSynthesis.recommendations.length < 2) {
      validation.suggestions.push('Se recomiendan al menos 2 recomendaciones');
    }
    if (parsedSynthesis.actionPlan.length < 3) {
      validation.suggestions.push('Se recomiendan al menos 3 pasos en el plan de acción');
    }

    return validation;
  }
}

module.exports = AgentService;