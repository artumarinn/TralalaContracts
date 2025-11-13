// Importar Stellar Wallets Kit desde CDN
// Nota: Usaremos una implementación simplificada para evitar problemas de importación

// Estado global de la aplicación
const appState = {
    currentStep: 1,
    totalSteps: 4,
    walletConnected: false,
    walletAddress: null,
    walletType: null,
    hasXLM: false,
    currentBalance: 0,
    selectedTemplate: null,
    usingBlocks: false,
    tokenData: {
        name: '',
        symbol: '',
        decimals: 2,
        initialSupply: 0,
        adminAddress: '',
        canMint: true,
        canBurn: true,
        isPausable: true,
        transferLimit: 0
    }
};

// Simplificar para usar solo Freighter por ahora
// const kit = new StellarWalletsKit({
//     network: WalletNetwork.TESTNET,
//     selectedWalletId: FREIGHTER_ID,
//     modules: [
//         new FreighterModule(),
//         new xBullModule(),
//         new AlbedoModule()
//     ]
// });

// Elementos del DOM
const elements = {
    stepper: document.querySelector('.stepper'),
    stepperLine: document.getElementById('stepperLine'),
    steps: document.querySelectorAll('.step'),
    stepContents: document.querySelectorAll('.step-content'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),

    // Wallet connection
    walletConnection: document.getElementById('walletConnection'),
    walletNotConnected: document.getElementById('walletNotConnected'),
    walletConnected: document.getElementById('walletConnected'),
    walletInfo: document.getElementById('walletInfo'),
    connectFreighter: document.getElementById('connectFreighter'),
    connectXbull: document.getElementById('connectXbull'),
    connectAlbedo: document.getElementById('connectAlbedo'),

    // XLM Funding
    walletNotConnectedForFunding: document.getElementById('walletNotConnectedForFunding'),
    walletConnectedForFunding: document.getElementById('walletConnectedForFunding'),
    userAddressForFunding: document.getElementById('userAddressForFunding'),
    currentBalance: document.getElementById('currentBalance'),
    fundAccountBtn: document.getElementById('fundAccountBtn'),
    fundingResult: document.getElementById('fundingResult'),

    // Blocks interface
    blocksInterface: document.getElementById('blocksInterface'),
    resetBlocksBtn: document.getElementById('resetBlocksBtn'),
    viewBlocksCodeBtn: document.getElementById('viewBlocksCodeBtn'),
    validateBlocksBtn: document.getElementById('validateBlocksBtn'),
    blockValidationResult: document.getElementById('blockValidationResult'),

    // Form inputs
    tokenName: document.getElementById('tokenName'),
    tokenSymbol: document.getElementById('tokenSymbol'),
    tokenDecimals: document.getElementById('tokenDecimals'),
    initialSupply: document.getElementById('initialSupply'),
    adminAddress: document.getElementById('adminAddress'),
    canMint: document.getElementById('canMint'),
    canBurn: document.getElementById('canBurn'),
    isPausable: document.getElementById('isPausable'),
    transferLimit: document.getElementById('transferLimit'),

    // Summary and deployment
    tokenSummary: document.getElementById('tokenSummary'),
    summaryContent: document.getElementById('summaryContent'),
    deploymentStatus: document.getElementById('deploymentStatus'),
    deploymentProgress: document.getElementById('deploymentProgress'),
    deploymentMessage: document.getElementById('deploymentMessage'),
    deploymentResult: document.getElementById('deploymentResult'),
    resultDetails: document.getElementById('resultDetails'),

    // Modal elements
    contractModal: document.getElementById('contractModal'),
    closeModal: document.getElementById('closeModal'),
    contractCode: document.getElementById('contractCode'),
    downloadBtn: document.getElementById('downloadBtn'),
    copyBtn: document.getElementById('copyBtn')
};

// Funciones de utilidad
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    if (type === 'success') {
        toast.style.background = '#10b981';
    } else if (type === 'error') {
        toast.style.background = '#dc2626';
    } else {
        toast.style.background = '#6366f1';
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}

// Funciones del stepper
function updateStepper() {
    // Actualizar pasos
    elements.steps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');

        if (stepNumber === appState.currentStep) {
            step.classList.add('active');
        } else if (stepNumber < appState.currentStep) {
            step.classList.add('completed');
        }
    });

    // Actualizar contenido de pasos
    elements.stepContents.forEach((content, index) => {
        content.classList.remove('active');
        if (index + 1 === appState.currentStep) {
            content.classList.add('active');
        }
    });

    // Actualizar línea de progreso
    const progress = ((appState.currentStep - 1) / (appState.totalSteps - 1)) * 100;
    elements.stepperLine.style.width = `${progress}%`;

    // Actualizar botones
    elements.prevBtn.disabled = appState.currentStep === 1;

    if (appState.currentStep === appState.totalSteps) {
        elements.nextBtn.textContent = 'Crear Smart Contract';
    } else {
        elements.nextBtn.textContent = 'Siguiente';
    }

    // Actualizar contenido dinámico según el paso
    updateStepContent();
}

function goToStep(stepNumber) {
    if (stepNumber >= 1 && stepNumber <= appState.totalSteps) {
        appState.currentStep = stepNumber;
        updateStepper();
    }
}

function nextStep() {
    if (validateCurrentStep()) {
        if (appState.currentStep < appState.totalSteps) {
            goToStep(appState.currentStep + 1);
        } else {
            deployToken();
        }
    }
}

function prevStep() {
    if (appState.currentStep > 1) {
        goToStep(appState.currentStep - 1);
    }
}

// Función para actualizar contenido dinámico
function updateStepContent() {
    switch (appState.currentStep) {
        case 2:
            // Paso 2: Seleccionar Plantilla
            addTemplateListeners();
            break;
        case 3:
            // Paso 3: Configurar con Bloques
            if (!window.blocklyWorkspace) {
                setTimeout(() => {
                    initializeBlockly();
                }, 500);
            }
            updateTokenSummary();
            break;
        case 4:
            // Paso 4: Revisar y Desplegar
            if (!window.blocklyWorkspace) {
                setTimeout(() => {
                    initializeBlockly();
                }, 500);
            }
            updateCodePreview();
            updateTokenSummary();
            updateDeploymentPipeline();
            break;
    }
}

