/**
 * Test para verificar que las especializaciones personalizadas funcionan correctamente
 * Ejemplo: "apicultor" como especialización personalizada
 */

const AgentService = require('./the-council/src/services/agentService');

async function testSpecializacionesPersonalizadas() {
  console.log('🧪 Test: Especializaciones Personalizadas\n');
  
  const agentService = new AgentService();
  
  // Test 1: Crear agente con especialización personalizada "apicultor"
  console.log('Test 1: Crear agente con especialización "apicultor"');
  try {
    const agent = agentService.createAgent('optimista', 'apicultor');
    console.log('✅ Agente creado exitosamente:');
    console.log(`   Nombre: ${agent.name}`);
    console.log(`   Personalidad: ${agent.personality}`);
    console.log(`   Especialización: ${agent.specialization}`);
    console.log(`   Descripción: ${agent.description}`);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n');
  
  // Test 2: Generar prompt para especialización personalizada
  console.log('Test 2: Generar prompt para especialización personalizada');
  try {
    const prompt = agentService.generateAgentPrompt(
      '¿Cómo mejorarar la producción de miel?',
      'optimista',
      'apicultor',
      '',
      '¿Cómo mejorarar la producción de miel?'
    );
    console.log('✅ Prompt generado exitosamente:');
    console.log('   Primeras 200 caracteres:', prompt.substring(0, 200) + '...');
    console.log('   ¿Contiene "apicultor"?:', prompt.includes('apicultor') ? 'Sí' : 'No');
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n');
  
  // Test 3: Crear múltiples agentes con especializaciones personalizadas
  console.log('Test 3: Crear consejo con especializaciones personalizadas');
  try {
    const agents = [
      agentService.createAgent('optimista', 'apicultor'),
      agentService.createAgent('pesimista', 'chef'),
      agentService.createAgent('neutral', 'musico')
    ];
    console.log('✅ Consejo creado exitosamente:');
    agents.forEach((agent, i) => {
      console.log(`   Agente ${i + 1}: ${agent.name} - ${agent.description}`);
    });
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n');
  
  // Test 4: Validar agentes con especializaciones personalizadas
  console.log('Test 4: Validar configuración de agentes personalizados');
  try {
    const agentConfigs = [
      { personality: 'optimista', specialization: 'apicultor' },
      { personality: 'pesimista', specialization: 'chef' }
    ];
    const validation = agentService.validateAgents(agentConfigs);
    console.log('✅ Validación completada:');
    console.log(`   ¿Es válida?: ${validation.isValid}`);
    if (validation.errors.length > 0) {
      console.log('   Errores:', validation.errors);
    } else {
      console.log('   Sin errores');
    }
    if (validation.warnings.length > 0) {
      console.log('   Advertencias:', validation.warnings);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n');
  
  // Test 5: Verificar que las especializaciones predefinidas siguen funcionando
  console.log('Test 5: Verificar especializaciones predefinidas (frontend, backend, etc.)');
  try {
    const predefinedAgents = [
      agentService.createAgent('optimista', 'frontend'),
      agentService.createAgent('pesimista', 'backend'),
      agentService.createAgent('neutral', 'devops')
    ];
    console.log('✅ Especializaciones predefinidas funcionan:');
    predefinedAgents.forEach((agent, i) => {
      console.log(`   Agente ${i + 1}: ${agent.name}`);
    });
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n');
  console.log('🎉 Test completado!');
}

// Ejecutar test
testSpecializacionesPersonalizadas().catch(console.error);