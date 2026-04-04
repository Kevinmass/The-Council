/**
 * Configuración global de la aplicación - THE COUNCIL
 */

const APP_CONFIG = {
    // URLs de la API
    api: {
        baseUrl: '/api',
        config: '/api/config',
        council: '/api/council',
        councilStatus: (id) => `/api/council/${id}/status`,
        personalities: '/api/personalities',
        specializations: '/api/specializations',
        models: '/api/models',
        health: '/api/health'
    },
    
    // Configuración por defecto
    defaults: {
        rounds: 2,
        minAgents: 2,
        maxAgents: 10,
        minRounds: 1,
        maxRounds: 10,
        agents: [
            { personality: 'optimista', specialization: 'frontend' },
            { personality: 'pesimista', specialization: 'backend' }
        ]
    },
    
    // Mapeo de especializaciones a modelos de IA
    specializationModels: {
        frontend: 'Qwen 3 4B',
        backend: 'Gemma 3 4B',
        devops: 'Qwen 3 4B',
        seguridad: 'Gemma 3 4B',
        neutral: 'Qwen 3 4B',
        custom: 'Qwen 3 4B'
    },
    
    // Emojis para especializaciones
    specializationEmojis: {
        frontend: '🎨',
        backend: '⚙️',
        devops: '🚀',
        seguridad: '🛡️',
        neutral: '⚖️',
        custom: '✨'
    },
    
    // Clases CSS para especializaciones
    specializationClasses: {
        frontend: 'agent-frontend',
        backend: 'agent-backend',
        devops: 'agent-devops',
        seguridad: 'agent-seguridad',
        neutral: 'agent-neutral',
        custom: 'agent-custom'
    },
    
    // Configuración de polling para progreso
    polling: {
        interval: 2000, // 2 segundos
        maxAttempts: 300 // 10 minutos máximo
    },
    
    // Especializaciones por defecto (se actualizan desde la API)
    defaultSpecializations: [
        { name: 'frontend', description: 'UI/UX, frameworks, interfaces de usuario' },
        { name: 'backend', description: 'APIs, bases de datos, arquitectura' },
        { name: 'devops', description: 'Deploy, CI/CD, performance, infraestructura' },
        { name: 'seguridad', description: 'Best practices, vulnerabilidades, seguridad' },
        { name: 'neutral', description: 'Análisis objetivo sin sesgo técnico' },
        { name: 'custom', description: 'Especialización personalizada...' }
    ]
};

// Congelar configuración para evitar modificaciones
Object.freeze(APP_CONFIG);