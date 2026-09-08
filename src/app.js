const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Frontend compilado (Vite -> frontend/dist). En dev se usa `vite` en :5173.
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend', 'dist');

// Middleware
app.use(cors());
app.use(express.json());

// Servir el SPA compilado (si existe)
app.use(express.static(FRONTEND_DIR));

// Rutas API
app.use('/api', apiRoutes);

// Índice de la API (antes servía en "/", ahora el SPA ocupa la raíz)
app.get('/api', (req, res) => {
  res.json({
    message: '🚀 The Council - Multi-Agent AI',
    version: '2.1.0',
    endpoints: {
      'POST /api/generate': 'Generar respuesta con Ollama (soporta personalidades)',
      'POST /api/council': 'Consejo multi-agente (ETAPA 6 - hasta 10 agentes)',
      'GET /api/config': 'Obtener configuración completa (personalidades, especializaciones, límites)',
      'GET /api/council/:id/status': 'Consultar estado de un consejo en ejecución',
      'GET /api/council-test': 'Prueba rápida del consejo multi-agente',
      'GET /api/health': 'Verificar estado del sistema',
      'GET /api/conversations/:id/history': 'Obtener historial de conversación',
      'GET /api/personalities': 'Listar personalidades disponibles',
      'GET /api/specializations': 'Listar especializaciones técnicas disponibles',
      'GET /api/models': 'Obtener información de modelos de IA',
      'GET /api/hello': 'Saludo rápido con personalidad predefinida (optimista)'
    },
    roadmap: {
      completedStages: [
        'ETAPA 3 - Sistema de Rondas',
        'ETAPA 4 - Síntesis Final',
        'ETAPA 5 - Especialización de Agentes',
        'ETAPA 6 - Control del Usuario',
        'ETAPA 11 - Interfaz Visual'
      ],
      currentStage: 'ETAPA 6 - Control del Usuario + ETAPA 11 - Interfaz',
      next: 'ETAPA 7 - Rotación de Personalidades'
    },
    features: {
      maxAgents: 10,
      minAgents: 2,
      maxRounds: 10,
      minRounds: 1,
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
        'seguridad - Best practices, vulnerabilidades, seguridad',
        'sintetizador - Análisis objetivo y síntesis de información'
      ],
      frontend: 'http://localhost:3000 (interfaz visual disponible)'
    },
    ejemplo_consejo: {
      input: 'quiero una app de delivery con drones',
      agentes: [
        { personality: 'optimista', specialization: 'frontend' },
        { personality: 'pesimista', specialization: 'backend' },
        { personality: 'creativo', specialization: 'devops' }
      ],
      rounds: 2
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
        // 🚀 INCLUIR SÍNTESIS FINAL (ETAPA 4)
        synthesis: data.synthesis || null,
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
      package: '¿Cuál es tu clima preferido?',
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
        // 🚀 INCLUIR SÍNTESIS FINAL (ETAPA 4)
        synthesis: data.synthesis || null,
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

// SPA fallback: cualquier GET que no sea /api ni un archivo estático -> index.html
// (permite recargar /app y otras rutas del router de React)
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.includes('.')) {
    return next();
  }
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'), (err) => {
    if (err) {
      res
        .status(200)
        .type('html')
        .send(
          '<!doctype html><meta charset="utf-8"><title>The Council</title>' +
            '<body style="font-family:system-ui;background:#08080a;color:#ececec;padding:3rem;max-width:40rem;margin:auto">' +
            '<h1>The Council</h1><p>El frontend todavía no está compilado.</p>' +
            '<p>Ejecutá <code>npm run frontend:build</code> (o <code>cd frontend &amp;&amp; npm install &amp;&amp; npm run build</code>) ' +
            'y recargá. Para desarrollo con hot-reload: <code>npm run frontend:dev</code> en otra terminal.</p>' +
            '<p>La API está viva en <a style="color:#C9A227" href="/api">/api</a>.</p></body>',
        );
    }
  });
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