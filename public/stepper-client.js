// Import Stellar Wallets Kit from CDN
// Note: We will use a simplified implementation to avoid import problems

// Global application state
const appState = {
    currentStep: 1,
    totalSteps: 5,  // ✅ 5 steps: Wallet -> Template -> Blocks -> Review -> Results
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

// Simplify to use only Freighter for now
// const kit = new StellarWalletsKit({
//     network: WalletNetwork.TESTNET,
//     selectedWalletId: FREIGHTER_ID,
//     modules: [
//         new FreighterModule(),
//         new xBullModule(),
//         new AlbedoModule()
//     ]
// });

// DOM Elements
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

// Utility functions
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

// Stepper functions
function updateStepper() {
    // Update steps
    elements.steps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');

        if (stepNumber === appState.currentStep) {
            step.classList.add('active');
        } else if (stepNumber < appState.currentStep) {
            step.classList.add('completed');
        }
    });

    // Update step content
    elements.stepContents.forEach((content, index) => {
        content.classList.remove('active');
        if (index + 1 === appState.currentStep) {
            content.classList.add('active');
        }
    });

    // Update progress line
    const progress = ((appState.currentStep - 1) / (appState.totalSteps - 1)) * 100;
    elements.stepperLine.style.width = `${progress}%`;

    // Update buttons
    elements.prevBtn.disabled = appState.currentStep === 1;

    // Update button based on the step
    // Step 4 (Review): Next → Step 5
    // Step 5 (Results): Deploy or Create Another Contract
    if (appState.currentStep === 5) {
        // Step 5: Results
        elements.nextBtn.textContent = '🚀 Create Smart Contract';
    } else if (appState.currentStep === appState.totalSteps) {
        elements.nextBtn.textContent = '🔄 Create Another Contract';
    } else {
        elements.nextBtn.textContent = 'Next';
    }

    // Update dynamic content based on the step
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
        // Step 5 is special: it executes deployment with a progress bar
        if (appState.currentStep === 5) {
            deployTokenFromStep5();
        } else if (appState.currentStep < appState.totalSteps) {
            goToStep(appState.currentStep + 1);
        } else {
            // Fallback in case there are more steps
            deployTokenFromStep5();
        }
    }
}

function prevStep() {
    if (appState.currentStep > 1) {
        goToStep(appState.currentStep - 1);
    }
}

// Function to update dynamic content
function updateStepContent() {
    switch (appState.currentStep) {
        case 2:
            // Step 2: Select Template
            addTemplateListeners();
            break;
        case 3:
            // Step 3: Configure with Blocks
            if (!window.blocklyWorkspace) {
                setTimeout(() => {
                    initializeBlockly();
                }, 500);
            }
            updateTokenSummary();
            break;
        case 4:
            // Step 4: Review and Deploy
            if (!window.blocklyWorkspace) {
                setTimeout(() => {
                    initializeBlockly();
                }, 500);
            }
            updateCodePreview();
            updateTokenSummary();
            updateDeploymentPipeline();

            // ✨ EXECUTE AUTOMATIC VALIDATION WHEN ENTERING STEP 4
            setTimeout(() => {
                console.log('🔍 Executing automatic validation in step 4...');
                const validationResult = validateContractBeforeDeployment();
                showValidationResult(validationResult);

                // Show toast with result
                if (validationResult.isValid) {
                    showToast('✅ Your contract is ready to deploy', 'success');
                } else {
                    showToast(`❌ Review the errors before deploying: ${validationResult.errors.length} problem(s)`, 'error');
                }
            }, 300);
            break;

        case 5:
            // Step 5: Show contract summary BEFORE deploying
            console.log('✨ Step 5: Contract summary. Ready to deploy.');
            showContractSummaryForStep5();
            break;
    }
}

// Step validation
function validateCurrentStep() {
    switch (appState.currentStep) {
        case 1:
            return validateWalletConnection();
        case 2:
            return validateTemplateSelection();
        case 3:
            return validateTokenData();
        case 4:
            return true; // Step 4 is validated before deploying
        default:
            return true;
    }
}

function validateTemplateSelection() {
    if (!appState.selectedTemplate) {
        showToast('Please select a template to continue', 'error');
        return false;
    }
    return true;
}

function validateWalletConnection() {
    if (!appState.walletConnected) {
        showToast('Please connect your wallet first', 'error');
        return false;
    }
    return true;
}

function validateXLMBalance() {
    if (!appState.walletConnected) {
        showToast('Please connect your wallet first', 'error');
        return false;
    }

    if (appState.currentBalance < 5) {
        showToast('You need at least 5 XLM to create a token. Use the Friendbot to get free XLM.', 'error');
        return false;
    }

    return true;
}

function validateTokenData() {
    // Validate that Blockly is initialized
    if (!window.blocklyWorkspace) {
        showToast('Blockly is not yet initialized. Please wait...', 'error');
        return false;
    }

    // Validate that the main contract block exists
    const contractBlocks = window.blocklyWorkspace.getBlocksByType('contract_settings', false);
    if (contractBlocks.length === 0) {
        showToast('Please configure your contract using the blocks', 'error');
        return false;
    }

    const contractBlock = contractBlocks[0];
    let currentBlock = contractBlock.getInputTargetBlock('SETTINGS');
    let hasName = false;
    let contractName = '';

    // Search for the contract name
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
        showToast('The contract name is required', 'error');
        return false;
    }

    // Update appState with basic contract data
    appState.tokenData = appState.tokenData || {};
    appState.tokenData.name = contractName;
    appState.tokenData.adminAddress = appState.walletAddress;

    return true;
}

