const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api', apiRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: '🚀 El Consejo - Multi-Agente IA',
    version: '1.0.0',
    endpoints: {
      'POST /api/generate': 'Generar respuesta con Ollama (soporta personalidades)',
      'POST /api/council': 'Consejo multi-agente (ETAPA 2 - 2 agentes secuenciales)',
      'GET /api/council-test': 'Prueba rápida del consejo multi-agente (¿Es la tierra plana?)',
      'GET /api/health': 'Verificar estado del sistema',
      'GET /api/conversations/:id/history': 'Obtener historial de conversación',
      'GET /api/personalities': 'Listar personalidades disponibles',
      'GET /api/specializations': 'Listar especializaciones técnicas disponibles',
      'GET /api/hello': 'Saludo rápido con personalidad predefinida (optimista)'
    },
    roadmap: {
      etapa: 'ETAPA 3 - Sistema de Rondas',
      objetivo: 'Implementar rondas donde cada agente habla 1 vez por ronda durante N rondas'
    },
    personalidades: [
      'optimista - Enfoque positivo y constructivo',
      'pesimista - Enfoque crítico y preventivo', 
      'creativo - Enfoque innovador y fuera de lo común',
      'obsesivo - Enfoque detallado y exhaustivo'
    ],
    especializaciones: [
      'frontend - UI/UX, frameworks, interfaces de usuario',
      'backend - APIs, bases de datos, arquitectura',
      'devops - Deploy, CI/CD, performance, infraestructura',
      'seguridad - Best practices, vulnerabilidades, seguridad'
    ],
    ejemplo_consejo: {
      input: 'quiero una app de delivery con drones',
      agentes: [
        { personalidad: 'optimista', especializacion: 'frontend' },
        { personalidad: 'pesimista', especializacion: 'backend' }
      ],
      rondas: 1
    }
  });
});

// Endpoint de saludo rápido con personalidad
app.get('/api/hello', (req, res) => {
  const personality = 'optimista';
  const response = {
    success: true,
    personality: personality,
    message: '¡Hola! Soy un agente optimista que siempre busca soluciones viables y enfoques positivos. Estoy aquí para ayudarte con una perspectiva constructiva y enfocarme en oportunidades y soluciones prácticas.',
    timestamp: new Date().toISOString()
  };
  
  res.json(response);
});

// Endpoint de prueba del council con pregunta "¿Es la tierra plana?"
app.get('/api/council-test', async (req, res) => {
  try {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    const councilInput = {
      package: '¿Es la tierra plana?',
      agents: [
        {
          personality: 'optimista',
          specialization: 'frontend'
        },
        {
          personality: 'pesimista', 
          specialization: 'backend'
        }
      ],
      rounds: 1
    };

    const response = await fetch('http://localhost:3000/api/council', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(councilInput)
    });

    const data = await response.json();
    
    if (data.success) {
      res.json({
        success: true,
        message: 'Prueba del consejo multi-agente realizada exitosamente',
        question: councilInput.package,
        agents: councilInput.agents,
        results: data.results,
        modelsUsed: {
          frontend: 'qwen3:4b',
          backend: 'gemma3:4b'
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error en la prueba del consejo',
        details: data.error
      });
    }
  } catch (error) {
    console.error('Error en /api/council-test:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Endpoint de prueba para rondas de Etapa 3 (exactamente 2 rondas)
app.get('/api/council-rondas-test', async (req, res) => {
  try {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    const councilInput = {
      package: '¿Cómo implementarías un sistema de autenticación JWT?',
      agents: [
        {
          personality: 'optimista',
          specialization: 'frontend'
        },
        {
          personality: 'pesimista', 
          specialization: 'seguridad'
        }
      ],
      rounds: 2  // Exactamente 2 rondas para probar Etapa 3
    };

    const response = await fetch('http://localhost:3000/api/council', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(councilInput)
    });

    const data = await response.json();
    
    if (data.success) {
      // Validar que se ejecutaron exactamente 2 rondas
      const rondasEjecutadas = data.results.length;
      const agentesPorRonda = data.results.map(r => r.responses.length);
      const totalRespuestas = data.results.reduce((acc, r) => acc + r.responses.length, 0);
      
      res.json({
        success: true,
        message: 'Prueba de rondas de Etapa 3 realizada exitosamente',
        testDetails: {
          input: councilInput.package,
          agents: councilInput.agents,
          roundsRequested: councilInput.rounds,
          roundsExecuted: rondasEjecutadas,
          agentsPerRound: agentesPorRonda,
          totalResponses: totalRespuestas,
          validation: {
            correctRounds: rondasEjecutadas === 2,
            correctResponses: totalRespuestas === 4, // 2 agentes * 2 rondas
            consistentAgentsPerRound: agentesPorRonda.every(count => count === 2)
          }
        },
        results: data.results,
        modelsUsed: {
          frontend: 'qwen3:4b',
          seguridad: 'gemma3:4b'
        },
        etapa: 'ETAPA 3 - Sistema de Rondas',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error en la prueba de rondas',
        details: data.error
      });
    }
  } catch (error) {
    console.error('Error en /api/council-rondas-test:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  });
});

module.exports = app;