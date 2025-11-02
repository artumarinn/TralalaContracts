/**
 * GENERADOR RUST PARA BLOCKLY
 * Convierte bloques visuales a código Rust válido para Soroban
 */

class RustGenerator {
    constructor() {
        this.indentation = 0;
        this.imports = new Set();
        this.declarations = [];
        this.code = [];
    }

    indent(text) {
        return '  '.repeat(this.indentation) + text;
    }

    addImport(importStatement) {
        this.imports.add(importStatement);
    }

    addDeclaration(decl) {
        this.declarations.push(decl);
    }

    addCode(code) {
        this.code.push(code);
    }

    /**
     * Genera código Rust a partir de un bloque de Blockly
     */
    fromBlock(block) {
        if (!block) return '';

        const methodName = `block_${block.type}`;
        if (typeof this[methodName] === 'function') {
            return this[methodName](block);
        }

        console.warn(`⚠️ No hay generador para el bloque: ${block.type}`);
        return '';
    }

    // ========== BLOQUES DE CONTRATO ==========

    block_contract_init(block) {
        this.addImport('use soroban_sdk::{contract, contractimpl, Address, Env};');
        this.addImport('use soroban_sdk::{Symbol, symbol_short};');
        return '// Contrato Soroban inicializado\n#![no_std]\n';
    }

    block_contract_metadata(block) {
        const title = block.getFieldValue('TITLE');
        const description = block.getFieldValue('DESCRIPTION');
        return `// ===== ${title} =====\n// ${description}\n`;
    }

    block_contract_name(block) {
        const name = block.getFieldValue('NAME');
        return `// Nombre: ${name}`;
    }

    block_contract_version(block) {
        const version = block.getFieldValue('VERSION');
        return `// Versión: ${version}`;
    }

    block_contract_owner(block) {
        const address = block.getFieldValue('ADDRESS');
        return `let OWNER: &'static str = "${address}";`;
    }

    block_admin_address(block) {
        const address = block.getFieldValue('ADDRESS');
        return `const ADMIN_ADDRESS: &'static str = "${address}";`;
    }

    block_contract_description(block) {
        const text = block.getFieldValue('TEXT');
        return `// Descripción: ${text}`;
    }

    // ========== VARIABLES DE ESTADO ==========

    block_state_variable(block) {
        const varName = block.getFieldValue('VAR_NAME');
        const varType = block.getFieldValue('VAR_TYPE');
        const initValue = block.getFieldValue('INIT_VALUE');

        const typeMap = {
            'I32': 'i32',
            'I128': 'i128',
            'I64': 'i64',
            'U32': 'u32',
            'U64': 'u64',
            'U128': 'u128',
            'BOOL': 'bool',
            'STRING': 'String',
            'ADDRESS': 'Address',
            'BYTES': 'Bytes',
            'MAP': 'Map',
            'VEC': 'Vec'
        };

        const rustType = typeMap[varType] || varType;
        const symbol = `symbol_short!("${varName.slice(0, 4).toUpperCase()}")`;

        this.addDeclaration(`const ${varName.toUpperCase()}_KEY: Symbol = ${symbol};`);

        if (initValue && initValue !== '0' && initValue !== 'false') {
            return `// Variable de estado: ${varName}: ${rustType} = ${initValue}`;
        }
        return `// Variable de estado: ${varName}: ${rustType}`;
    }

    block_state_map(block) {
        const mapName = block.getFieldValue('MAP_NAME');
        const keyType = block.getFieldValue('KEY_TYPE');
        const valueType = block.getFieldValue('VALUE_TYPE');

        const keyMap = { 'ADDRESS': 'Address', 'STRING': 'String', 'I128': 'i128' };
        const valueMap = { 'I128': 'i128', 'BOOL': 'bool', 'STRING': 'String', 'ADDRESS': 'Address' };

        this.addImport('use soroban_sdk::Map;');

        const rustKeyType = keyMap[keyType] || keyType;
        const rustValueType = valueMap[valueType] || valueType;

        return `// Mapeo: ${mapName}: Map<${rustKeyType}, ${rustValueType}>`;
    }