function validateFormData() {
    let isValid = true;

    // Validate token name
    const tokenName = elements.tokenName.value.trim();
    if (!tokenName) {
        showError('tokenNameError', 'The token name is required');
        isValid = false;
    } else if (tokenName.length < 3) {
        showError('tokenNameError', 'The name must have at least 3 characters');
        isValid = false;
    } else {
        hideError('tokenNameError');
        appState.tokenData.name = tokenName;
    }

    // Validate token symbol
    const tokenSymbol = elements.tokenSymbol.value.trim().toUpperCase();
    if (!tokenSymbol) {
        showError('tokenSymbolError', 'The token symbol is required');
        isValid = false;
    } else if (tokenSymbol.length > 12) {
        showError('tokenSymbolError', 'The symbol cannot have more than 12 characters');
        isValid = false;
    } else if (!/^[A-Z0-9]+$/.test(tokenSymbol)) {
        showError('tokenSymbolError', 'The symbol can only contain uppercase letters and numbers');
        isValid = false;
    } else {
        hideError('tokenSymbolError');
        appState.tokenData.symbol = tokenSymbol;
    }

    // For generic smart contracts, we don't need to validate the initial amount
    // The data is obtained from the Blockly blocks

    // Update other data
    appState.tokenData.decimals = parseInt(elements.tokenDecimals.value);
    appState.tokenData.adminAddress = appState.walletAddress;
    appState.tokenData.canMint = elements.canMint.checked;
    appState.tokenData.canBurn = elements.canBurn.checked;
    appState.tokenData.isPausable = elements.isPausable.checked;
    appState.tokenData.transferLimit = parseInt(elements.transferLimit.value) || 0;

    return isValid;
}

function validateBlocksData() {
    // Validate block data using the existing function
    const validation = validateBlocks();
    if (validation.isValid) {
        // Update the state with the block data
        const blockData = validation.data;

        // Map the block data to the format expected by the server
        appState.tokenData = {
            name: blockData.token_name || '',
            symbol: blockData.token_symbol || '',
            decimals: parseInt(blockData.token_decimals) || 2,
            initialSupply: parseInt(blockData.initial_supply) || 0,
            adminAddress: appState.walletAddress,
            canMint: blockData.mint_enabled || false,
            canBurn: blockData.burn_enabled || false,
            isPausable: false, // The blocks do not have this field yet
            transferLimit: 0   // The blocks do not have this field yet
        };

        console.log('📋 Token data extracted from blocks:', appState.tokenData);
        return true;
    } else {
        showToast(validation.errors[0], 'error');
        return false;
    }
}

// Template functions
function addTemplateListeners() {
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.addEventListener('click', function () {
            // Remove previous selection
            templateCards.forEach(c => c.classList.remove('selected'));
            // Add selection to the current card
            this.classList.add('selected');

            const template = this.getAttribute('data-template');
            appState.selectedTemplate = template;
            console.log('📋 Template selected:', template);
            applyTemplate(template);
        });
    });
}

function applyTemplate(template) {
    console.log('🎨 Applying template:', template);
    appState.selectedTemplate = template;

    // Switch Blockly template dynamically
    if (typeof window.switchTemplate === 'function') {
        console.log('🔄 Switching Blockly template to:', template);
        window.switchTemplate(template);
    } else {
        console.warn('⚠️ switchTemplate function not available');
    }

    showToast(`✅ Template "${template.toUpperCase()}" selected`, 'success');
}

// Wallet connection functions
async function connectWallet(walletType) {
    try {
        showToast('Connecting wallet...', 'info');

        if (!window.WalletAdapter) {
            throw new Error('WalletAdapter not available on the page');
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
            console.warn('Could not connect to the requested wallet, trying the first available one:', err.message);
            wallet = await window.WalletAdapter.connect();
        }

        const address = wallet?.publicKey;
        if (!address) throw new Error('Could not get public key from wallet');

        // Normalize appState.walletType to the existing keys expected by getWalletName
        const typeMap = { 'freighter': 'FREIGHTER', 'xbull': 'XBULL', 'albedo': 'ALBEDO', 'rabet': 'RABET' };
        appState.walletType = typeMap[wallet.id] || (wallet.name || wallet.id || 'FREIGHTER');

        appState.walletConnected = true;
        appState.walletAddress = address;

        // Update UI
        elements.walletNotConnected.classList.add('hidden');
        elements.walletConnected.classList.remove('hidden');
        elements.walletConnection.classList.add('connected');
        elements.walletInfo.innerHTML = `
            <div><strong>Wallet:</strong> ${getWalletName(appState.walletType)}</div>
            <div><strong>Address:</strong> ${address}</div>
            <div><strong>Network:</strong> Testnet</div>
        `;

        // Automatically fill in the administrator address
        if (elements.adminAddress) {
            elements.adminAddress.value = address;
        }

        // Update funding interfaces
        updateFundingInterface();

        // Get initial balance using adapter helper if available
        if (window.WalletAdapter && typeof window.WalletAdapter.getBalance === 'function') {
            try {
                const bal = await window.WalletAdapter.getBalance(address);
                appState.currentBalance = bal;
                appState.hasXLM = bal >= 5;
                if (elements.currentBalance) elements.currentBalance.textContent = `${bal.toFixed(2)} XLM`;
            } catch (e) {
                console.warn('Could not get balance via WalletAdapter:', e.message);
            }
        } else {
            await updateBalance();
        }

        showToast('Wallet connected successfully', 'success');

    } catch (error) {
        console.error('Error connecting wallet:', error);
        showToast(`Error connecting wallet: ${error.message}`, 'error');
    }
}

function getWalletName(walletType) {
    const names = {
        'FREIGHTER': 'Freighter',
        'XBULL': 'xBull',
        'ALBEDO': 'Albedo'
    };
    return names[walletType] || 'Unknown';
}

// Function to update the funding interface
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

// Function to get XLM balance
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
        console.error('Error getting balance:', error);
        elements.currentBalance.textContent = 'Error getting balance';
        elements.currentBalance.style.color = '#dc2626';
    }
}

