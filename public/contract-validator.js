/**
 * VALIDADOR DE CONTRATOS INTELIGENTES
 * Valida estructura, tipos, y mejores prácticas antes de compilar
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
     * Valida un contrato completo desde el workspace de Blockly
     */
    validate(blocklyWorkspace) {
        this.reset();

        if (!blocklyWorkspace) {
            this.addError("El workspace de Blockly no está inicializado");
            return this.getReport();
        }

        // Obtener bloque principal
        const contractBlocks = blocklyWorkspace.getBlocksByType('contract_settings', false);
        if (contractBlocks.length === 0) {
            this.addError("❌ Falta el bloque principal 'Mi Smart Contract'");
            return this.getReport();
        }

        const contractBlock = contractBlocks[0];
        const contractData = this.extractContractData(contractBlock);

        // Validaciones
        this.validateContractMetadata(contractData);
        this.validateStateVariables(contractData);
        this.validateFunctions(contractData);
        this.validateSecurity(contractData);
        this.validateStellarIntegration(contractData);

        return this.getReport();
    }

    /**
     * Extrae datos del contrato desde los bloques
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
            } else if (blockType.startsWith('require_') || blockType === 'access_control') {
                data.securityBlocks.push(blockType);
            }

            currentBlock = currentBlock.getNextBlock();
        }

        return data;
    }

    /**
     * Valida metadatos del contrato
     */
    validateContractMetadata(data) {
        // Nombre
        if (!data.name || data.name.trim() === '') {
            this.addError("El nombre del contrato es requerido");
        } else if (data.name.length > 64) {
            this.addError("El nombre del contrato es muy largo (máx 64 caracteres)");
        } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(data.name)) {
            this.addError("El nombre del contrato debe ser un identificador válido (letras, números, guiones bajos)");
        } else {
            this.addInfo(`✅ Nombre del contrato válido: ${data.name}`);
        }

        // Versión
        if (!data.version || data.version.trim() === '') {
            this.addWarning("Considera agregar una versión al contrato (ej: 1.0.0)");
        } else if (!/^\d+\.\d+\.\d+/.test(data.version)) {
            this.addWarning("La versión debería seguir formato semántico (X.Y.Z)");
        } else {
            this.addInfo(`✅ Versión: ${data.version}`);
        }

        // Admin/Owner
        if (!data.admin && !data.owner) {
            this.addError("Debes especificar al menos un administrador o propietario");
        } else {
            if (data.admin) this.addInfo(`✅ Administrador configurado`);
            if (data.owner) this.addInfo(`✅ Propietario configurado`);
        }

        // Descripción
        if (!data.description || data.description.trim() === '') {
            this.addWarning("Considera agregar una descripción del contrato");
        } else {
            this.addInfo(`✅ Descripción presente`);
        }
    }

    /**
     * Valida variables de estado
     */
    validateStateVariables(data) {
        if (data.stateVars.length === 0) {
            this.addWarning("El contrato no tiene variables de estado. ¿Debería almacenar algún dato?");
            return;
        }

        const validTypes = ['I32', 'I64', 'I128', 'U32', 'U64', 'U128', 'BOOL', 'STRING', 'ADDRESS', 'BYTES', 'MAP', 'VEC'];
        const varNames = new Set();

        data.stateVars.forEach((varDef, index) => {
            const { name, type, value } = varDef;

            // Validar nombre
            if (!name || name.trim() === '') {
                this.addError(`Variable de estado ${index + 1}: nombre vacío`);
                return;
            }

            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
                this.addError(`Variable '${name}': nombre inválido (debe ser identificador válido)`);
            }

            if (varNames.has(name)) {
                this.addError(`Variable '${name}': nombre duplicado`);
            }
            varNames.add(name);

            // Validar tipo
            if (!validTypes.includes(type)) {
                this.addError(`Variable '${name}': tipo inválido '${type}'`);
            }

            // Validar valor inicial
            if (value && value.trim() !== '') {
                if (type === 'I32' || type === 'I64' || type === 'I128' || type === 'U32' || type === 'U64' || type === 'U128') {
                    if (!/^-?\d+$/.test(value)) {
                        this.addWarning(`Variable '${name}': valor inicial '${value}' no es un número válido`);
                    }
                }
            }

            this.addInfo(`✅ Variable de estado: ${name} (${type})`);
        });

        if (data.stateVars.length > 20) {
            this.addWarning("El contrato tiene muchas variables de estado (>20). Considera usar mapeos para optimizar");
        }
    }

    /**
     * Valida definición de funciones
     */
    validateFunctions(data) {
        if (data.functions.length === 0) {
            this.addError("El contrato debe tener al menos una función");
            return;
        }

        const validReturnTypes = ['VOID', 'I32', 'I64', 'I128', 'U32', 'U64', 'U128', 'BOOL', 'STRING', 'ADDRESS', 'BYTES', 'VEC'];
        const functionNames = new Set();

        data.functions.forEach((fn) => {
            const { name, returnType } = fn;

            // Validar nombre
            if (!name || name.trim() === '') {
                this.addError("Función: nombre vacío");
                return;
            }

            if (!/^[a-z_][a-z0-9_]*$/.test(name)) {
                this.addError(`Función '${name}': nombre debe ser snake_case`);
            }

            if (functionNames.has(name)) {
                this.addError(`Función '${name}': nombre duplicado`);
            }
            functionNames.add(name);

            // Validar tipo de retorno
            if (!validReturnTypes.includes(returnType)) {
                this.addWarning(`Función '${name}': tipo de retorno inválido`);
            }

            this.addInfo(`✅ Función: ${name}() -> ${returnType}`);
        });

        // Funciones comunes recomendadas
        if (!functionNames.has('initialize')) {
            this.addWarning("Considera agregar una función 'initialize()' para setup del contrato");
        }

        if (data.tokenBlocks.length > 0 && !functionNames.has('transfer')) {
            this.addWarning("Token contract: considera agregar función 'transfer'");
        }
    }

    /**
     * Valida características de seguridad
     */
    validateSecurity(data) {
        if (data.securityBlocks.length === 0) {
            this.addWarning("El contrato no tiene bloques de seguridad. Considera agregar validaciones y control de acceso");
        } else {
            this.addInfo(`✅ Seguridad: ${data.securityBlocks.length} bloque(s) de seguridad`);
        }
    }

    /**
     * Valida integración con Stellar
     */
    validateStellarIntegration(data) {
        if (data.stellarBlocks.length > 0) {
            this.addInfo(`✅ Integración Stellar: ${data.stellarBlocks.length} operación(es)`);
        }

        if (data.tokenBlocks.length > 0) {
            this.addInfo(`✅ Token Features: ${data.tokenBlocks.length} bloque(s) de token`);
        }

        if (data.rwaBlocks.length > 0) {
            this.addInfo(`✅ RWA Features: ${data.rwaBlocks.length} bloque(s) RWA`);
        }
    }

    /**
     * Agrega un error
     */
    addError(message) {
        this.errors.push(message);
    }

    /**
     * Agrega una advertencia
     */
    addWarning(message) {
        this.warnings.push(message);
    }

    /**
     * Agrega información
     */
    addInfo(message) {
        this.info.push(message);
    }

    /**
     * Retorna reporte de validación
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
     * Genera resumen de validación
     */
    getSummary() {
        if (this.errors.length > 0) {
            return `❌ ${this.errors.length} error(es) encontrado(s)`;
        } else if (this.warnings.length > 0) {
            return `⚠️ Contrato válido con ${this.warnings.length} advertencia(s)`;
        } else {
            return `✅ Contrato completamente válido`;
        }
    }

    /**
     * Genera HTML para mostrar el reporte
     */
    toHTML() {
        let html = `<div style="font-family: monospace;">`;

        // Resumen
        html += `<div style="margin-bottom: 1rem; padding: 1rem; background: ${this.errors.length > 0 ? '#fef2f2' : this.warnings.length > 0 ? '#fffbeb' : '#f0fdf4'}; border-radius: 0.5rem; border-left: 4px solid ${this.errors.length > 0 ? '#dc2626' : this.warnings.length > 0 ? '#d97706' : '#059669'};">`;
        html += `<strong>${this.getSummary()}</strong>`;
        html += `</div>`;

        // Errores
        if (this.errors.length > 0) {
            html += `<div style="margin-bottom: 1rem;">`;
            html += `<strong style="color: #dc2626;">❌ Errores (${this.errors.length}):</strong>`;
            html += `<ul style="margin: 0.5rem 0; padding-left: 1.5rem;">`;
            this.errors.forEach(err => {
                html += `<li style="color: #991b1b; margin: 0.25rem 0;">${err}</li>`;
            });
            html += `</ul></div>`;
        }

        // Advertencias
        if (this.warnings.length > 0) {
            html += `<div style="margin-bottom: 1rem;">`;
            html += `<strong style="color: #d97706;">⚠️ Advertencias (${this.warnings.length}):</strong>`;
            html += `<ul style="margin: 0.5rem 0; padding-left: 1.5rem;">`;
            this.warnings.forEach(warn => {
                html += `<li style="color: #92400e; margin: 0.25rem 0;">${warn}</li>`;
            });
            html += `</ul></div>`;
        }

        // Info
        if (this.info.length > 0) {
            html += `<div style="margin-bottom: 1rem;">`;
            html += `<strong style="color: #059669;">ℹ️ Información (${this.info.length}):</strong>`;
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

// Crear instancia global
const validator = new ContractValidator();

console.log('✅ Validador de contratos cargado correctamente');