    block_state_event(block) {
        const eventName = block.getFieldValue('EVENT_NAME');
        return `// Evento: ${eventName}`;
    }

    // ========== FUNCIONES ==========

    block_function_declaration(block) {
        const fnName = block.getFieldValue('FN_NAME');
        const retType = block.getFieldValue('RET_TYPE');

        const typeMap = {
            'VOID': '()',
            'I32': 'i32',
            'I128': 'i128',
            'BOOL': 'bool',
            'STRING': 'String',
            'ADDRESS': 'Address',
            'BYTES': 'soroban_sdk::Bytes',
            'VEC': 'Vec'
        };

        const rustRetType = typeMap[retType] || retType;

        return `pub fn ${fnName}(env: Env) -> ${rustRetType} {\n    // TODO: Implementar función\n}`;
    }

    block_function_parameter(block) {
        const paramName = block.getFieldValue('PARAM_NAME');
        const paramType = block.getFieldValue('PARAM_TYPE');

        const typeMap = {
            'I32': 'i32',
            'I128': 'i128',
            'BOOL': 'bool',
            'STRING': 'String',
            'ADDRESS': 'Address',
            'BYTES': 'soroban_sdk::Bytes',
            'VEC': 'Vec'
        };

        const rustType = typeMap[paramType] || paramType;
        return `${paramName}: ${rustType}`;
    }

    block_function_return(block) {
        const input = block.getInputTargetBlock('VALUE');
        let value = '';

        if (input) {
            value = this.fromBlock(input);
        } else {
            value = 'None';
        }

        return `return ${value};`;
    }

    // ========== LÓGICA Y CONTROL ==========

    block_if_statement(block) {
        const condition = block.getInputTargetBlock('CONDITION');
        const thenBlock = block.getInputTargetBlock('THEN');
        const elseBlock = block.getInputTargetBlock('ELSE');

        let code = 'if ';

        if (condition) {
            code += this.fromBlock(condition);
        } else {
            code += 'true';
        }

        code += ' {\n';
        this.indentation++;

        if (thenBlock) {
            code += this.indent(this.fromBlock(thenBlock)) + '\n';
        }

        this.indentation--;
        code += this.indent('}');

        if (elseBlock) {
            code += ' else {\n';
            this.indentation++;
            code += this.indent(this.fromBlock(elseBlock)) + '\n';
            this.indentation--;
            code += this.indent('}');
        }

        return code;
    }

    block_comparison_operator(block) {
        const a = block.getInputTargetBlock('A');
        const b = block.getInputTargetBlock('B');
        const op = block.getFieldValue('OP');

        const opMap = {
            'EQ': '==',
            'NEQ': '!=',
            'LT': '<',
            'GT': '>',
            'LTE': '<=',
            'GTE': '>='
        };

        const rustOp = opMap[op] || '==';

        let aCode = a ? this.fromBlock(a) : '0';
        let bCode = b ? this.fromBlock(b) : '0';

        return `(${aCode} ${rustOp} ${bCode})`;
    }

    block_logical_operator(block) {
        const a = block.getInputTargetBlock('A');
        const b = block.getInputTargetBlock('B');
        const op = block.getFieldValue('OP');

        const opMap = {
            'AND': '&&',
            'OR': '||'
        };

        const rustOp = opMap[op] || '&&';

        let aCode = a ? this.fromBlock(a) : 'true';
        let bCode = b ? this.fromBlock(b) : 'true';

        return `(${aCode} ${rustOp} ${bCode})`;
    }

    block_loop_while(block) {
        const condition = block.getInputTargetBlock('CONDITION');
        const body = block.getInputTargetBlock('BODY');

        let code = 'while ';

        if (condition) {
            code += this.fromBlock(condition);
        } else {
            code += 'true';
        }

        code += ' {\n';
        this.indentation++;

        if (body) {
            code += this.indent(this.fromBlock(body)) + '\n';
        }

        this.indentation--;
        code += this.indent('}');

        return code;
    }