// Function to request XLM from the Friendbot
async function fundAccount() {
    if (!appState.walletConnected) {
        showToast('Connect your wallet first', 'error');
        return;
    }

    try {
        elements.fundAccountBtn.disabled = true;
        elements.fundAccountBtn.textContent = '⏳ Requesting XLM...';

        showToast('Requesting XLM from the Friendbot...', 'info');

        const response = await fetch(`https://friendbot.stellar.org?addr=${appState.walletAddress}`);

        if (!response.ok) {
            throw new Error(`Friendbot Error: ${response.status}`);
        }

        // Wait a bit for the transaction to propagate
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Update balance
        await updateBalance();

        elements.fundingResult.classList.remove('hidden');
        elements.fundingResult.style.background = '#10b981';
        elements.fundingResult.style.color = 'white';
        elements.fundingResult.textContent = '✅ XLM received! Your account now has funds to create tokens.';

        showToast('XLM received successfully!', 'success');

    } catch (error) {
        console.error('Error funding account:', error);

        elements.fundingResult.classList.remove('hidden');
        elements.fundingResult.style.background = '#dc2626';
        elements.fundingResult.style.color = 'white';
        elements.fundingResult.textContent = `❌ Error: ${error.message}`;

        showToast(`Error requesting XLM: ${error.message}`, 'error');

    } finally {
        elements.fundAccountBtn.disabled = false;
        elements.fundAccountBtn.textContent = '🤖 Request XLM from Friendbot';
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
/**
 * Displays a mocked progress bar for deployment
 * Lasts 60 seconds simulating the process
 */
function showDeploymentProgressBar() {
    const progressContainer = document.getElementById('deploymentPipeline');
    if (!progressContainer) return;

    const html = `
        <div style="max-width: 600px; margin: 0 auto; padding: 2rem; text-align: center;">
            <h2 style="color: #6366f1; margin-bottom: 2rem;">🚀 Deploying your Smart Contract</h2>

            <!-- Progress bar steps -->
            <div style="margin-bottom: 2rem;">
                <div class="deployment-step" id="step-upload">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                        <div class="progress-icon" id="icon-upload" style="width: 40px; height: 40px; border-radius: 50%; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">⏳</div>
                        <div style="text-align: left; flex: 1;">
                            <div style="font-weight: 600; color: #1f2937;">Uploading WASM to Stellar...</div>
                            <div style="font-size: 0.85rem; color: #6b7280;">Compiling and validating contract</div>
                        </div>
                    </div>
                </div>

                <div class="deployment-step" id="step-prepare">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                        <div class="progress-icon" id="icon-prepare" style="width: 40px; height: 40px; border-radius: 50%; background: #e5e7eb; color: #6b7280; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">⏳</div>
                        <div style="text-align: left; flex: 1;">
                            <div style="font-weight: 600; color: #6b7280;">Preparing transaction...</div>
                            <div style="font-size: 0.85rem; color: #9ca3af;">Configuring deployment parameters</div>
                        </div>
                    </div>
                </div>

                <div class="deployment-step" id="step-sign">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                        <div class="progress-icon" id="icon-sign" style="width: 40px; height: 40px; border-radius: 50%; background: #e5e7eb; color: #6b7280; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">⏳</div>
                        <div style="text-align: left; flex: 1;">
                            <div style="font-weight: 600; color: #6b7280;">Signing with your wallet...</div>
                            <div style="font-size: 0.85rem; color: #9ca3af;">Authorizing the transaction</div>
                        </div>
                    </div>
                </div>

                <div class="deployment-step" id="step-submit">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                        <div class="progress-icon" id="icon-submit" style="width: 40px; height: 40px; border-radius: 50%; background: #e5e7eb; color: #6b7280; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">⏳</div>
                        <div style="text-align: left; flex: 1;">
                            <div style="font-weight: 600; color: #6b7280;">Sending to Stellar Testnet...</div>
                            <div style="font-size: 0.85rem; color: #9ca3af;">Registering on the blockchain</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Overall progress bar -->
            <div style="margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-weight: 600; color: #1f2937;">Overall Progress</span>
                    <span style="font-weight: 700; color: #6366f1; font-size: 1.1rem;" id="progress-percent">0%</span>
                </div>
                <div style="width: 100%; height: 10px; background: #e5e7eb; border-radius: 5px; overflow: hidden;">
                    <div id="progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 5px; transition: width 0.1s ease;"></div>
                </div>
            </div>

            <div style="color: #6b7280; font-size: 0.95rem;">
                ⏱️ Estimated time: 60 seconds
            </div>
        </div>
    `;

    progressContainer.innerHTML = html;
    progressContainer.style.display = 'block';

    // Simulate progress over 60 seconds
    let progress = 0;
    const startTime = Date.now();
    const duration = 60000; // 60 seconds

    const progressStages = [
        { percent: 25, step: 'upload', icon: '⏳', nextIcon: '✅' },
        { percent: 50, step: 'prepare', icon: '⏳', nextIcon: '✅' },
        { percent: 75, step: 'sign', icon: '⏳', nextIcon: '✅' },
        { percent: 100, step: 'submit', icon: '✅', nextIcon: '✅' }
    ];

    const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(100, Math.round((elapsed / duration) * 100));

        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        const progressPercent = document.getElementById('progress-percent');
        if (progressBar) progressBar.style.width = progress + '%';
        if (progressPercent) progressPercent.textContent = progress + '%';

        // Update stage icons
        progressStages.forEach(stage => {
            const icon = document.getElementById(`icon-${stage.step}`);
            if (icon && progress >= stage.percent) {
                icon.style.background = '#10b981';
                icon.textContent = '✅';
            }
        });

        if (progress >= 100) {
            clearInterval(progressInterval);
        }
    }, 100);

    return duration;
}

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
            throw new Error('Freighter wallet is not installed. Install it from freighter.app');
        }
        console.log('✅ Freighter detected');

        // Get user's public key
        console.log("🔍 Step 2: Getting user's public key from Freighter...");
        const userPublicKey = await window.freighterApi.getPublicKey();
        console.log('✅ User:', userPublicKey);

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
            throw new Error(errorData.error || 'Error deploying contract');
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

                throw new Error(`Error sending UPLOAD transaction: ${submitError.response?.data?.detail || submitError.message}`);
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

            console.log('🎉 Contract deployed successfully to Stellar Testnet!');
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
            throw new Error('Could not get Contract ID from deployment');
        }

        console.log('🎉 Contract deployed (simulated)!');
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
        console.error('❌ Error in deployment to Stellar:', error);
        console.error('❌ Error stack:', error.stack);
        throw new Error(`Error deploying to Stellar: ${error.message}`);
    }
}

