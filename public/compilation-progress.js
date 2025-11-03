// Sistema de progreso para compilación de smart contracts

class CompilationProgressMonitor {
    constructor() {
        this.currentCompilationId = null;
        this.progressInterval = null;
        this.compilationData = null;
    }

    start(compilationId) {
        this.currentCompilationId = compilationId;

        // Empezar a monitorear el progreso
        this.monitorProgress();

        // Actualizar cada segundo
        this.progressInterval = setInterval(() => this.monitorProgress(), 1000);
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
            this.compilationData = data;
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
        const progressBar = document.getElementById('compilationProgressBar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        // Actualizar porcentaje
        const percentElement = document.getElementById('compilationPercent');
        if (percentElement) {
            percentElement.textContent = `${progress}%`;
        }

        // Actualizar mensaje de estado
        const statusElement = document.getElementById('compilationStatus');
        if (statusElement) {
            statusElement.textContent = message;
        }

        // Actualizar stepper vertical de compilación
        this.updateCompilationSteps(status, progress);
    }

    updateCompilationSteps(status, progress) {
        const stepsContainer = document.getElementById('compilationSteps');
        if (!stepsContainer) return;

        const steps = [
            { id: 'compile', icon: '⚙️', label: 'Compilando Rust', done: progress >= 40 },
            { id: 'verify', icon: '✓', label: 'Verificando WASM', done: progress >= 60 },
            { id: 'optimize', icon: '🚀', label: 'Optimizando', done: progress >= 75 },
            { id: 'export', icon: '💾', label: 'Guardando', done: progress >= 100 }
        ];

        stepsContainer.innerHTML = steps.map((step, index) => {
            const isActive = progress >= (index * 25) && progress < ((index + 1) * 25);
            const isDone = step.done && progress < 100;
            const isCompleted = progress >= 100;

            return `
                <div style="
                    display: flex;
                    align-items: center;
                    margin-bottom: ${index < steps.length - 1 ? '1.5rem' : '0'};
                    opacity: ${progress >= (index * 25) || progress >= 100 ? '1' : '0.5'};
                    transition: opacity 0.3s ease;
                ">
                    <!-- Icono -->
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: ${isDone || isCompleted ? '#10b981' : isActive ? '#6366f1' : '#e5e7eb'};
                        color: white;
                        font-size: 1.2rem;
                        font-weight: 600;
                        flex-shrink: 0;
                        ${isActive ? 'animation: pulse 1.5s infinite;' : ''}
                    ">
                        ${isDone || isCompleted ? '✓' : step.icon}
                    </div>

                    <!-- Línea vertical (excepto último) -->
                    ${index < steps.length - 1 ? `
                        <div style="
                            width: 2px;
                            height: 30px;
                            background: ${progress >= ((index + 1) * 25) ? '#10b981' : '#e5e7eb'};
                            margin: 0 auto;
                            margin-left: 19px;
                            transition: background 0.3s ease;
                        "></div>
                    ` : ''}

                    <!-- Texto -->
                    <span style="
                        margin-left: 1rem;
                        color: ${isDone || isCompleted ? '#10b981' : isActive ? '#6366f1' : '#6b7280'};
                        font-weight: ${isDone || isCompleted ? '600' : isActive ? '600' : '500'};
                        font-size: 0.95rem;
                    ">
                        ${step.label}
                    </span>
                </div>
            `;
        }).join('');
    }

    showResult(contractData) {
        // Mostrar resultado
        const compilationSteps = document.getElementById('compilationSteps');
        const progressDiv = document.querySelector('[style*="width: 100%"]').parentElement.parentElement;
        const compilationResult = document.getElementById('compilationResult');

        if (compilationSteps) compilationSteps.style.display = 'none';
        if (progressDiv) progressDiv.style.display = 'none';
        if (compilationResult) {
            compilationResult.classList.remove('hidden');
            this.renderResult(contractData);
        }
    }

    renderResult(data) {
        const resultContent = document.getElementById('resultContent');
        if (!resultContent) return;

        const features = Object.keys(data.features || {})
            .filter(f => data.features[f])
            .map(f => {
                const names = {
                    'mintable': 'Mintable',
                    'burnable': 'Burnable',
                    'pausable': 'Pausable',
                    'upgradeable': 'Upgradeable',
                    'governance': 'Governance',
                    'stakeable': 'Stakeable'
                };
                return names[f] || f;
            })
            .join(', ') || 'Ninguna';

        resultContent.innerHTML = `
            <div style="text-align: center; animation: fadeIn 0.5s ease;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                <h3 style="
                    color: #10b981;
                    margin: 0 0 1.5rem 0;
                    font-size: 1.5rem;
                ">¡Smart Contract Compilado!</h3>

                <!-- Tarjetas de información -->
                <div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    text-align: left;
                ">
                    <div style="
                        background: #f9fafb;
                        padding: 1rem;
                        border-radius: 0.75rem;
                        border-left: 3px solid #6366f1;
                    ">
                        <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.25rem;">Nombre</div>
                        <div style="font-weight: 600; color: #1f2937;">${data.name || '-'}</div>
                    </div>

                    <div style="
                        background: #f9fafb;
                        padding: 1rem;
                        border-radius: 0.75rem;
                        border-left: 3px solid #8b5cf6;
                    ">
                        <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.25rem;">Símbolo</div>
                        <div style="font-weight: 600; color: #1f2937;">${data.symbol || '-'}</div>
                    </div>

                    <div style="
                        background: #f9fafb;
                        padding: 1rem;
                        border-radius: 0.75rem;
                        border-left: 3px solid #ec4899;
                    ">
                        <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.25rem;">Supply</div>
                        <div style="font-weight: 600; color: #1f2937;">${(data.supply || 0).toLocaleString()}</div>
                    </div>

                    <div style="
                        background: #f9fafb;
                        padding: 1rem;
                        border-radius: 0.75rem;
                        border-left: 3px solid #f59e0b;
                    ">
                        <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.25rem;">Decimales</div>
                        <div style="font-weight: 600; color: #1f2937;">${data.decimals || 2}</div>
                    </div>
                </div>

                <!-- Características -->
                <div style="
                    background: #f0fdf4;
                    border: 1px solid #dcfce7;
                    border-radius: 0.75rem;
                    padding: 1rem;
                    margin-bottom: 2rem;
                    text-align: left;
                ">
                    <div style="font-weight: 600; color: #059669; margin-bottom: 0.5rem;">✨ Características Activadas</div>
                    <div style="color: #10b981; font-size: 0.9rem;">${features}</div>
                </div>

                <!-- Botones de acción -->
                <div style="
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                ">
                    <button onclick="window.location.reload()" style="
                        background: #6366f1;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 0.5rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background 0.2s;
                    " onmouseover="this.style.background='#4f46e5'" onmouseout="this.style.background='#6366f1'">
                        🔄 Crear Otro Contrato
                    </button>
                    <a href="https://soroban.stellar.org/" target="_blank" style="
                        background: #10b981;
                        color: white;
                        padding: 0.75rem 1.5rem;
                        border-radius: 0.5rem;
                        font-weight: 600;
                        text-decoration: none;
                        transition: background 0.2s;
                        display: inline-block;
                    " onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
                        📚 Docs de Soroban
                    </a>
                </div>

                <div style="
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    font-size: 0.9rem;
                    color: #1e40af;
                ">
                    <strong>ℹ️ Próximos pasos:</strong><br>
                    • Descarga el código Rust generado<br>
                    • Configura tu wallet en el testnet<br>
                    • Comparte tu contrato con la comunidad
                </div>
            </div>

            <style>
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
            </style>
        `;
    }

    stop() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }
}

// Instancia global
window.compilationProgressMonitor = new CompilationProgressMonitor();
