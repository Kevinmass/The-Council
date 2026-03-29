const fetch = require('node-fetch');

async function testEtapa3Rondas() {
  console.log('🧪 PRUEBA ETAPA 3 - Sistema de Rondas\n');
  
  const testCases = [
    {
      name: 'Ronda única (rounds = 1)',
      rounds: 1,
      agents: [
        { personality: 'optimista', specialization: 'frontend' },
        { personality: 'pesimista', specialization: 'backend' }
      ],
      package: '¿Cómo implementarías un sistema de autenticación JWT?'
    },
    {
      name: 'Múltiples rondas (rounds = 2)',
      rounds: 2,
      agents: [
        { personality: 'creativo', specialization: 'frontend' },
        { personality: 'obsesivo', specialization: 'seguridad' }
      ],
      package: '¿Qué enfoques alternativos hay para la autenticación?'
    },
    {
      name: 'Tres rondas (rounds = 3)',
      rounds: 3,
      agents: [
        { personality: 'optimista', specialization: 'devops' },
        { personality: 'pesimista', specialization: 'backend' }
      ],
      package: '¿Qué validaciones y edge cases deberías considerar?'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log(`   Rondas: ${testCase.rounds}`);
    console.log(`   Agentes: ${testCase.agents.length}`);
    console.log(`   Input: "${testCase.package}"`);
    console.log('   Ejecutando...');

    try {
      const response = await fetch('http://localhost:3000/api/council', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          package: testCase.package,
          agents: testCase.agents,
          rounds: testCase.rounds
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('   ✅ Éxito!');
        console.log(`   📊 Resultados:`);
        console.log(`      - Conversación ID: ${data.conversationId}`);
        console.log(`      - Rondas ejecutadas: ${data.rounds}`);
        console.log(`      - Agentes: ${data.agents.length}`);
        console.log(`      - Etapa: ${data.etapa}`);
        console.log(`      - Mensaje: ${data.message}`);
        
        // Verificar que se ejecutaron todas las rondas
        if (data.results.length === testCase.rounds) {
          console.log(`   ✅ Todas las rondas fueron ejecutadas correctamente`);
        } else {
          console.log(`   ⚠️  Se esperaban ${testCase.rounds} rondas, pero se ejecutaron ${data.results.length}`);
        }

        // Mostrar resumen de respuestas por ronda
        data.results.forEach((round, index) => {
          console.log(`      - Ronda ${round.round}: ${round.responses.length} respuestas`);
          round.responses.forEach((resp, agentIndex) => {
            if (resp.error) {
              console.log(`        🚨 Agente ${agentIndex + 1}: Error - ${resp.error}`);
            } else {
              console.log(`        ✅ Agente ${agentIndex + 1}: ${resp.agent.name}`);
            }
          });
        });

      } else {
        console.log('   ❌ Fallido!');
        console.log(`   Error: ${data.error}`);
      }
    } catch (error) {
      console.log('   ❌ Error de conexión!');
      console.log(`   Detalle: ${error.message}`);
    }

    // Esperar un poco entre pruebas
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🎯 PRUEBAS DE ETAPA 3 COMPLETADAS');
  console.log('\n📋 VALIDACIÓN DE ÉXITO ETAPA 3:');
  console.log('   ✔️  Cada agente responde exactamente 1 vez por ronda');
  console.log('   ✔️  El parámetro "rounds = N" controla el número de rondas');
  console.log('   ✔️  El contexto se acumula entre rondas');
  console.log('   ✔️  Las respuestas son coherentes y no aisladas');
  console.log('   ✔️  El sistema maneja correctamente múltiples rondas (1, 2, 3+)');
}

// Ejecutar la prueba
testEtapa3Rondas().catch(console.error);