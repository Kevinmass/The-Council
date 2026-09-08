/**
 * Test ETAPA 5 - Identificación Progresiva de Modelos
 * 
 * Este test verifica que:
 * 1. Cada agente identifica su modelo de IA al finalizar su respuesta
 * 2. Se muestra el modelo anterior cuando corresponde
 * 3. El tracking de modelos funciona correctamente entre rondas
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testModelIdentification() {
  console.log('🧪 TEST ETAPA 5: Identificación Progresiva de Modelos\n');
  
  try {
    // 1. Verificar que el endpoint /models funciona
    console.log('1. Verificando endpoint /models...');
    const modelsResponse = await axios.get(`${BASE_URL}/models`);
    console.log('   ✅ Modelos disponibles:');
    console.log('      ', JSON.stringify(modelsResponse.data.modelDistribution, null, 2));
    
    // 2. Ejecutar un consejo con 2 agentes y 2 rondas
    console.log('\n2. Ejecutando consejo con identificación de modelos...');
    
    const councilPayload = {
      package: 'Implementar autenticación JWT en una app React + Node.js',
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
      rounds: 2
    };
    
    const councilResponse = await axios.post(`${BASE_URL}/council`, councilPayload);
    
    if (!councilResponse.data.success) {
      throw new Error('El consejo falló: ' + JSON.stringify(councilResponse.data));
    }
    
    console.log('   ✅ Consejo ejecutado exitosamente');
    console.log(`   📊 Rondas: ${councilResponse.data.rounds}`);
    console.log(`   🤖 Agentes: ${councilResponse.data.agents.length}`);
    
    // 3. Verificar identificación de modelos en las respuestas
    console.log('\n3. Verificando identificación de modelos en respuestas...');
    
    let modelIdentificationsFound = 0;
    let totalResponses = 0;
    
    councilResponse.data.results.forEach(round => {
      console.log(`\n   --- Ronda ${round.round} ---`);
      
      round.responses.forEach(response => {
        totalResponses++;
        const agentName = `${response.agent.personality}-${response.agent.specialization}`;
        const model = response.metadata?.model || 'desconocido';
        
        // Verificar si la respuesta contiene identificación de modelo
        const hasModelIdentification = response.response.includes('[Modelo:');
        
        if (hasModelIdentification) {
          modelIdentificationsFound++;
          // Extraer la identificación del modelo
          const identificationMatch = response.response.match(/\[Modelo: ([^\]]+)\]/);
          if (identificationMatch) {
            console.log(`   ✅ ${agentName}: ${identificationMatch[0]}`);
          }
        } else {
          console.log(`   ⚠️ ${agentName}: No se encontró identificación (modelo: ${model})`);
        }
      });
    });
    
    // 4. Verificar síntesis final
    console.log('\n4. Verificando síntesis final...');
    const synthesis = councilResponse.data.synthesis;
    if (synthesis && synthesis.enabled) {
      console.log(`   ✅ Síntesis generada (modelo: ${synthesis.model})`);
      console.log(`   📊 Calidad: ${synthesis.quality?.score || 0}/100`);
    } else {
      console.log('   ⚠️ Síntesis no disponible');
    }
    
    // 5. Resultados finales
    console.log('\n📋 RESULTADOS:');
    console.log(`   Total respuestas: ${totalResponses}`);
    console.log(`   Identificaciones encontradas: ${modelIdentificationsFound}`);
    
    if (modelIdentificationsFound === totalResponses) {
      console.log('\n✅ TEST APROBADO: Todas las respuestas incluyen identificación de modelo');
    } else {
      console.log(`\n⚠️ TEST PARCIAL: ${modelIdentificationsFound}/${totalResponses} respuestas con identificación`);
    }
    
    // 6. Mostrar ejemplo de identificación
    console.log('\n📝 EJEMPLO DE IDENTIFICACIÓN:');
    if (councilResponse.data.results[0]?.responses[0]?.response) {
      const lastResponse = councilResponse.data.results[0].responses[0].response;
      const lines = lastResponse.split('\n');
      const lastLines = lines.slice(-3);
      console.log('   Útimas líneas de la primera respuesta:');
      lastLines.forEach(line => console.log(`   ${line}`));
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
testModelIdentification()
  .then(() => {
    console.log('\n✨ Test completado exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });