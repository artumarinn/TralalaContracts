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

    // --- 2. Definición de bloques de Smart Contract (Genérico) ---
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
            this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setStyle('property_blocks');
        }
    };
    Blockly.Blocks['contract_version'] = {
        init: function () {
            this.appendDummyInput().appendField("Versión").appendField(new Blockly.FieldTextInput("0.1.0"), "VERSION");
            this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setStyle('property_blocks');
        }
    };
    Blockly.Blocks['admin_address'] = {
        init: function () {
            this.appendDummyInput().appendField("🔑 Administrador (Address)").appendField(new Blockly.FieldTextInput('G...'), "ADDRESS");
            this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setStyle('rules_blocks');
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
            this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setStyle('rules_blocks');
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
            this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setStyle('advanced_blocks');
        }
    };

    // --- 3. Toolbox ---
    const toolbox = `
        <xml id="toolbox" style="display: none">
            <category name="🚀 Empezar" categorystyle="start_category"><block type="contract_settings"></block></category>
            <category name="🎨 Propiedades" categorystyle="property_category">
                <block type="contract_name"></block><block type="contract_version"></block><block type="admin_address"></block>
            </category>
            <category name="📦 Estado" categorystyle="rules_category">
                <block type="state_var"></block>
            </category>
            <category name="⚙️ Funciones" categorystyle="advanced_category">
                <block type="function_def"></block>
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

            const nameBlock = blocklyWorkspace.newBlock('contract_name');
            if (nameBlock) {
                nameBlock.initSvg();
                nameBlock.render();
                nameBlock.setFieldValue('MiContrato', 'NAME');
                blocks.push(nameBlock);
                console.log('✅ Bloque de nombre creado');
            }

            const versionBlock = blocklyWorkspace.newBlock('contract_version');
            if (versionBlock) {
                versionBlock.initSvg();
                versionBlock.render();
                versionBlock.setFieldValue('0.1.0', 'VERSION');
                blocks.push(versionBlock);
                console.log('✅ Bloque de versión creado');
            }

            const adminBlock = blocklyWorkspace.newBlock('admin_address');
            if (adminBlock) {
                adminBlock.initSvg();
                adminBlock.render();
                adminBlock.setFieldValue('G...', 'ADDRESS');
                blocks.push(adminBlock);
                console.log('✅ Bloque de admin creado');
            }

            const stateVarBlock = blocklyWorkspace.newBlock('state_var');
            if (stateVarBlock) {
                stateVarBlock.initSvg();
                stateVarBlock.render();
                stateVarBlock.setFieldValue('contador', 'VAR_NAME');
                stateVarBlock.setFieldValue('I32', 'VAR_TYPE');
                blocks.push(stateVarBlock);
                console.log('✅ Bloque de variable de estado creado');
            }

            const fnBlock = blocklyWorkspace.newBlock('function_def');
            if (fnBlock) {
                fnBlock.initSvg();
                fnBlock.render();
                fnBlock.setFieldValue('incrementar', 'FN_NAME');
                fnBlock.setFieldValue('VOID', 'RET_TYPE');
                blocks.push(fnBlock);
                console.log('✅ Bloque de función creado');
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

        const data = { name: '', version: '0.1.0', admin: '', state: [], functions: [] };
        let currentBlock = contractBlock.getInputTargetBlock('SETTINGS');

        while (currentBlock) {
            switch (currentBlock.type) {
                case 'contract_name':
                    data.name = currentBlock.getFieldValue('NAME');
                    break;
                case 'contract_version':
                    data.version = currentBlock.getFieldValue('VERSION');
                    break;
                case 'admin_address':
                    data.admin = currentBlock.getFieldValue('ADDRESS');
                    break;
                case 'state_var':
                    data.state.push({
                        name: currentBlock.getFieldValue('VAR_NAME'),
                        type: currentBlock.getFieldValue('VAR_TYPE')
                    });
                    break;
                case 'function_def':
                    data.functions.push({
                        name: currentBlock.getFieldValue('FN_NAME'),
                        returns: currentBlock.getFieldValue('RET_TYPE')
                    });
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

        return {
            errors,
            warnings,
            isValid: errors.length === 0,
            data
        };
    }

    // Función para generar código Rust como string (genérico)
    function generateRustCodeString(data) {
        const contractName = (data.name || 'MyContract').replace(/[^A-Za-z0-9_]/g, '');
        const stateDecls = (data.state || []).map(v => {
            const key = v.name.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
            return `const ${key}: Symbol = symbol_short!("${key.substring(0, 9)}");`;
        }).join('\n');

        const gettersSetters = (data.state || []).map(v => {
            const key = v.name.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
            const rustType = v.type === 'I32' ? 'i32' : v.type === 'I128' ? 'i128' : v.type === 'BOOL' ? 'bool' : v.type === 'ADDRESS' ? 'Address' : 'String';
            const getFn = `pub fn get_${v.name}(env: Env) -> ${rustType} { env.storage().instance().get(&${key}).unwrap() }`;
            const setFn = `pub fn set_${v.name}(env: Env, value: ${rustType}) { Self::require_admin(&env); env.storage().instance().set(&${key}, &value); }`;
            return `${getFn}\n\n${setFn}`;
        }).join('\n\n');

        const fnStubs = (data.functions || []).map(f => {
            const ret = f.returns === 'VOID' ? '' : ` -> ${f.returns === 'I32' ? 'i32' : f.returns === 'I128' ? 'i128' : f.returns === 'BOOL' ? 'bool' : f.returns === 'ADDRESS' ? 'Address' : 'String'}`;
            const body = f.returns === 'VOID' ? ` { /* TODO */ }` : ` { panic!("not implemented") }`;
            return `pub fn ${f.name}(env: Env)${ret}${body}`;
        }).join('\n\n');

        return `// Código generado automáticamente por Tralalero Contracts\n#![no_std]\nuse soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, String};\n\nconst ADMIN: Symbol = symbol_short!("ADMIN");\n${stateDecls ? stateDecls + '\n' : ''}\n#[contract]\npub struct ${contractName};\n\n#[contractimpl]\nimpl ${contractName} {\n    pub fn initialize(env: Env, admin: Address) {\n        if env.storage().instance().has(&ADMIN) {\n            panic!("Contract already initialized");\n        }\n        env.storage().instance().set(&ADMIN, &admin);\n    }\n\n    fn require_admin(env: &Env) {\n        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();\n        admin.require_auth();\n    }\n\n${gettersSetters}\n\n${fnStubs}\n}`;
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
                statusDiv.textContent = '✅ Configuración válida. Listo para generar el contrato.';
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
        a.download = 'smart_contract.rs';
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


    // En este flujo, solo generamos/mostramos el contrato (sin crear tokens)
    deployBtn.addEventListener('click', async () => {
        statusDiv.textContent = 'Validando configuración...';
        statusDiv.className = 'status-area';

        const validation = validateBlocks();
        if (!validation.isValid) {
            statusDiv.textContent = '❌ ' + validation.errors[0];
            statusDiv.classList.add('error');
            showToast(validation.errors[0], 'error');
            return;
        }

        const rustCode = generateRustCodeString(validation.data);
        contractCode.textContent = rustCode;
        contractModal.style.display = 'block';
        statusDiv.textContent = '✅ Contrato generado. Puedes descargarlo o copiarlo.';
        statusDiv.className = 'status-area success';
    });
});
