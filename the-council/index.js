const app = require('./src/app');
const config = require('./src/config');

const server = app.listen(config.server.port, config.server.host, () => {
  console.log(`🚀 El Consejo - Servidor iniciado`);
  console.log(`📍 Escuchando en: http://${config.server.host}:${config.server.port}`);
  console.log(`📊 Estado: ETAPA 1 - Agente único con personalidad`);
  console.log(`🎯 Objetivo: Probar el concepto de personalidad con casos de uso de codeo`);
  console.log(`\nEndpoints disponibles:`);
  console.log(`  POST /api/generate - Generar respuesta con Ollama (soporta personalidades)`);
  console.log(`  GET  /api/health     - Verificar estado del sistema`);
  console.log(`  GET  /api/conversations/:id/history - Obtener historial`);
  console.log(`  GET  /api/personalities - Listar personalidades disponibles`);
  console.log(`\nPersonalidades disponibles:`);
  console.log(`  - optimista: Enfoque positivo y constructivo`);
  console.log(`  - pesimista: Enfoque crítico y preventivo`);
  console.log(`  - creativo: Enfoque innovador y fuera de lo común`);
  console.log(`  - obsesivo: Enfoque detallado y exhaustivo`);
});

// Manejo de cierre del servidor
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});