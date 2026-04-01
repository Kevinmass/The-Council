const express = require('express');
const OllamaService = require('../services/ollamaService');
const MultiModelOllamaService = require('../services/multiModelOllamaService');
const DatabaseService = require('../services/databaseService');
const PersonalityService = require('../services/personalityService');
const AgentService = require('../services/agentService');

const router = express.Router();
const ollamaService = new OllamaService();
const multiModelOllamaService = new MultiModelOllamaService();
const dbService = new DatabaseService();
const personalityService = new PersonalityService();
const agentService = new AgentService();

// POST /api/generate
router.post('/generate', async (req, res) => {
  try {
    const { package: packageInput, options = {}, personality } = req.body;

    if (!packageInput) {
      return res.status(400).json({
        success: false,
        error: 'El campo "package" es requerido'
      });
    }

    // Validar personalidad si se proporciona
    if (personality && !personalityService.isValidPersonality(personality)) {
      return res.status(400).json({
        success: false,
        error: `Personalidad inválida. Personalidades disponibles: ${personalityService.getAvailablePersonalities().join(', ')}`
      });
    }

    // Generar prompt con personalidad aplicada
    const promptWithPersonality = personalityService.generatePrompt(packageInput, personality);

    // Guardar conversación en la base de datos (con información de personalidad)
    const conversationId = await dbService.saveConversation(packageInput);
    
    // Si hay personalidad, guardarla en los metadatos de la conversación
    if (personality) {
      await dbService.saveMessage(conversationId, 'system', `Personalidad: ${personality}`);
    }

    // Generar respuesta con Ollama
    const result = await ollamaService.generate(promptWithPersonality, options);

    if (result.success) {
      // Guardar mensaje en la base de datos
      await dbService.saveMessage(conversationId, 'user', packageInput, personality || 'default');
      await dbService.saveMessage(conversationId, 'assistant', result.content, personality || 'default');

      res.json({
        success: true,
        conversationId,
        personality: personality || null,
        response: result.content,
        metadata: {
          model: result.model,
          total_duration: result.total_duration,
          load_duration: result.load_duration,
          prompt_eval_count: result.prompt_eval_count,
          eval_count: result.eval_count,
          eval_duration: result.eval_duration
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error en /api/generate:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/health
router.get('/health', async (req, res) => {
  try {
    const ollamaConnected = await ollamaService.checkConnection();
    
    res.json({
      success: true,
      status: 'ok',
      services: {
        ollama: ollamaConnected ? 'connected' : 'disconnected',
        database: 'connected'
      }
    });
  } catch (error) {
    console.error('Error en /api/health:', error);
    res.status(500).json({
      success: false,
      error: 'Error verificando estado del sistema'
    });
  }
});

// GET /api/conversations/:id/history
router.get('/conversations/:id/history', async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    
    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de conversación inválido'
      });
    }

    const history = await dbService.getConversationHistory(conversationId);
    
    res.json({
      success: true,
      conversationId,
      history
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo historial de conversación'
    });
  }
});

// GET /api/personalities
router.get('/personalities', (req, res) => {
  try {
    const availablePersonalities = personalityService.getAvailablePersonalities();
    const personalitiesInfo = availablePersonalities.map(name => ({
      name,
      description: personalityService.getPersonality(name).description
    }));
    
    res.json({
      success: true,
      count: availablePersonalities.length,
      personalities: personalitiesInfo
    });
  } catch (error) {
    console.error('Error obteniendo personalidades:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo lista de personalidades'
    });
  }
});

// GET /api/specializations
router.get('/specializations', (req, res) => {
  try {
    const availableSpecializations = agentService.getAvailableSpecializations();
    const specializationsInfo = availableSpecializations.map(name => ({
      name,
      description: agentService.getSpecialization(name).description
    }));
    
    res.json({
      success: true,
      count: availableSpecializations.length,
      specializations: specializationsInfo
    });
  } catch (error) {
    console.error('Error obteniendo especializaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo lista de especializaciones'
    });
  }
});