// Validación de pasos
function validateCurrentStep() {
    switch (appState.currentStep) {
        case 1:
            return validateWalletConnection();
        case 2:
            return validateTemplateSelection();
        case 3:
            return validateTokenData();
        case 4:
            return true; // El paso 4 se valida antes de desplegar
        default:
            return true;
    }
}

function validateTemplateSelection() {
    if (!appState.selectedTemplate) {
        showToast('Por favor, selecciona una plantilla para continuar', 'error');
        return false;
    }
    return true;
}

function validateWalletConnection() {
    if (!appState.walletConnected) {
        showToast('Por favor, conecta tu wallet primero', 'error');
        return false;
    }
    return true;
}

function validateXLMBalance() {
    if (!appState.walletConnected) {
        showToast('Por favor, conecta tu wallet primero', 'error');
        return false;
    }

    if (appState.currentBalance < 5) {
        showToast('Necesitas al menos 5 XLM para crear un token. Usa el Friendbot para obtener XLM gratuitos.', 'error');
        return false;
    }

    return true;
}

function validateTokenData() {
    // Validar que Blockly esté inicializado
    if (!window.blocklyWorkspace) {
        showToast('Blockly aún no se ha inicializado. Por favor espera...', 'error');
        return false;
    }

    // Validar que exista el bloque de contrato principal
    const contractBlocks = window.blocklyWorkspace.getBlocksByType('contract_settings', false);
    if (contractBlocks.length === 0) {
        showToast('Por favor, configura tu contrato usando los bloques', 'error');
        return false;
    }

    const contractBlock = contractBlocks[0];
    let currentBlock = contractBlock.getInputTargetBlock('SETTINGS');
    let hasName = false;
    let contractName = '';

    // Buscar el nombre del contrato
    while (currentBlock) {
        if (currentBlock.type === 'contract_name') {
            contractName = currentBlock.getFieldValue('NAME');
            if (contractName && contractName.trim() !== '') {
                hasName = true;
            }
        }
        currentBlock = currentBlock.getNextBlock();
    }

    if (!hasName) {
        showToast('El nombre del contrato es requerido', 'error');
        return false;
    }

    // Actualizar appState con datos básicos del contrato
    appState.tokenData = appState.tokenData || {};
    appState.tokenData.name = contractName;
    appState.tokenData.adminAddress = appState.walletAddress;

    return true;
}

function validateFormData() {
    let isValid = true;

    // Validar nombre del token
    const tokenName = elements.tokenName.value.trim();
    if (!tokenName) {
        showError('tokenNameError', 'El nombre del token es requerido');
        isValid = false;
    } else if (tokenName.length < 3) {
        showError('tokenNameError', 'El nombre debe tener al menos 3 caracteres');
        isValid = false;
    } else {
        hideError('tokenNameError');
        appState.tokenData.name = tokenName;
    }

    // Validar símbolo del token
    const tokenSymbol = elements.tokenSymbol.value.trim().toUpperCase();
    if (!tokenSymbol) {
        showError('tokenSymbolError', 'El símbolo del token es requerido');
        isValid = false;
    } else if (tokenSymbol.length > 12) {
        showError('tokenSymbolError', 'El símbolo no puede tener más de 12 caracteres');
        isValid = false;
    } else if (!/^[A-Z0-9]+$/.test(tokenSymbol)) {
        showError('tokenSymbolError', 'El símbolo solo puede contener letras mayúsculas y números');
        isValid = false;
    } else {
        hideError('tokenSymbolError');
        appState.tokenData.symbol = tokenSymbol;
    }

    // Para smart contracts genéricos, no necesitamos validar cantidad inicial
    // Los datos se obtienen de los bloques de Blockly

    // Actualizar otros datos
    appState.tokenData.decimals = parseInt(elements.tokenDecimals.value);
    appState.tokenData.adminAddress = appState.walletAddress;
    appState.tokenData.canMint = elements.canMint.checked;
    appState.tokenData.canBurn = elements.canBurn.checked;
    appState.tokenData.isPausable = elements.isPausable.checked;
    appState.tokenData.transferLimit = parseInt(elements.transferLimit.value) || 0;

    return isValid;
}

function validateBlocksData() {
    // Validar datos de los bloques usando la función existente
    const validation = validateBlocks();
    if (validation.isValid) {
        // Actualizar el estado con los datos de los bloques
        const blockData = validation.data;

        // Mapear los datos de los bloques al formato esperado por el servidor
        appState.tokenData = {
            name: blockData.token_name || '',
            symbol: blockData.token_symbol || '',
            decimals: parseInt(blockData.token_decimals) || 2,
            initialSupply: parseInt(blockData.initial_supply) || 0,
            adminAddress: appState.walletAddress,
            canMint: blockData.mint_enabled || false,
            canBurn: blockData.burn_enabled || false,
            isPausable: false, // Los bloques no tienen este campo aún
            transferLimit: 0   // Los bloques no tienen este campo aún
        };

        console.log('📋 Datos del token extraídos de bloques:', appState.tokenData);
        return true;
    } else {
        showToast(validation.errors[0], 'error');
        return false;
    }
}

// Funciones de plantillas
function addTemplateListeners() {
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remover selección anterior
            templateCards.forEach(c => c.classList.remove('selected'));
            // Agregar selección a la tarjeta actual
            this.classList.add('selected');

            const template = this.getAttribute('data-template');
            appState.selectedTemplate = template;
            console.log('📋 Plantilla seleccionada:', template);
            applyTemplate(template);
        });
    });
}

function applyTemplate(template) {
    console.log('🎨 Aplicando plantilla:', template);
    appState.selectedTemplate = template;
    showToast(`✅ Plantilla "${template.toUpperCase()}" seleccionada`, 'success');
}

