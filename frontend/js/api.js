/**
 * API Service - Maneja la comunicación con el backend
 */

class ApiService {
    constructor() {
        this.currentConversationId = null;
        this.pollingInterval = null;
        this.pollingAttempts = 0;
    }

    /**
     * Inicia un consejo de agentes
     */
    async startCouncil(packageText, agents, rounds) {
        try {
            const response = await fetch(APP_CONFIG.api.council, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    package: packageText,
                    agents: agents,
                    rounds: rounds
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.currentConversationId = data.conversationId;
                return {
                    success: true,
                    data: data
                };
            } else {
                return {
                    success: false,
                    error: data.error || 'Error desconocido',
                    details: data.details
                };
            }
        } catch (error) {
            console.error('Error iniciando consejo:', error);
            return {
                success: false,
                error: 'Error de conexión con el servidor'
            };
        }
    }

    /**
     * Consulta el estado de un consejo
     */
    async getCouncilStatus(conversationId) {
        try {
            const response = await fetch(APP_CONFIG.api.councilStatus(conversationId));
            const data = await response.json();

            if (data.success) {
                return {
                    success: true,
                    status: data.status,
                    progress: data.progress,
                    currentRound: data.currentRound,
                    totalRounds: data.totalRounds,
                    hasSynthesis: data.hasSynthesis
                };
            } else {
                return {
                    success: false,
                    error: data.error
                };
            }
        } catch (error) {
            console.error('Error consultando estado:', error);
            return {
                success: false,
                error: 'Error de conexión'
            };
        }
    }

    /**
     * Inicia el polling para monitorear el progreso
     */
    startPolling(conversationId, onProgress, onComplete) {
        this.pollingAttempts = 0;
        
        const checkStatus = async () => {
            this.pollingAttempts++;
            
            if (this.pollingAttempts > APP_CONFIG.polling.maxAttempts) {
                this.stopPolling();
                onComplete({
                    success: false,
                    error: 'Tiempo máximo de espera excedido'
                });
                return;
            }

            const status = await this.getCouncilStatus(conversationId);
            
            if (status.success) {
                onProgress(status);
                
                if (status.status === 'completed' || status.hasSynthesis) {
                    this.stopPolling();
                    onComplete(status);
                }
            } else {
                console.error('Error en polling:', status.error);
            }
        };

        // Verificar inmediatamente
        checkStatus();
        
        // Luego hacer polling
        this.pollingInterval = setInterval(checkStatus, APP_CONFIG.polling.interval);
    }

    /**
     * Detiene el polling
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    /**
     * Obtiene la configuración del sistema
     */
    async getConfig() {
        try {
            const response = await fetch(APP_CONFIG.api.config);
            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    config: data.config
                };
            }
            return {
                success: false,
                error: 'Error cargando configuración'
            };
        } catch (error) {
            console.error('Error cargando configuración:', error);
            return {
                success: false,
                error: 'Error de conexión'
            };
        }
    }

    /**
     * Obtiene las personalidades disponibles
     */
    async getPersonalities() {
        try {
            const response = await fetch(APP_CONFIG.api.personalities);
            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    personalities: data.personalities
                };
            }
            return {
                success: false,
                error: 'Error cargando personalidades'
            };
        } catch (error) {
            console.error('Error cargando personalidades:', error);
            return {
                success: false,
                error: 'Error de conexión'
            };
        }
    }

    /**
     * Obtiene las especializaciones disponibles
     */
    async getSpecializations() {
        try {
            const response = await fetch(APP_CONFIG.api.specializations);
            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    specializations: data.specializations
                };
            }
            return {
                success: false,
                error: 'Error cargando especializaciones'
            };
        } catch (error) {
            console.error('Error cargando especializaciones:', error);
            return {
                success: false,
                error: 'Error de conexión'
            };
        }
    }

    /**
     * Verifica la salud del servidor
     */
    async healthCheck() {
        try {
            const response = await fetch(APP_CONFIG.api.health);
            const data = await response.json();
            
            return {
                success: data.success,
                services: data.services
            };
        } catch (error) {
            console.error('Error en health check:', error);
            return {
                success: false,
                error: 'Error de conexión'
            };
        }
    }

    /**
     * Obtiene el historial de una conversación
     */
    async getConversationHistory(conversationId) {
        try {
            const response = await fetch(`/api/conversations/${conversationId}/history`);
            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    history: data.history
                };
            }
            return {
                success: false,
                error: 'Error cargando historial'
            };
        } catch (error) {
            console.error('Error cargando historial:', error);
            return {
                success: false,
                error: 'Error de conexión'
            };
        }
    }

    /**
     * Reinicia el estado
     */
    reset() {
        this.stopPolling();
        this.currentConversationId = null;
        this.pollingAttempts = 0;
    }
}

// Exportar instancia global
const apiService = new ApiService();