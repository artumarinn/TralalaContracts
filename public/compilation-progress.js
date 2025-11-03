// Sistema de progreso para compilación de smart contracts

class CompilationProgressMonitor {
    constructor() {
        this.currentCompilationId = null;
        this.progressInterval = null;
        this.progressBar = null;
        this.progressMessage = null;
    }

    start(compilationId) {
        this.currentCompilationId = compilationId;

        // Crear/actualizar elementos de UI si no existen
        this.setupProgressUI();

        // Mostrar el contenedor de progreso
        const progressContainer = document.getElementById('compilationProgressContainer');
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }

        // Empezar a monitorear el progreso
        this.monitorProgress();

        // Actualizar cada segundo
        this.progressInterval = setInterval(() => this.monitorProgress(), 1000);
    }

    setupProgressUI() {
        // Crear contenedor si no existe
        let container = document.getElementById('compilationProgressContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'compilationProgressContainer';
            container.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 350px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                padding: 1.5rem;
                z-index: 1000;
                display: none;
                animation: slideUp 0.3s ease-out;
            `;

            container.innerHTML = `
                <div style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h4 style="margin: 0; color: #1f2937; font-size: 0.95rem;">🔨 Compilando Smart Contract</h4>
                        <span id="progressPercent" style="font-weight: 600; color: #6366f1; font-size: 0.9rem;">0%</span>
                    </div>
                    <div id="progressMessage" style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.75rem;">
                        Iniciando compilación...
                    </div>
                    <div style="width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
                        <div id="progressBar" style="
                            width: 0%;
                            height: 100%;
                            background: linear-gradient(90deg, #6366f1, #8b5cf6);
                            border-radius: 3px;
                            transition: width 0.3s ease;
                        "></div>
                    </div>
                </div>
                <div id="progressSteps" style="font-size: 0.8rem; color: #6b7280; line-height: 1.6;"></div>
            `;

            document.body.appendChild(container);

            // Agregar estilos de animación
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.6;
                    }
                }

                .progress-step {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.4rem;
                }

                .progress-step.active {
                    animation: pulse 1s infinite;
                }

                .progress-step-icon {
                    font-size: 0.9rem;
                    min-width: 1.2rem;
                }

                .progress-step-text {
                    flex: 1;
                }
            `;
            document.head.appendChild(style);
        }

        this.progressBar = document.getElementById('progressBar');
        this.progressMessage = document.getElementById('progressMessage');
    }

    async monitorProgress() {
        if (!this.currentCompilationId) {
            this.stop();
            return;
        }

        try {
            const response = await fetch(`/api/compilation-progress/${this.currentCompilationId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    // La compilación no está disponible aún, esperar
                    return;
                }
                throw new Error('Error al obtener progreso');
            }

            const data = await response.json();
            this.updateUI(data);

            // Si hay error o se completó, detener el monitoreo
            if (data.error || data.status === 'completed') {
                this.stop();
            }

        } catch (error) {
            console.error('Error monitoreando progreso:', error);
            // Continuar intentando
        }
    }

    updateUI(data) {
        const { progress, message, status } = data;

        // Actualizar barra de progreso
        if (this.progressBar) {
            this.progressBar.style.width = `${progress}%`;
        }

        // Actualizar porcentaje
        const percentElement = document.getElementById('progressPercent');
        if (percentElement) {
            percentElement.textContent = `${progress}%`;
        }

        // Actualizar mensaje
        if (this.progressMessage) {
            this.progressMessage.textContent = message;
        }

        // Actualizar pasos
        const stepsContainer = document.getElementById('progressSteps');
        if (stepsContainer) {
            const steps = this.getStepsForStatus(status, progress);
            stepsContainer.innerHTML = steps.map((step, index) => `
                <div class="progress-step ${step.active ? 'active' : ''}">
                    <span class="progress-step-icon">${step.icon}</span>
                    <span class="progress-step-text">${step.label}</span>
                </div>
            `).join('');
        }
    }

    getStepsForStatus(status, progress) {
        const steps = [
            { label: 'Compilando Rust', icon: '⚙️', active: progress < 40 },
            { label: 'Verificando WASM', icon: '✓', active: progress >= 40 && progress < 60 },
            { label: 'Optimizando', icon: '🚀', active: progress >= 60 && progress < 75 },
            { label: 'Guardando', icon: '💾', active: progress >= 75 && progress < 80 },
            { label: 'Desplegando', icon: '📤', active: progress >= 80 }
        ];

        // Marcar pasos completados
        steps.forEach((step, index) => {
            if (progress > (index + 1) * 20) {
                step.icon = '✅';
            }
        });

        return steps;
    }

    stop() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }

        // Dejar visible el estado final por 2 segundos, luego ocultar
        setTimeout(() => {
            const container = document.getElementById('compilationProgressContainer');
            if (container) {
                container.style.animation = 'slideUp 0.3s ease-out reverse';
                setTimeout(() => {
                    container.style.display = 'none';
                    container.style.animation = 'slideUp 0.3s ease-out';
                }, 300);
            }
        }, 2000);
    }
}

// Instancia global
window.compilationProgressMonitor = new CompilationProgressMonitor();