// Funciones de conexión de wallet
async function connectWallet(walletType) {
    try {
        showToast('Conectando wallet...', 'info');

        let address;

        if (walletType === 'FREIGHTER' || !walletType) {
            // Usar Freighter directamente
            if (!window.freighterApi) {
                throw new Error('Freighter no está instalado. Ve a freighter.app para instalarlo.');
            }

            address = await window.freighterApi.getPublicKey();
            appState.walletType = 'FREIGHTER';
        } else {
            throw new Error(`Wallet tipo ${walletType} no soportado aún`);
        }

        appState.walletConnected = true;
        appState.walletAddress = address;

        // Actualizar UI
        elements.walletNotConnected.classList.add('hidden');
        elements.walletConnected.classList.remove('hidden');
        elements.walletConnection.classList.add('connected');
        elements.walletInfo.innerHTML = `
            <div><strong>Wallet:</strong> ${getWalletName(appState.walletType)}</div>
            <div><strong>Dirección:</strong> ${address}</div>
            <div><strong>Red:</strong> Testnet</div>
        `;

        // Llenar automáticamente la dirección del administrador
        if (elements.adminAddress) {
            elements.adminAddress.value = address;
        }

        // Actualizar interfaces de funding
        updateFundingInterface();

        // Obtener balance inicial
        await updateBalance();

        showToast('Wallet conectado exitosamente', 'success');

    } catch (error) {
        console.error('Error conectando wallet:', error);
        showToast(`Error conectando wallet: ${error.message}`, 'error');
    }
}

function getWalletName(walletType) {
    const names = {
        'FREIGHTER': 'Freighter',
        'XBULL': 'xBull',
        'ALBEDO': 'Albedo'
    };
    return names[walletType] || 'Desconocido';
}

// Función para actualizar la interfaz de funding
function updateFundingInterface() {
    if (!elements.walletNotConnectedForFunding || !elements.walletConnectedForFunding) return;

    if (appState.walletConnected) {
        elements.walletNotConnectedForFunding.classList.add('hidden');
        elements.walletConnectedForFunding.classList.remove('hidden');

        if (elements.userAddressForFunding) {
            elements.userAddressForFunding.textContent = appState.walletAddress;
        }
    } else {
        elements.walletNotConnectedForFunding.classList.remove('hidden');
        elements.walletConnectedForFunding.classList.add('hidden');
    }
}

// Función para obtener balance de XLM
async function updateBalance() {
    if (!appState.walletConnected || !elements.currentBalance) return;

    try {
        const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
        const account = await server.loadAccount(appState.walletAddress);

        const xlmBalance = account.balances.find(balance => balance.asset_type === 'native');
        const balance = xlmBalance ? parseFloat(xlmBalance.balance) : 0;

        appState.currentBalance = balance;
        appState.hasXLM = balance >= 5;

        elements.currentBalance.textContent = `${balance.toFixed(2)} XLM`;

        if (balance >= 5) {
            elements.currentBalance.style.color = 'var(--stellar-secondary)';
        } else {
            elements.currentBalance.style.color = '#dc2626';
        }

    } catch (error) {
        console.error('Error obteniendo balance:', error);
        elements.currentBalance.textContent = 'Error obteniendo balance';
        elements.currentBalance.style.color = '#dc2626';
    }
}

// Función para solicitar XLM del Friendbot
async function fundAccount() {
    if (!appState.walletConnected) {
        showToast('Conecta tu wallet primero', 'error');
        return;
    }

    try {
        elements.fundAccountBtn.disabled = true;
        elements.fundAccountBtn.textContent = '⏳ Pidiendo XLM...';

        showToast('Solicitando XLM al Friendbot...', 'info');

        const response = await fetch(`https://friendbot.stellar.org?addr=${appState.walletAddress}`);

        if (!response.ok) {
            throw new Error(`Error del Friendbot: ${response.status}`);
        }

        // Esperar un poco para que se propague la transacción
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Actualizar balance
        await updateBalance();

        elements.fundingResult.classList.remove('hidden');
        elements.fundingResult.style.background = '#10b981';
        elements.fundingResult.style.color = 'white';
        elements.fundingResult.textContent = '✅ ¡XLM recibidos! Tu cuenta ahora tiene fondos para crear tokens.';

        showToast('¡XLM recibidos exitosamente!', 'success');

    } catch (error) {
        console.error('Error funding account:', error);

        elements.fundingResult.classList.remove('hidden');
        elements.fundingResult.style.background = '#dc2626';
        elements.fundingResult.style.color = 'white';
        elements.fundingResult.textContent = `❌ Error: ${error.message}`;

        showToast(`Error solicitando XLM: ${error.message}`, 'error');

    } finally {
        elements.fundAccountBtn.disabled = false;
        elements.fundAccountBtn.textContent = '🤖 Pedir XLM al Friendbot';
    }
}

// Función para alternar entre bloques y formulario
function toggleInterface(useBlocks) {
    appState.usingBlocks = useBlocks;

    if (useBlocks) {
        elements.blocksInterface.classList.remove('hidden');
        elements.formInterface.classList.add('hidden');
        elements.useBlocksBtn.classList.add('btn-primary');
        elements.useBlocksBtn.classList.remove('btn-secondary');
        elements.useFormBtn.classList.add('btn-secondary');
        elements.useFormBtn.classList.remove('btn-primary');

        // Inicializar Blockly si no está inicializado
        if (!window.blocklyWorkspace) {
            initializeBlockly();
        }
    } else {
        elements.blocksInterface.classList.add('hidden');
        elements.formInterface.classList.remove('hidden');
        elements.useFormBtn.classList.add('btn-primary');
        elements.useFormBtn.classList.remove('btn-secondary');
        elements.useBlocksBtn.classList.add('btn-secondary');
        elements.useBlocksBtn.classList.remove('btn-primary');
    }
}

// Función de despliegue mejorada
/**
 * Deploy compiled WASM to Stellar Testnet
 * @param {string} wasmBase64 - Base64-encoded WASM binary
 * @param {object} contractData - Contract metadata
 * @returns {Promise<{contractId: string, transactionHash: string}>}
 */
