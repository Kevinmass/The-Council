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
      { agents: configuredAgents, rounds }
    );

    const roundResults = [];
    let context = '';

    // Ejecutar rondas
    for (let round = 1; round <= rounds; round++) {
      const roundResponses = await agentService.executeRound(
        configuredAgents, 
        packageInput, 
        conversationId, 
        context
      );

      const roundData = {
        round,
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
                round
              }
            );

            roundData.responses.push({
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

            // Actualizar contexto para la próxima ronda
            context += `\n\nAgente ${response.agent.name} (${response.agent.personality} + ${response.agent.specialization}): ${result.content}`;
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          console.error(`Error procesando respuesta del agente ${response.agent.name}:`, error);
          roundData.responses.push({
            agent: response.agent,
            error: error.message
          });
        }
      }

      roundResults.push(roundData);
    }

    res.json({
      success: true,
      conversationId,
      rounds,
      agents: configuredAgents,
      results: roundResults,
      context: context
    });

  } catch (error) {
    console.error('Error en /api/council:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
