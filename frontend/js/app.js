/**
 * Aplicación Principal - El Consejo
 * Maneja la interfaz de usuario y la lógica de la aplicación
 */

class CouncilApp {
    constructor() {
        this.package = '';
        this.rounds = APP_CONFIG.defaults.rounds;
        this.isRunning = false;
        this.currentResult = null;
    }

    /**
     * Inicializa la aplicación
     */
    async init() {
        // Inicializar gestores
        await agentsManager.init();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Configurar callbacks
        agentsManager.setOnChange((agents) => {
            this.onAgentsChange(agents);
        });
        
        // Verificar salud del servidor
        this.checkHealth();
        
        console.log('🚀 El Consejo - Aplicación inicializada');
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Input de package
        const packageInput = document.getElementById('package-input');
        packageInput.addEventListener('input', (e) => {
            this.package = e.target.value;
        });

        // Selector de rondas
        const roundsInput = document.getElementById('rounds-input');
        const roundsValue = document.getElementById('rounds-value');
        roundsInput.addEventListener('input', (e) => {
            this.rounds = parseInt(e.target.value);
            roundsValue.textContent = this.rounds;
        });

        // Botón de agregar agente
        const addAgentBtn = document.getElementById('add-agent-btn');
        addAgentBtn.addEventListener('click', () => {
            agentsManager.addAgent();
        });

        // Botón de iniciar consejo
        const startBtn = document.getElementById('start-council-btn');
        startBtn.addEventListener('click', () => {
            this.startCouncil();
        });

        // Botón de limpiar
        const clearBtn = document.getElementById('clear-btn');
        clearBtn.addEventListener('click', () => {
            this.clear();
        });

        // Botón de nuevo consejo
        const newCouncilBtn = document.getElementById('btn-new-council');
        newCouncilBtn.addEventListener('click', () => {
            this.clear();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /**
     * Verifica la salud del servidor
     */
    async checkHealth() {
        const health = await apiService.healthCheck();
        if (!health.success) {
            this.showNotification('warning', 'El servidor puede no estar disponible. Algunas funcionalidades podrían no funcionar.');
        }
    }

    /**
     * Callback cuando cambian los agentes
     */
    onAgentsChange(agents) {
        console.log('Agentes actualizados:', agents);
        // Aquí podríamos actualizar algún indicador visual
    }

    /**
     * Inicia el consejo
     */
    async startCouncil() {
        // Validar formulario
        if (!this.package.trim()) {
            this.showNotification('error', 'Por favor, ingresá un problema o proyecto para analizar.');
            document.getElementById('package-input').focus();
            return;
        }

        // Validar agentes
        const validation = agentsManager.validate();
        if (!validation.valid) {
            this.showNotification('error', validation.error);
            return;
        }

        // Preparar estado
        this.isRunning = true;
        this.updateUIState('running');
        
        // Ocultar resultados anteriores
        document.getElementById('results-section').classList.add('hidden');
        document.getElementById('progress-section').classList.remove('hidden');
        
        // Limpiar mensajes de estado
        const statusMessages = document.getElementById('status-messages');
        statusMessages.innerHTML = '';

        // Obtener configuración de agentes
        const agents = agentsManager.getConfig();

        // Mostrar estado inicial
        this.addStatusMessage('preparing', 'Preparando consejo...');
        this.updateProgress(5, 'Iniciando...');

        try {
            // Iniciar el consejo
            this.addStatusMessage('thinking', 'Enviando solicitud al servidor...');
            this.updateProgress(10, 'Procesando...');

            // Deshabilitar botón
            const startBtn = document.getElementById('start-council-btn');
            startBtn.disabled = true;
            startBtn.classList.add('opacity-50', 'cursor-not-allowed');

            // Iniciar polling para progreso
            const result = await apiService.startCouncil(this.package, agents, this.rounds);

            if (result.success) {
                // Consejo completado exitosamente
                this.currentResult = result.data;
                
                this.updateProgress(100, '¡Completado!');
                this.addStatusMessage('success', 'Consejo finalizado correctamente');
                
                // Mostrar resultados
                this.displayResults(result.data);
                
                // Pequeña pausa antes de mostrar resultados
                await new Promise(resolve => setTimeout(resolve, 500));
                this.updateUIState('results');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error en consejo:', error);
            this.addStatusMessage('error', `Error: ${error.message || 'Error desconocido'}`);
            this.updateUIState('idle');
            this.showNotification('error', `Error: ${error.message || 'Error desconocido'}`);
        } finally {
            this.isRunning = false;
            const startBtn = document.getElementById('start-council-btn');
            startBtn.disabled = false;
            startBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            agentsManager.setAllThinking(false);
        }
    }

    /**
     * Muestra los resultados del consejo
     */
    displayResults(data) {
        const resultsSection = document.getElementById('results-section');
        const roundsResults = document.getElementById('rounds-results');
        const synthesisContent = document.getElementById('synthesis-content');
        
        // Limpiar contenidos anteriores
        roundsResults.innerHTML = '';
        synthesisContent.innerHTML = '';

        // Mostrar resultados por ronda
        if (data.results && data.results.length > 0) {
            data.results.forEach((round, index) => {
                const roundCard = this.createRoundCard(round, index);
                roundsResults.appendChild(roundCard);
            });
        }

        // Mostrar síntesis
        if (data.synthesis && data.synthesis.enabled) {
            const synthesisHTML = this.createSynthesisHTML(data.synthesis);
            synthesisContent.innerHTML = synthesisHTML;
        }

        // Mostrar sección de resultados
        resultsSection.classList.remove('hidden');
        
        // Scroll suave hacia resultados
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    /**
     * Crea la tarjeta de una ronda
     */
    createRoundCard(round, index) {
        const card = document.createElement('div');
        card.className = 'round-card';
        card.style.animationDelay = `${index * 0.2}s`;

        const header = document.createElement('div');
        header.className = 'round-header';
        header.innerHTML = `
            <div class="round-number">${round.round}</div>
            <div>
                <h3 class="font-semibold text-lg">Ronda ${round.round}</h3>
                <p class="text-sm text-gray-400">${round.responses.length} respuestas</p>
            </div>
        `;

        card.appendChild(header);

        // Agregar respuestas de cada agente
        round.responses.forEach(response => {
            if (response.error) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'agent-response response-error';
                errorDiv.innerHTML = `
                    <div class="response-header">
                        <span class="response-badge bg-red-500/20 text-red-400">Error</span>
                        <span class="text-sm text-gray-400">${response.agent.name}</span>
                    </div>
                    <p class="text-red-400 text-sm">${response.error}</p>
                `;
                card.appendChild(errorDiv);
            } else {
                const responseDiv = document.createElement('div');
                responseDiv.className = `agent-response response-${response.agent.specialization}`;
                
                const emoji = APP_CONFIG.specializationEmojis[response.agent.specialization] || '🤖';
                
                responseDiv.innerHTML = `
                    <div class="response-header">
                        <span class="response-badge bg-${this.getBadgeColor(response.agent.specialization)}-500/20 text-${this.getBadgeColor(response.agent.specialization)}-400">
                            ${response.agent.specialization}
                        </span>
                        <span class="text-sm text-gray-400">${emoji} ${response.agent.personality}</span>
                        ${response.metadata?.model ? `<span class="text-xs text-gray-500 ml-auto">${response.metadata.model}</span>` : ''}
                    </div>
                    <div class="prose prose-invert prose-sm max-w-none">
                        <p class="whitespace-pre-wrap text-gray-300">${this.formatResponse(response.response)}</p>
                    </div>
                `;
                card.appendChild(responseDiv);
            }
        });

        return card;
    }

    /**
     * Obtiene el color del badge según especialización
     */
    getBadgeColor(specialization) {
        const colors = {
            frontend: 'purple',
            backend: 'pink',
            devops: 'sky',
            seguridad: 'green'
        };
        return colors[specialization] || 'gray';
    }

    /**
     * Formatea la respuesta (convierte saltos de línea)
     */
    formatResponse(text) {
        if (!text) return '';
        return text
            .replace(/###\s+(.+)/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-white">$1</h3>')
            .replace(/##\s+(.+)/g, '<h4 class="text-base font-semibold mt-3 mb-1 text-white">$1</h4>')
            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    /**
     * Crea el HTML de la síntesis
     */
    createSynthesisHTML(synthesis) {
        let html = '';

        // Calidad de la síntesis
        const qualityClass = synthesis.quality?.score >= 80 ? 'quality-high' : 
                           synthesis.quality?.score >= 60 ? 'quality-medium' : 'quality-low';
        const qualityText = synthesis.quality?.score >= 80 ? 'Alta' : 
                          synthesis.quality?.score >= 60 ? 'Media' : 'Baja';
        
        html += `
            <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-400">Calidad de síntesis:</span>
                    <span class="quality-badge ${qualityClass}">
                        ${qualityText} (${synthesis.quality?.score || 0}/100)
                    </span>
                </div>
                <div class="text-sm text-gray-500">
                    Modelo: ${synthesis.model || 'N/A'}
                </div>
            </div>
        `;

        // Resumen
        if (synthesis.summary && synthesis.summary !== 'No disponible') {
            html += `
                <div class="synthesis-section">
                    <div class="synthesis-title">
                        <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        Resumen General
                    </div>
                    <div class="synthesis-content">
                        <p>${synthesis.summary}</p>
                    </div>
                </div>
            `;
        }

        // Puntos clave
        if (synthesis.keyPoints && synthesis.keyPoints.length > 0) {
            html += `
                <div class="synthesis-section">
                    <div class="synthesis-title">
                        <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Puntos Clave
                    </div>
                    <div class="synthesis-content">
                        <ul class="synthesis-list">
                            ${synthesis.keyPoints.map(point => `<li>${point}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }

        // Acuerdos y desacuerdos
        if (synthesis.agreementsDisagreements && synthesis.agreementsDisagreements !== 'No disponible') {
            html += `
                <div class="synthesis-section">
                    <div class="synthesis-title">
                        <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Acuerdos y Desacuerdos
                    </div>
                    <div class="synthesis-content">
                        <p>${synthesis.agreementsDisagreements}</p>
                    </div>
                </div>
            `;
        }

        // Recomendaciones
        if (synthesis.recommendations && synthesis.recommendations.length > 0) {
            html += `
                <div class="synthesis-section">
                    <div class="synthesis-title">
                        <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Recomendaciones
                    </div>
                    <div class="synthesis-content">
                        <ul class="synthesis-list">
                            ${synthesis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }

        // Plan de acción
        if (synthesis.actionPlan && synthesis.actionPlan.length > 0) {
            html += `
                <div class="synthesis-section">
                    <div class="synthesis-title">
                        <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Plan de Acción
                    </div>
                    <div class="synthesis-content">
                        <ul class="synthesis-list">
                            ${synthesis.actionPlan.map(step => `<li>${step}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }

        return html;
    }

    /**
     * Actualiza el estado de la UI
     */
    updateUIState(state) {
        const startBtn = document.getElementById('start-council-btn');
        const addAgentBtn = document.getElementById('add-agent-btn');
        const configPanel = document.getElementById('config-panel');

        switch (state) {
            case 'running':
                startBtn.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                `;
                addAgentBtn.classList.add('opacity-50', 'cursor-not-allowed');
                addAgentBtn.style.pointerEvents = 'none';
                break;

            case 'results':
                startBtn.innerHTML = 'Iniciar Consejo';
                addAgentBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                addAgentBtn.style.pointerEvents = 'auto';
                break;

            case 'idle':
            default:
                startBtn.innerHTML = 'Iniciar Consejo';
                addAgentBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                addAgentBtn.style.pointerEvents = 'auto';
                break;
        }
    }

    /**
     * Actualiza la barra de progreso
     */
    updateProgress(percent, label) {
        const progressBar = document.getElementById('progress-bar');
        const progressPercent = document.getElementById('progress-percent');
        const progressLabel = document.getElementById('progress-label');

        progressBar.style.width = `${percent}%`;
        progressPercent.textContent = `${percent}%`;
        if (label) {
            progressLabel.textContent = label;
        }
    }

    /**
     * Agrega un mensaje de estado
     */
    addStatusMessage(type, message) {
        const container = document.getElementById('status-messages');
        
        const dotClass = type === 'success' ? 'active' : 
                        type === 'error' ? 'error' : 'pending';

        const messageDiv = document.createElement('div');
        messageDiv.className = 'status-message';
        messageDiv.innerHTML = `
            <div class="status-dot ${dotClass}"></div>
            <span>${message}</span>
        `;

        container.appendChild(messageDiv);
        
        // Auto-scroll al último mensaje
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Muestra una notificación
     */
    showNotification(type, message) {
        // Crear notificación toast
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-8 px-6 py-4 rounded-xl shadow-2xl z-50 transform transition-all duration-300 translate-x-full opacity-0`;
        
        const bgColor = type === 'error' ? 'bg-red-500' : 
                       type === 'warning' ? 'bg-yellow-500' : 'bg-green-500';
        
        notification.classList.add(bgColor);
        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${type === 'error' ? 
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />' :
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />'
                    }
                </svg>
                <span class="text-white font-medium">${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animar entrada
        requestAnimationFrame(() => {
            notification.classList.remove('translate-x-full', 'opacity-0');
        });

        // Remover después de 5 segundos
        setTimeout(() => {
            notification.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    /**
     * Limpia el estado de la aplicación
     */
    clear() {
        // Resetear variables
        this.package = '';
        this.rounds = APP_CONFIG.defaults.rounds;
        this.isRunning = false;
        this.currentResult = null;

        // Resetear UI
        document.getElementById('package-input').value = '';
        document.getElementById('rounds-input').value = APP_CONFIG.defaults.rounds;
        document.getElementById('rounds-value').textContent = APP_CONFIG.defaults.rounds;
        
        document.getElementById('progress-section').classList.add('hidden');
        document.getElementById('results-section').classList.add('hidden');
        
        // Resetear agentes
        agentsManager.reset();
        
        // Resetear API service
        apiService.reset();

        // Resetear botón
        this.updateUIState('idle');
        
        // Resetear progreso
        this.updateProgress(0, 'Listo');
        document.getElementById('status-messages').innerHTML = '';

        this.showNotification('success', 'Aplicación reiniciada');
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new CouncilApp();
    app.init();
    
    // Hacer app disponible globalmente para debugging
    window.councilApp = app;
});