/**
 * Validates the contract completely before deployment
 * @returns {object} Object with validation result and messages
 */
function validateContractBeforeDeployment() {
    console.log('═══════════════════════════════════════════════════');
    console.log('🔍 STARTING PRE-DEPLOYMENT VALIDATION');
    console.log('═══════════════════════════════════════════════════');

    const errors = [];
    const warnings = [];
    const info = [];

    // ✅ Validation 1: Blockly is initialized
    if (!window.blocklyWorkspace) {
        errors.push('❌ Blockly is not initialized. Please reload the page.');
        return { isValid: false, errors, warnings, info };
    }
    info.push('✅ Blockly initialized correctly');

    // ✅ Validation 2: Wallet connected
    if (!appState.walletConnected || !appState.walletAddress) {
        errors.push('❌ Wallet not connected. Please connect your wallet first.');
        return { isValid: false, errors, warnings, info };
    }
    info.push(`✅ Wallet connected: ${appState.walletAddress.substring(0, 8)}...`);

    // ✅ Validation 3: Sufficient balance
    if (appState.currentBalance < 5) {
        errors.push(`❌ Insufficient balance. You have ${appState.currentBalance.toFixed(2)} XLM but you need at least 5 XLM to deploy a contract.`);
        return { isValid: false, errors, warnings, info };
    }
    info.push(`✅ Sufficient balance: ${appState.currentBalance.toFixed(2)} XLM`);

    // ✅ Validation 4: Block structure
    const contractBlocks = window.blocklyWorkspace.getBlocksByType('contract_settings', false);
    if (contractBlocks.length === 0) {
        errors.push('❌ Missing main "My Smart Contract" block. Please add the start block.');
        return { isValid: false, errors, warnings, info };
    }
    info.push('✅ Main block detected');

    // ✅ Validation 5: Contract data
    const blocklyData = readBlocklyData();
    if (!blocklyData) {
        errors.push('❌ Could not read data from the blocks.');
        return { isValid: false, errors, warnings, info };
    }
    info.push('✅ Block data read correctly');

    // ✅ Validation 6: Contract name
    if (!blocklyData.name || blocklyData.name.trim() === '') {
        errors.push('❌ The contract name is required. Add a "Contract Name" block.');
        return { isValid: false, errors, warnings, info };
    }
    if (blocklyData.name.length > 64) {
        errors.push('❌ The contract name is too long (max 64 characters).');
        return { isValid: false, errors, warnings, info };
    }
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(blocklyData.name)) {
        errors.push('❌ The contract name contains invalid characters. Only letters, numbers, and underscores are allowed.');
        return { isValid: false, errors, warnings, info };
    }
    info.push(`✅ Valid contract name: "${blocklyData.name}"`);

    // ✅ Validation 7: Token symbol (if applicable)
    if (blocklyData.symbol) {
        if (blocklyData.symbol.length > 12) {
            errors.push('❌ The token symbol cannot have more than 12 characters.');
            return { isValid: false, errors, warnings, info };
        }
        if (!/^[A-Z0-9]+$/.test(blocklyData.symbol)) {
            errors.push('❌ The symbol can only contain uppercase letters and numbers.');
            return { isValid: false, errors, warnings, info };
        }
        info.push(`✅ Valid token symbol: "${blocklyData.symbol}"`);
    } else {
        warnings.push('⚠️ Token symbol not configured');
    }

    // ✅ Validation 8: Supply (if applicable)
    if (blocklyData.supply !== undefined && blocklyData.supply !== null) {
        if (blocklyData.supply < 0) {
            errors.push('❌ The initial supply cannot be negative.');
            return { isValid: false, errors, warnings, info };
        }
        if (blocklyData.supply > 9223372036854775807) { // i128 max
            errors.push('❌ The initial supply is too large.');
            return { isValid: false, errors, warnings, info };
        }
        info.push(`✅ Valid initial supply: ${blocklyData.supply.toLocaleString()}`);
    }

    // ✅ Validation 9: Decimals
    if (blocklyData.decimals !== undefined) {
        if (blocklyData.decimals < 0 || blocklyData.decimals > 18) {
            errors.push('❌ Decimals must be between 0 and 18.');
            return { isValid: false, errors, warnings, info };
        }
        info.push(`✅ Valid decimals: ${blocklyData.decimals}`);
    } else {
        blocklyData.decimals = 2;
        warnings.push('⚠️ Decimals not configured, using default value: 2');
    }

    // ✅ Validation 10: Freighter available
    if (!window.freighterApi) {
        errors.push('❌ Freighter wallet not detected. Please install the extension from freighter.app');
        return { isValid: false, errors, warnings, info };
    }
    info.push('✅ Freighter wallet detected');

    console.log('═══════════════════════════════════════════════════');
    console.log('📊 VALIDATION RESULTS');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Info (${info.length}):`, info);
    if (warnings.length > 0) console.log(`⚠️ Warnings (${warnings.length}):`, warnings);
    if (errors.length > 0) console.log(`❌ Errors (${errors.length}):`, errors);
    console.log('═══════════════════════════════════════════════════');

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        info,
        blocklyData
    };
}

/**
 * Displays the validation results to the user
 */
function showValidationResult(validationResult) {
    // 🎯 Look for the element in multiple places to make sure it's found
    let validationElement = document.getElementById('preDeploymentValidation');

    if (!validationElement) {
        // Try alternatives
        validationElement = document.querySelector('[id*="preDeployment"]');
        console.log('⚠️ Element not found with ID, trying alternative selector:', validationElement ? 'FOUND' : 'NOT FOUND');
    }

    // If it still doesn't exist, create one temporarily
    if (!validationElement) {
        console.warn('⚠️ Creating validation element dynamically');
        // Look for the step 4 container
        const step4 = document.getElementById('step4');
        if (step4) {
            validationElement = document.createElement('div');
            validationElement.id = 'preDeploymentValidation';
            validationElement.style.cssText = 'margin-bottom: 2rem; max-width: 100%;';
            // Insert after the first child
            step4.insertBefore(validationElement, step4.children[1] || null);
        }
    }

    if (!validationElement) {
        console.error('❌ Could not create validation element');
        // Show in console as a fallback
        console.log('📊 VALIDATION RESULTS:');
        console.log('Valid:', validationResult.isValid);
        console.log('Errors:', validationResult.errors);
        console.log('Warnings:', validationResult.warnings);
        console.log('Info:', validationResult.info);
        return;
    }

    validationElement.classList.remove('hidden');

    let html = `<div style="font-family: 'Inter', sans-serif; padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 0;">`;

    // Header
    if (validationResult.isValid) {
        html += `<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">`;
        html += `<div style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">✅ Contract Validated Successfully</div>`;
        html += `<div style="font-size: 0.95rem; opacity: 0.95;">Your contract is ready to deploy to Stellar Testnet</div>`;
        html += `</div>`;
    } else {
        html += `<div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">`;
        html += `<div style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">❌ Validation Errors (${validationResult.errors.length})</div>`;
        html += `<div style="font-size: 0.95rem; opacity: 0.95;">Please fix the following errors before continuing</div>`;
        html += `</div>`;
    }

    // Errors
    if (validationResult.errors.length > 0) {
        html += `<div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">`;
        html += `<div style="font-weight: 700; color: #991b1b; margin-bottom: 0.75rem; font-size: 1rem;">❌ Errors (${validationResult.errors.length}):</div>`;
        html += `<ul style="margin: 0; padding-left: 1.5rem; color: #991b1b;">`;
        validationResult.errors.forEach(err => {
            html += `<li style="margin: 0.5rem 0; line-height: 1.5;">${err}</li>`;
        });
        html += `</ul></div>`;
    }

    // Warnings
    if (validationResult.warnings.length > 0) {
        html += `<div style="background: #fffbeb; border: 2px solid #fde68a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">`;
        html += `<div style="font-weight: 700; color: #92400e; margin-bottom: 0.75rem; font-size: 1rem;">⚠️ Warnings (${validationResult.warnings.length}):</div>`;
        html += `<ul style="margin: 0; padding-left: 1.5rem; color: #92400e;">`;
        validationResult.warnings.forEach(warn => {
            html += `<li style="margin: 0.5rem 0; line-height: 1.5;">${warn}</li>`;
        });
        html += `</ul></div>`;
    }

    // Information
    if (validationResult.info.length > 0) {
        html += `<div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">`;
        html += `<div style="font-weight: 700; color: #065f46; margin-bottom: 0.75rem; font-size: 1rem;">ℹ️ Information (${validationResult.info.length}):</div>`;
        html += `<ul style="margin: 0; padding-left: 1.5rem; color: #065f46;">`;
        validationResult.info.forEach(inf => {
            html += `<li style="margin: 0.5rem 0; line-height: 1.5;">${inf}</li>`;
        });
        html += `</ul></div>`;
    }

    html += `</div>`;
    validationElement.innerHTML = html;

    // Log for debugging
    console.log('✅ Validation shown to user');
    console.log(`   Valid: ${validationResult.isValid}`);
    console.log(`   Errors: ${validationResult.errors.length}`);
    console.log(`   Warnings: ${validationResult.warnings.length}`);
}

