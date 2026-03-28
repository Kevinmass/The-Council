const app = require('./src/app');
const config = require('./src/config');

const server = app.listen(config.server.port, config.server.host, () => {
  console.log(`🚀 El Consejo - Multi-Agente IA`);
  console.log(`📡 Servidor escuchando en http://${config.server.host}:${config.server.port}`);
  console.log(`🎯 ETAPA 2 - Consejo básico (multi-agente secuencial)`);
  console.log(`📚 Documentación: http://${config.server.host}:${config.server.port}/`);
  console.log(`\nEndpoints clave:`);
  console.log(`   POST /api/council - Consejo multi-agente`);
  console.log(`   GET /api/specializations - Especializaciones disponibles`);
  console.log(`   GET /api/personalities - Personalidades disponibles`);
  console.log(`\nEjemplo de uso:`);
  console.log(`   curl -X POST http://${config.server.host}:${config.server.port}/api/council \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{`);
  console.log(`       "package": "quiero una app de delivery con drones",`);
  console.log(`       "agents": [`);
  console.log(`         {"personality": "optimista", "specialization": "frontend"},`);
  console.log(`         {"personality": "pesimista", "specialization": "backend"}`);
  console.log(`       ],`);
  console.log(`       "rounds": 1`);
  console.log(`     }'`);
});

// Manejo de cierre del servidor
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado exitosamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado exitosamente');
    process.exit(0);
  });
});