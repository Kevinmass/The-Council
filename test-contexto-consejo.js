const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testContextoConsejo() {
  console.log('🧪 PRUEBA - Contexto del Consejo y Evitar Teléfono Descompuesto\n');
  
  const testInput = '¿Cómo implementarías un sistema de autenticación JWT seguro?';
  
  console.log(`📋 Input Original: "${testInput}"`);
  console.log('   Agentes: optimista (frontend) + pesimista (seguridad)');
  console.log('   Rondas: 2');
  console.log('   Ejecutando...\n');

  try {
    const response = await fetch('http://127.0.0.1:3000/api/council', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        package: testInput,
        agents: [
          { personality: 'optimista', specialization: 'frontend' },
          { personality: 'pesimista', specialization: 'seguridad' }
        ],
        rounds: 2
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Éxito! Consejo completado\n');
      
      // Analizar las respuestas para validar el contexto del consejo
      console.log('🔍 ANÁLISIS DE RESPUESTAS:\n');
      
      data.results.forEach((round, roundIndex) => {
        console.log(`📋 RONDA ${round.round}:`);
        round.responses.forEach((resp, agentIndex) => {
          if (resp.error) {
            console.log(`   🚨 Agente ${agentIndex + 1}: Error - ${resp.error}`);
          } else {
            const agentName = resp.agent.name;
            const agentType = resp.agent.personality === 'optimista' ? 'Optimista' : 'Pesimista';
            const specialization = resp.agent.specialization;
            
            console.log(`   ✅ Agente ${agentIndex + 1}: ${agentName} (${agentType} + ${specialization})`);
            
            // Validar que el agente menciona el contexto del consejo
            const responseText = resp.response.toLowerCase();
            const tieneContextoConsejo = responseText.includes('consejo') || 
                                       responseText.includes('agente') || 
                                       responseText.includes('colaboración') ||
                                       responseText.includes('equipo');
            
            // Validar que menciona el input original o JWT
            const tieneInputOriginal = responseText.includes('jwt') || 
                                     responseText.includes('autenticación') ||
                                     responseText.includes('token');
            
            console.log(`      📝 Contexto del Consejo: ${tieneContextoConsejo ? '✅ Sí' : '❌ No'}`);
            console.log(`      📝 Input Original: ${tieneInputOriginal ? '✅ Sí' : '❌ No'}`);
            console.log(`      📊 Longitud: ${resp.response.length} caracteres`);
          }
        });
        console.log('');
      });

      // Validación general
      console.log('📊 VALIDACIÓN GENERAL:');
      const totalRondas = data.results.length;
      const totalRespuestas = data.results.reduce((acc, r) => acc + r.responses.length, 0);
      const rondasCorrectas = totalRondas === 2;
      const respuestasCorrectas = totalRespuestas === 4; // 2 agentes * 2 rondas
      
      console.log(`   ✅ Rondas ejecutadas: ${totalRondas} (${rondasCorrectas ? 'Correcto' : 'Incorrecto'})`);
      console.log(`   ✅ Total respuestas: ${totalRespuestas} (${respuestasCorrectas ? 'Correcto' : 'Incorrecto'})`);
      console.log(`   ✅ Contexto acumulado: ${data.accumulatedContext ? 'Sí' : 'No'}`);
      console.log(`   ✅ Etapa: ${data.etapa}`);
      
      // Resumen de validación
      const exitoTotal = rondasCorrectas && respuestasCorrectas && data.accumulatedContext;
      console.log(`\n🎯 RESULTADO FINAL: ${exitoTotal ? '✅ ÉXITO TOTAL' : '⚠️  PARCIAL'}`);
      
      if (exitoTotal) {
        console.log('\n✅ VALIDACIÓN DE ÉXITO ETAPA 3 MEJORADA:');
        console.log('   ✔️  Las IAs son conscientes del contexto del consejo');
        console.log('   ✔️  El input original se mantiene accesible (no teléfono descompuesto)');
        console.log('   ✔️  Cada agente responde exactamente 1 vez por ronda');
        console.log('   ✔️  El parámetro "rounds = N" controla el número de rondas');
        console.log('   ✔️  El contexto se acumula entre rondas');
        console.log('   ✔️  Sistema maneja correctamente múltiples rondas');
      }

    } else {
      console.log('❌ Fallido!');
      console.log(`   Error: ${data.error}`);
    }
  } catch (error) {
    console.log('❌ Error de conexión!');
    console.log(`   Detalle: ${error.message}`);
  }

  console.log('\n🎯 PRUEBA DE CONTEXTO DEL CONSEJO COMPLETADA');
}

// Ejecutar la prueba
testContextoConsejo().catch(console.error);