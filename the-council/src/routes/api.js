const express = require('express');
const OllamaService = require('../services/ollamaService');
const DatabaseService = require('../services/databaseService');
const PersonalityService = require('../services/personalityService');

const router = express.Router();
const ollamaService = new OllamaService();
const dbService = new DatabaseService();
const personalityService = new PersonalityService();

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

module.exports = router;