/**
 * Test ETAPA 6 - Control del usuario y configuración
 * 
 * Tests para:
 * - GET /api/config
 * - GET /api/council/:id/status
 * - Soporte para N agentes (2-10)
 * - Validación mejorada
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Función helper para hacer requests
function request(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(data)
                    });
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${data}`));
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
    if (passed) {
        log(`  ✅ ${name}`, 'green');
    } else {
        log(`  ❌ ${name}`, 'red');
        if (details) log(`     ${details}`, 'red');
    }
}

// Tests
async function runTests() {
    log('\n🧪 ETAPA 6 - Tests de Control del Usuario\n', 'blue');
    
    let totalTests = 0;
    let passedTests = 0;

    // Test 1: GET /api/config - Endpoint existe
    log('\n📋 Test 1: GET /api/config', 'yellow');
    try {
        const res = await request('/api/config');
        totalTests++;
        
        if (res.status === 200 && res.data.success) {
            passedTests++;
            logTest('Endpoint responde correctamente', true);
        } else {
            logTest('Endpoint responde correctamente', false, `Status: ${res.status}`);
        }
    } catch (error) {
        totalTests++;
        logTest('Endpoint responde correctamente', false, error.message);
    }

    // Test 2: GET /api/config - Estructura de respuesta
    log('\n📋 Test 2: Estructura de /api/config', 'yellow');
    try {
        const res = await request('/api/config');
        const config = res.data.config;
        
        // Verificar personalidades
        totalTests++;
        if (config && config.personalities && Array.isArray(config.personalities)) {
            passedTests++;
            logTest('Contiene lista de personalidades', true);
        } else {
            logTest('Contiene lista de personalidades', false);
        }

        // Verificar especializaciones
        totalTests++;
        if (config && config.specializations && Array.isArray(config.specializations)) {
            passedTests++;
            logTest('Contiene lista de especializaciones', true);
        } else {
            logTest('Contiene lista de especializaciones', false);
        }

        // Verificar modelos
        totalTests++;
        if (config && config.models) {
            passedTests++;
            logTest('Contiene información de modelos', true);
        } else {
            logTest('Contiene información de modelos', false);
        }

        // Verificar límites
        totalTests++;
        if (config && config.limits && config.limits.minAgents && config.limits.maxAgents) {
            passedTests++;
            logTest('Contiene límites de configuración', true);
        } else {
            logTest('Contiene límites de configuración', false);
        }
    } catch (error) {
        totalTests += 4;
        logTest('Estructura de config', false, error.message);
    }

    // Test 3: Council con 3 agentes (más que el límite anterior de 2)
    log('\n📋 Test 3: Council con 3 agentes', 'yellow');
    try {
        const res = await request('/api/council', 'POST', {
            package: 'Test con 3 agentes',
            agents: [
                { personality: 'optimista', specialization: 'frontend' },
                { personality: 'pesimista', specialization: 'backend' },
                { personality: 'creativo', specialization: 'devops' }
            ],
            rounds: 1
        });
        
        totalTests++;
        if (res.status === 200) {
            passedTests++;
            logTest('Acepta 3 agentes correctamente', true);
        } else {
            logTest('Acepta 3 agentes correctamente', false, `Status: ${res.status}`);
        }
    } catch (error) {
        totalTests++;
        logTest('Acepta 3 agentes correctamente', false, error.message);
    }

    // Test 4: Council con 1 agente (debería fallar)
    log('\n📋 Test 4: Council con 1 agente (debería fallar)', 'yellow');
    try {
        const res = await request('/api/council', 'POST', {
            package: 'Test con 1 agente',
            agents: [
                { personality: 'optimista', specialization: 'frontend' }
            ],
            rounds: 1
        });
        
        totalTests++;
        if (res.status === 400 && !res.data.success) {
            passedTests++;
            logTest('Rechaza council con 1 agente', true);
        } else {
            logTest('Rechaza council con 1 agente', false, `Status: ${res.status}`);
        }
    } catch (error) {
        totalTests++;
        logTest('Rechaza council con 1 agente', false, error.message);
    }

    // Test 5: Validación de especialización inválida
    log('\n📋 Test 5: Validación de especialización inválida', 'yellow');
    try {
        const res = await request('/api/council', 'POST', {
            package: 'Test especialización inválida',
            agents: [
                { personality: 'optimista', specialization: 'frontend' },
                { personality: 'pesimista', specialization: 'invalida' }
            ],
            rounds: 1
        });
        
        totalTests++;
        if (res.status === 400 && res.data.details && res.data.details.errors) {
            passedTests++;
            logTest('Rechaza especialización inválida con mensaje descriptivo', true);
        } else {
            logTest('Rechaza especialización inválida con mensaje descriptivo', false);
        }
    } catch (error) {
        totalTests++;
        logTest('Rechaza especialización inválida', false, error.message);
    }

    // Test 6: Metadata en respuesta del council
    log('\n📋 Test 6: Metadata en respuesta del council', 'yellow');
    try {
        const res = await request('/api/council', 'POST', {
            package: 'Test metadata',
            agents: [
                { personality: 'optimista', specialization: 'frontend' },
                { personality: 'pesimista', specialization: 'backend' }
            ],
            rounds: 1
        });
        
        totalTests++;
        if (res.data && res.data.configuration) {
            passedTests++;
            logTest('Respuesta incluye configuración', true);
        } else {
            logTest('Respuesta incluye configuración', false);
        }

        totalTests++;
        if (res.data && res.data.metadata) {
            passedTests++;
            logTest('Respuesta incluye metadata', true);
        } else {
            logTest('Respuesta incluye metadata', false);
        }
    } catch (error) {
        totalTests += 2;
        logTest('Metadata en respuesta', false, error.message);
    }

    // Test 7: GET /api/council/:id/status - Endpoint existe
    log('\n📋 Test 7: GET /api/council/:id/status', 'yellow');
    try {
        // Primero creamos un council para tener un ID válido
        const createRes = await request('/api/council', 'POST', {
            package: 'Test status',
            agents: [
                { personality: 'optimista', specialization: 'frontend' },
                { personality: 'pesimista', specialization: 'backend' }
            ],
            rounds: 1
        });

        if (createRes.data && createRes.data.conversationId) {
            const conversationId = createRes.data.conversationId;
            
            const statusRes = await request(`/api/council/${conversationId}/status`);
            
            totalTests++;
            if (statusRes.status === 200 && statusRes.data.success) {
                passedTests++;
                logTest('Endpoint de status responde correctamente', true);
            } else {
                logTest('Endpoint de status responde correctamente', false, `Status: ${statusRes.status}`);
            }

            totalTests++;
            if (statusRes.data && statusRes.data.status) {
                passedTests++;
                logTest('Status incluye estado de la conversación', true);
            } else {
                logTest('Status incluye estado de la conversación', false);
            }
        } else {
            totalTests += 2;
            logTest('Endpoint de status', false, 'No se pudo crear council para test');
        }
    } catch (error) {
        totalTests += 2;
        logTest('Endpoint de status', false, error.message);
    }

    // Resumen
    log('\n' + '='.repeat(50), 'blue');
    log(`📊 Resultados: ${passedTests}/${totalTests} tests pasaron`, passedTests === totalTests ? 'green' : 'yellow');
    
    if (passedTests === totalTests) {
        log('🎉 ¡Todos los tests de ETAPA 6 pasaron!', 'green');
    } else {
        log(`⚠️ ${totalTests - passedTests} tests fallaron`, 'red');
    }
    log('='.repeat(50), 'blue');

    // Exit con código apropiado
    process.exit(passedTests === totalTests ? 0 : 1);
}

// Manejar error de conexión
runTests().catch(error => {
    if (error.code === 'ECONNREFUSED') {
        log('\n❌ Error: No se pudo conectar al servidor.', 'red');
        log('   Asegurate de que el servidor esté corriendo en http://localhost:3000', 'yellow');
        log('   Ejecutá: npm start', 'yellow');
    } else {
        log(`\n❌ Error inesperado: ${error.message}`, 'red');
    }
    process.exit(1);
});