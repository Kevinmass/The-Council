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
      'GET /api/health': 'Verificar estado del sistema',
      'GET /api/conversations/:id/history': 'Obtener historial de conversación',
      'GET /api/personalities': 'Listar personalidades disponibles'
    },
    roadmap: {
      etapa: 'ETAPA 1 - Agente único con personalidad',
      objetivo: 'Probar el concepto de personalidad con casos de uso de codeo'
    },
    personalidades: [
      'optimista - Enfoque positivo y constructivo',
      'pesimista - Enfoque crítico y preventivo', 
      'creativo - Enfoque innovador y fuera de lo común',
      'obsesivo - Enfoque detallado y exhaustivo'
    ]
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