    block_loop_for(block) {
        const start = block.getInputTargetBlock('START');
        const end = block.getInputTargetBlock('END');
        const body = block.getInputTargetBlock('BODY');

        let startCode = start ? this.fromBlock(start) : '0';
        let endCode = end ? this.fromBlock(end) : '10';

        let code = `for i in ${startCode}..${endCode} {\n`;
        this.indentation++;

        if (body) {
            code += this.indent(this.fromBlock(body)) + '\n';
        }

        this.indentation--;
        code += this.indent('}');

        return code;
    }

    // ========== OPERACIONES ==========

    block_arithmetic_operation(block) {
        const a = block.getInputTargetBlock('A');
        const b = block.getInputTargetBlock('B');
        const op = block.getFieldValue('OP');

        const opMap = {
            'ADD': '+',
            'MINUS': '-',
            'MULT': '*',
            'DIV': '/',
            'MOD': '%'
        };

        const rustOp = opMap[op] || '+';

        let aCode = a ? this.fromBlock(a) : '0';
        let bCode = b ? this.fromBlock(b) : '0';

        return `(${aCode} ${rustOp} ${bCode})`;
    }

    block_variable_assignment(block) {
        const varName = block.getFieldValue('VAR');
        const value = block.getInputTargetBlock('VALUE');

        let valueCode = value ? this.fromBlock(value) : '0';

        return `let ${varName} = ${valueCode};`;
    }

    block_increment_decrement(block) {
        const varName = block.getFieldValue('VAR');
        const op = block.getFieldValue('OP');

        if (op === 'INC') {
            return `${varName} += 1;`;
        } else {
            return `${varName} -= 1;`;
        }
    }

    // ========== STELLAR ==========

    block_stellar_transfer(block) {
        this.addImport('use soroban_sdk::token::Client as TokenClient;');

        const from = block.getInputTargetBlock('FROM');
        const to = block.getInputTargetBlock('TO');
        const amount = block.getInputTargetBlock('AMOUNT');
        const asset = block.getInputTargetBlock('ASSET');

        let fromCode = from ? this.fromBlock(from) : 'from_address';
        let toCode = to ? this.fromBlock(to) : 'to_address';
        let amountCode = amount ? this.fromBlock(amount) : '0';

        return `TokenClient::new(&env, &asset_contract_id).transfer(&${fromCode}, &${toCode}, &${amountCode});`;
    }

    block_stellar_payment(block) {
        this.addImport('use soroban_sdk::Env;');

        const destination = block.getInputTargetBlock('DESTINATION');
        const amount = block.getInputTargetBlock('AMOUNT');
        const assetCode = block.getInputTargetBlock('ASSET_CODE');
        const assetIssuer = block.getInputTargetBlock('ASSET_ISSUER');

        let destCode = destination ? this.fromBlock(destination) : 'destination';
        let amountCode = amount ? this.fromBlock(amount) : '0';

        return `// Pago a ${destCode} de ${amountCode}`;
    }

    block_stellar_require_auth(block) {
        const address = block.getInputTargetBlock('ADDRESS');

        let addrCode = address ? this.fromBlock(address) : 'account';

        return `${addrCode}.require_auth();`;
    }

    // ========== TOKEN ==========

    block_token_init(block) {
        this.addImport('use soroban_sdk::token::{TokenInterface, TokenMetadata};');

        const name = block.getInputTargetBlock('NAME');
        const symbol = block.getInputTargetBlock('SYMBOL');
        const decimals = block.getInputTargetBlock('DECIMALS');
        const supply = block.getInputTargetBlock('SUPPLY');

        return `// Token inicializado\n// Nombre, Símbolo, Decimales, Suministro`;
    }

    block_token_mint(block) {
        const to = block.getInputTargetBlock('TO');
        const amount = block.getInputTargetBlock('AMOUNT');

        let toCode = to ? this.fromBlock(to) : 'to_address';
        let amountCode = amount ? this.fromBlock(amount) : '0';

        return `// Mint: ${toCode} recibe ${amountCode} tokens`;
    }

