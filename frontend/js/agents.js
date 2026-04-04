/**
 * Gestión de agentes - THE COUNCIL
 * Maneja la creación, eliminación y configuración de agentes
 */

class AgentsManager {
    constructor() {
        this.agents = [];
        this.agentIdCounter = 0;
        this.personalities = [];
        this.specializations = [];
        this.onAgentsChange = null; // Callback cuando cambian los agentes
        this.currentRound = 0;
        this.totalRounds = 0;
        this.isProcessing = false;
    }

    /**
     * Inicializa el manager de agentes
     */
    async init() {
        await this.loadConfig();
        this.createDefaultAgents();
        this.render();
        this.setupMouseTracking();
    }

    /**
     * Configura el seguimiento del mouse para efectos reactivos
     */
    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            const cards = document.querySelectorAll('.agent-card');
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                card.style.setProperty('--mouse-x', `${x}%`);
                card.style.setProperty('--mouse-y', `${y}%`);
            });
        });
    }

    /**
     * Carga la configuración desde la API
     */
    async loadConfig() {
        try {
            const response = await fetch(APP_CONFIG.api.config);
            const data = await response.json();
            
            if (data.success) {
                this.personalities = data.config.personalities;
                this.specializations = data.config.specializations;
                
                // Agregar especialidad neutral y custom
                if (!this.specializations.find(s => s.name === 'neutral')) {
                    this.specializations.push({
                        name: 'neutral',
                        description: 'Análisis objetivo sin sesgo técnico'
                    });
                }
                if (!this.specializations.find(s => s.name === 'custom')) {
                    this.specializations.push({
                        name: 'custom',
                        description: 'Especialización personalizada...'
                    });
                }
                
                // Actualizar límites
                APP_CONFIG.defaults.minAgents = data.config.limits.minAgents;
                APP_CONFIG.defaults.maxAgents = data.config.limits.maxAgents;
                APP_CONFIG.defaults.minRounds = data.config.limits.minRounds;
                APP_CONFIG.defaults.maxRounds = data.config.limits.maxRounds;
            }
        } catch (error) {
            console.error('Error cargando configuración:', error);
            // Usar valores por defecto si falla la carga
            this.personalities = [
                { name: 'optimista', description: 'Enfoque positivo y constructivo' },
                { name: 'pesimista', description: 'Enfoque crítico y preventivo' },
                { name: 'creativo', description: 'Enfoque innovador y fuera de lo común' },
                { name: 'obsesivo', description: 'Enfoque detallado y exhaustivo' }
            ];
            this.specializations = APP_CONFIG.defaults.defaultSpecializations;
        }
    }

    /**
     * Crea los agentes por defecto
     */
    createDefaultAgents() {
        this.agents = APP_CONFIG.defaults.agents.map((agentConfig, index) => ({
            id: this.agentIdCounter++,
            personality: agentConfig.personality,
            specialization: agentConfig.specialization,
            customSpecialization: '' // Para especializaciones personalizadas
        }));
    }

    /**
     * Agrega un nuevo agente
     */
    addAgent() {
        if (this.agents.length >= APP_CONFIG.defaults.maxAgents) {
            alert(`Máximo ${APP_CONFIG.defaults.maxAgents} agentes permitidos`);
            return false;
        }

        // Seleccionar personalidad y especialización por defecto
        const availablePersonalities = this.personalities.map(p => p.name);
        const availableSpecializations = this.specializations
            .filter(s => s.name !== 'custom') // Excluir custom para auto-selección
            .map(s => s.name);
        
        // Intentar usar una combinación no duplicada
        let personality = availablePersonalities[this.agents.length % availablePersonalities.length];
        let specialization = availableSpecializations[this.agents.length % availableSpecializations.length];

        this.agents.push({
            id: this.agentIdCounter++,
            personality,
            specialization,
            customSpecialization: ''
        });

        this.render();
        this.notifyChange();
        return true;
    }

    /**
     * Elimina un agente por su ID
     */
    removeAgent(agentId) {
        if (this.agents.length <= APP_CONFIG.defaults.minAgents) {
            alert(`Mínimo ${APP_CONFIG.defaults.minAgents} agentes requeridos`);
            return false;
        }

        this.agents = this.agents.filter(a => a.id !== agentId);
        this.render();
        this.notifyChange();
        return true;
    }

    /**
     * Actualiza la personalidad de un agente
     */
    updateAgentPersonality(agentId, personality) {
        const agent = this.agents.find(a => a.id === agentId);
        if (agent) {
            agent.personality = personality;
            this.notifyChange();
        }
    }

    /**
     * Actualiza la especialización de un agente
     */
    updateAgentSpecialization(agentId, specialization) {
        const agent = this.agents.find(a => a.id === agentId);
        if (agent) {
            agent.specialization = specialization;
            if (specialization !== 'custom') {
                agent.customSpecialization = '';
            }
            this.render(); // Re-render para actualizar colores y nombre del modelo
            this.notifyChange();
        }
    }

    /**
     * Actualiza la especialización personalizada
     */
    updateCustomSpecialization(agentId, value) {
        const agent = this.agents.find(a => a.id === agentId);
        if (agent) {
            agent.customSpecialization = value;
            this.notifyChange();
        }
    }

    /**
     * Obtiene el nombre del modelo para un agente
     */
    getModelName(specialization) {
        return APP_CONFIG.specializationModels[specialization] || 'Qwen 3 4B';
    }

    /**
     * Obtiene la especialización para mostrar (nombre o custom)
     */
    getDisplaySpecialization(agent) {
        if (agent.specialization === 'custom' && agent.customSpecialization) {
            return agent.customSpecialization;
        }
        return agent.specialization;
    }

    /**
     * Obtiene la configuración actual de agentes para enviar a la API
     */
    getConfig() {
        return this.agents.map(agent => ({
            personality: agent.personality,
            specialization: agent.specialization === 'custom' 
                ? (agent.customSpecialization || 'custom') 
                : agent.specialization
        }));
    }

    /**
     * Renderiza los agentes en el DOM
     */
    render() {
        const grid = document.getElementById('agents-grid');
        const svg = document.getElementById('agents-svg');
        
        // Limpiar grid
        grid.innerHTML = '';
        
        // Renderizar cada agente
        this.agents.forEach((agent, index) => {
            const card = this.createAgentCard(agent, index);
            grid.appendChild(card);
        });

        // Actualizar conexiones SVG después de que el DOM se actualice
        requestAnimationFrame(() => {
            this.drawConnections(svg, grid);
        });
    }

    /**
     * Crea el elemento DOM para una tarjeta de agente
     */
    createAgentCard(agent, index) {
        const card = document.createElement('div');
        const displaySpecialization = this.getDisplaySpecialization(agent);
        const modelName = this.getModelName(agent.specialization);
        const specClass = APP_CONFIG.specializationClasses[agent.specialization] || '';
        
        card.className = `agent-card ${specClass}`;
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-fade-in-up');

        const emoji = APP_CONFIG.specializationEmojis[agent.specialization] || '🤖';

        // Crear HTML de la tarjeta
        let cardHTML = `
            <button class="agent-remove" data-agent-id="${agent.id}" title="Eliminar agente">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div class="agent-circle">
                ${emoji}
            </div>
            <div class="agent-info">
                <div class="agent-model-name">${modelName}</div>
                <div class="agent-model-info">${agent.personality} • ${displaySpecialization}</div>
            </div>
            <select class="agent-select" data-type="personality" data-agent-id="${agent.id}">
                ${this.personalities.map(p => `
                    <option value="${p.name}" ${p.name === agent.personality ? 'selected' : ''}>
                        ${p.name}
                    </option>
                `).join('')}
            </select>
            <select class="agent-select" data-type="specialization" data-agent-id="${agent.id}">
                ${this.specializations.map(s => `
                    <option value="${s.name}" ${s.name === agent.specialization ? 'selected' : ''}>
                        ${s.name === 'custom' ? 'Personalizada...' : s.name}
                    </option>
                `).join('')}
            </select>
        `;

        // Agregar input para especialización personalizada si corresponde
        if (agent.specialization === 'custom') {
            cardHTML += `
                <input 
                    type="text" 
                    class="agent-custom-input"
                    data-agent-id="${agent.id}"
                    placeholder="Ingresa especialización..."
                    value="${agent.customSpecialization || ''}"
                >
            `;
        }

        card.innerHTML = cardHTML;

        // Event listeners
        card.querySelector('.agent-remove').addEventListener('click', (e) => {
            e.preventDefault();
            this.removeAgent(agent.id);
        });

        card.querySelectorAll('.agent-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const type = e.target.dataset.type;
                const value = e.target.value;
                
                if (type === 'personality') {
                    this.updateAgentPersonality(agent.id, value);
                } else if (type === 'specialization') {
                    this.updateAgentSpecialization(agent.id, value);
                }
            });
        });

        // Input para especialización personalizada
        const customInput = card.querySelector('.agent-custom-input');
        if (customInput) {
            customInput.addEventListener('input', (e) => {
                this.updateCustomSpecialization(agent.id, e.target.value);
            });
            customInput.focus();
        }

        return card;
    }

    /**
     * Dibuja las conexiones entre agentes en el SVG
     */
    drawConnections(svg, grid) {
        // Limpiar SVG
        svg.innerHTML = '';
        
        if (this.agents.length < 2) return;

        // Obtener posiciones de las tarjetas
        const cards = grid.querySelectorAll('.agent-card');
        const positions = [];

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const containerRect = grid.getBoundingClientRect();
            
            positions.push({
                x: rect.left + rect.width / 2 - containerRect.left,
                y: rect.top + rect.height / 2 - containerRect.top
            });
        });

        // Ajustar SVG al tamaño del contenedor
        svg.setAttribute('width', grid.offsetWidth);
        svg.setAttribute('height', grid.offsetHeight);

        // Crear conexiones entre todos los agentes (grafo completo)
        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', positions[i].x);
                line.setAttribute('y1', positions[i].y);
                line.setAttribute('x2', positions[j].x);
                line.setAttribute('y2', positions[j].y);
                line.setAttribute('stroke', 'rgba(180, 180, 180, 0.2)');
                line.setAttribute('stroke-width', '1.5');
                line.setAttribute('class', 'connection-line');
                line.dataset.from = i;
                line.dataset.to = j;
                svg.appendChild(line);
            }
        }
    }

    /**
     * Activa una conexión específica (para mostrar flujo de ronda)
     */
    setActiveConnection(fromIndex, toIndex) {
        const lines = document.querySelectorAll('.connection-line');
        lines.forEach(line => {
            const lineFrom = parseInt(line.dataset.from);
            const lineTo = parseInt(line.dataset.to);
            
            if ((lineFrom === fromIndex && lineTo === toIndex) ||
                (lineFrom === toIndex && lineTo === fromIndex)) {
                line.classList.add('active');
            } else {
                line.classList.remove('active');
            }
        });
    }

    /**
     * Limpia todas las conexiones activas
     */
    clearActiveConnections() {
        const lines = document.querySelectorAll('.connection-line');
        lines.forEach(line => {
            line.classList.remove('active');
        });
    }

    /**
     * Establece el callback para cuando cambian los agentes
     */
    setOnChange(callback) {
        this.onAgentsChange = callback;
    }

    /**
     * Notifica el cambio de agentes
     */
    notifyChange() {
        if (this.onAgentsChange) {
            this.onAgentsChange(this.getConfig());
        }
    }

    /**
     * Marca un agente como "pensando" (con animación)
     */
    setThinking(agentId, isThinking) {
        const card = document.querySelector(`[data-agent-id="${agentId}"]`)?.closest('.agent-card');
        if (card) {
            if (isThinking) {
                card.classList.add('agent-thinking');
            } else {
                card.classList.remove('agent-thinking');
            }
        }
    }

    /**
     * Marca todos los agentes como pensando
     */
    setAllThinking(isThinking) {
        const cards = document.querySelectorAll('.agent-card');
        cards.forEach(card => {
            if (isThinking) {
                card.classList.add('agent-thinking');
            } else {
                card.classList.remove('agent-thinking');
            }
        });
    }

    /**
     * Valida que la configuración de agentes sea válida
     */
    validate() {
        if (this.agents.length < APP_CONFIG.defaults.minAgents) {
            return {
                valid: false,
                error: `Se requieren al menos ${APP_CONFIG.defaults.minAgents} agentes`
            };
        }

        // Verificar que todos tengan personalidad y especialización válidas
        for (const agent of this.agents) {
            if (!this.personalities.find(p => p.name === agent.personality)) {
                return {
                    valid: false,
                    error: `Personalidad inválida: ${agent.personality}`
                };
            }
            
            // Para especializaciones custom, verificar que tenga valor
            if (agent.specialization === 'custom' && !agent.customSpecialization?.trim()) {
                return {
                    valid: false,
                    error: 'Debe ingresar una especialización personalizada'
                };
            }
            
            // Verificar que la especialización exista (excepto custom que es válida)
            if (agent.specialization !== 'custom' && 
                !this.specializations.find(s => s.name === agent.specialization)) {
                return {
                    valid: false,
                    error: `Especialización inválida: ${agent.specialization}`
                };
            }
        }

        return { valid: true };
    }

    /**
     * Reinicia los agentes a los valores por defecto
     */
    reset() {
        this.agentIdCounter = 0;
        this.currentRound = 0;
        this.totalRounds = 0;
        this.isProcessing = false;
        this.createDefaultAgents();
        this.render();
        this.notifyChange();
    }

    /**
     * Establece el estado de procesamiento de rondas
     */
    setProcessing(isProcessing, currentRound = 0, totalRounds = 0) {
        this.isProcessing = isProcessing;
        this.currentRound = currentRound;
        this.totalRounds = totalRounds;
    }

    /**
     * Obtiene información del estado actual
     */
    getStatus() {
        return {
            isProcessing: this.isProcessing,
            currentRound: this.currentRound,
            totalRounds: this.totalRounds,
            agentCount: this.agents.length
        };
    }
}

// Exportar instancia global
const agentsManager = new AgentsManager();