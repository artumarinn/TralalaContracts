/**
 * SMART CONTRACT VALIDATOR
 * Validates structure, types, and best practices before compiling
 */

class ContractValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.info = [];
    }

    reset() {
        this.errors = [];
        this.warnings = [];
        this.info = [];
    }

    /**
     * Validates a complete contract from the Blockly workspace
     */
    validate(blocklyWorkspace) {
        this.reset();

        if (!blocklyWorkspace) {
            this.addError("Blockly workspace is not initialized");
            return this.getReport();
        }

        // Get main block - try multiple block types
        let contractBlock = null;
        const blockTypes = ['contract_settings', 'contract_init'];

        for (const blockType of blockTypes) {
            const blocks = blocklyWorkspace.getBlocksByType(blockType, false);
            if (blocks.length > 0) {
                contractBlock = blocks[0];
                break;
            }
        }

        // If no contract block found, show info instead of error
        if (!contractBlock) {
            this.addInfo("ℹ️ No main contract block found, validating available blocks...");
            const contractData = this.extractContractDataFromWorkspace(blocklyWorkspace);

            // Still validate what we have
            this.validateContractMetadata(contractData);
            this.validateStateVariables(contractData);
            this.validateFunctions(contractData);
            this.validateSecurity(contractData);
            this.validateStellarIntegration(contractData);
        } else {
            const contractData = this.extractContractData(contractBlock);

            // Validations
            this.validateContractMetadata(contractData);
            this.validateStateVariables(contractData);
            this.validateFunctions(contractData);
            this.validateSecurity(contractData);
            this.validateStellarIntegration(contractData);
        }

        return this.getReport();
    }

    /**
     * Extracts contract data from all blocks in the workspace
     */
    extractContractDataFromWorkspace(blocklyWorkspace) {
        const data = {
            name: null,
            version: null,
            admin: null,
            owner: null,
            description: null,
            stateVars: [],
            functions: [],
            events: [],
            securityBlocks: [],
            stellarBlocks: [],
            tokenBlocks: [],
            rwaBlocks: []
        };

        const allBlocks = blocklyWorkspace.getAllBlocks(false);

        allBlocks.forEach(block => {
            const blockType = block.type;

            if (blockType === 'contract_name') {
                data.name = block.getFieldValue('NAME');
            } else if (blockType === 'contract_version') {
                data.version = block.getFieldValue('VERSION');
            } else if (blockType === 'admin_address') {
                data.admin = block.getFieldValue('ADDRESS');
            } else if (blockType === 'contract_owner') {
                data.owner = block.getFieldValue('ADDRESS');
            } else if (blockType === 'contract_description') {
                data.description = block.getFieldValue('TEXT');
            } else if (blockType === 'state_variable') {
                data.stateVars.push({
                    name: block.getFieldValue('VAR_NAME'),
                    type: block.getFieldValue('VAR_TYPE'),
                    value: block.getFieldValue('INIT_VALUE')
                });
            } else if (blockType === 'function_declaration') {
                data.functions.push({
                    name: block.getFieldValue('FN_NAME'),
                    returnType: block.getFieldValue('RET_TYPE')
                });
            } else if (blockType === 'state_event') {
                data.events.push(block.getFieldValue('EVENT_NAME'));
            } else if (blockType.startsWith('stellar_') || blockType === 'stellar_transfer') {
                if (!data.stellarBlocks.includes(blockType)) {
                    data.stellarBlocks.push(blockType);
                }
            } else if (blockType.startsWith('token_')) {
                if (!data.tokenBlocks.includes(blockType)) {
                    data.tokenBlocks.push(blockType);
                }
            } else if (blockType.startsWith('rwa_')) {
                if (!data.rwaBlocks.includes(blockType)) {
                    data.rwaBlocks.push(blockType);
                }
            } else if (blockType.startsWith('require_') || blockType === 'access_control') {
                if (!data.securityBlocks.includes(blockType)) {
                    data.securityBlocks.push(blockType);
                }
            }
        });

        return data;
    }

    /**
     * Extracts contract data from the blocks
     */
    extractContractData(contractBlock) {
        const data = {
            name: null,
            version: null,
            admin: null,
            owner: null,
            description: null,
            stateVars: [],
            functions: [],
            events: [],
            securityBlocks: [],
            stellarBlocks: [],
            tokenBlocks: [],
            rwaBlocks: []
        };

        let currentBlock = contractBlock.getInputTargetBlock('SETTINGS');
        let rwaAssetName = null; // To use as a fallback

        while (currentBlock) {
            const blockType = currentBlock.type;

            if (blockType === 'contract_name') {
                data.name = currentBlock.getFieldValue('NAME');
            } else if (blockType === 'contract_version') {
                data.version = currentBlock.getFieldValue('VERSION');
            } else if (blockType === 'admin_address') {
                data.admin = currentBlock.getFieldValue('ADDRESS');
            } else if (blockType === 'contract_owner') {
                data.owner = currentBlock.getFieldValue('ADDRESS');
            } else if (blockType === 'contract_description') {
                data.description = currentBlock.getFieldValue('TEXT');
            } else if (blockType === 'state_variable') {
                data.stateVars.push({
                    name: currentBlock.getFieldValue('VAR_NAME'),
                    type: currentBlock.getFieldValue('VAR_TYPE'),
                    value: currentBlock.getFieldValue('INIT_VALUE')
                });
            } else if (blockType === 'function_declaration') {
                data.functions.push({
                    name: currentBlock.getFieldValue('FN_NAME'),
                    returnType: currentBlock.getFieldValue('RET_TYPE')
                });
            } else if (blockType === 'state_event') {
                data.events.push(currentBlock.getFieldValue('EVENT_NAME'));
            } else if (blockType.startsWith('stellar_') || blockType === 'stellar_transfer') {
                data.stellarBlocks.push(blockType);
            } else if (blockType.startsWith('token_')) {
                data.tokenBlocks.push(blockType);
            } else if (blockType.startsWith('rwa_')) {
                data.rwaBlocks.push(blockType);
                // Save the RWA asset name as a fallback for the contract name
                if (blockType === 'rwa_asset' && !rwaAssetName) {
                    rwaAssetName = currentBlock.getFieldValue('NAME');
                }
            } else if (blockType.startsWith('require_') || blockType === 'access_control') {
                data.securityBlocks.push(blockType);
            }

            currentBlock = currentBlock.getNextBlock();
        }

        // If there is no contract name but there is an RWA asset, use its name
        if (!data.name && rwaAssetName) {
            data.name = rwaAssetName;
        }

        return data;
    }

    /**
     * Validates contract metadata
     */
    validateContractMetadata(data) {
        // Name
        if (!data.name || data.name.trim() === '') {
            this.addError("The contract name is required");
        } else if (data.name.length > 64) {
            this.addError("The contract name is too long (max 64 characters)");
        } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(data.name)) {
            this.addError("The contract name must be a valid identifier (letters, numbers, underscores)");
        } else {
            this.addInfo(`✅ Valid contract name: ${data.name}`);
        }

        // Version
        if (!data.version || data.version.trim() === '') {
            this.addWarning("Consider adding a version to the contract (e.g., 1.0.0)");
        } else if (!/^\d+\.\d+\.\d+/.test(data.version)) {
            this.addWarning("The version should follow semantic formatting (X.Y.Z)");
        } else {
            this.addInfo(`✅ Version: ${data.version}`);
        }

        // Admin/Owner
        if (!data.admin && !data.owner) {
            this.addError("You must specify at least one administrator or owner");
        } else {
            if (data.admin) this.addInfo(`✅ Administrator configured`);
            if (data.owner) this.addInfo(`✅ Owner configured`);
        }

        // Description
        if (!data.description || data.description.trim() === '') {
            this.addWarning("Consider adding a contract description");
        } else {
            this.addInfo(`✅ Description present`);
        }
    }

    /**
     * Validates state variables
     */
    validateStateVariables(data) {
        if (data.stateVars.length === 0) {
            this.addWarning("The contract has no state variables. Should it store any data?");
            return;
        }

        const validTypes = ['I32', 'I64', 'I128', 'U32', 'U64', 'U128', 'BOOL', 'STRING', 'ADDRESS', 'BYTES', 'MAP', 'VEC'];
        const varNames = new Set();

        data.stateVars.forEach((varDef, index) => {
            const { name, type, value } = varDef;

            // Validate name
            if (!name || name.trim() === '') {
                this.addError(`State variable ${index + 1}: empty name`);
                return;
            }

            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
                this.addError(`Variable '${name}': invalid name (must be a valid identifier)`);
            }

            if (varNames.has(name)) {
                this.addError(`Variable '${name}': duplicate name`);
            }
            varNames.add(name);

            // Validate type
            if (!validTypes.includes(type)) {
                this.addError(`Variable '${name}': invalid type '${type}'`);
            }

            // Validate initial value
            if (value && value.trim() !== '') {
                if (type === 'I32' || type === 'I64' || type === 'I128' || type === 'U32' || type === 'U64' || type === 'U128') {
                    if (!/^-?\d+$/.test(value)) {
                        this.addWarning(`Variable '${name}': initial value '${value}' is not a valid number`);
                    }
                }
            }

            this.addInfo(`✅ State variable: ${name} (${type})`);
        });

        if (data.stateVars.length > 20) {
            this.addWarning("The contract has many state variables (>20). Consider using maps to optimize");
        }
    }

    /**
     * Validates function definitions
     */
    validateFunctions(data) {
        // 🎯 For RWA and Token templates, it's OK not to have function blocks
        // The code is automatically generated from the template
        if (data.functions.length === 0) {
            // Only show a warning if there are no RWA, token, or function blocks
            if (data.rwaBlocks.length === 0 && data.tokenBlocks.length === 0) {
                this.addWarning("Consider adding function blocks for greater flexibility");
            } else {
                this.addInfo("✅ Using pre-generated functions from the RWA/Token template");
            }
            return;
        }

        const validReturnTypes = ['VOID', 'I32', 'I64', 'I128', 'U32', 'U64', 'U128', 'BOOL', 'STRING', 'ADDRESS', 'BYTES', 'VEC'];
        const functionNames = new Set();

        data.functions.forEach((fn) => {
            const { name, returnType } = fn;

            // Validate name
            if (!name || name.trim() === '') {
                this.addError("Function: empty name");
                return;
            }

            if (!/^[a-z_][a-z0-9_]*$/.test(name)) {
                this.addError(`Function '${name}': name should be snake_case`);
            }

            if (functionNames.has(name)) {
                this.addError(`Function '${name}': duplicate name`);
            }
            functionNames.add(name);

            // Validate return type
            if (!validReturnTypes.includes(returnType)) {
                this.addWarning(`Function '${name}': invalid return type`);
            }

            this.addInfo(`✅ Function: ${name}() -> ${returnType}`);
        });

        // Recommended common functions
        if (!functionNames.has('initialize')) {
            this.addWarning("Consider adding an 'initialize()' function for contract setup");
        }

        if (data.tokenBlocks.length > 0 && !functionNames.has('transfer')) {
            this.addWarning("Token contract: consider adding a 'transfer' function");
        }
    }

    /**
     * Validates security features
     */
    validateSecurity(data) {
        if (data.securityBlocks.length === 0) {
            this.addWarning("The contract has no security blocks. Consider adding validations and access control");
        } else {
            this.addInfo(`✅ Security: ${data.securityBlocks.length} security block(s)`);
        }
    }

    /**
     * Validates Stellar integration
     */
    validateStellarIntegration(data) {
        if (data.stellarBlocks.length > 0) {
            this.addInfo(`✅ Stellar Integration: ${data.stellarBlocks.length} operation(s)`);
        }

        if (data.tokenBlocks.length > 0) {
            this.addInfo(`✅ Token Features: ${data.tokenBlocks.length} token block(s)`);
        }

        if (data.rwaBlocks.length > 0) {
            this.addInfo(`✅ RWA Features: ${data.rwaBlocks.length} RWA block(s)`);
        }
    }

    /**
     * Adds an error
     */
    addError(message) {
        this.errors.push(message);
    }

    /**
     * Adds a warning
     */
    addWarning(message) {
        this.warnings.push(message);
    }

    /**
     * Adds information
     */
    addInfo(message) {
        this.info.push(message);
    }

    /**
     * Returns a validation report
     */
    getReport() {
        const isValid = this.errors.length === 0;

        return {
            isValid,
            errorCount: this.errors.length,
            warningCount: this.warnings.length,
            infoCount: this.info.length,
            errors: this.errors,
            warnings: this.warnings,
            info: this.info,
            summary: this.getSummary()
        };
    }

    /**
     * Generates a validation summary
     */
    getSummary() {
        if (this.errors.length > 0) {
            return `❌ ${this.errors.length} error(s) found`;
        } else if (this.warnings.length > 0) {
            return `⚠️ Contract valid with ${this.warnings.length} warning(s)`;
        } else {
            return `✅ Contract completely valid`;
        }
    }

    /**
     * Generates HTML to display the report
     */
    toHTML() {
        let html = `<div style="font-family: monospace;">`;

        // Summary
        html += `<div style="margin-bottom: 1rem; padding: 1rem; background: ${this.errors.length > 0 ? '#fef2f2' : this.warnings.length > 0 ? '#fffbeb' : '#f0fdf4'}; border-radius: 0.5rem; border-left: 4px solid ${this.errors.length > 0 ? '#dc2626' : this.warnings.length > 0 ? '#d97706' : '#059669'};">`;
        html += `<strong>${this.getSummary()}</strong>`;
        html += `</div>`;

        // Errors
        if (this.errors.length > 0) {
            html += `<div style="margin-bottom: 1rem;">`;
            html += `<strong style="color: #dc2626;">❌ Errors (${this.errors.length}):</strong>`;
            html += `<ul style="margin: 0.5rem 0; padding-left: 1.5rem;">`;
            this.errors.forEach(err => {
                html += `<li style="color: #991b1b; margin: 0.25rem 0;">${err}</li>`;
            });
            html += `</ul></div>`;
        }

        // Warnings
        if (this.warnings.length > 0) {
            html += `<div style="margin-bottom: 1rem;">`;
            html += `<strong style="color: #d97706;">⚠️ Warnings (${this.warnings.length}):</strong>`;
            html += `<ul style="margin: 0.5rem 0; padding-left: 1.5rem;">`;
            this.warnings.forEach(warn => {
                html += `<li style="color: #92400e; margin: 0.25rem 0;">${warn}</li>`;
            });
            html += `</ul></div>`;
        }

        // Info
        if (this.info.length > 0) {
            html += `<div style="margin-bottom: 1rem;">`;
            html += `<strong style="color: #059669;">ℹ️ Information (${this.info.length}):</strong>`;
            html += `<ul style="margin: 0.5rem 0; padding-left: 1.5rem;">`;
            this.info.forEach(inf => {
                html += `<li style="color: #065f46; margin: 0.25rem 0;">${inf}</li>`;
            });
            html += `</ul></div>`;
        }

        html += `</div>`;
        return html;
    }
}

// Create a global instance
const validator = new ContractValidator();

console.log('✅ Contract validator loaded successfully');
