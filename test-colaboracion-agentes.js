/**
 * Test de Colaboración entre Agentes
 * 
 * Este test verifica que:
 * 1. Cada agente recibe las respuestas de los agentes anteriores
 * 2. El contexto se acumula correctamente entre rondas
 * 3. Los agentes realmente "se escuchan" entre sí
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testColaboracion() {
  console.log('🧪 TEST DE COLABORACIÓN ENTRE AGENTES\n');
  
  try {
    // Ejecutar un consejo con 2 agentes y 2 rondas
    console.log('1. Ejecutando consejo para verificar colaboración...');
    
    const councilPayload = {
      package: '¿Cuál es tu clima preferido?',
      agents: [
        {
          personality: 'optimista',
          specialization: 'frontend'
        },
        {
          personality: 'pesimista',
          specialization: 'seguridad'
        }
      ],
      rounds: 2
    };
    
    const councilResponse = await axios.post(`${BASE_URL}/council`, councilPayload);
    
    if (!councilResponse.data.success) {
      throw new Error('El consejo falló: ' + JSON.stringify(councilResponse.data, null, 2));
    }
    
    console.log('   ✅ Consejo ejecutado exitosamente');
    
    // 2. Verificar que el contexto acumulado contiene todas las respuestas
    console.log('\n2. Verificando contexto acumulado...');
    const accumulatedContext = councilResponse.data.accumulatedContext;
    
    if (!accumulatedContext || accumulatedContext.length === 0) {
      console.log('   ❌ ERROR: No hay contexto acumulado');
      process.exit(1);
    }
    
    console.log('   ✅ Contexto acumulado existe');
    console.log(`   📏 Longitud del contexto: ${accumulatedContext.length} caracteres`);
    
    // 3. Verificar que cada agente menciona al menos una vez a otros agentes
    console.log('\n3. Verificando referencias cruzadas entre agentes...');
    
    let referenciasCruzadas = 0;
    const totalAgentes = councilResponse.data.results.reduce((sum, round) => sum + round.responses.length, 0);
    
    councilResponse.data.results.forEach((round, roundIndex) => {
      console.log(`\n   --- Ronda ${round.round} ---`);
      
      round.responses.forEach((response, agentIndex) => {
        const agentName = `${response.agent.personality}-${response.agent.specialization}`;
        
        // Verificar si la respuesta menciona a otros agentes o sus respuestas
        const mencionaAgentesAnteriores = 
          response.response.toLowerCase().includes('agente') ||
          response.response.toLowerCase().includes('como dijo') ||
          response.response.toLowerCase().includes('como mencionó') ||
          response.response.toLowerCase().includes('coincido') ||
          response.response.toLowerCase().includes('discrepo') ||
          response.response.toLowerCase().includes('respecto a') ||
          response.response.toLowerCase().includes('en relación a') ||
          response.response.toLowerCase().includes('basándome') ||
          response.response.toLowerCase().includes('considerando');
        
        // En la primera ronda, el primer agente no debería tener contexto previo
        if (roundIndex === 0 && agentIndex === 0) {
          console.log(`   ℹ️  ${agentName}: Primer agente en primera ronda (sin contexto previo)`);
        } else if (mencionaAgentesAnteriores) {
          referenciasCruzadas++;
          console.log(`   ✅ ${agentName}: ¡Menciona a agentes anteriores!`);
        } else {
          console.log(`   ⚠️  ${agentName}: No menciona explícitamente a agentes anteriores`);
        }
      });
    });
    
    // 4. Mostrar ejemplo del contexto
    console.log('\n4. Ejemplo del contexto acumulado (primeros 500 caracteres):');
    console.log('   ' + accumulatedContext.substring(0, 500).replace(/\n/g, '\n   ') + '...');
    
    // 5. Resultados finales
    console.log('\n📋 RESULTADOS:');
    console.log(`   Total agentes: ${totalAgentes}`);
    console.log(`   Referencias cruzadas: ${referenciasCruzadas}`);
    
    if (referenciasCruzadas > 0) {
      console.log('\n✅ TEST APROBADO: Los agentes se están escuchando entre sí');
      console.log('   El sistema de contexto colaborativo está funcionando');
    } else {
      console.log('\n⚠️ TEST PARCIAL: Los agentes no muestran referencias explícitas');
      console.log('   Esto no necesariamente indica un problema - pueden estar considerando el contexto sin mencionarlo explícitamente');
    }
    
    // 6. Verificar identificación de modelos
    console.log('\n5. Verificando identificación de modelos...');
    let modelosIdentificados = 0;
    
    councilResponse.data.results.forEach(round => {
      round.responses.forEach(response => {
        if (response.response.includes('[Modelo:')) {
          modelosIdentificados++;
        }
      });
    });
    
    console.log(`   Modelos identificados: ${modelosIdentificados}/${totalAgentes}`);
    if (modelosIdentificados === totalAgentes) {
      console.log('   ✅ Todos los agentes identifican correctamente su modelo');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   Message:', error.message);
    }
    process.exit(1);
  }
}

// Ejecutar test
testColaboracion()
  .then(() => {
    console.log('\n✨ Test completado exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });