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

// GET /api/models
router.get('/models', (req, res) => {
  try {
    // Retornar la distribución de modelos por especialización
    const modelDistribution = {
      frontend: 'qwen3:4b',
      backend: 'gemma3:4b',
      devops: 'qwen3:4b',
      seguridad: 'gemma3:4b',
      sintetizador: 'qwen3:4b'
    };
    
    res.json({
      success: true,
      modelDistribution,
      description: {
        'qwen3:4b': 'Optimizado para UI/UX, infraestructura y síntesis',
        'gemma3:4b': 'Optimizado para lógica, arquitectura y análisis de riesgos'
      }
    });
  } catch (error) {
    console.error('Error obteniendo información de modelos:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo información de modelos'
    });
  }
});

// 🚀 ETAPA 6 - GET /api/config
// Endpoint unificado para obtener toda la configuración disponible
router.get('/config', (req, res) => {
  try {
    const availablePersonalities = personalityService.getAvailablePersonalities();
    const availableSpecializations = agentService.getAvailableSpecializations();
    
    const personalitiesInfo = availablePersonalities.map(name => ({
      name,
      description: personalityService.getPersonality(name).description
    }));
    
    const specializationsInfo = availableSpecializations.map(name => ({
      name,
      description: agentService.getSpecialization(name).description,
      model: {
        'frontend': 'qwen3:4b',
        'backend': 'gemma3:4b',
        'devops': 'qwen3:4b',
        'seguridad': 'gemma3:4b',
        'neutral': 'qwen3:4b',
        'sintetizador': 'qwen3:4b'
      }[name]
    }));
    
    res.json({
      success: true,
      config: {
        personalities: personalitiesInfo,
        specializations: specializationsInfo,
        models: {
          'qwen3:4b': {
            name: 'Qwen 3 4B',
            description: 'Optimizado para UI/UX, infraestructura y síntesis',
            provider: 'Ollama'
          },
          'gemma3:4b': {
            name: 'Gemma 3 4B',
            description: 'Optimizado para lógica, arquitectura y análisis de riesgos',
            provider: 'Ollama'
          }
        },
        limits: {
          minAgents: 2,
          maxAgents: 10,
          minRounds: 1,
          maxRounds: 10,
          recommendedAgents: [2, 4],
          recommendedRounds: [1, 3]
        },
        defaults: {
          rounds: 2,
          agents: [
            { personality: 'optimista', specialization: 'frontend' },
            { personality: 'pesimista', specialization: 'backend' }
          ]
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo configuración del sistema'
    });
  }
});

// 🚀 ETAPA 6 - GET /api/council/:id/status
// Endpoint para consultar el estado de un consejo en ejecución
router.get('/council/:id/status', async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    
    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de conversación inválido'
      });
    }

    // Obtener historial para determinar el estado
    const history = await dbService.getConversationHistory(conversationId);
    
    if (!history || history.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conversación no encontrada'
      });
    }

    // Analizar el estado actual
    const lastMessage = history[history.length - 1];
    const systemMessages = history.filter(m => m.role === 'system');
    const assistantMessages = history.filter(m => m.role === 'assistant');
    
    // Determinar estado basado en los mensajes
    let status = 'unknown';
    let currentRound = 0;
    let totalRounds = 0;
    let currentAgent = null;
    let progress = 0;
    
    // Buscar configuración de rondas
    const configMessage = systemMessages.find(m => 
      m.content.includes('CONFIGURACIÓN:') || m.content.includes('Configuración del consejo')
    );
    
    if (configMessage) {
      const configMatch = configMessage.content.match(/(\d+)\s+agentes,\s*(\d+)\s+rondas/);
      if (configMatch) {
        totalRounds = parseInt(configMatch[2]);
      }
    }
    
    // Determinar ronda actual basada en mensajes de sistema
    const roundMessages = systemMessages.filter(m => 
      m.content.includes('RONDA') || m.content.includes('Ronda')
    );
    
    if (roundMessages.length > 0) {
      const lastRoundMsg = roundMessages[roundMessages.length - 1];
      const roundMatch = lastRoundMsg.content.match(/RONDA\s*(\d+)/);
      if (roundMatch) {
        currentRound = parseInt(roundMatch[1]);
      }
    }
    
    // Calcular progreso
    if (totalRounds > 0 && currentRound > 0) {
      progress = Math.round((currentRound / totalRounds) * 100);
    }
    
    // Verificar si hay síntesis
    const synthesisMessage = assistantMessages.find(m => 
      m.metadata && m.metadata.specialization === 'sintetizador'
    );
    
    if (synthesisMessage) {
      status = 'completed';
      progress = 100;
    } else if (currentRound > 0 && totalRounds > 0) {
      status = 'in_progress';
    } else if (history.length > 0) {
      status = 'started';
    }
    
    res.json({
      success: true,
      conversationId,
      status,
      progress,
      currentRound,
      totalRounds,
      totalMessages: history.length,
      lastActivity: lastMessage.created_at,
      hasSynthesis: !!synthesisMessage
    });
  } catch (error) {
    console.error('Error obteniendo estado del consejo:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estado del consejo'
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
      console.error('Validación fallida:', validation.errors);
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

      // Contexto específico de esta ronda (para pasar entre agentes)
      let roundContext = '';

      // Procesar respuestas de cada agente en esta ronda
      for (let i = 0; i < roundResponses.length; i++) {
        const response = roundResponses[i];
        
        try {
          // Generar prompt con contexto completo:
          // 1. Contexto acumulado de rondas anteriores
          // 2. Respuestas de agentes anteriores en ESTA ronda
          const fullContext = accumulatedContext + roundContext;
          
          const promptWithContext = agentService.generateAgentPrompt(
            packageInput,
            response.agent.personality,
            response.agent.specialization,
            fullContext,  // Contexto completo
            packageInput  // Input original
          );
          
          // Usar el servicio de múltiples modelos basado en la especialización
          // Con identificación de modelo para tracking progresivo
          const result = await multiModelOllamaService.generate(
            promptWithContext, 
            response.agent.specialization,
            {
              conversationId: conversationId,
              agentName: response.agent.name,
              includeModelIdentification: true
            }
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

            // Agregar esta respuesta al contexto de la ronda
            // para que el próximo agente la vea
            roundContext += `\n\n[Agente ${response.agent.name} (${response.agent.personality} + ${response.agent.specialization})]: ${result.content}`;
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

      // Agregar el contexto de esta ronda al contexto acumulado
      if (roundContext) {
        accumulatedContext += `\n\n=== RONDA ${roundNumber} ===\n${roundContext}\n`;
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

    // Verificar si hubo errores en las respuestas
    const hasErrors = roundResults.some(round => 
      round.responses.some(response => response.error)
    );
    
    // 🚀 ETAPA 6 - Preparar respuesta final con metadata de configuración
    const finalResponse = {
      success: !hasErrors, // Solo success: true si no hay errores
      conversationId,
      configuration: {
        rounds: roundsNum,
        agents: configuredAgents.map(a => ({
          name: a.name,
          personality: a.personality,
          specialization: a.specialization,
          description: a.description
        })),
        totalAgents: configuredAgents.length
      },
      results: roundResults,
      accumulatedContext: accumulatedContext,
      synthesis: synthesisData,
      metadata: {
        stage: 'ETAPA 6 - Control del Usuario',
        executionTime: new Date().toISOString(),
        hasErrors,
        warnings: validation ? validation.warnings : []
      },
      message: hasErrors 
        ? `Consejo completado con errores: ${configuredAgents.length} agentes, ${roundsNum} rondas + síntesis final`
        : `Consejo completado: ${configuredAgents.length} agentes, ${roundsNum} rondas + síntesis final`,
      errors: hasErrors ? roundResults.filter(round => round.responses.some(r => r.error)).map(round => round.responses.filter(r => r.error)) : undefined
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
