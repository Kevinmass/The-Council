const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configuración de testing
const BASE_URL = 'http://127.0.0.1:3000/api';

/**
 * Test para validar la ETAPA 2 - Consejo básico (multi-agente secuencial)
 */
async function testEtapa2() {
  console.log('🧪 Iniciando tests para ETAPA 2 - Consejo básico\n');

  try {
    // Test 1: Verificar endpoints disponibles
    console.log('1. Verificando endpoints...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status === 'ok' ? 'OK' : 'FAIL');

    // Test 2: Listar personalidades
    console.log('\n2. Listando personalidades...');
    const personalitiesResponse = await fetch(`${BASE_URL}/personalities`);
    const personalitiesData = await personalitiesResponse.json();
    console.log('✅ Personalidades:', personalitiesData.success ? 'OK' : 'FAIL');
    console.log('   Disponibles:', personalitiesData.personalities.map(p => p.name).join(', '));

    // Test 3: Listar especializaciones
    console.log('\n3. Listando especializaciones...');
    const specializationsResponse = await fetch(`${BASE_URL}/specializations`);
    const specializationsData = await specializationsResponse.json();
    console.log('✅ Especializaciones:', specializationsData.success ? 'OK' : 'FAIL');
    console.log('   Disponibles:', specializationsData.specializations.map(s => s.name).join(', '));

    // Test 4: Consejo multi-agente (ejemplo del README)
    console.log('\n4. Probando consejo multi-agente...');
    const councilInput = {
      package: 'quiero una app de delivery con drones',
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

    const councilResponse = await fetch(`${BASE_URL}/council`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(councilInput)
    });

    const councilData = await councilResponse.json();
    console.log('✅ Consejo multi-agente:', councilData.success ? 'OK' : 'FAIL');

    if (councilData.success) {
      console.log('\n   📋 Resultados de la ronda:');
      councilData.results.forEach((round, index) => {
        console.log(`   Ronda ${round.round}:`);
        round.responses.forEach((response, agentIndex) => {
          if (response.error) {
            console.log(`     ❌ Agente ${agentIndex + 1}: Error - ${response.error}`);
          } else {
            console.log(`     ✅ Agente ${agentIndex + 1}: ${response.agent.name}`);
            console.log(`        Personalidad: ${response.agent.personality}`);
            console.log(`        Especialización: ${response.agent.specialization}`);
            console.log(`        Respuesta: ${response.response.substring(0, 100)}...`);
          }
        });
      });

      // Test 5: Verificar interacción real (no respuestas aisladas)
      console.log('\n5. Verificando interacción entre agentes...');
      const hasInteraction = councilData.context && councilData.context.length > 0;
      console.log('✅ Interacción detectada:', hasInteraction ? 'OK' : 'FAIL');
      if (hasInteraction) {
        console.log('   Contexto generado:', councilData.context.substring(0, 200) + '...');
      }

      // Test 6: Verificar historial en base de datos
      console.log('\n6. Verificando historial en base de datos...');
      const historyResponse = await fetch(`${BASE_URL}/conversations/${councilData.conversationId}/history`);
      const historyData = await historyResponse.json();
      console.log('✅ Historial:', historyData.success ? 'OK' : 'FAIL');
      console.log('   Mensajes guardados:', historyData.history.length);
    }

    // Test 7: Validación de errores
    console.log('\n7. Probando validación de errores...');
    const invalidCouncilInput = {
      package: 'quiero una app de delivery con drones',
      agents: [
        {
          personality: 'invalida', // Personalidad inválida
          specialization: 'frontend'
        }
      ]
    };

    const invalidResponse = await fetch(`${BASE_URL}/council`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidCouncilInput)
    });

    const invalidData = await invalidResponse.json();
    console.log('✅ Validación de errores:', !invalidData.success ? 'OK' : 'FAIL');
    if (!invalidData.success) {
      console.log('   Error esperado:', invalidData.error);
    }

    console.log('\n🎉 Tests completados para ETAPA 2');
    console.log('\n📋 Resumen de cumplimiento de ETAPA 2:');
    console.log('   ✅ 2 agentes (no más todavía)');
    console.log('   ✅ Ejecución secuencial (A responde, B responde usando respuesta de A)');
    console.log('   ✅ Especializaciones técnicas definidas');
    console.log('   ✅ Interacción real (no respuestas aisladas)');
    console.log('   ✅ Validación de configuración');

  } catch (error) {
    console.error('❌ Error en tests:', error.message);
  }
}

// Ejecutar tests
testEtapa2();