    block_token_burn(block) {
        const from = block.getInputTargetBlock('FROM');
        const amount = block.getInputTargetBlock('AMOUNT');

        let fromCode = from ? this.fromBlock(from) : 'from_address';
        let amountCode = amount ? this.fromBlock(amount) : '0';

        return `// Burn: Se queman ${amountCode} tokens de ${fromCode}`;
    }

    // ========== SEGURIDAD ==========

    block_require_condition(block) {
        const condition = block.getInputTargetBlock('CONDITION');
        const message = block.getInputTargetBlock('MESSAGE');

        let condCode = condition ? this.fromBlock(condition) : 'true';
        let msgCode = message ? this.fromBlock(message) : 'Condition failed';

        return `if !(${condCode}) { panic!("${msgCode}"); }`;
    }

    block_access_control(block) {
        const address = block.getInputTargetBlock('ADDRESS');
        const role = block.getFieldValue('ROLE');

        let addrCode = address ? this.fromBlock(address) : 'invoker';

        return `// Control de acceso para ${role}\n${addrCode}.require_auth();`;
    }

    // ========== LITERALES ==========

    block_number_literal(block) {
        const value = block.getFieldValue('VALUE');
        return value.toString();
    }

    block_string_literal(block) {
        const value = block.getFieldValue('VALUE');
        return `"${value}"`;
    }

    block_boolean_literal(block) {
        const value = block.getFieldValue('VALUE');
        return value === 'TRUE' ? 'true' : 'false';
    }

    /**
     * Genera el contrato Rust completo
     */
    generateContract(contractBlock) {
        this.reset();

        if (!contractBlock) {
            return this.buildContract();
        }

        // Procesar todos los bloques conectados
        let currentBlock = contractBlock.getInputTargetBlock('SETTINGS');
        const stateVars = [];
        const functions = [];
        const eventDefs = [];

        while (currentBlock) {
            const code = this.fromBlock(currentBlock);

            if (currentBlock.type.startsWith('state_')) {
                stateVars.push(code);
            } else if (currentBlock.type.startsWith('function_')) {
                functions.push(code);
            } else if (currentBlock.type.startsWith('state_event')) {
                eventDefs.push(code);
            } else {
                this.addCode(code);
            }

            currentBlock = currentBlock.getNextBlock();
        }

        return this.buildContract(stateVars, functions, eventDefs);
    }

    /**
     * Construye el archivo Rust completo
     */
    buildContract(stateVars = [], functions = [], events = []) {
        let rust = '';

        // Agregar imports
        if (this.imports.size === 0) {
            this.addImport('#![no_std]');
            this.addImport('use soroban_sdk::{contract, contractimpl, Address, Env};');
        }

        rust += Array.from(this.imports).join('\n') + '\n\n';

        // Agregar declaraciones
        if (this.declarations.length > 0) {
            rust += this.declarations.join('\n') + '\n\n';
        }

        // Agregar variables de estado
        if (stateVars.length > 0) {
            rust += '// ===== ESTADO =====\n';
            rust += stateVars.join('\n') + '\n\n';
        }

        // Agregar estructura del contrato
        rust += '#[contract]\npub struct SmartContract;\n\n';

        // Agregar implementación
        rust += '#[contractimpl]\nimpl SmartContract {\n';

        // Agregar funciones
        if (functions.length > 0) {
            rust += '    // ===== FUNCIONES =====\n';
            rust += functions.map(f => '    ' + f.replace(/\n/g, '\n    ')).join('\n\n') + '\n';
        } else {
            rust += '    // TODO: Implementar funciones\n';
        }

        rust += '}\n';

        // Agregar eventos
        if (events.length > 0) {
            rust += '\n// ===== EVENTOS =====\n';
            rust += events.join('\n') + '\n';
        }

        return rust;
    }

    reset() {
        this.indentation = 0;
        this.imports.clear();
        this.declarations = [];
        this.code = [];
    }
}

// Crear instancia global
const rustGen = new RustGenerator();

console.log('✅ Generador Rust cargado correctamente');
