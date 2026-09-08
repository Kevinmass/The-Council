/**
 * Test que simula el error original reportado:
 * "Error en /api/council: Error: Especialización inválida: apicultor"
 * 
 * Este test reproduce exactamente lo que hacía el endpoint /api/council
 */

const AgentService = require('../src/services/agentService');

async function testErrorOriginal() {
  console.log('🧪 Test: Reproducir error original "Especialización inválida: apicultor"\n');
  
  const agentService = new AgentService();
  
  // Simular la configuración que causaba el error
  const agentsConfig = [
    { personality: 'optimista', specialization: 'apicultor' },
    { personality: 'pesimista', specialization: 'backend' }
  ];
  
  console.log('Paso 1: Validar agentes (esto siempre funcionó)');
  const validation = agentService.validateAgents(agentsConfig);
  console.log(`  Validación: ${validation.isValid ? '✅ APROBADA' : '❌ RECHAZADA'}`);
  if (!validation.isValid) {
    console.log('  Errores:', validation.errors);
    return;
  }
  
  console.log('\nPaso 2: Crear agentes (aquí ocurría el error antes)');
  try {
    // Esto es exactamente lo que hace el endpoint /api/council en la línea 421
    const configuredAgents = agentsConfig.map(config => 
      agentService.createAgent(config.personality, config.specialization)
    );
    
    console.log('  ✅ Agentes creados exitosamente:');
    configuredAgents.forEach((agent, i) => {
      console.log(`    Agente ${i + 1}: ${agent.name}`);
    });
    
    console.log('\n✅ ¡ERROR SOLUCIONADO! El agente con especialización "apicultor" se crea correctamente.');
    
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
    console.log('\n❌ El error persiste. Revisa la implementación.');
  }
}

testErrorOriginal().catch(console.error);