// POST /api/council
router.post('/council', async (req, res) => {
  try {
    const { package: packageInput, agents, rounds = 1 } = req.body;

    if (!packageInput) {
      return res.status(400).json({
        success: false,
        error: 'El campo "package" es requerido'
      });
    }

    if (!agents || !Array.isArray(agents)) {
      return res.status(400).json({
        success: false,
        error: 'El campo "agents" es requerido y debe ser un array'
      });
    }

    // Validar número de rondas
    const roundsNum = parseInt(rounds);
    if (isNaN(roundsNum) || roundsNum < 1) {
      return res.status(400).json({
        success: false,
        error: 'El campo "rounds" debe ser un número mayor o igual a 1'
      });
    }

    // Validar agentes
    const validation = agentService.validateAgents(agents);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Configuración de agentes inválida',
        details: validation.errors
      });
    }

    // Mostrar warnings si existen
    if (validation.warnings.length > 0) {
      console.warn('Advertencias de configuración:', validation.warnings);
    }

    // Crear agentes configurados
    const configuredAgents = agents.map(config => 
      agentService.createAgent(config.personality, config.specialization)
    );

    // Guardar conversación en la base de datos
    const conversationId = await dbService.saveConversation(packageInput);
    
    // Guardar configuración de agentes en metadata
    await dbService.saveMessage(
      conversationId, 
      'system', 
      'Configuración del consejo',
      'council',
      { agents: configuredAgents, rounds: roundsNum }
    );

    // Ejecutar sistema de rondas (ETAPA 3)
    const roundsExecution = await agentService.executeRounds(
      configuredAgents, 
      packageInput, 
      conversationId, 
      roundsNum
    );

    const roundResults = [];
    let accumulatedContext = '';

    // Procesar cada ronda
    for (const roundData of roundsExecution.rounds) {
      const roundNumber = roundData.round;
      const roundResponses = roundData.responses;
      
      const roundResult = {
        round: roundNumber,
        responses: []
      };

      // Procesar respuestas de cada agente en esta ronda
      for (const response of roundResponses) {
        try {
          // Usar el servicio de múltiples modelos basado en la especialización
          const result = await multiModelOllamaService.generate(
            response.prompt, 
            response.agent.specialization
          );
          
          if (result.success) {
            // Guardar respuesta del agente
            await dbService.saveMessage(
              conversationId,
              'assistant',
              result.content,
              response.agent.name,
              {
                personality: response.agent.personality,
                specialization: response.agent.specialization,
                round: roundNumber
              }
            );

            roundResult.responses.push({
              agent: response.agent,
              response: result.content,
              metadata: {
                model: result.model,
                total_duration: result.total_duration,
                load_duration: result.load_duration,
                prompt_eval_count: result.prompt_eval_count,
                eval_count: result.eval_count,
                eval_duration: result.eval_duration
              }
            });

            // Actualizar contexto acumulado para la próxima ronda
            // Incluir el input original para evitar "teléfono descompuesto"
            accumulatedContext += `\n\n[Ronda ${roundNumber}] Input Original: ${packageInput}\n`;
            accumulatedContext += `Agente ${response.agent.name} (${response.agent.personality} + ${response.agent.specialization}): ${result.content}`;
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          console.error(`Error procesando respuesta del agente ${response.agent.name} en ronda ${roundNumber}:`, error);
          roundResult.responses.push({
            agent: response.agent,
            error: error.message
          });
        }
      }

      roundResults.push(roundResult);
    }

    // 🚀 ETAPA 4 - SÍNTESIS FINAL
    console.log('[ETAPA 4] Ejecutando síntesis final...');
    
    let synthesisData = {
      enabled: true,
      summary: 'No disponible',
      keyPoints: [],
      agreementsDisagreements: 'No disponible',
      recommendations: [],
      actionPlan: [],
      fullResponse: 'No disponible',
      model: 'qwen3:4b',
      personality: 'neutral',
      metadata: {},
      quality: { score: 0, warnings: [] }
    };

    try {
      const synthesisResult = await agentService.executeSynthesis(
        packageInput,
        roundResults,
        conversationId
      );

      if (synthesisResult.success) {
        // Validar calidad de la síntesis
        const parsedSynthesis = agentService.parseSynthesisResponse(synthesisResult.fullResponse);
        const qualityValidation = agentService.validateSynthesisQuality(parsedSynthesis);

        synthesisData = {
          enabled: true,
          summary: parsedSynthesis.summary || 'No disponible',
          keyPoints: parsedSynthesis.keyPoints || [],
          agreementsDisagreements: parsedSynthesis.agreementsDisagreements || 'No disponible',
          recommendations: parsedSynthesis.recommendations || [],
          actionPlan: parsedSynthesis.actionPlan || [],
          fullResponse: synthesisResult.fullResponse,
          model: synthesisResult.model || 'qwen3:4b',
          personality: 'neutral',
          metadata: synthesisResult.metadata || {},
          quality: {
            score: qualityValidation.score,
            passed: qualityValidation.passed,
            warnings: qualityValidation.warnings,
            suggestions: qualityValidation.suggestions
          }
        };

        console.log(`[ETAPA 4] Síntesis completada - Calidad: ${qualityValidation.score}/100`);
        if (qualityValidation.warnings.length > 0) {
          console.warn('[ETAPA 4] Advertencias de calidad:', qualityValidation.warnings);
        }
      } else {
        synthesisData.error = synthesisResult.error;
        synthesisData.enabled = false;
        console.error('[ETAPA 4] Error en síntesis:', synthesisResult.error);
      }
    } catch (error) {
      synthesisData.error = error.message;
      synthesisData.enabled = false;
      console.error('[ETAPA 4] Excepción en síntesis:', error);
    }

    // Preparar respuesta final con síntesis
    const finalResponse = {
      success: true,
      conversationId,
      rounds: roundsNum,
      agents: configuredAgents,
      results: roundResults,
      accumulatedContext: accumulatedContext,
      synthesis: synthesisData,
      etapa: 'ETAPA 4 - Síntesis Final',
      message: `Consejo completado: ${configuredAgents.length} agentes, ${roundsNum} rondas + síntesis final`
    };

    res.json(finalResponse);

  } catch (error) {
    console.error('Error en /api/council:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