async function deployToStellar(wasmBase64, contractData) {
    console.log('🚀 Deployando contrato a Stellar Testnet...');

    try {
        // Verify Freighter is available
        if (!window.freighterApi) {
            throw new Error('Freighter wallet no está instalada. Instálala desde freighter.app');
        }

        // Get user's public key
        const userPublicKey = await window.freighterApi.getPublicKey();
        console.log('👤 Usuario:', userPublicKey);

        // Request deployment via backend (which will use Stellar SDK)
        const deployResponse = await fetch('/api/deploy-contract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                wasmBase64: wasmBase64,
                userAddress: userPublicKey,
                contractData: {
                    name: contractData.name,
                    symbol: contractData.symbol,
                    decimals: contractData.decimals || 7,
                    initialSupply: contractData.supply || 0
                }
            })
        });

        if (!deployResponse.ok) {
            const errorData = await deployResponse.json();
            throw new Error(errorData.error || 'Error deployando contrato');
        }

        const deployResult = await deployResponse.json();
        console.log('✅ Deployment result:', deployResult);

        if (!deployResult.success) {
            throw new Error(deployResult.error || 'Deployment failed');
        }

        // Extract contract ID from deployment result
        const contractId = deployResult.contractId || deployResult.contract_id;
        const transactionHash = deployResult.transactionHash || deployResult.hash;

        if (!contractId) {
            throw new Error('No se pudo obtener el Contract ID del deployment');
        }

        console.log('🎉 Contrato deployado exitosamente!');
        console.log('   Contract ID:', contractId);
        console.log('   TX Hash:', transactionHash);

        return {
            contractId: contractId,
            transactionHash: transactionHash,
            network: 'testnet',
            deployed: true
        };

    } catch (error) {
        console.error('❌ Error en deployment a Stellar:', error);
        throw new Error(`Error deployando a Stellar: ${error.message}`);
    }
}

