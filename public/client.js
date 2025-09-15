document.addEventListener("DOMContentLoaded", () => {

    // --- 1. Custom Theme Definition (Restored) ---
    const tralaleroTheme = Blockly.Theme.defineTheme('tralalerotheme', {
        'base': Blockly.Themes.Zelos,
        'fontStyle': { 'family': 'Nunito, sans-serif', 'weight': 'bold', 'size': 11 },
        'componentStyles': {
            'workspaceBackgroundColour': '#f0f8ff', 'toolboxBackgroundColour': '#e3f2fd',
            'flyoutBackgroundColour': '#d8eafd', 'scrollbarColour': '#cce3fa',
        },
        'blockStyles': {
            'start_blocks': { 'colourPrimary': '#8E24AA', 'hat': 'cap' },
            'property_blocks': { 'colourPrimary': '#1E88E5' },
            'rules_blocks': { 'colourPrimary': '#5E35B1' },
            'powers_blocks': { 'colourPrimary': '#FF8F00' },
            'advanced_blocks': { 'colourPrimary': '#E91E63' },
        },
        'categoryStyles': {
            'start_category': { 'colour': '#8E24AA' }, 'property_category': { 'colour': '#1E88E5' },
            'rules_category': { 'colour': '#5E35B1' }, 'powers_category': { 'colour': '#FF8F00' },
            'advanced_category': { 'colour': '#E91E63' },
        }
    });

    // --- 2. Definition of Magic Blocks (Restored) ---
    Blockly.Blocks['contract_settings'] = {
        init: function () {
            this.appendDummyInput().appendField("🔮 My Stellar Token");
            this.appendStatementInput("SETTINGS").setCheck(null);
            this.setStyle('start_blocks');
        }
    };
    Blockly.Blocks['token_name'] = {
        init: function () {
            this.appendDummyInput().appendField("Coin Name").appendField(new Blockly.FieldTextInput("MyTreasure"), "NAME");
            this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setStyle('property_blocks');
        }
    };
    Blockly.Blocks['token_symbol'] = {
        init: function () {
            this.appendDummyInput().appendField("Symbol (icon)").appendField(new Blockly.FieldTextInput("GOLD"), "SYMBOL");
            this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setStyle('property_blocks');
        }
    };
    Blockly.Blocks['token_decimals'] = {
        init: function () {
            this.appendDummyInput().appendField("How many tiny pieces?").appendField(new Blockly.FieldNumber(7, 0, 18), "DECIMALS");
            this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setStyle('property_blocks');
        }
    };
    Blockly.Blocks['admin_address'] = {
        init: function () {
            this.appendDummyInput().appendField("🔑 Contract Owner (Admin)").appendField(new Blockly.FieldTextInput('G...'), "ADDRESS");
            this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setStyle('rules_blocks');
        }
    };
    Blockly.Blocks['initial_supply'] = {
        init: function () {
            this.appendDummyInput().appendField("💰 Initial Number of Coins").appendField(new Blockly.FieldNumber(1000, 1), "SUPPLY");
            this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setStyle('rules_blocks');
        }
    };
    Blockly.Blocks['can_mint'] = {
        init: function () {
            this.appendDummyInput().appendField("👑 Can owner create more?").appendField(new Blockly.FieldCheckbox(true), "MINT_ENABLED");
            this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setStyle('powers_blocks');
        }
    };
    Blockly.Blocks['can_burn'] = {
        init: function () {
            this.appendDummyInput().appendField("🔥 Can coins be burned?").appendField(new Blockly.FieldCheckbox(true), "BURN_ENABLED");
            this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setStyle('powers_blocks');
        }
    };
    Blockly.Blocks['is_pausable'] = {
        init: function () {
            this.appendDummyInput().appendField("⏸️ Can admin pause contract?").appendField(new Blockly.FieldCheckbox(true), "PAUSABLE_ENABLED");
            this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setStyle('advanced_blocks');
        }
    };
    Blockly.Blocks['transfer_limit'] = {
        init: function () {
            this.appendDummyInput().appendField("✋ Max amount per transfer").appendField(new Blockly.FieldNumber(100, 0), "TRANSFER_LIMIT");
            this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setStyle('advanced_blocks');
        }
    };

    // --- 3. The Magic Toolbox (Restored) ---
    const toolbox = `
        <xml id="toolbox" style="display: none">
            <category name="🚀 Start Here" categorystyle="start_category"><block type="contract_settings"></block></category>
            <category name="🎨 Basic Properties" categorystyle="property_category">
                <block type="token_name"></block><block type="token_symbol"></block><block type="token_decimals"></block>
            </category>
            <category name="⚙️ Game Rules" categorystyle="rules_category">
                <block type="admin_address"></block><block type="initial_supply"></block>
            </category>
            <category name="✨ Special Powers" categorystyle="powers_category">
                <block type="can_mint"></block><block type="can_burn"></block>
            </category>
            <category name="🛡️ Advanced Rules" categorystyle="advanced_category">
                <block type="is_pausable"></block><block type="transfer_limit"></block>
            </category>
        </xml>
    `;

    // --- 4. Preparing the Workspace (Restored) ---
    const blocklyWorkspace = Blockly.inject('blocklyDiv', {
        toolbox: toolbox, scrollbars: true, trashcan: true, renderer: 'zelos', theme: tralaleroTheme
    });

    // --- 4.1. Crear Bloques por Defecto ---
    function createDefaultBlocks() {
        console.log('🔄 Creando bloques por defecto...');

        // Limpiar workspace
        blocklyWorkspace.clear();

        try {
            // Crear el bloque principal del contrato
            const contractBlock = blocklyWorkspace.newBlock('contract_settings');
            if (!contractBlock) {
                console.error('❌ No se pudo crear el bloque de contrato');
                return;
            }
            contractBlock.initSvg();
            contractBlock.render();
            contractBlock.moveBy(50, 50);
            console.log('✅ Bloque de contrato creado');

            // Crear bloques básicos necesarios
            const blocks = [];

            const nameBlock = blocklyWorkspace.newBlock('token_name');
            if (nameBlock) {
                nameBlock.initSvg();
                nameBlock.render();
                nameBlock.setFieldValue('Mi Token Mágico', 'NAME');
                blocks.push(nameBlock);
                console.log('✅ Bloque de nombre creado');
            }

            const symbolBlock = blocklyWorkspace.newBlock('token_symbol');
            if (symbolBlock) {
                symbolBlock.initSvg();
                symbolBlock.render();
                symbolBlock.setFieldValue('MAGIC', 'SYMBOL');
                blocks.push(symbolBlock);
                console.log('✅ Bloque de símbolo creado');
            }

            const decimalsBlock = blocklyWorkspace.newBlock('token_decimals');
            if (decimalsBlock) {
                decimalsBlock.initSvg();
                decimalsBlock.render();
                decimalsBlock.setFieldValue(2, 'DECIMALS');
                blocks.push(decimalsBlock);
                console.log('✅ Bloque de decimales creado');
            }

            const adminBlock = blocklyWorkspace.newBlock('admin_address');
            if (adminBlock) {
                adminBlock.initSvg();
                adminBlock.render();
                adminBlock.setFieldValue('G...', 'ADDRESS');
                blocks.push(adminBlock);
                console.log('✅ Bloque de admin creado');
            }

            const supplyBlock = blocklyWorkspace.newBlock('initial_supply');
            if (supplyBlock) {
                supplyBlock.initSvg();
                supplyBlock.render();
                supplyBlock.setFieldValue(1000, 'SUPPLY');
                blocks.push(supplyBlock);
                console.log('✅ Bloque de suministro creado');
            }

            const mintBlock = blocklyWorkspace.newBlock('can_mint');
            if (mintBlock) {
                mintBlock.initSvg();
                mintBlock.render();
                mintBlock.setFieldValue(true, 'MINT_ENABLED');
                blocks.push(mintBlock);
                console.log('✅ Bloque de mint creado');
            }

            const burnBlock = blocklyWorkspace.newBlock('can_burn');
            if (burnBlock) {
                burnBlock.initSvg();
                burnBlock.render();
                burnBlock.setFieldValue(true, 'BURN_ENABLED');
                blocks.push(burnBlock);
                console.log('✅ Bloque de burn creado');
            }

            // Conectar todos los bloques de forma secuencial
            setTimeout(() => {
                try {
                    console.log('🔗 Intentando conectar bloques...');

                    // Conectar el primer bloque al contrato
                    const settingsInput = contractBlock.getInput('SETTINGS');
                    if (settingsInput && settingsInput.connection && blocks[0] && blocks[0].previousConnection) {
                        settingsInput.connection.connect(blocks[0].previousConnection);
                        console.log('✅ Primer bloque conectado');
                    }

                    // Conectar los bloques en cadena
                    for (let i = 0; i < blocks.length - 1; i++) {
                        const currentBlock = blocks[i];
                        const nextBlock = blocks[i + 1];

                        if (currentBlock && currentBlock.nextConnection &&
                            nextBlock && nextBlock.previousConnection) {
                            currentBlock.nextConnection.connect(nextBlock.previousConnection);
                            console.log(`✅ Bloque ${i + 1} conectado`);
                        }
                    }

                    // Renderizar de nuevo después de conectar
                    blocklyWorkspace.render();
                    console.log('🎉 Bloques por defecto creados y conectados');

                } catch (error) {
                    console.error('❌ Error conectando bloques:', error);
                }
            }, 500);

        } catch (error) {
            console.error('❌ Error creando bloques:', error);
        }
    }

    // Crear bloques por defecto al cargar (con delay para asegurar que Blockly esté listo)
    setTimeout(() => {
        createDefaultBlocks();

        // Verificar Freighter al cargar para logging
        setTimeout(() => {
            const freighterCheck = checkFreighterAvailability();
            if (freighterCheck.available) {
                console.log('✅ Freighter detectado y disponible');
                statusDiv.textContent = '✅ ¡Listo! Freighter detectado. Personaliza tu token y despliega.';
                statusDiv.className = 'status-area success';
            } else {
                console.warn('⚠️ Freighter no disponible:', freighterCheck.error);
                statusDiv.textContent = '⚠️ Freighter no detectado. Instálalo desde freighter.app antes de desplegar.';
                statusDiv.className = 'status-area error';
            }
        }, 1000);
    }, 500);

    // --- 4.2. Generación de Código en Tiempo Real ---
    function generateRustCode() {
        const contractBlock = blocklyWorkspace.getBlocksByType('contract_settings', false)[0];
        if (!contractBlock) {
            return null;
        }

        const data = {};
        let currentBlock = contractBlock.getInputTargetBlock('SETTINGS');

        while (currentBlock) {
            switch (currentBlock.type) {
                case 'token_name':
                    data.token_name = currentBlock.getFieldValue('NAME');
                    break;
                case 'token_symbol':
                    data.token_symbol = currentBlock.getFieldValue('SYMBOL');
                    break;
                case 'token_decimals':
                    data.token_decimals = currentBlock.getFieldValue('DECIMALS');
                    break;
                case 'admin_address':
                    data.admin_address = currentBlock.getFieldValue('ADDRESS');
                    break;
                case 'initial_supply':
                    data.initial_supply = currentBlock.getFieldValue('SUPPLY');
                    break;
                case 'can_mint':
                    data.mint_enabled = currentBlock.getFieldValue('MINT_ENABLED') === 'TRUE';
                    break;
                case 'can_burn':
                    data.burn_enabled = currentBlock.getFieldValue('BURN_ENABLED') === 'TRUE';
                    break;
            }
            currentBlock = currentBlock.getNextBlock();
        }

        return data;
    }

    // Función para validar bloques con errores detallados
    function validateBlocks() {
        const errors = [];
        const warnings = [];

        const contractBlock = blocklyWorkspace.getBlocksByType('contract_settings', false)[0];
        if (!contractBlock) {
            errors.push('❌ Falta el bloque principal "Mi Contrato Mágico"');
            return { errors, warnings, isValid: false };
        }

        const data = generateRustCode();
        if (!data) {
            errors.push('❌ No se pudieron leer los datos de los bloques');
            return { errors, warnings, isValid: false };
        }

        // Validar campos requeridos
        if (!data.token_name || data.token_name.trim() === '') {
            errors.push('❌ El nombre del token está vacío. Usa el bloque "Nombre de la moneda"');
        }

        if (!data.token_symbol || data.token_symbol.trim() === '') {
            errors.push('❌ El símbolo del token está vacío. Usa el bloque "Símbolo (dibujito)"');
        }

        if (data.token_decimals === undefined || data.token_decimals === '') {
            errors.push('❌ Los decimales no están definidos. Usa el bloque "Nº de pedacitos"');
        }

        if (!data.admin_address || data.admin_address.trim() === '' || data.admin_address === 'G...') {
            errors.push('❌ La dirección del administrador no está configurada. Cambia "G..." por tu dirección real');
        }

        if (!data.initial_supply || data.initial_supply <= 0) {
            errors.push('❌ El suministro inicial debe ser mayor a 0. Usa el bloque "Cantidad inicial"');
        }

        // Validar formato de dirección Stellar
        if (data.admin_address && data.admin_address !== 'G...' && !data.admin_address.startsWith('G')) {
            errors.push('❌ La dirección del administrador debe empezar con "G" (formato Stellar)');
        }

        // Warnings
        if (data.token_name && data.token_name.length < 3) {
            warnings.push('⚠️ El nombre del token es muy corto (mínimo 3 caracteres)');
        }

        if (data.token_symbol && data.token_symbol.length > 4) {
            warnings.push('⚠️ El símbolo del token es muy largo (máximo 4 caracteres recomendado)');
        }

        return {
            errors,
            warnings,
            isValid: errors.length === 0,
            data
        };
    }

    // Función para generar código Rust como string
    function generateRustCodeString(data) {
        return `// Código generado automáticamente por Tralalero Contracts
#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, IntoVal, Val};
use soroban_token_sdk::{TokenUtils, metadata::TokenMetadata};

const ADMIN_KEY: Val = soroban_sdk::symbol_short!("ADMIN").into_val();

fn check_admin(env: &Env) {
    let admin: Address = env.storage().instance().get(&ADMIN_KEY).unwrap();
    admin.require_auth();
}

#[contract]
pub struct TokenContract;

#[contractimpl]
impl TokenContract {
    pub fn initialize(env: Env, admin: Address, initial_supply: i128) {
        if env.storage().instance().has(&ADMIN_KEY) {
            panic!("Contract already initialized");
        }
        env.storage().instance().set(&ADMIN_KEY, &admin);

        if initial_supply > 0 {
            let token_utils = TokenUtils::new(&env);
            let formatted_supply = initial_supply * 10i128.pow(${data.token_decimals || 2});
            token_utils.mint(&admin, &formatted_supply);
        }
    }

    pub fn metadata(env: Env) -> TokenMetadata {
        TokenMetadata {
            name: String::from_slice(&env, "${data.token_name || 'Mi Token'}"),
            symbol: String::from_slice(&env, "${data.token_symbol || 'TOKEN'}"),
            decimals: ${data.token_decimals || 2},
        }
    }

    ${data.mint_enabled ? `
    pub fn mint(env: Env, to: Address, amount: i128) {
        check_admin(&env);
        TokenUtils::new(&env).mint(&to, &amount);
    }` : ''}

    ${data.burn_enabled ? `
    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();
        TokenUtils::new(&env).burn(&from, &amount);
    }` : ''}

    // Funciones estándar del token
    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        TokenUtils::new(&env).allowance(&from, &spender)
    }

    pub fn approve(env: Env, from: Address, spender: Address, amount: i128, expiration_ledger: u32) {
        TokenUtils::new(&env).approve(&from, &spender, &amount, expiration_ledger)
    }

    pub fn balance(env: Env, id: Address) -> i128 {
        TokenUtils::new(&env).balance(&id)
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        TokenUtils::new(&env).transfer(&from, &to, &amount)
    }

    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        TokenUtils::new(&env).transfer_from(&spender, &from, &to, &amount)
    }
}`;
    }

    // Función para mostrar toasts
    function showToast(message, type = 'info') {
        // Remover toast existente
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Auto-remover después de 3 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 3000);
    }

    // Escuchar cambios en el workspace para actualizar estado
    blocklyWorkspace.addChangeListener((event) => {
        if (event.type === Blockly.Events.BLOCK_CHANGE ||
            event.type === Blockly.Events.BLOCK_MOVE ||
            event.type === Blockly.Events.BLOCK_CREATE ||
            event.type === Blockly.Events.BLOCK_DELETE) {
            // Actualizar estado de validación
            const validation = validateBlocks();
            if (validation.isValid) {
                statusDiv.textContent = '✅ Configuración válida. Listo para deployar.';
                statusDiv.className = 'status-area success';
            } else {
                statusDiv.textContent = '⚠️ ' + validation.errors[0];
                statusDiv.className = 'status-area error';
            }
        }
    });

    // --- 5. New Deployment Logic ---
    const deployBtn = document.getElementById('deployBtn');
    const resetBtn = document.getElementById('resetBtn');
    const contractBtn = document.getElementById('contractBtn');
    const statusDiv = document.getElementById('status');

    // Modal elements
    const contractModal = document.getElementById('contractModal');
    const closeModal = document.getElementById('closeModal');
    const contractCode = document.getElementById('contractCode');
    const downloadBtn = document.getElementById('downloadBtn');
    const copyBtn = document.getElementById('copyBtn');

    // Función para verificar Freighter con soporte para múltiples APIs
    function checkFreighterAvailability() {
        console.log('🔍 Verificando disponibilidad de Freighter...');
        console.log('window.freighterApi:', window.freighterApi);
        console.log('window.freighter:', window.freighter);

        // Verificar diferentes formas de acceso a Freighter
        const freighterApi = window.freighterApi || window.freighter;

        if (!freighterApi) {
            return {
                available: false,
                error: 'Freighter no está instalado o no se cargó correctamente'
            };
        }

        // Verificar métodos en diferentes ubicaciones
        const getPublicKey = freighterApi.getPublicKey || freighterApi.requestAccess || freighterApi.connect;
        const signTransaction = freighterApi.signTransaction || freighterApi.sign;
        const isConnected = freighterApi.isConnected || freighterApi.isAllowed;

        console.log('🔍 Métodos encontrados:');
        console.log('  getPublicKey:', typeof getPublicKey);
        console.log('  signTransaction:', typeof signTransaction);
        console.log('  isConnected:', typeof isConnected);

        if (typeof getPublicKey !== 'function') {
            return {
                available: false,
                error: 'Freighter no tiene método de conexión válido. Versión: ' + (freighterApi.version || 'desconocida')
            };
        }

        return {
            available: true,
            api: freighterApi,
            methods: {
                getPublicKey,
                signTransaction,
                isConnected
            }
        };
    }

    // Función para conectar automáticamente con Freighter
    async function autoConnectFreighter() {
        // Verificación de Freighter
        const freighterCheck = checkFreighterAvailability();
        if (!freighterCheck.available) {
            throw new Error('🛰️ ' + freighterCheck.error + '\n\nPasos para solucionarlo:\n1. Instala Freighter desde freighter.app\n2. Asegúrate de que esté habilitado\n3. Refresca la página');
        }

        const { api, methods } = freighterCheck;

        // Solicitar conexión usando el método correcto
        const publicKey = await methods.getPublicKey();
        console.log('✅ Freighter conectado automáticamente:', publicKey);

        // Verificar red (opcional)
        try {
            if (api.getNetworkDetails) {
                const networkDetails = await api.getNetworkDetails();
                console.log('🌐 Red detectada:', networkDetails);

                if (networkDetails && networkDetails.network !== 'TESTNET') {
                    throw new Error('🛰️ Freighter debe estar en TESTNET. Ve a Settings → Network → Testnet');
                }
            }
        } catch (netError) {
            console.warn('No se pudo verificar la red:', netError);
        }

        // Guardar la API para uso posterior
        window.activeFreighterApi = api;
        window.activeFreighterMethods = methods;

        return { api, methods };
    }

    // Botón para resetear bloques
    resetBtn.addEventListener('click', () => {
        createDefaultBlocks();
        statusDiv.textContent = '¡Bloques reseteados! Personaliza tu token y despliega.';
        statusDiv.className = 'status-area';
    });

    // Botón para ver contrato
    contractBtn.addEventListener('click', () => {
        const validation = validateBlocks();
        if (!validation.isValid) {
            showToast('❌ ' + validation.errors[0], 'error');
            return;
        }

        const rustCode = generateRustCodeString(validation.data);
        contractCode.textContent = rustCode;
        contractModal.style.display = 'block';
    });

    // Cerrar modal
    closeModal.addEventListener('click', () => {
        contractModal.style.display = 'none';
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === contractModal) {
            contractModal.style.display = 'none';
        }
    });

    // Descargar contrato
    downloadBtn.addEventListener('click', () => {
        const code = contractCode.textContent;
        const blob = new Blob([code], { type: 'text/rust' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'token_contract.rs';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('✅ Contrato descargado', 'success');
    });

    // Copiar código
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(contractCode.textContent);
            showToast('✅ Código copiado al portapapeles', 'success');
        } catch (err) {
            showToast('❌ Error al copiar código', 'error');
        }
    });


    deployBtn.addEventListener('click', async () => {
        statusDiv.textContent = 'Validando configuración...';
        statusDiv.className = 'status-area';

        // 1. Validar bloques con errores detallados
        const validation = validateBlocks();

        if (!validation.isValid) {
            statusDiv.textContent = '❌ ' + validation.errors[0];
            statusDiv.classList.add('error');
            showToast(validation.errors[0], 'error');
            return;
        }

        // Mostrar warnings si hay
        if (validation.warnings.length > 0) {
            statusDiv.textContent = '⚠️ Advertencias encontradas, pero continuando...';
            statusDiv.className = 'status-area';
            // Mostrar warnings en el estado en lugar de codeOutput que no existe
            console.warn('Warnings:', validation.warnings.join('\n'));
        } else {
            statusDiv.textContent = '✅ Configuración válida. Iniciando deployment...';
            statusDiv.className = 'status-area';
        }

        const data = validation.data;

        try {
            // 2. Crear token directamente en el servidor
            statusDiv.textContent = '🧙‍♂️ Creando token en la red Stellar...';
            console.log('📝 Enviando datos para crear token:');
            console.log('   Token código:', data.token_symbol);
            console.log('   Cantidad inicial:', data.initial_supply);

            const response = await fetch('/api/build-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: data.token_symbol,
                    amount: data.initial_supply
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('📋 Error del servidor:', errorText);
                throw new Error(`Error del servidor: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Respuesta del servidor:', result);

            if (!result.success) {
                throw new Error(result.details || 'Error desconocido del servidor');
            }

            // 4. Mostrar resultado exitoso
            statusDiv.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 1.2em; margin-bottom: 1rem;">✅ ¡Token creado exitosamente!</div>
                    <div style="margin-bottom: 1rem;">
                        <div style="font-family: monospace; background: #f1f5f9; padding: 0.5rem; border-radius: 0.375rem; font-size: 0.875rem; margin-bottom: 0.5rem;">
                            <strong>Token:</strong> ${result.assetCode}
                        </div>
                        <div style="font-family: monospace; background: #f1f5f9; padding: 0.5rem; border-radius: 0.375rem; font-size: 0.875rem; margin-bottom: 0.5rem;">
                            <strong>Emisor:</strong> ${result.assetIssuer}
                        </div>
                        <div style="font-family: monospace; background: #f1f5f9; padding: 0.5rem; border-radius: 0.375rem; font-size: 0.875rem; margin-bottom: 0.5rem;">
                            <strong>Hash:</strong> ${result.transactionHash}
                        </div>
                    </div>
                    <a href="https://stellar.expert/explorer/testnet/tx/${result.transactionHash}" 
                       target="_blank" 
                       style="display: inline-block; background: #6366f1; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.5rem; font-weight: 600; margin: 0.5rem;">
                        🔍 Ver en Stellar Explorer
                    </a>
                    <a href="https://laboratory.stellar.org/#explorer?resource=transactions&endpoint=single&network=testnet&request=+${result.transactionHash}" 
                       target="_blank" 
                       style="display: inline-block; background: #10b981; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.5rem; font-weight: 600; margin: 0.5rem;">
                        🧪 Ver en Laboratory
                    </a>
                </div>
            `;
            statusDiv.classList.add('success');

            // Mostrar toast adicional
            showToast('¡Token creado exitosamente! Revisa los enlaces de abajo.', 'success');
            console.log('Transaction Hash:', result.transactionHash);
            console.log('Explorer Link:', `https://stellar.expert/explorer/testnet/tx/${result.transactionHash}`);

        } catch (error) {
            console.error('Deployment Error:', error);

            // Manejo específico de errores
            let errorMessage = '🔥 Error desconocido';

            if (error.message.includes('STELLAR_SECRET_KEY')) {
                errorMessage = '🔐 Error de configuración del servidor. Contacta al administrador.';
            } else if (error.message.includes('Error del servidor')) {
                errorMessage = '🖥️ Error del servidor. Verifica la configuración.';
            } else if (error.message.includes('balance insuficiente') || error.message.includes('Balance insuficiente')) {
                errorMessage = '💰 Balance insuficiente en la cuenta del servidor. Necesita más XLM.';
            } else if (error.message.includes('network') || error.message.includes('conexión')) {
                errorMessage = '🌐 Error de conexión. Verifica tu internet.';
            } else if (error.message.includes('Error de transacción')) {
                errorMessage = '⚠️ Error en la transacción. Revisa los datos del token.';
            } else {
                errorMessage = `🔥 Error: ${error.message}`;
            }

            statusDiv.textContent = errorMessage;
            statusDiv.classList.add('error');
            showToast(errorMessage, 'error');
        }
    });
});
