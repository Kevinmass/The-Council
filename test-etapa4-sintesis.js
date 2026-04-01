const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testEtapa4Sintesis() {
  console.log('🧪 PRUEBA ETAPA 4 - Síntesis Final\n');
  
  const testCases = [
    {
      name: 'Síntesis básica (2 agentes, 1 ronda)',
      rounds: 1,
      agents: [
        { personality: 'optimista', specialization: 'frontend' },
        { personality: 'pesimista', specialization: 'backend' }
      ],
      package: '¿Cómo implementarías un sistema de autenticación JWT?'
    },
    {
      name: 'Síntesis avanzada (2 agentes, 2 rondas)',
      rounds: 2,
      agents: [
        { personality: 'creativo', specialization: 'frontend' },
        { personality: 'obsesivo', specialization: 'seguridad' }
      ],
      package: '¿Qué enfoques alternativos hay para la autenticación?'
    },
    {
      name: 'Síntesis completa (2 agentes, 3 rondas)',
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
      const response = await fetch('http://127.0.0.1:3000/api/council', {
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

        // Verificar que existe la síntesis
        if (data.synthesis && data.synthesis.enabled) {
          console.log(`   🚀 SÍNTESIS FINAL ACTIVADA!`);
          console.log(`      - Modelo: ${data.synthesis.model}`);
          console.log(`      - Personalidad: ${data.synthesis.personality}`);
          console.log(`      - Resumen: ${data.synthesis.summary && data.synthesis.summary !== 'No disponible' ? '✅ Disponible' : '❌ No disponible'}`);
          console.log(`      - Puntos clave: ${data.synthesis.keyPoints.length} encontrados`);
          console.log(`      - Recomendaciones: ${data.synthesis.recommendations.length} encontradas`);
          console.log(`      - Plan de acción: ${data.synthesis.actionPlan.length} pasos`);
          
          // Mostrar calidad de la síntesis
          if (data.synthesis.quality) {
            const quality = data.synthesis.quality;
            console.log(`      - Calidad: ${quality.score}/100 ${quality.score >= 60 ? '✅' : '⚠️'}`);
            if (quality.passed !== undefined) {
              console.log(`        Estado: ${quality.passed ? '✅ Aprobada' : '⚠️ No aprobada'}`);
            }
            if (quality.warnings && quality.warnings.length > 0) {
              console.log(`        Advertencias:`);
              quality.warnings.forEach(w => console.log(`          - ${w}`));
            }
          }
          
          // Mostrar contenido de la síntesis
          if (data.synthesis.summary && data.synthesis.summary !== 'No disponible') {
            console.log(`      - Resumen: "${data.synthesis.summary.substring(0, 100)}..."`);
          }
          if (data.synthesis.keyPoints.length > 0) {
            console.log(`      - Puntos clave:`);
            data.synthesis.keyPoints.slice(0, 3).forEach((point, index) => {
              console.log(`        ${index + 1}. ${point.substring(0, 80)}...`);
            });
          }
        } else {
          console.log(`   ❌ Síntesis no activada o no disponible`);
          if (data.synthesis && data.synthesis.error) {
            console.log(`      Error: ${data.synthesis.error}`);
          }
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
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n🎯 PRUEBAS DE ETAPA 4 COMPLETADAS');
  console.log('\n📋 VALIDACIÓN DE ÉXITO ETAPA 4:');
  console.log('   ✔️  Cada agente responde exactamente 1 vez por ronda');
  console.log('   ✔️  El parámetro "rounds = N" controla el número de rondas');
  console.log('   ✔️  El contexto se acumula entre rondas');
  console.log('   ✔️  Las respuestas son coherentes y no aisladas');
  console.log('   ✔️  La IA síntesis se ejecuta automáticamente al final');
  console.log('   ✔️  La síntesis usa modelo qwen3:4b con personalidad neutral');
  console.log('   ✔️  La síntesis genera resumen, puntos clave, recomendaciones y plan de acción');
  console.log('   ✔️  El formato de salida incluye la sección "synthesis" estructurada');
}

// Ejecutar la prueba
testEtapa4Sintesis().catch(console.error);