async function deployToken() {
    try {
        console.log('🚀 Iniciando despliegue de Smart Contract...');

        // Leer datos de los bloques
        const blocklyData = readBlocklyData();
        if (!blocklyData || !blocklyData.name) {
            showToast('Por favor, configura el nombre de tu contrato', 'error');
            return;
        }

        // Mostrar estado de despliegue
        const contractSummary = document.getElementById('contractSummary');
        const deploymentPipeline = document.getElementById('deploymentPipeline');

        if (contractSummary) contractSummary.style.display = 'none';
        if (deploymentPipeline) deploymentPipeline.style.display = 'block';

        elements.nextBtn.disabled = true;
        elements.prevBtn.disabled = true;

        console.log('📊 Datos del contrato:');
        console.log('   Nombre:', blocklyData.name);
        console.log('   Símbolo:', blocklyData.symbol);
        console.log('   Suministro:', blocklyData.supply);

        // Paso 1: Compilar contrato
        const deploymentMessage = document.getElementById('deploymentMessage');
        if (deploymentMessage) deploymentMessage.textContent = 'Compilando Smart Contract...';

        // Generar código Rust
        const rustCode = generateAdvancedRustCode(blocklyData);
        console.log('✅ Código Rust generado');

        // Paso 2: Enviar al servidor para compilar
        if (deploymentMessage) deploymentMessage.textContent = 'Enviando a servidor para compilación...';

        const response = await fetch('/api/build-smart-contract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: blocklyData.symbol || 'TOKEN',
                amount: blocklyData.supply || 1000,
                userAddress: appState.walletAddress,
                contractData: {
                    name: blocklyData.name,
                    symbol: blocklyData.symbol || 'TOKEN',
                    decimals: blocklyData.decimals || 2,
                    supply: blocklyData.supply || 1000,
                    rustCode: rustCode
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error del servidor:', errorText);
            throw new Error(`Error del servidor: ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Respuesta del servidor:', result);

        if (!result.success) {
            throw new Error(result.details || 'Error desconocido del servidor');
        }

        // Paso 3: Deploy to Stellar Testnet
        if (deploymentMessage) deploymentMessage.textContent = '🚀 Desplegando a Stellar Testnet...';

        // Deploy the compiled WASM to Stellar
        const deploymentData = await deployToStellar(result.wasmBase64, blocklyData);

        console.log('✅ Contrato deployado a Stellar:', deploymentData);

        // Paso 4: Mostrar resultado con link al explorador
        if (deploymentMessage) deploymentMessage.textContent = '✅ ¡Contrato deployado exitosamente!';

        const deploymentResult = document.getElementById('deploymentResult');
        const resultContent = document.getElementById('resultContent');

        if (deploymentPipeline) deploymentPipeline.style.display = 'none';
        if (deploymentResult) deploymentResult.classList.remove('hidden');

        if (resultContent) {
            const explorerUrl = `https://stellar.expert/explorer/testnet/contract/${deploymentData.contractId}`;

            resultContent.innerHTML = `
                <div style="text-align: center; max-width: 600px; margin: 0 auto;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                    <h2 style="color: #10b981; margin-bottom: 1rem;">¡Smart Contract Deployado a Stellar Testnet!</h2>

                    <!-- Contract ID destacado -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 1rem; padding: 1.5rem; margin-bottom: 2rem; color: white;">
                        <div style="font-size: 0.85rem; margin-bottom: 0.5rem; opacity: 0.9;">Contract ID</div>
                        <div style="font-family: monospace; font-size: 0.9rem; word-break: break-all; background: rgba(255,255,255,0.2); padding: 0.75rem; border-radius: 0.5rem;">
                            ${deploymentData.contractId}
                        </div>
                    </div>

                    <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 1rem; padding: 1.5rem; margin-bottom: 2rem; text-align: left;">
                        <h3 style="margin: 0 0 1rem 0; color: #059669;">📄 Detalles del Contrato</h3>
                        <div style="display: grid; gap: 0.75rem;">
                            <div><strong>Nombre:</strong> ${blocklyData.name}</div>
                            <div><strong>Símbolo:</strong> ${blocklyData.symbol || 'TOKEN'}</div>
                            <div><strong>Suministro Inicial:</strong> ${(blocklyData.supply || 0).toLocaleString()}</div>
                            <div><strong>Decimales:</strong> ${blocklyData.decimals || 2}</div>
                            <div><strong>Admin:</strong> <code style="font-size: 0.8rem; background: #dcfce7; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">${appState.walletAddress.substring(0, 8)}...${appState.walletAddress.substring(appState.walletAddress.length - 8)}</code></div>
                            <div><strong>Red:</strong> Stellar Testnet</div>
                        </div>
                    </div>

                    <!-- Link al explorador destacado -->
                    <a href="${explorerUrl}"
                       target="_blank"
                       style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; background: #f59e0b; color: white; padding: 1.25rem; text-decoration: none; border-radius: 0.75rem; font-weight: 600; margin-bottom: 2rem; font-size: 1.1rem; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);">
                        🔍 Ver en Stellar Explorer
                    </a>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                        <a href="https://github.com/stellar/soroban-cli"
                           target="_blank"
                           style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: #6366f1; color: white; padding: 1rem; text-decoration: none; border-radius: 0.75rem; font-weight: 600;">
                            🛠️ Soroban CLI
                        </a>
                        <a href="https://soroban.stellar.org/"
                           target="_blank"
                           style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: #10b981; color: white; padding: 1rem; text-decoration: none; border-radius: 0.75rem; font-weight: 600;">
                            📚 Docs Soroban
                        </a>
                    </div>

                    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1.5rem; text-align: left;">
                        <strong>ℹ️ Próximos pasos:</strong><br>
                        • Click "Ver en Stellar Explorer" para verificar tu contrato en blockchain<br>
                        • Interactúa con el contrato usando Soroban CLI<br>
                        • Comparte tu contrato deployado con la comunidad
                    </div>

                    <button onclick="window.location.reload()"
                            style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: #6b7280; color: white; padding: 1rem; border: none; width: 100%; border-radius: 0.75rem; font-weight: 600; cursor: pointer;">
                        🔄 Crear Otro Contrato
                    </button>
                </div>
            `;
        }

        showToast('🎉 ¡Smart Contract deployado a Stellar Testnet!', 'success');

    } catch (error) {
        console.error('❌ Error desplegando Smart Contract:', error);

        const deploymentMessage = document.getElementById('deploymentMessage');
        if (deploymentMessage) deploymentMessage.textContent = `Error: ${error.message}`;

        showToast(`Error creando Smart Contract: ${error.message}`, 'error');

        // Re-habilitar botones
        elements.nextBtn.disabled = false;
        elements.prevBtn.disabled = false;
    }
}

// Función para actualizar el preview del código
function updateCodePreview() {
    const contractPreview = document.getElementById('contractPreview');
    if (!contractPreview) return;

    if (!window.blocklyWorkspace) {
        contractPreview.textContent = '// Blockly aún se está inicializando...';
        return;
    }

    try {
        const blocklyData = readBlocklyData();
        if (!blocklyData || !blocklyData.name) {
            contractPreview.textContent = '// Configura el nombre de tu contrato para ver el preview...';
            return;
        }

        const rustCode = generateAdvancedRustCode(blocklyData);
        contractPreview.textContent = rustCode;
        console.log('✅ Preview actualizado');
    } catch (error) {
        console.error('❌ Error actualizando preview:', error);
        contractPreview.textContent = `// Error generando preview:\n// ${error.message}`;
    }
}

// Función para generar código Rust avanzado
function generateAdvancedRustCode(data) {
    const features = [];
    const dataFeatures = data.features || {};

    if (dataFeatures.mintable) features.push('Mintable');
    if (dataFeatures.burnable) features.push('Burnable');
    if (dataFeatures.pausable) features.push('Pausable');

    return `// Smart Contract: ${data.name || 'Mi Token'}
// Generado automáticamente por Tralalero Contracts
#![no_std]

use soroban_sdk::{
    contract, contractimpl, Address, Env, String, Symbol,
    token::{self, Interface as TokenInterface},
};

// Constantes del contrato
const TOKEN_NAME: &str = "${data.name || 'Mi Token'}";
const TOKEN_SYMBOL: &str = "${data.symbol || 'TOKEN'}";
const DECIMALS: u32 = ${data.decimals || 2};
const INITIAL_SUPPLY: i128 = ${data.supply || 1000};

#[contract]
pub struct TokenContract;

#[contractimpl]
impl TokenContract {
    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&Symbol::new(&env, "ADMIN"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "TOTAL_SUPPLY"), &INITIAL_SUPPLY);
    }

    pub fn name(env: Env) -> String {
        String::from_str(&env, TOKEN_NAME)
    }

    pub fn symbol(env: Env) -> String {
        String::from_str(&env, TOKEN_SYMBOL)
    }

    pub fn decimals(env: Env) -> u32 {
        DECIMALS
    }
}

// Características: ${features.join(', ') || 'Básico'}`;
}

// Función para leer datos de Blockly
function readBlocklyData() {
    if (!window.blocklyWorkspace) {
        return null;
    }

    const contractBlock = window.blocklyWorkspace.getBlocksByType('contract_settings', false)[0];
    if (!contractBlock) {
        return null;
    }

    const data = {
        name: '',
        symbol: 'TOKEN',
        supply: 1000,
        decimals: 2,
        admin: appState.walletAddress || '',
        features: {}
    };

    let currentBlock = contractBlock.getInputTargetBlock('SETTINGS');

    while (currentBlock) {
        switch (currentBlock.type) {
            case 'contract_name':
                data.name = currentBlock.getFieldValue('NAME');
                break;
            case 'token_symbol':
                data.symbol = currentBlock.getFieldValue('SYMBOL');
                break;
            case 'token_supply':
                data.supply = parseInt(currentBlock.getFieldValue('SUPPLY')) || 1000;
                break;
        }
        currentBlock = currentBlock.getNextBlock();
    }

    return data;
}

// Función para actualizar el pipeline de despliegue
function updateDeploymentPipeline() {
    const pipeline = document.getElementById('deploymentPipeline');
    if (!pipeline) return;

    // Resetear estados
    const steps = pipeline.querySelectorAll('.pipeline-step');
    steps.forEach(step => {
        const status = step.querySelector('.step-status');
        status.className = 'step-status pending';
        status.textContent = '⏳';
    });
}

// Función para actualizar el resumen del contrato
function updateContractSummary() {
    if (appState.currentStep === 3 && elements.summaryContent) {
        // Obtener datos de los bloques
        const data = generateRustCode();

        if (data && Object.keys(data).length > 0 && data.name) {
            const stateVars = data.state || [];
            const functions = data.functions || [];

            elements.summaryContent.innerHTML = `
                <div style="padding: 1rem; background: white; border-radius: 0.5rem; border: 1px solid rgba(61, 81, 128, 0.1);">
                    <strong>Nombre:</strong> ${data.name || 'Sin definir'}
                </div>
                <div style="padding: 1rem; background: white; border-radius: 0.5rem; border: 1px solid rgba(61, 81, 128, 0.1);">
                    <strong>Versión:</strong> ${data.version || '0.1.0'}
                </div>
                <div style="padding: 1rem; background: white; border-radius: 0.5rem; border: 1px solid rgba(61, 81, 128, 0.1);">
                    <strong>Administrador:</strong> ${data.admin || 'Sin definir'}
                </div>
                <div style="padding: 1rem; background: white; border-radius: 0.5rem; border: 1px solid rgba(61, 81, 128, 0.1);">
                    <strong>Variables de Estado:</strong> ${stateVars.length > 0 ? stateVars.map(v => `${v.name} (${v.type})`).join(', ') : 'Ninguna'}
                </div>
                <div style="padding: 1rem; background: white; border-radius: 0.5rem; border: 1px solid rgba(61, 81, 128, 0.1);">
                    <strong>Funciones:</strong> ${functions.length > 0 ? functions.map(f => `${f.name}() -> ${f.returns}`).join(', ') : 'Ninguna'}
                </div>
            `;
        } else {
            elements.summaryContent.innerHTML = `
                <div style="padding: 2rem; background: white; border-radius: 0.5rem; border: 1px solid rgba(61, 81, 128, 0.1); text-align: center; color: var(--stellar-text-light); grid-column: 1 / -1;">
                    🧩 Conecta los bloques para ver el resumen de tu contrato
                </div>
            `;
        }
    }
}

// Mantener función legacy para compatibilidad
function updateTokenSummary() {
    updateContractSummary();
}

// Función para obtener datos del formulario
function getFormData() {
    if (!elements.tokenName) return {};

    return {
        name: elements.tokenName.value.trim(),
        symbol: elements.tokenSymbol.value.trim().toUpperCase(),
        decimals: parseInt(elements.tokenDecimals.value) || 2,
        initialSupply: parseInt(elements.initialSupply.value) || 0,
        canMint: elements.canMint ? elements.canMint.checked : true,
        canBurn: elements.canBurn ? elements.canBurn.checked : true,
        isPausable: elements.isPausable ? elements.isPausable.checked : true,
        transferLimit: elements.transferLimit ? parseInt(elements.transferLimit.value) || 0 : 0
    };
}

// Función para obtener datos de los bloques
function getBlocksData() {
    if (!window.blocklyWorkspace) return {};

    try {
        return generateRustCode() || {};
    } catch (error) {
        console.error('Error obteniendo datos de bloques:', error);
        return {};
    }
}

// Funciones de Blockly (importadas del client.js original)
function initializeBlockly() {
    if (window.blocklyWorkspace) return; // Ya está inicializado

    try {
        // Definir tema de Tralalero
        const tralaleroTheme = Blockly.Theme.defineTheme('tralalerotheme', {
            'base': Blockly.Themes.Zelos,
            'fontStyle': { 'family': 'Inter, sans-serif', 'weight': '500', 'size': 11 },
            'componentStyles': {
                'workspaceBackgroundColour': '#f8f9fa',
                'toolboxBackgroundColour': '#e3f2fd',
                'flyoutBackgroundColour': '#d8eafd',
                'scrollbarColour': '#cce3fa',
            },
            'blockStyles': {
                'start_blocks': { 'colourPrimary': '#8E24AA', 'hat': 'cap' },
                'property_blocks': { 'colourPrimary': '#1E88E5' },
                'rules_blocks': { 'colourPrimary': '#5E35B1' },
                'powers_blocks': { 'colourPrimary': '#FF8F00' },
                'advanced_blocks': { 'colourPrimary': '#E91E63' },
            }
        });

        // Definir bloques
        defineBlocks();

        // Crear workspace
        const toolbox = createToolbox();
        window.blocklyWorkspace = Blockly.inject('blocklyDiv', {
            toolbox: toolbox,
            scrollbars: true,
            trashcan: true,
            renderer: 'zelos',
            theme: tralaleroTheme
        });

        // Crear bloques por defecto
        setTimeout(() => {
            createDefaultBlocks();
        }, 500);

        // Agregar listener para cambios en el workspace
        window.blocklyWorkspace.addChangeListener((event) => {
            if (event.type === Blockly.Events.BLOCK_CHANGE ||
                event.type === Blockly.Events.BLOCK_MOVE ||
                event.type === Blockly.Events.BLOCK_CREATE ||
                event.type === Blockly.Events.BLOCK_DELETE) {
                // Actualizar resumen cuando cambien los bloques
                setTimeout(() => {
                    updateTokenSummary();
                }, 100);
            }
        });

    } catch (error) {
        console.error('Error inicializando Blockly:', error);
    }
}

// Funciones de Blockly - Implementación completa
function defineBlocks() {
    // Definir bloques de Smart Contract genérico
    Blockly.Blocks['contract_settings'] = {
        init: function () {
            this.appendDummyInput().appendField("🔮 Mi Smart Contract");
            this.appendStatementInput("SETTINGS").setCheck(null);
            this.setStyle('start_blocks');
        }
    };

    Blockly.Blocks['contract_name'] = {
        init: function () {
            this.appendDummyInput().appendField("Nombre del Contrato").appendField(new Blockly.FieldTextInput("MiContrato"), "NAME");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setStyle('property_blocks');
        }
    };

    Blockly.Blocks['contract_version'] = {
        init: function () {
            this.appendDummyInput().appendField("Versión").appendField(new Blockly.FieldTextInput("0.1.0"), "VERSION");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setStyle('property_blocks');
        }
    };

    Blockly.Blocks['admin_address'] = {
        init: function () {
            this.appendDummyInput().appendField("🔑 Administrador").appendField(new Blockly.FieldTextInput('G...'), "ADDRESS");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setStyle('rules_blocks');
        }
    };

    Blockly.Blocks['state_var'] = {
        init: function () {
            this.appendDummyInput()
                .appendField("📦 Variable de estado")
                .appendField("nombre:")
                .appendField(new Blockly.FieldTextInput("contador"), "VAR_NAME")
                .appendField("tipo:")
                .appendField(new Blockly.FieldDropdown([["i32", "I32"], ["i128", "I128"], ["bool", "BOOL"], ["String", "STRING"], ["Address", "ADDRESS"]]), "VAR_TYPE");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setStyle('rules_blocks');
        }
    };

    Blockly.Blocks['function_def'] = {
        init: function () {
            this.appendDummyInput()
                .appendField("⚙️ Función")
                .appendField("nombre:")
                .appendField(new Blockly.FieldTextInput("mi_funcion"), "FN_NAME")
                .appendField("retorna:")
                .appendField(new Blockly.FieldDropdown([["void", "VOID"], ["i32", "I32"], ["i128", "I128"], ["bool", "BOOL"], ["String", "STRING"], ["Address", "ADDRESS"]]), "RET_TYPE");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setStyle('advanced_blocks');
        }
    };

    Blockly.Blocks['function_param'] = {
        init: function () {
            this.appendDummyInput()
                .appendField("📝 Parámetro")
                .appendField("nombre:")
                .appendField(new Blockly.FieldTextInput("param"), "PARAM_NAME")
                .appendField("tipo:")
                .appendField(new Blockly.FieldDropdown([["i32", "I32"], ["i128", "I128"], ["bool", "BOOL"], ["String", "STRING"], ["Address", "ADDRESS"]]), "PARAM_TYPE");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setStyle('advanced_blocks');
        }
    };
}

function createToolbox() {
    return `
        <xml id="toolbox" style="display: none">
            <category name="🚀 Empezar" categorystyle="start_category">
                <block type="contract_settings"></block>
            </category>
            <category name="🎨 Propiedades" categorystyle="property_category">
                <block type="contract_name"></block>
                <block type="contract_version"></block>
                <block type="admin_address"></block>
            </category>
            <category name="📦 Estado" categorystyle="rules_category">
                <block type="state_var"></block>
            </category>
            <category name="⚙️ Funciones" categorystyle="powers_category">
                <block type="function_def"></block>
                <block type="function_param"></block>
            </category>
        </xml>
    `;
}

function generateRustCode() {
    if (!window.blocklyWorkspace) {
        console.log('❌ Blockly workspace no disponible');
        return {};
    }

    const contractBlock = window.blocklyWorkspace.getBlocksByType('contract_settings', false)[0];
    if (!contractBlock) {
        console.log('❌ No hay bloque de contrato principal');
        return {};
    }

    const data = {
        name: '',
        version: '0.1.0',
        admin: '',
        state: [],
        functions: [],
        parameters: []
    };
    let currentBlock = contractBlock.getInputTargetBlock('SETTINGS');

    console.log('🔍 Extrayendo datos de bloques...');

    while (currentBlock) {
        console.log(`   Procesando bloque: ${currentBlock.type}`);
        switch (currentBlock.type) {
            case 'contract_name':
                data.name = currentBlock.getFieldValue('NAME');
                console.log(`     Nombre: ${data.name}`);
                break;
            case 'contract_version':
                data.version = currentBlock.getFieldValue('VERSION');
                console.log(`     Versión: ${data.version}`);
                break;
            case 'admin_address':
                data.admin = currentBlock.getFieldValue('ADDRESS');
                console.log(`     Admin: ${data.admin}`);
                break;
            case 'state_var':
                data.state.push({
                    name: currentBlock.getFieldValue('VAR_NAME'),
                    type: currentBlock.getFieldValue('VAR_TYPE')
                });
                console.log(`     Variable: ${data.state[data.state.length - 1].name} (${data.state[data.state.length - 1].type})`);
                break;
            case 'function_def':
                data.functions.push({
                    name: currentBlock.getFieldValue('FN_NAME'),
                    returns: currentBlock.getFieldValue('RET_TYPE')
                });
                console.log(`     Función: ${data.functions[data.functions.length - 1].name} -> ${data.functions[data.functions.length - 1].returns}`);
                break;
            case 'function_param':
                data.parameters.push({
                    name: currentBlock.getFieldValue('PARAM_NAME'),
                    type: currentBlock.getFieldValue('PARAM_TYPE')
                });
                console.log(`     Parámetro: ${data.parameters[data.parameters.length - 1].name} (${data.parameters[data.parameters.length - 1].type})`);
                break;
        }
        currentBlock = currentBlock.getNextBlock();
    }

    console.log('📋 Datos extraídos:', data);
    return data;
}

function validateBlocks() {
    const errors = [];
    const warnings = [];

    if (!window.blocklyWorkspace) {
        errors.push('❌ Blockly no está inicializado');
        return { errors, warnings, isValid: false };
    }

    const contractBlock = window.blocklyWorkspace.getBlocksByType('contract_settings', false)[0];
    if (!contractBlock) {
        errors.push('❌ Falta el bloque principal "Mi Smart Contract"');
        return { errors, warnings, isValid: false };
    }

    const data = generateRustCode();
    if (!data) {
        errors.push('❌ No se pudieron leer los datos de los bloques');
        return { errors, warnings, isValid: false };
    }

    // Validar campos requeridos
    if (!data.name || data.name.trim() === '') {
        errors.push('❌ El nombre del contrato está vacío. Usa el bloque "Nombre del Contrato"');
    }

    if (!data.admin || data.admin.trim() === '' || data.admin === 'G...') {
        warnings.push('⚠️ La dirección del administrador no está configurada');
    }

    // Validar formato de dirección Stellar
    if (data.admin && data.admin !== 'G...' && !data.admin.startsWith('G')) {
        warnings.push('⚠️ La dirección del administrador debería empezar con "G" (Stellar)');
    }

    if (data.state.some(v => !v.name || v.name.trim() === '')) {
        errors.push('❌ Hay variables de estado sin nombre');
    }

    if (data.functions.some(f => !f.name || f.name.trim() === '')) {
        errors.push('❌ Hay funciones sin nombre');
    }

    return {
        errors,
        warnings,
        isValid: errors.length === 0,
        data
    };
}

function createDefaultBlocks() {
    if (!window.blocklyWorkspace) return;

    console.log('🔄 Creando bloques por defecto...');

    // Limpiar workspace
    window.blocklyWorkspace.clear();

    try {
        // Crear el bloque principal del contrato
        const contractBlock = window.blocklyWorkspace.newBlock('contract_settings');
        if (!contractBlock) {
            console.error('❌ No se pudo crear el bloque de contrato');
            return;
        }
        contractBlock.initSvg();
        contractBlock.render();
        contractBlock.moveBy(50, 50);

        // Crear bloques básicos necesarios
        const blocks = [];

        const nameBlock = window.blocklyWorkspace.newBlock('contract_name');
        if (nameBlock) {
            nameBlock.initSvg();
            nameBlock.render();
            nameBlock.setFieldValue('MiContrato', 'NAME');
            blocks.push(nameBlock);
        }

        const versionBlock = window.blocklyWorkspace.newBlock('contract_version');
        if (versionBlock) {
            versionBlock.initSvg();
            versionBlock.render();
            versionBlock.setFieldValue('0.1.0', 'VERSION');
            blocks.push(versionBlock);
        }

        const adminBlock = window.blocklyWorkspace.newBlock('admin_address');
        if (adminBlock) {
            adminBlock.initSvg();
            adminBlock.render();
            adminBlock.setFieldValue('G...', 'ADDRESS');
            blocks.push(adminBlock);
        }

        const stateVarBlock = window.blocklyWorkspace.newBlock('state_var');
        if (stateVarBlock) {
            stateVarBlock.initSvg();
            stateVarBlock.render();
            stateVarBlock.setFieldValue('contador', 'VAR_NAME');
            stateVarBlock.setFieldValue('I32', 'VAR_TYPE');
            blocks.push(stateVarBlock);
        }

        const fnBlock = window.blocklyWorkspace.newBlock('function_def');
        if (fnBlock) {
            fnBlock.initSvg();
            fnBlock.render();
            fnBlock.setFieldValue('incrementar', 'FN_NAME');
            fnBlock.setFieldValue('VOID', 'RET_TYPE');
            blocks.push(fnBlock);
        }

        // Conectar todos los bloques de forma secuencial
        setTimeout(() => {
            try {
                console.log('🔗 Conectando bloques...');

                // Conectar el primer bloque al contrato
                const settingsInput = contractBlock.getInput('SETTINGS');
                if (settingsInput && settingsInput.connection && blocks[0] && blocks[0].previousConnection) {
                    settingsInput.connection.connect(blocks[0].previousConnection);
                }

                // Conectar los bloques en cadena
                for (let i = 0; i < blocks.length - 1; i++) {
                    const currentBlock = blocks[i];
                    const nextBlock = blocks[i + 1];

                    if (currentBlock && currentBlock.nextConnection &&
                        nextBlock && nextBlock.previousConnection) {
                        currentBlock.nextConnection.connect(nextBlock.previousConnection);
                    }
                }

                // Renderizar después de conectar
                window.blocklyWorkspace.render();
                console.log('🎉 Bloques creados y conectados');

                // Actualizar el resumen del contrato
                updateContractSummary();

            } catch (error) {
                console.error('❌ Error conectando bloques:', error);
            }
        }, 500);

    } catch (error) {
        console.error('❌ Error creando bloques:', error);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Botones de navegación
    if (elements.nextBtn) elements.nextBtn.addEventListener('click', nextStep);
    if (elements.prevBtn) elements.prevBtn.addEventListener('click', prevStep);

    // Botones de conexión de wallet
    if (elements.connectFreighter) elements.connectFreighter.addEventListener('click', () => connectWallet('FREIGHTER'));
    if (elements.connectXbull) elements.connectXbull.addEventListener('click', () => connectWallet('XBULL'));
    if (elements.connectAlbedo) elements.connectAlbedo.addEventListener('click', () => connectWallet('ALBEDO'));

    // Botón de funding
    if (elements.fundAccountBtn) elements.fundAccountBtn.addEventListener('click', fundAccount);

    // Botones de bloques
    if (elements.resetBlocksBtn) elements.resetBlocksBtn.addEventListener('click', createDefaultBlocks);
    if (elements.validateBlocksBtn) elements.validateBlocksBtn.addEventListener('click', validateAndShowBlocks);
    if (elements.viewBlocksCodeBtn) elements.viewBlocksCodeBtn.addEventListener('click', () => {
        if (elements.contractModal) {
            const data = getBlocksData();
            elements.contractCode.textContent = JSON.stringify(data, null, 2);
            elements.contractModal.style.display = 'block';
        }
    });

    // Modal
    if (elements.closeModal) elements.closeModal.addEventListener('click', () => {
        if (elements.contractModal) elements.contractModal.style.display = 'none';
    });

    // Inicializar stepper
    updateStepper();

    // Inicializar Blockly cuando se llegue al paso 3
    setTimeout(() => {
        if (appState.currentStep === 3) {
            initializeBlockly();
        }
    }, 1000);
});

// Función para validar y mostrar resultados de bloques
function validateAndShowBlocks() {
    const validation = validateBlocks();

    if (elements.blockValidationResult) {
        elements.blockValidationResult.classList.remove('hidden');

        if (validation.isValid) {
            elements.blockValidationResult.style.background = '#10b981';
            elements.blockValidationResult.style.color = 'white';
            elements.blockValidationResult.textContent = '✅ ¡Configuración válida! Tu token está listo para crear.';
            updateTokenSummary();
        } else {
            elements.blockValidationResult.style.background = '#dc2626';
            elements.blockValidationResult.style.color = 'white';
            elements.blockValidationResult.textContent = validation.errors[0] || '❌ Error de validación';
        }

        // Auto ocultar después de 5 segundos
        setTimeout(() => {
            if (elements.blockValidationResult) {
                elements.blockValidationResult.classList.add('hidden');
            }
        }, 5000);
    }

    return validation.isValid;
}

// Verificar conexión existente
async function checkExistingConnection() {
    try {
        // Intentar obtener la dirección actual
        const { address } = await kit.getAddress();
        if (address) {
            appState.walletConnected = true;
            appState.walletAddress = address;
            appState.walletType = FREIGHTER_ID; // Asumir Freighter por defecto

            elements.walletNotConnected.classList.add('hidden');
            elements.walletConnected.classList.remove('hidden');
            elements.walletConnection.classList.add('connected');
            elements.walletInfo.innerHTML = `
                <div><strong>Wallet:</strong> ${getWalletName(FREIGHTER_ID)}</div>
                <div><strong>Dirección:</strong> ${address}</div>
                <div><strong>Red:</strong> Testnet</div>
            `;

            elements.adminAddress.value = address;
        }
    } catch (error) {
        // No hay wallet conectado, continuar normalmente
        console.log('No hay wallet conectado previamente');
    }
}
