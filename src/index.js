const app = require('./app');
const config = require('./config');

const server = app.listen(config.server.port, config.server.host, () => {
  console.log(`\n🚀 The Council - Multi-Agent AI v2.1`);
  console.log(`📡 Server listening on http://${config.server.host}:${config.server.port}`);
  console.log(`\n🎯 COMPLETED STAGES:`);
  console.log(`   ✅ ETAPA 3 - Round System`);
  console.log(`   ✅ ETAPA 4 - Final Synthesis`);
  console.log(`   ✅ ETAPA 5 - Agent Specialization`);
  console.log(`   ✅ ETAPA 6 - User Control`);
  console.log(`   ✅ ETAPA 11 - Visual Interface`);
  console.log(`\n🌐 WEB INTERFACE:`);
  console.log(`   👉 http://${config.server.host}:${config.server.port}`);
  console.log(`\n📚 KEY ENDPOINTS:`);
  console.log(`   POST /api/council    - Multi-agent council (up to 10 agents)`);
  console.log(`   GET  /api/config     - Full configuration`);
  console.log(`   GET  /api/personalities   - Available personalities`);
  console.log(`   GET  /api/specializations - Available specializations`);
  console.log(`\n📖 DOCUMENTATION:`);
  console.log(`   http://${config.server.host}:${config.server.port}/`);
  console.log(`\n💡 NEXT STAGE: ETAPA 7 - Personality Rotation\n`);
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