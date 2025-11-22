document.addEventListener("DOMContentLoaded", () => {

    // --- 1. Custom Theme Definition ---
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
            'rwa_blocks': { 'colourPrimary': '#C62828' },
        },
        'categoryStyles': {
            'start_category': { 'colour': '#8E24AA' },
            'property_category': { 'colour': '#1E88E5' },
            'rules_category': { 'colour': '#5E35B1' },
            'powers_category': { 'colour': '#FF8F00' },
            'advanced_category': { 'colour': '#E91E63' },
            'rwa_category': { 'colour': '#C62828' },
        }
    });

    // --- 2. Block Definitions (Generic) ---
    Blockly.Blocks['contract_settings'] = {
        init: function () {
            this.appendDummyInput().appendField("🔮 My Smart Contract");
            this.appendStatementInput("SETTINGS").setCheck(null);
            this.setStyle('start_blocks');
        }
    };
    Blockly.Blocks['contract_name'] = {
        init: function () {
            this.appendDummyInput().appendField("Contract Name").appendField(new Blockly.FieldTextInput("MyContract"), "NAME");
            this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setStyle('property_blocks');
        }
    };
    Blockly.Blocks['contract_version'] = {
        init: function () {
            this.appendDummyInput().appendField("Version").appendField(new Blockly.FieldTextInput("0.1.0"), "VERSION");
            this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setStyle('property_blocks');
        }
    };
    Blockly.Blocks['admin_address'] = {
        init: function () {
            this.appendDummyInput().appendField("🔑 Administrator (Address)").appendField(new Blockly.FieldTextInput('G...'), "ADDRESS");
            this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setStyle('rules_blocks');
        }
    };

    // --- 3. Template-Specific Toolboxes ---
    const toolboxes = {
        basic: `
            <xml id="toolbox" style="display: none">
                <category name="🚀 Start" categorystyle="start_category">
                    <block type="contract_settings"></block>
                </category>
                <category name="👋 Hello World" categorystyle="property_category">
                    <block type="hello_world_function"></block>
                </category>
            </xml>
        `,
        rwa: `
            <xml id="toolbox" style="display: none">
                <category name="🚀 Start" categorystyle="start_category">
                    <block type="contract_settings"></block>
                    <block type="contract_name"></block>
                    <block type="contract_version"></block>
                </category>
                <category name="🏢 Real World Assets" categorystyle="rwa_category">
                    <block type="rwa_asset"></block>
                    <block type="rwa_custody"></block>
                    <block type="rwa_redemption"></block>
                </category>
                <category name="📋 Settlement &amp; Compliance" categorystyle="rwa_category">
                    <block type="rwa_settlement"></block>
                    <block type="rwa_compliance"></block>
                </category>
                <category name="🔐 Administration" categorystyle="property_category">
                    <block type="admin_address"></block>
                    <block type="admin_config"></block>
                </category>
                <category name="⚖️ Verification" categorystyle="advanced_category">
                    <block type="require_condition"></block>
                    <block type="access_control"></block>
                </category>
            </xml>
        `,
        defi: `
            <xml id="toolbox" style="display: none">
                <category name="🚀 Start" categorystyle="start_category">
                    <block type="contract_settings"></block>
                </category>
                <category name="🔢 Counter" categorystyle="powers_category">
                    <block type="counter_function"></block>
                </category>
            </xml>
        `
    };

    // --- 4. Global workspace variable ---
    let blocklyWorkspace = null;
    let currentTemplate = 'basic';

    // --- 5. Initialize Blockly on first load ---
    function initializeBlockly() {
        if (!blocklyWorkspace) {
            const toolbox = toolboxes.basic || toolboxes.basic;
            blocklyWorkspace = Blockly.inject('blocklyDiv', {
                toolbox: toolbox,
                scrollbars: true,
                trashcan: true,
                renderer: 'zelos',
                theme: tralaleroTheme
            });
            console.log('✅ Blockly workspace initialized');
        }
    }

    // --- 6. Template-aware default block creation ---
    function createDefaultBlocks() {
        console.log(`🔄 Creating default blocks for template: ${currentTemplate}`);

        if (!blocklyWorkspace) {
            console.error('❌ Workspace not initialized');
            return;
        }

        blocklyWorkspace.clear();
        const blocks = [];

        // Always add contract settings block
        const contractBlock = blocklyWorkspace.newBlock('contract_settings');
        if (contractBlock) {
            contractBlock.initSvg();
            contractBlock.render();
            contractBlock.moveBy(50, 50);
            console.log('✅ Contract settings block created');
        }

        // Template-specific blocks
        if (currentTemplate === 'basic') {
            // Hello World template
            const helloWorldBlock = blocklyWorkspace.newBlock('hello_world_function');
            if (helloWorldBlock) {
                helloWorldBlock.initSvg();
                helloWorldBlock.render();
                helloWorldBlock.setFieldValue('Hello, Stellar!', 'MESSAGE');
                blocks.push(helloWorldBlock);
                console.log('✅ Hello World function block created');
            }

        } else if (currentTemplate === 'rwa') {
            // Real World Assets template
            const rwaAsset = blocklyWorkspace.newBlock('rwa_asset');
            if (rwaAsset) {
                rwaAsset.initSvg();
                rwaAsset.render();
                blocks.push(rwaAsset);
                console.log('✅ RWA asset block created');
            }

            const rwaCustody = blocklyWorkspace.newBlock('rwa_custody');
            if (rwaCustody) {
                rwaCustody.initSvg();
                rwaCustody.render();
                blocks.push(rwaCustody);
                console.log('✅ RWA custody block created');
            }

            const rwaSettlement = blocklyWorkspace.newBlock('rwa_settlement');
            if (rwaSettlement) {
                rwaSettlement.initSvg();
                rwaSettlement.render();
                blocks.push(rwaSettlement);
                console.log('✅ RWA settlement block created');
            }

            const rwaCompliance = blocklyWorkspace.newBlock('rwa_compliance');
            if (rwaCompliance) {
                rwaCompliance.initSvg();
                rwaCompliance.render();
                blocks.push(rwaCompliance);
                console.log('✅ RWA compliance block created');
            }

            const rwaRedemption = blocklyWorkspace.newBlock('rwa_redemption');
            if (rwaRedemption) {
                rwaRedemption.initSvg();
                rwaRedemption.render();
                blocks.push(rwaRedemption);
                console.log('✅ RWA redemption block created');
            }

        } else if (currentTemplate === 'defi') {
            // Counter template
            const counterBlock = blocklyWorkspace.newBlock('counter_function');
            if (counterBlock) {
                counterBlock.initSvg();
                counterBlock.render();
                counterBlock.setFieldValue(1, 'INCREMENT');
                blocks.push(counterBlock);
                console.log('✅ Counter function block created');
            }
        }

        // Connect blocks in sequence
        setTimeout(() => {
            try {
                console.log('🔗 Connecting blocks...');

                const settingsInput = contractBlock.getInput('SETTINGS');
                if (settingsInput && settingsInput.connection && blocks[0] && blocks[0].previousConnection) {
                    settingsInput.connection.connect(blocks[0].previousConnection);
                    console.log('✅ First block connected');
                }

                for (let i = 0; i < blocks.length - 1; i++) {
                    const currentBlock = blocks[i];
                    const nextBlock = blocks[i + 1];

                    if (currentBlock && currentBlock.nextConnection &&
                        nextBlock && nextBlock.previousConnection) {
                        currentBlock.nextConnection.connect(nextBlock.previousConnection);
                        console.log(`✅ Block ${i + 1} connected`);
                    }
                }

                blocklyWorkspace.render();
                console.log('🎉 Default blocks created and connected for template: ' + currentTemplate);

            } catch (error) {
                console.error('❌ Error connecting blocks:', error);
            }
        }, 300);
    }

    // --- 7. PUBLIC FUNCTION: Switch template and reload blocks ---
    window.switchTemplate = function(templateName) {
        console.log(`🔄 Switching to template: ${templateName}`);

        if (!toolboxes[templateName]) {
            console.error(`❌ Unknown template: ${templateName}`);
            return;
        }

        currentTemplate = templateName;

        // Update toolbox
        const newToolbox = toolboxes[templateName];
        blocklyWorkspace.updateToolbox(newToolbox);
        console.log(`✅ Toolbox updated for ${templateName}`);

        // Recreate default blocks for the new template
        createDefaultBlocks();

        console.log(`✅ Template switched to: ${templateName}`);
    };

    // --- 8. Code Generation Functions ---
    function generateRustCode() {
        if (!blocklyWorkspace) return null;

        const contractBlock = blocklyWorkspace.getBlocksByType('contract_settings', false)[0];
        if (!contractBlock) return null;

        const data = {
            name: '',
            version: '0.1.0',
            admin: '',
            state: [],
            functions: [],
            templateType: currentTemplate,
            helloWorldMessage: null,
            counterIncrement: null
        };
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
                case 'hello_world_function':
                    data.helloWorldMessage = currentBlock.getFieldValue('MESSAGE') || 'Hello, Stellar!';
                    break;
                case 'counter_function':
                    data.counterIncrement = currentBlock.getFieldValue('INCREMENT') || 1;
                    break;
            }
            currentBlock = currentBlock.getNextBlock();
        }

        return data;
    }

    function validateBlocks() {
        const errors = [];
        const warnings = [];

        if (!blocklyWorkspace) {
            errors.push('❌ Workspace not initialized');
            return { errors, warnings, isValid: false };
        }

        const contractBlock = blocklyWorkspace.getBlocksByType('contract_settings', false)[0];
        if (!contractBlock) {
            errors.push('❌ Missing main "My Smart Contract" block');
            return { errors, warnings, isValid: false };
        }

        const data = generateRustCode();
        if (!data) {
            errors.push('❌ Could not read block data');
            return { errors, warnings, isValid: false };
        }

        // Skip validation for Hello World and Counter templates
        const isHelloWorld = data.helloWorldMessage !== null;
        const isCounter = data.counterIncrement !== null && data.counterIncrement !== undefined;

        if (!isHelloWorld && !isCounter && (!data.name || data.name.trim() === '')) {
            errors.push('❌ Contract name is empty');
        }

        if (!isHelloWorld && !isCounter && (!data.admin || data.admin.trim() === '' || data.admin === 'G...')) {
            warnings.push('⚠️ Admin address not configured');
        }

        if (!isHelloWorld && !isCounter && data.admin && data.admin !== 'G...' && !data.admin.startsWith('G')) {
            warnings.push('⚠️ Admin address should start with "G" (Stellar)');
        }

        return {
            errors,
            warnings,
            isValid: errors.length === 0,
            data
        };
    }

    function generateRustCodeString(data) {
        // Handle Hello World template
        if (data.templateType === 'basic' || data.helloWorldMessage) {
            const message = data.helloWorldMessage || 'Hello, Stellar!';
            return `// Generated by Tralalero Contracts - Hello World
#![no_std]
use soroban_sdk::{contract, contractimpl, Env, String};

#[contract]
pub struct HelloContract;

#[contractimpl]
impl HelloContract {
    /// Returns a greeting message
    pub fn hello(env: Env) -> String {
        String::from_str(&env, "${message}")
    }
}`;
        }

        // Handle Counter template
        if (data.templateType === 'defi' || data.counterIncrement !== null) {
            const increment = data.counterIncrement || 1;
            return `// Generated by Tralalero Contracts - Counter
#![no_std]
use soroban_sdk::{contract, contractimpl, Env};

#[contract]
pub struct CounterContract;

#[contractimpl]
impl CounterContract {
    /// Takes a number and returns the number plus ${increment}
    pub fn increment(_env: Env, value: u32) -> u32 {
        value + ${increment}
    }
}`;
        }

        // Handle RWA and other templates using TokenCodeGenerator
        if (typeof TokenCodeGenerator !== 'undefined' && TokenCodeGenerator.generateRustCode) {
            const config = {
                tokenName: data.name || "MyToken",
                tokenSymbol: data.symbol || "MTK",
                decimals: data.decimals || 6,
                initialSupply: data.initialSupply || 1000000,
                admin: data.admin || "GBQQHZKDUU...",
                features: {
                    mintable: data.mintable || false,
                    burnable: data.burnable || false,
                    pausable: data.pausable || false
                },
                functions: data.functions || []
            };
            return TokenCodeGenerator.generateRustCode(config);
        }

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

        return `// Generated by Tralalero Contracts\n#![no_std]\nuse soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, String};\n\nconst ADMIN: Symbol = symbol_short!("ADMIN");\n${stateDecls ? stateDecls + '\n' : ''}\n#[contract]\npub struct ${contractName};\n\n#[contractimpl]\nimpl ${contractName} {\n    pub fn initialize(env: Env, admin: Address) {\n        if env.storage().instance().has(&ADMIN) {\n            panic!("Contract already initialized");\n        }\n        env.storage().instance().set(&ADMIN, &admin);\n    }\n\n    fn require_admin(env: &Env) {\n        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();\n        admin.require_auth();\n    }\n\n${gettersSetters}\n\n${fnStubs}\n}`;
    }

    function showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 3000);
    }

    // --- 9. Initialize on page load ---
    setTimeout(() => {
        initializeBlockly();
        createDefaultBlocks();

        // Check Freighter
        setTimeout(() => {
            const freighterCheck = checkFreighterAvailability();
            const statusDiv = document.getElementById('status');
            if (statusDiv) {
                if (freighterCheck.available) {
                    console.log('✅ Freighter detected');
                    statusDiv.textContent = '✅ Ready! Freighter detected.';
                    statusDiv.className = 'status-area success';
                } else {
                    console.warn('⚠️ Freighter not available:', freighterCheck.error);
                    statusDiv.textContent = '⚠️ Freighter not detected. Install from freighter.app';
                    statusDiv.className = 'status-area error';
                }
            }
        }, 1000);
    }, 500);

    // --- 10. Workspace change listener ---
    setTimeout(() => {
        if (blocklyWorkspace) {
            blocklyWorkspace.addChangeListener((event) => {
                if (event.type === Blockly.Events.BLOCK_CHANGE ||
                    event.type === Blockly.Events.BLOCK_MOVE ||
                    event.type === Blockly.Events.BLOCK_CREATE ||
                    event.type === Blockly.Events.BLOCK_DELETE) {
                    const validation = validateBlocks();
                    const statusDiv = document.getElementById('status');
                    if (statusDiv) {
                        if (validation.isValid) {
                            statusDiv.textContent = '✅ Configuration valid. Ready to generate contract.';
                            statusDiv.className = 'status-area success';
                        } else {
                            statusDiv.textContent = '⚠️ ' + validation.errors[0];
                            statusDiv.className = 'status-area error';
                        }
                    }
                }
            });
        }
    }, 1000);

    // --- 11. Button handlers ---
    setTimeout(() => {
        const deployBtn = document.getElementById('deployBtn');
        const resetBtn = document.getElementById('resetBtn');
        const contractBtn = document.getElementById('contractBtn');
        const contractModal = document.getElementById('contractModal');
        const closeModal = document.getElementById('closeModal');
        const contractCode = document.getElementById('contractCode');
        const downloadBtn = document.getElementById('downloadBtn');
        const copyBtn = document.getElementById('copyBtn');
        const statusDiv = document.getElementById('status');

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                createDefaultBlocks();
                if (statusDiv) {
                    statusDiv.textContent = 'Blocks reset! Customize and deploy.';
                    statusDiv.className = 'status-area';
                }
            });
        }

        if (contractBtn) {
            contractBtn.addEventListener('click', () => {
                const validation = validateBlocks();
                if (!validation.isValid) {
                    showToast('❌ ' + validation.errors[0], 'error');
                    return;
                }

                const rustCode = generateRustCodeString(validation.data);
                if (contractCode) {
                    contractCode.textContent = rustCode;
                }
                if (contractModal) {
                    contractModal.style.display = 'block';
                }
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                if (contractModal) {
                    contractModal.style.display = 'none';
                }
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const code = contractCode ? contractCode.textContent : '';
                const blob = new Blob([code], { type: 'text/rust' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'smart_contract.rs';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('✅ Contract downloaded', 'success');
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                try {
                    const code = contractCode ? contractCode.textContent : '';
                    await navigator.clipboard.writeText(code);
                    showToast('✅ Code copied to clipboard', 'success');
                } catch (err) {
                    showToast('❌ Error copying code', 'error');
                }
            });
        }

        if (deployBtn) {
            deployBtn.addEventListener('click', async () => {
                if (statusDiv) {
                    statusDiv.textContent = 'Validating configuration...';
                    statusDiv.className = 'status-area';
                }

                const validation = validateBlocks();
                if (!validation.isValid) {
                    if (statusDiv) {
                        statusDiv.textContent = '❌ ' + validation.errors[0];
                        statusDiv.classList.add('error');
                    }
                    showToast(validation.errors[0], 'error');
                    return;
                }

                const rustCode = generateRustCodeString(validation.data);
                if (contractCode) {
                    contractCode.textContent = rustCode;
                }
                if (contractModal) {
                    contractModal.style.display = 'block';
                }
                if (statusDiv) {
                    statusDiv.textContent = '✅ Contract generated. Download or copy it.';
                    statusDiv.className = 'status-area success';
                }
            });
        }

        window.addEventListener('click', (event) => {
            if (event.target === contractModal) {
                contractModal.style.display = 'none';
            }
        });
    }, 1000);

    // --- 12. Freighter availability check ---
    function checkFreighterAvailability() {
        console.log('🔍 Checking Freighter availability...');

        const freighterApi = window.freighterApi || window.freighter;

        if (!freighterApi) {
            return {
                available: false,
                error: 'Freighter not installed or not loaded correctly'
            };
        }

        const getPublicKey = freighterApi.getPublicKey || freighterApi.requestAccess || freighterApi.connect;
        const signTransaction = freighterApi.signTransaction || freighterApi.sign;

        if (typeof getPublicKey !== 'function') {
            return {
                available: false,
                error: 'Freighter no valid connection method'
            };
        }

        return {
            available: true,
            api: freighterApi,
            methods: {
                getPublicKey,
                signTransaction
            }
        };
    }

    // --- 13. Export globally accessible functions ---
    window.generateRustCode = generateRustCode;
    window.validateBlocks = validateBlocks;
    window.showToast = showToast;
    window.getBlocklyWorkspace = () => blocklyWorkspace;

});