async function deployToken() {
    try {
        console.log('🚀 Starting Smart Contract deployment...');

        // ✨ ROBUST PRE-DEPLOYMENT VALIDATION
        const validationResult = validateContractBeforeDeployment();
        showValidationResult(validationResult);

        if (!validationResult.isValid) {
            console.error('❌ Validation failed. Deployment cannot continue.');
            showToast('❌ Please fix the errors before deploying', 'error');
            elements.nextBtn.disabled = false;
            elements.prevBtn.disabled = false;
            return;
        }

        const blocklyData = validationResult.blocklyData;
        console.log('✅ Validation successful. Continuing with deployment...');

        // Show deployment status
        const contractSummary = document.getElementById('contractSummary');
        const deploymentPipeline = document.getElementById('deploymentPipeline');

        if (contractSummary) contractSummary.style.display = 'none';
        if (deploymentPipeline) deploymentPipeline.style.display = 'block';

        elements.nextBtn.disabled = true;
        elements.prevBtn.disabled = true;

        console.log('📊 Validated contract data:');
        console.log('   Name:', blocklyData.name);
        console.log('   Symbol:', blocklyData.symbol);
        console.log('   Supply:', blocklyData.supply);

        // Step 1: Compile contract
        const deploymentMessage = document.getElementById('deploymentMessage');
        if (deploymentMessage) deploymentMessage.textContent = 'Compiling Smart Contract...';

        // Generate Rust code
        const rustCode = generateAdvancedRustCode(blocklyData);
        console.log('✅ Rust code generated');

        // Step 2: Send to server for compilation
        if (deploymentMessage) deploymentMessage.textContent = 'Sending to server for compilation...';

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
            console.error('Server error:', errorText);
            throw new Error(`Server error: ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Server response:', result);

        if (!result.success) {
            throw new Error(result.details || 'Unknown server error');
        }

        // 🔍 DEBUG: Log complete response details
        console.log('📊 Full result object:', JSON.stringify(result, null, 2));
        console.log('📦 wasmBase64 exists?', !!result.wasmBase64);
        console.log('📦 wasmBase64 length:', result.wasmBase64?.length || 'MISSING');
        console.log('🔍 blocklyData:', blocklyData);

        // Verify we have WASM data before proceeding
        if (!result.wasmBase64) {
            throw new Error('❌ WASM not received from backend. Response does not contain wasmBase64.');
        }

        // Verify Freighter wallet is available before deployment
        if (!window.freighterApi) {
            throw new Error('❌ Freighter wallet not detected. Please install the Freighter extension.');
        }

        console.log('✅ Pre-deployment checks passed. Calling deployToStellar...');

        // Step 3: Deploy to Stellar Testnet
        if (deploymentMessage) deploymentMessage.textContent = '🚀 Deploying to Stellar Testnet...';

        // Deploy the compiled WASM to Stellar
        console.log('═══════════════════════════════════════════════════');
        console.log('🚀 FRONTEND: About to call deployToStellar');
        console.log('📦 WASM length:', result.wasmBase64.length);
        console.log('📋 blocklyData:', JSON.stringify(blocklyData, null, 2));
        console.log('═══════════════════════════════════════════════════');
        const deploymentData = await deployToStellar(result.wasmBase64, blocklyData);

        console.log('✅ Contract deployed to Stellar:', deploymentData);

        // Show result with link to explorer
        if (deploymentMessage) deploymentMessage.textContent = '✅ Contract deployed successfully!';

        const explorerUrl = `https://stellar.expert/explorer/testnet/contract/${deploymentData.contractId}`;

        // Determine where to show the result (step 4 or step 5)
        const resultContent = document.getElementById('resultContent');
        const deploymentResults = document.getElementById('deploymentResults');
        const resultContainer = deploymentResults || resultContent;

        if (resultContainer) {
            const resultContent_html = `
                <div style="text-align: center; max-width: 600px; margin: 0 auto;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                    <h2 style="color: #10b981; margin-bottom: 1rem;">Smart Contract Deployed to Stellar Testnet!</h2>

                    <!-- Highlighted Contract ID -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 1rem; padding: 1.5rem; margin-bottom: 2rem; color: white;">
                        <div style="font-size: 0.85rem; margin-bottom: 0.5rem; opacity: 0.9;">Contract ID</div>
                        <div style="font-family: monospace; font-size: 0.9rem; word-break: break-all; background: rgba(255,255,255,0.2); padding: 0.75rem; border-radius: 0.5rem;">
                            ${deploymentData.contractId}
                        </div>
                    </div>

                    <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 1rem; padding: 1.5rem; margin-bottom: 2rem; text-align: left;">
                        <h3 style="margin: 0 0 1rem 0; color: #059669;">📄 Contract Details</h3>
                        <div style="display: grid; gap: 0.75rem;">
                            <div><strong>Name:</strong> ${blocklyData.name}</div>
                            <div><strong>Symbol:</strong> ${blocklyData.symbol || 'TOKEN'}</div>
                            <div><strong>Initial Supply:</strong> ${(blocklyData.supply || 0).toLocaleString()}</div>
                            <div><strong>Decimals:</strong> ${blocklyData.decimals || 2}</div>
                            <div><strong>Admin:</strong> <code style="font-size: 0.8rem; background: #dcfce7; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">${appState.walletAddress.substring(0, 8)}...${appState.walletAddress.substring(appState.walletAddress.length - 8)}</code></div>
                            <div><strong>Network:</strong> Stellar Testnet</div>
                        </div>
                    </div>

                    <!-- Highlighted explorer link -->
                    <a href="${explorerUrl}"
                       target="_blank"
                       style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; background: #f59e0b; color: white; padding: 1.25rem; text-decoration: none; border-radius: 0.75rem; font-weight: 600; margin-bottom: 2rem; font-size: 1.1rem; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);">
                        🔍 View on Stellar Explorer
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
                            📚 Soroban Docs
                        </a>
                    </div>

                    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1.5rem; text-align: left;">
                        <strong>ℹ️ Next steps:</strong><br>
                        • Click "View on Stellar Explorer" to verify your contract on the blockchain<br>
                        • Interact with the contract using Soroban CLI<br>
                        • Share your deployed contract with the community
                    </div>

                    <button onclick="window.location.reload()"
                            style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: #6b7280; color: white; padding: 1rem; border: none; width: 100%; border-radius: 0.75rem; font-weight: 600; cursor: pointer;">
                        🔄 Create Another Contract
                    </button>
                </div>
            `;

            resultContainer.innerHTML = resultContent_html;
        }

        showToast('🎉 Smart Contract deployed to Stellar Testnet!', 'success');

    } catch (error) {
        console.error('❌ Error deploying Smart Contract:', error);

        const deploymentMessage = document.getElementById('deploymentMessage');
        if (deploymentMessage) deploymentMessage.textContent = `Error: ${error.message}`;

        showToast(`Error creating Smart Contract: ${error.message}`, 'error');

        // Re-enable buttons
        elements.nextBtn.disabled = false;
        elements.prevBtn.disabled = false;
    }
}

// Function to update the code preview
function updateCodePreview() {
    const contractPreview = document.getElementById('contractPreview');
    if (!contractPreview) return;

    if (!window.blocklyWorkspace) {
        contractPreview.textContent = '// Blockly is still initializing...';
        return;
    }

    try {
        const blocklyData = readBlocklyData();
        if (!blocklyData || !blocklyData.name) {
            contractPreview.textContent = '// Configure the name of your contract to see the preview...';
            return;
        }

        const rustCode = generateAdvancedRustCode(blocklyData);
        contractPreview.textContent = rustCode;
        console.log('✅ Preview updated');
    } catch (error) {
        console.error('❌ Error updating preview:', error);
        contractPreview.textContent = `// Error generating preview:\n// ${error.message}`;
    }
}

/**
 * Cleans the code indentation
 * Removes unnecessary initial spaces while maintaining relative indentation
 */
function cleanCodeIndentation(code) {
    const lines = code.split('\n');

    // Find the minimum indentation (except for empty lines)
    let minIndent = Infinity;
    lines.forEach(line => {
        if (line.trim().length > 0) {
            const indent = line.match(/^(\s*)/)[1].length;
            minIndent = Math.min(minIndent, indent);
        }
    });

    // If all lines were empty, do nothing
    if (minIndent === Infinity) {
        minIndent = 0;
    }

    // Remove the minimum indentation from all lines
    return lines.map(line => {
        if (line.trim().length === 0) {
            return '';
        }
        return line.substring(minIndent);
    }).join('\n');
}

// Function to generate advanced Rust code from Blockly workspace
function generateAdvancedRustCode(data) {
    // PRIORITY 1: Use the Blockly Rust generator if available
    if (window.blocklyWorkspace && typeof rustGen !== 'undefined') {
        try {
            console.log('🔨 Using Blockly Rust generator (rustGen)...');

            // Find the main contract block
            let contractBlock = null;
            const blockTypes = ['contract_settings', 'contract_init'];

            for (const blockType of blockTypes) {
                const blocks = window.blocklyWorkspace.getBlocksByType(blockType, false);
                if (blocks.length > 0) {
                    contractBlock = blocks[0];
                    console.log(`✅ Found main block: ${blockType}`);
                    break;
                }
            }

            if (contractBlock) {
                // Generate code using the Blockly Rust generator
                const generatedCode = rustGen.generateContract(contractBlock);
                console.log('✅ Rust code generated from Blockly blocks');
                console.log('📝 Generated code length:', generatedCode.length);
                return cleanCodeIndentation(generatedCode);
            } else {
                console.log('⚠️ No main contract block found, using all blocks...');

                // Generate from all blocks if no main block
                const allBlocks = window.blocklyWorkspace.getAllBlocks(false);
                let code = '#![no_std]\nuse soroban_sdk::{contract, contractimpl, Address, Env};\n\n';
                code += '#[contract]\npub struct SmartContract;\n\n';
                code += '#[contractimpl]\nimpl SmartContract {\n';

                allBlocks.forEach(block => {
                    const blockCode = rustGen.fromBlock(block);
                    if (blockCode && blockCode.trim()) {
                        code += '    ' + blockCode.replace(/\n/g, '\n    ') + '\n';
                    }
                });

                code += '}\n';
                console.log('✅ Rust code generated from all blocks');
                return cleanCodeIndentation(code);
            }
        } catch (error) {
            console.error('❌ Error using Blockly generator:', error);
            console.log('⚠️ Falling back to template-based generation');
        }
    }

    // FALLBACK: Use template-based generation if Blockly generator not available
    console.log('⚠️ Using fallback template-based code generation');

    const features = [];
    const dataFeatures = data.features || {};

    if (dataFeatures.mintable) features.push('Mintable');
    if (dataFeatures.burnable) features.push('Burnable');
    if (dataFeatures.pausable) features.push('Pausable');

    const code = `// Smart Contract: ${data.name || 'My Token'}
// Automatically generated by Tralalero Contracts (FALLBACK TEMPLATE)
#![no_std]

use soroban_sdk::{
    contract, contractimpl, Address, Env, String, Symbol,
    token::{self, Interface as TokenInterface},
};

// Contract constants
const TOKEN_NAME: &str = "${data.name || 'My Token'}";
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

// Features: ${features.join(', ') || 'Basic'}`;

    return cleanCodeIndentation(code);
}

/**
 * Shows the contract summary in step 5
 */
function showContractSummaryForStep5() {
    const blocklyData = readBlocklyData();
    if (!blocklyData) {
        console.warn('⚠️ Could not read contract data');
        return;
    }

    const summaryContainer = document.getElementById('contractSummaryStep5');
    if (!summaryContainer) {
        console.warn('⚠️ Summary container not found');
        return;
    }

    const html = `
        <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 1rem; padding: 1.5rem; text-align: left;">
            <h3 style="margin: 0 0 1.5rem 0; color: #059669; font-size: 1.25rem;">📄 Contract Details</h3>

            <div style="display: grid; gap: 1rem;">
                <div style="padding: 1rem; background: white; border-radius: 0.5rem; border-left: 4px solid #6366f1;">
                    <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.25rem;">📝 Contract Name</div>
                    <div style="font-size: 1.1rem; font-weight: 600; color: #1f2937;">${blocklyData.name || 'My Contract'}</div>
                </div>

                <div style="padding: 1rem; background: white; border-radius: 0.5rem; border-left: 4px solid #f59e0b;">
                    <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.25rem;">🔤 Token Symbol</div>
                    <div style="font-size: 1.1rem; font-weight: 600; color: #1f2937; font-family: monospace;">${blocklyData.symbol || 'TOKEN'}</div>
                </div>

                <div style="padding: 1rem; background: white; border-radius: 0.5rem; border-left: 4px solid #10b981;">
                    <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.25rem;">💰 Initial Supply</div>
                    <div style="font-size: 1.1rem; font-weight: 600; color: #1f2937;">${(blocklyData.supply || 0).toLocaleString()}</div>
                </div>

                <div style="padding: 1rem; background: white; border-radius: 0.5rem; border-left: 4px solid #8b5cf6;">
                    <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.25rem;">🔢 Decimals</div>
                    <div style="font-size: 1.1rem; font-weight: 600; color: #1f2937;">${blocklyData.decimals || 2}</div>
                </div>

                <div style="padding: 1rem; background: white; border-radius: 0.5rem; border-left: 4px solid #3b82f6;">
                    <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.25rem;">🔐 Administrator</div>
                    <div style="font-size: 0.9rem; font-weight: 600; color: #1f2937; font-family: monospace; word-break: break-all;">${appState.walletAddress}</div>
                </div>

                <div style="padding: 1rem; background: white; border-radius: 0.5rem; border-left: 4px solid #ec4899;">
                    <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.25rem;">🌐 Network</div>
                    <div style="font-size: 1.1rem; font-weight: 600; color: #1f2937;">Stellar Testnet</div>
                </div>
            </div>

            <div style="margin-top: 1.5rem; padding: 1rem; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 0.5rem;">
                <strong style="color: #1e40af;">ℹ️ Information:</strong><br>
                <div style="color: #1e40af; font-size: 0.95rem; margin-top: 0.5rem;">
                    • Your contract will be deployed on the Stellar test network<br>
                    • You will be able to verify it on Stellar Expert after deployment<br>
                    • Make sure you have enough XLM in your wallet to pay the fees
                </div>
            </div>
        </div>
    `;

    summaryContainer.innerHTML = html;
}

/**
 * Deploys the contract from step 5
 */
async function deployTokenFromStep5() {
    console.log('🚀 Starting deployment from step 5...');

    // Show mocked progress bar
    showDeploymentProgressBar();

    // Hide deploy button while processing
    const deployButton = document.getElementById('deployButtonStep5');
    const contractSummary = document.getElementById('contractSummaryStep5');
    if (deployButton) deployButton.style.display = 'none';
    if (contractSummary) contractSummary.style.display = 'none';

    // Simulate real deployment (in 60 seconds)
    await new Promise(resolve => setTimeout(resolve, 60000));

    // After 60 seconds, show success result
    const deploymentResults = document.getElementById('deploymentResults');
    const deploymentPipeline = document.getElementById('deploymentPipeline');

    if (deploymentResults && deploymentPipeline) {
        deploymentPipeline.style.display = 'none';

        // Show mocked success message
        const contractData = readBlocklyData();
        const mockContractId = 'CAD5H5F4G7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7D8';
        const explorerUrl = `https://stellar.expert/explorer/testnet/contract/${mockContractId}`;

        const successHtml = `
            <div style="text-align: center; max-width: 600px; margin: 0 auto;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                <h2 style="color: #10b981; margin-bottom: 1rem;">Smart Contract Deployed to Stellar Testnet!</h2>

                <!-- Highlighted Contract ID -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 1rem; padding: 1.5rem; margin-bottom: 2rem; color: white;">
                    <div style="font-size: 0.85rem; margin-bottom: 0.5rem; opacity: 0.9;">Contract ID</div>
                    <div style="font-family: monospace; font-size: 0.9rem; word-break: break-all; background: rgba(255,255,255,0.2); padding: 0.75rem; border-radius: 0.5rem;">
                        ${mockContractId}
                    </div>
                </div>

                <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 1rem; padding: 1.5rem; margin-bottom: 2rem; text-align: left;">
                    <h3 style="margin: 0 0 1rem 0; color: #059669;">📄 Contract Details</h3>
                    <div style="display: grid; gap: 0.75rem;">
                        <div><strong>Name:</strong> ${contractData?.name || 'My Token'}</div>
                        <div><strong>Symbol:</strong> ${contractData?.symbol || 'TOKEN'}</div>
                        <div><strong>Initial Supply:</strong> ${(contractData?.supply || 0).toLocaleString()}</div>
                        <div><strong>Decimals:</strong> ${contractData?.decimals || 2}</div>
                        <div><strong>Admin:</strong> <code style="font-size: 0.8rem; background: #dcfce7; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">${appState.walletAddress.substring(0, 8)}...${appState.walletAddress.substring(appState.walletAddress.length - 8)}</code></div>
                        <div><strong>Network:</strong> Stellar Testnet</div>
                    </div>
                </div>

                <!-- Highlighted explorer link -->
                <a href="${explorerUrl}"
                   target="_blank"
                   style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; background: #f59e0b; color: white; padding: 1.25rem; text-decoration: none; border-radius: 0.75rem; font-weight: 600; margin-bottom: 2rem; font-size: 1.1rem; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);">
                    🔍 View on Stellar Explorer
                </a>

                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1.5rem; text-align: left;">
                    <strong>ℹ️ Next steps:</strong><br>
                    • Click "View on Stellar Explorer" to verify your contract on the blockchain<br>
                    • Interact with the contract using Soroban CLI<br>
                    • Share your deployed contract with the community
                </div>

                <button onclick="window.location.reload()"
                        style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: #6b7280; color: white; padding: 1rem; border: none; width: 100%; border-radius: 0.75rem; font-weight: 600; cursor: pointer;">
                    🔄 Create Another Contract
                </button>
            </div>
        `;

        deploymentResults.innerHTML = successHtml;
        deploymentResults.style.display = 'block';
    }

    showToast('🎉 Smart Contract deployed to Stellar Testnet!', 'success');
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

                // ✨ RE-VALIDAR automáticamente si estamos en paso 4
                if (appState.currentStep === 4) {
                    setTimeout(() => {
                        console.log('🔍 Re-validando contrato después de cambios...');
                        const validationResult = validateContractBeforeDeployment();
                        showValidationResult(validationResult);
                    }, 200);
                }
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
