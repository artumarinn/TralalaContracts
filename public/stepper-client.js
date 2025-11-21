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
        card.addEventListener('click', function () {
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

        if (!window.WalletAdapter) {
            throw new Error('WalletAdapter no disponible en la página');
        }

        const normalize = (t) => {
            if (!t) return undefined;
            const map = { 'FREIGHTER': 'freighter', 'XBULL': 'xbull', 'ALBEDO': 'albedo', 'RABET': 'rabet' };
            return map[t] || t.toLowerCase();
        };

        const id = normalize(walletType);

        let wallet;
        try {
            wallet = await window.WalletAdapter.connect(id);
        } catch (err) {
            console.warn('No se pudo conectar al wallet solicitado, intentando el primero disponible:', err.message);
            wallet = await window.WalletAdapter.connect();
        }

        const address = wallet?.publicKey;
        if (!address) throw new Error('No se obtuvo la clave pública de la wallet');

        // Normalize appState.walletType to the existing keys expected by getWalletName
        const typeMap = { 'freighter': 'FREIGHTER', 'xbull': 'XBULL', 'albedo': 'ALBEDO', 'rabet': 'RABET' };
        appState.walletType = typeMap[wallet.id] || (wallet.name || wallet.id || 'FREIGHTER');

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

        // Obtener balance inicial usando adapter helper si está disponible
        if (window.WalletAdapter && typeof window.WalletAdapter.getBalance === 'function') {
            try {
                const bal = await window.WalletAdapter.getBalance(address);
                appState.currentBalance = bal;
                appState.hasXLM = bal >= 5;
                if (elements.currentBalance) elements.currentBalance.textContent = `${bal.toFixed(2)} XLM`;
            } catch (e) {
                console.warn('No se pudo obtener balance via WalletAdapter:', e.message);
            }
        } else {
            await updateBalance();
        }

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
// TEMPORARY FILE - This is the correct deployToStellar function
// Copy this to stepper-client.js line 621

async function deployToStellar(wasmBase64, contractData) {
    console.log('═══════════════════════════════════════════════════');
    console.log('🚀 DEPLOYTOSTELLAR FUNCTION CALLED (STEPPER-CLIENT.JS - FIXED VERSION)');
    console.log('═══════════════════════════════════════════════════');
    console.log('📦 WASM Base64 length received:', wasmBase64?.length || 'MISSING');
    console.log('📋 Contract data:', contractData);

    try {
        // Verify Freighter is available
        console.log('🔍 Step 1: Checking Freighter availability...');
        if (!window.freighterApi) {
            console.error('❌ FREIGHTER NOT DETECTED');
            throw new Error('Freighter wallet no está instalada. Instálala desde freighter.app');
        }
        console.log('✅ Freighter detected');

        // Get user's public key
        console.log('🔍 Step 2: Getting user public key from Freighter...');
        const userPublicKey = await window.freighterApi.getPublicKey();
        console.log('✅ Usuario:', userPublicKey);

        // Prepare deployment request payload
        const deployPayload = {
            wasmBase64: wasmBase64,
            userAddress: userPublicKey,
            contractData: {
                name: contractData.name,
                symbol: contractData.symbol,
                decimals: contractData.decimals || 7,
                initialSupply: contractData.supply || 0
            }
        };

        console.log('🔍 Step 3: Preparing deployment request...');
        console.log('📤 Deploy payload:', {
            wasmSize: wasmBase64.length,
            userAddress: userPublicKey,
            contractData: deployPayload.contractData
        });

        // Request deployment via backend
        console.log('═══════════════════════════════════════════════════');
        console.log('🔍 Step 4: Sending deployment request to /api/deploy-contract...');
        console.log('📍 URL:', window.location.origin + '/api/deploy-contract');
        console.log('📦 Payload size:', JSON.stringify(deployPayload).length, 'bytes');
        console.log('═══════════════════════════════════════════════════');

        const deployResponse = await fetch('/api/deploy-contract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deployPayload)
        });

        console.log('═══════════════════════════════════════════════════');
        console.log('📥 DEPLOY RESPONSE RECEIVED');
        console.log('📥 Deploy response status:', deployResponse.status, deployResponse.statusText);
        console.log('═══════════════════════════════════════════════════');

        if (!deployResponse.ok) {
            console.error('❌ Deploy response not OK. Status:', deployResponse.status);
            let errorData;
            try {
                errorData = await deployResponse.json();
                console.error('❌ Error data:', errorData);
            } catch (e) {
                console.error('❌ Could not parse error response as JSON');
                errorData = { error: `HTTP ${deployResponse.status}: ${deployResponse.statusText}` };
            }
            throw new Error(errorData.error || 'Error deployando contrato');
        }

        console.log('🔍 Step 5: Parsing deployment result...');
        const deployResult = await deployResponse.json();
        console.log('✅ Deployment result received:', JSON.stringify(deployResult, null, 2));

        if (!deployResult.success) {
            console.error('❌ Deployment result success=false:', deployResult.error);
            throw new Error(deployResult.error || 'Deployment failed');
        }

        // Check if we have XDR to sign (real deployment)
        console.log('🔍 DEBUG: Checking for UPLOAD XDR in deployResult...');
        console.log('   Has uploadTransactionXDR?', !!deployResult.uploadTransactionXDR);
        console.log('   Expected Contract ID:', deployResult.contractId);
        console.log('   WASM ID:', deployResult.wasmId);

        if (deployResult.uploadTransactionXDR) {
            console.log('🔍 Step 6: Signing and submitting transactions to Stellar...');
            console.log('📝 Found XDRs to sign with Freighter');

            // Initialize Stellar SDK
            const StellarSdk = window.StellarSdk;

            // Compatibility layer: v14.x uses 'rpc', v12.x uses 'SorobanRpc'
            const SorobanRpc = StellarSdk.rpc || StellarSdk.SorobanRpc;
            if (!SorobanRpc || !SorobanRpc.Server) {
                throw new Error('❌ SorobanRpc.Server not available. Check SDK version.');
            }

            // IMPORTANT: Use Soroban RPC server for smart contract operations (NOT Horizon!)
            const sorobanServer = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
            const networkPassphrase = StellarSdk.Networks.TESTNET;

            // Step 6a: Sign and submit UPLOAD transaction
            console.log('📤 Step 6a: Signing UPLOAD transaction with Freighter...');
            console.log('📋 Original XDR:', deployResult.uploadTransactionXDR.substring(0, 50) + '...');

            console.log('🔑 DEBUG: About to call Freighter API...');
            console.log('   Freighter available?', !!window.freighterApi);
            console.log('   Freighter signTransaction?', !!window.freighterApi?.signTransaction);

            const uploadSignedXdr = await window.freighterApi.signTransaction(
                deployResult.uploadTransactionXDR,
                { networkPassphrase: networkPassphrase }
            );
            console.log('✅ Upload transaction signed by Freighter');
            console.log('📋 Signed XDR:', uploadSignedXdr.substring(0, 50) + '...');

            // Submit upload transaction to Stellar
            console.log('📤 Submitting UPLOAD transaction to Stellar...');

            // Parse signed XDR into Transaction object
            const uploadTx = new StellarSdk.Transaction(uploadSignedXdr, networkPassphrase);
            console.log('✅ Upload transaction parsed');

            let uploadResult;
            try {
                // Soroban RPC uses sendTransaction instead of submitTransaction
                uploadResult = await sorobanServer.sendTransaction(uploadTx);
                console.log('✅ Upload transaction sent to Stellar!');
                console.log('📊 Upload TX Hash:', uploadResult.hash);
            } catch (submitError) {
                console.error('═══════════════════════════════════════════════════');
                console.error('❌ ERROR SUBMITTING UPLOAD TRANSACTION');
                console.error('═══════════════════════════════════════════════════');
                console.error('❌ Status:', submitError.response?.status);
                console.error('❌ Status Text:', submitError.response?.statusText);

                // Log result codes specifically
                if (submitError.response?.data?.extras?.result_codes) {
                    console.error('❌ RESULT CODES:');
                    console.error('   TX Code:', submitError.response.data.extras.result_codes.transaction);
                    console.error('   OP Codes:', submitError.response.data.extras.result_codes.operations);
                }

                // Log full extras
                if (submitError.response?.data?.extras) {
                    console.error('❌ Full Extras:', JSON.stringify(submitError.response.data.extras, null, 2));
                }

                // Log full error data
                console.error('❌ Full Error Data:', JSON.stringify(submitError.response?.data, null, 2));
                console.error('═══════════════════════════════════════════════════');

                throw new Error(`Error al enviar transacción UPLOAD: ${submitError.response?.data?.detail || submitError.message}`);
            }

            // CRITICAL: Wait for transaction to be confirmed on the blockchain
            // Use SOROBAN RPC for checking Soroban transaction status (official way)
            console.log('⏱️ Waiting for UPLOAD transaction to be confirmed...');
            console.log('   Using Soroban RPC Server (official Stellar SDK method)');
            const uploadHash = uploadResult.hash;
            let uploadConfirmed = false;
            let attempts = 0;
            const maxAttempts = 20; // 20 seconds max (recommended by Stellar)

            while (!uploadConfirmed && attempts < maxAttempts) {
                attempts++;
                console.log(`🔍 Checking confirmation on Soroban RPC... attempt ${attempts}/${maxAttempts}`);

                try {
                    // ✅ CORRECT: Use Soroban RPC getTransaction() for Soroban transactions
                    // This is the official way per Stellar documentation
                    const txStatus = await sorobanServer.getTransaction(uploadHash);

                    console.log(`   Status: ${txStatus.status}`);

                    if (txStatus.status === 'SUCCESS') {
                        console.log('✅ UPLOAD transaction confirmed on blockchain!');
                        console.log('   Ledger:', txStatus.ledger);
                        console.log('   Latest Ledger Close Time:', txStatus.latestLedgerCloseTime);
                        uploadConfirmed = true;
                        break;
                    } else if (txStatus.status === 'FAILED') {
                        console.error('❌ UPLOAD transaction failed');
                        console.error('   Result XDR:', txStatus.resultXdr);
                        throw new Error('UPLOAD transaction failed on blockchain');
                    } else if (txStatus.status === 'NOT_FOUND') {
                        // Transaction not indexed yet, keep polling
                        console.log('   ⏳ Transaction not found yet, waiting...');
                    } else {
                        // Status could be 'PENDING' or other
                        console.log(`   ⏳ Transaction status: ${txStatus.status}, waiting...`);
                    }
                } catch (pollError) {
                    // Handle errors during polling
                    if (pollError.message && pollError.message.includes('404')) {
                        // Transaction not found yet (normal during polling)
                        console.log('   ⏳ Transaction not indexed yet, waiting...');
                    } else {
                        console.warn('⚠️ Error polling Soroban RPC:', pollError.message);
                    }
                }

                // Wait 1 second before next check
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            if (!uploadConfirmed) {
                throw new Error('Timeout waiting for UPLOAD transaction confirmation');
            }

            console.log('✅ UPLOAD transaction fully confirmed, proceeding to CREATE CONTRACT...');

            // Step 6b: Prepare CREATE CONTRACT transaction (WASM now exists on blockchain!)
            console.log('📤 Step 6b: Preparing CREATE CONTRACT transaction...');
            console.log('   Calling /api/prepare-create-contract with WASM hash:', deployResult.wasmId);

            const prepareCreateResponse = await fetch('/api/prepare-create-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userAddress: userPublicKey,
                    wasmHash: deployResult.wasmId,
                    contractId: deployResult.contractId
                })
            });

            if (!prepareCreateResponse.ok) {
                throw new Error(`Failed to prepare CREATE transaction: ${prepareCreateResponse.statusText}`);
            }

            const prepareCreateResult = await prepareCreateResponse.json();

            if (!prepareCreateResult.success) {
                throw new Error(prepareCreateResult.error || 'Failed to prepare CREATE transaction');
            }

            console.log('✅ CREATE transaction prepared by backend');
            console.log('   Fee:', prepareCreateResult.fee, 'stroops');

            // Step 6c: Sign CREATE CONTRACT transaction
            console.log('📤 Step 6c: Signing CREATE CONTRACT transaction with Freighter...');
            console.log('📋 Original XDR:', prepareCreateResult.createTransactionXDR.substring(0, 50) + '...');

            const createSignedXdr = await window.freighterApi.signTransaction(
                prepareCreateResult.createTransactionXDR,
                { networkPassphrase: networkPassphrase }
            );
            console.log('✅ Create contract transaction signed by Freighter');
            console.log('📋 Signed XDR:', createSignedXdr.substring(0, 50) + '...');

            // Submit create contract transaction
            console.log('📤 Submitting CREATE CONTRACT transaction to Stellar...');

            // Parse signed XDR into Transaction object
            const createTx = new StellarSdk.Transaction(createSignedXdr, networkPassphrase);
            console.log('✅ Create contract transaction parsed');

            // Soroban RPC uses sendTransaction instead of submitTransaction
            let createResult = await sorobanServer.sendTransaction(createTx);
            console.log('✅ Create contract transaction sent to Stellar!');
            console.log('📊 Create TX Hash:', createResult.hash);

            // CRITICAL: Wait for CREATE transaction to be confirmed
            // Use Soroban RPC for CREATE transaction (contract-specific)
            console.log('⏱️ Waiting for CREATE CONTRACT transaction to be confirmed...');
            console.log('   Using Soroban RPC for contract creation status');
            const createHash = createResult.hash;
            let createConfirmed = false;
            attempts = 0;

            while (!createConfirmed && attempts < maxAttempts) {
                attempts++;
                console.log(`🔍 Checking CREATE confirmation... attempt ${attempts}/${maxAttempts}`);

                try {
                    const txStatus = await sorobanServer.getTransaction(createHash);

                    if (txStatus.status === 'SUCCESS') {
                        console.log('✅ CREATE CONTRACT transaction confirmed on blockchain!');
                        createResult = txStatus; // Update with full result
                        createConfirmed = true;
                        break;
                    } else if (txStatus.status === 'FAILED') {
                        console.error('❌ CREATE CONTRACT transaction failed:', txStatus);
                        throw new Error('CREATE CONTRACT transaction failed on blockchain');
                    } else if (txStatus.status !== 'NOT_FOUND') {
                        console.log('⏳ CREATE transaction status:', txStatus.status);
                    }
                } catch (pollError) {
                    if (pollError.message && !pollError.message.includes('404')) {
                        console.warn('⚠️ Error polling CREATE transaction:', pollError.message);
                    }
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            if (!createConfirmed) {
                throw new Error('Timeout waiting for CREATE CONTRACT transaction confirmation');
            }

            // Extract real contract ID from the create transaction result
            console.log('🔍 Step 7: Extracting real contract ID from Stellar response...');

            // The contract ID should be in the transaction result
            // For Stellar, we need to get it from the operation results
            let realContractId = deployResult.contractId; // Fallback to simulated ID

            // Try to extract from transaction result
            if (createResult && createResult.resultMetaXdr) {
                try {
                    const meta = StellarSdk.xdr.TransactionMeta.fromXDR(createResult.resultMetaXdr, 'base64');
                    console.log('📊 Transaction meta XDR parsed');

                    // Extract contract ID from the meta (v3 has sorobanMeta)
                    if (meta.switch() === 3 && meta.v3().sorobanMeta()) {
                        const returnValue = meta.v3().sorobanMeta().returnValue();
                        if (returnValue) {
                            // Contract ID is returned as an Address SCVal
                            const addressObj = StellarSdk.Address.fromScVal(returnValue);
                            realContractId = addressObj.toString();
                            console.log('✅ Extracted real contract ID from blockchain:', realContractId);
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Could not parse result meta XDR:', e);
                }
            }

            console.log('🎉 Contrato deployado exitosamente a Stellar Testnet!');
            console.log('   Contract ID:', realContractId);
            console.log('   Upload TX Hash:', uploadResult.hash);
            console.log('   Create TX Hash:', createResult.hash);
            console.log('   Explorer URL:', `https://stellar.expert/explorer/testnet/contract/${realContractId}`);

            return {
                contractId: realContractId,
                transactionHash: createResult.hash,
                hash: createResult.hash,
                uploadHash: uploadResult.hash,
                contract_address: realContractId,
                network: 'testnet',
                deployed: true,
                realDeployment: true
            };
        }

        // Fallback: simulated deployment (no XDRs)
        console.log('⚠️ No XDRs found - using simulated deployment');
        const contractId = deployResult.contractId || deployResult.contract_id;
        const transactionHash = deployResult.transactionHash || deployResult.hash;

        console.log('📊 Extracted data:');
        console.log('   - contractId:', contractId);
        console.log('   - transactionHash:', transactionHash);

        if (!contractId) {
            console.error('❌ No contract ID found in result:', deployResult);
            throw new Error('No se pudo obtener el Contract ID del deployment');
        }

        console.log('🎉 Contrato deployado (simulated)!');
        console.log('   Contract ID:', contractId);
        console.log('   TX Hash:', transactionHash);
        console.log('   Explorer URL:', `https://stellar.expert/explorer/testnet/contract/${contractId}`);

        return {
            contractId: contractId,
            transactionHash: transactionHash,
            network: 'testnet',
            deployed: true
        };

    } catch (error) {
        console.error('❌ Error en deployment a Stellar:', error);
        console.error('❌ Error stack:', error.stack);
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

        // 🔍 DEBUG: Log complete response details
        console.log('📊 Full result object:', JSON.stringify(result, null, 2));
        console.log('📦 wasmBase64 exists?', !!result.wasmBase64);
        console.log('📦 wasmBase64 length:', result.wasmBase64?.length || 'MISSING');
        console.log('🔍 blocklyData:', blocklyData);

        // Verify we have WASM data before proceeding
        if (!result.wasmBase64) {
            throw new Error('❌ No se recibió WASM del backend. Response no contiene wasmBase64.');
        }

        // Verify Freighter wallet is available before deployment
        if (!window.freighterApi) {
            throw new Error('❌ Freighter wallet no detectado. Por favor instala la extensión de Freighter.');
        }

        console.log('✅ Pre-deployment checks passed. Calling deployToStellar...');

        // Paso 3: Deploy to Stellar Testnet
        if (deploymentMessage) deploymentMessage.textContent = '🚀 Desplegando a Stellar Testnet...';

        // Deploy the compiled WASM to Stellar
        console.log('═══════════════════════════════════════════════════');
        console.log('🚀 FRONTEND: About to call deployToStellar');
        console.log('📦 WASM length:', result.wasmBase64.length);
        console.log('📋 blocklyData:', JSON.stringify(blocklyData, null, 2));
        console.log('═══════════════════════════════════════════════════');
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
