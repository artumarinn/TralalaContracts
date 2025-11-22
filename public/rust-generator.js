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
        this.currentFunctionReturnType = null;
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

        // Procesar el body si existe
        let bodyCode = '';
        const bodyBlock = block.getInputTargetBlock('BODY');
        if (bodyBlock) {
            this.indentation++;
            let currentStatement = bodyBlock;
            while (currentStatement) {
                const statement = this.fromBlock(currentStatement);
                if (statement && statement.trim()) {
                    bodyCode += this.indent(statement) + '\n';
                }
                currentStatement = currentStatement.getNextBlock();
            }
            this.indentation--;
        }

        return '// Contrato Soroban inicializado\n#![no_std]\n' + bodyCode;
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

        // Procesar parámetros del evento
        let params = [];
        const paramsBlock = block.getInputTargetBlock('PARAMS');
        if (paramsBlock) {
            let currentParam = paramsBlock;
            while (currentParam) {
                if (currentParam.type === 'event_parameter') {
                    const paramCode = this.fromBlock(currentParam);
                    if (paramCode && paramCode.trim()) {
                        params.push(paramCode);
                    }
                }
                currentParam = currentParam.getNextBlock();
            }
        }

        const paramList = params.length > 0 ? `(${params.join(', ')})` : '()';
        return `// Evento ${eventName}${paramList}`;
    }

    // ========== FUNCIONES ==========

    block_function_declaration(block) {
        const fnName = block.getFieldValue('FN_NAME');
        const retType = block.getFieldValue('RET_TYPE');

        const typeMap = {
            'VOID': '',  // Empty string - we'll handle this specially
            'I32': 'i32',
            'I128': 'i128',
            'BOOL': 'bool',
            'STRING': 'String',
            'ADDRESS': 'Address',
            'BYTES': 'soroban_sdk::Bytes',
            'VEC': 'Vec'
        };

        const rustRetType = typeMap[retType] || retType;
        // Store current return type for use in return statements
        this.currentFunctionReturnType = retType;

        // Procesar parámetros
        let params = ['env: Env'];
        const paramsBlock = block.getInputTargetBlock('PARAMS');
        if (paramsBlock) {
            let currentParam = paramsBlock;
            while (currentParam) {
                if (currentParam.type === 'function_parameter') {
                    const paramCode = this.fromBlock(currentParam);
                    if (paramCode && paramCode.trim()) {
                        params.push(paramCode);
                    }
                }
                currentParam = currentParam.getNextBlock();
            }
        }

        // Procesar body
        let bodyCode = '    // TODO: Implementar función';
        const bodyBlock = block.getInputTargetBlock('BODY');
        if (bodyBlock) {
            bodyCode = '';
            this.indentation = 1;
            let currentStatement = bodyBlock;
            while (currentStatement) {
                const statement = this.fromBlock(currentStatement);
                if (statement && statement.trim()) {
                    bodyCode += this.indent(statement) + '\n';
                }
                currentStatement = currentStatement.getNextBlock();
            }
            this.indentation = 0;
            // Remove trailing newline
            bodyCode = bodyCode.replace(/\n$/, '');
        }

        const paramList = params.join(', ');
        // For VOID functions, don't add return type (Rust defaults to ())
        const returnTypePart = rustRetType ? ` -> ${rustRetType}` : '';
        return `pub fn ${fnName}(${paramList})${returnTypePart} {\n${bodyCode}\n    }`;
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

    block_event_parameter(block) {
        const paramName = block.getFieldValue('PARAM_NAME');
        const paramType = block.getFieldValue('PARAM_TYPE');

        const typeMap = {
            'I32': 'i32',
            'I128': 'i128',
            'BOOL': 'bool',
            'STRING': 'String',
            'ADDRESS': 'Address',
            'BYTES': 'Bytes',
            'VEC': 'Vec'
        };

        const rustType = typeMap[paramType] || paramType;
        return `${paramName}: ${rustType}`;
    }

    block_function_return(block) {
        const input = block.getInputTargetBlock('VALUE');

        // If we're in a VOID function, just return without a value
        if (this.currentFunctionReturnType === 'VOID') {
            return 'return;';
        }

        let value = '';
        if (input) {
            value = this.fromBlock(input);

            // If returning a string literal in a STRING function, convert to Soroban String
            if (this.currentFunctionReturnType === 'STRING' && input.type === 'string_literal') {
                const strValue = input.getFieldValue('VALUE');
                value = `String::from_str(&env, "${strValue}")`;
            }
        } else {
            // Default values based on expected return type
            const defaults = {
                'I32': '0',
                'I128': '0i128',
                'BOOL': 'false',
                'STRING': 'String::from_str(&env, "")',
                'ADDRESS': 'panic!("No address")'
            };
            value = defaults[this.currentFunctionReturnType] || '()';
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
        // Si estamos en una función y el input A está vacío, intentar usar el primer parámetro
        if (!a && this.currentFunctionReturnType !== null) {
            // Buscar el primer parámetro de la función actual
            // Por ahora, usamos 'value' como nombre por defecto para el template DeFi
            // Esto se puede mejorar para obtener el nombre real del parámetro
            aCode = 'value';
        }
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
        let assetCodeStr = assetCode ? this.fromBlock(assetCode) : '"USDC"';
        let assetIssuerStr = assetIssuer ? this.fromBlock(assetIssuer) : 'issuer_address';

        return `// Pago a ${destCode} de ${amountCode} ${assetCodeStr} (Emisor: ${assetIssuerStr})`;
    }

    block_stellar_require_auth(block) {
        const address = block.getInputTargetBlock('ADDRESS');

        let addrCode = address ? this.fromBlock(address) : 'account';

        return `${addrCode}.require_auth();`;
    }

    block_stellar_trust_line(block) {
        this.addImport('use soroban_sdk::{Symbol, symbol_short};');

        const account = block.getInputTargetBlock('ACCOUNT');
        const assetCode = block.getInputTargetBlock('ASSET_CODE');
        const assetIssuer = block.getInputTargetBlock('ASSET_ISSUER');
        const limit = block.getInputTargetBlock('LIMIT');

        let accountCode = account ? this.fromBlock(account) : 'account';
        let assetCodeStr = assetCode ? this.fromBlock(assetCode) : '"USDC"';
        let assetIssuerStr = assetIssuer ? this.fromBlock(assetIssuer) : 'issuer';
        let limitCode = limit ? this.fromBlock(limit) : '1_000_000_000';

        return `// Establecer línea de confianza\n// Cuenta: ${accountCode}, Asset: ${assetCodeStr}, Límite: ${limitCode}`;
    }

    block_stellar_context(block) {
        const context = block.getFieldValue('CONTEXT');

        const contextMap = {
            'CURRENT_CONTRACT': 'env.current_contract_address()',
            'LEDGER': 'env.ledger().sequence()',
            'TIMESTAMP': 'env.ledger().timestamp()',
            'INVOKER': 'env.invoker()'
        };

        const contextCode = contextMap[context] || 'env.current_contract_address()';
        return contextCode;
    }

    // ========== TOKEN ==========

    block_token_init(block) {
        this.addImport('use soroban_sdk::token::{TokenInterface, TokenMetadata};');

        const name = block.getInputTargetBlock('NAME');
        const symbol = block.getInputTargetBlock('SYMBOL');
        const decimals = block.getInputTargetBlock('DECIMALS');
        const supply = block.getInputTargetBlock('SUPPLY');

        let nameCode = name ? this.fromBlock(name) : '"Token"';
        let symbolCode = symbol ? this.fromBlock(symbol) : '"TOK"';
        let decimalsCode = decimals ? this.fromBlock(decimals) : '7';
        let supplyCode = supply ? this.fromBlock(supply) : '1_000_000';

        return `pub fn initialize(env: Env, name: String, symbol: String, decimals: u32, initial_supply: i128) {\n    // Token: ${nameCode}\n    // Symbol: ${symbolCode}\n    // Decimals: ${decimalsCode}\n    // Initial Supply: ${supplyCode}\n}`;
    }

    block_token_mint(block) {
        const to = block.getInputTargetBlock('TO');
        const amount = block.getInputTargetBlock('AMOUNT');

        let toCode = to ? this.fromBlock(to) : 'to_address';
        let amountCode = amount ? this.fromBlock(amount) : '0';

        // Mint tokens - increment balance
        return `// Mint tokens to ${toCode}
let balance_key = symbol_short!("BAL");
let current: i128 = env.storage().persistent().get(&(&${toCode}, &balance_key)).unwrap_or(0);
env.storage().persistent().set(&(&${toCode}, &balance_key), &(current + ${amountCode}));`;
    }

    block_token_burn(block) {
        const from = block.getInputTargetBlock('FROM');
        const amount = block.getInputTargetBlock('AMOUNT');

        let fromCode = from ? this.fromBlock(from) : 'from_address';
        let amountCode = amount ? this.fromBlock(amount) : '0';

        return `// Burn: Se queman ${amountCode} tokens de ${fromCode}`;
    }

    block_token_transfer(block) {
        const from = block.getInputTargetBlock('FROM');
        const to = block.getInputTargetBlock('TO');
        const amount = block.getInputTargetBlock('AMOUNT');

        let fromCode = from ? this.fromBlock(from) : 'from_address';
        let toCode = to ? this.fromBlock(to) : 'to_address';
        let amountCode = amount ? this.fromBlock(amount) : '0';

        return `TokenClient::new(&env, &token_id).transfer(&${fromCode}, &${toCode}, &${amountCode});`;
    }

    block_token_balance(block) {
        const account = block.getInputTargetBlock('ACCOUNT');

        let accountCode = account ? this.fromBlock(account) : 'account';

        return `TokenClient::new(&env, &token_id).balance(&${accountCode})`;
    }

    block_token_allowance(block) {
        const owner = block.getInputTargetBlock('OWNER');
        const spender = block.getInputTargetBlock('SPENDER');
        const amount = block.getInputTargetBlock('AMOUNT');

        let ownerCode = owner ? this.fromBlock(owner) : 'owner';
        let spenderCode = spender ? this.fromBlock(spender) : 'spender';
        let amountCode = amount ? this.fromBlock(amount) : '0';

        return `TokenClient::new(&env, &token_id).approve(&${ownerCode}, &${spenderCode}, &${amountCode}, &10_000);`;
    }

    block_token_symbol(block) {
        const symbol = block.getInputTargetBlock('SYMBOL');

        let symbolCode = symbol ? this.fromBlock(symbol) : '"TOK"';

        return `let symbol = Symbol::new(&env, ${symbolCode});`;
    }

    block_token_supply(block) {
        const supply = block.getInputTargetBlock('SUPPLY');

        let supplyCode = supply ? this.fromBlock(supply) : '1_000_000';

        return `TokenClient::new(&env, &token_id).total_supply()`;
    }

    block_token_decimals(block) {
        const decimals = block.getInputTargetBlock('DECIMALS');

        let decimalsCode = decimals ? this.fromBlock(decimals) : '7';

        return `TokenClient::new(&env, &token_id).decimals()`;
    }

    // ========== RWA (REAL WORLD ASSETS) ==========

    block_rwa_asset(block) {
        // Add RWA imports once (Set will deduplicate)
        this.addImport('use soroban_sdk::{Symbol, symbol_short, Map};');

        const name = block.getFieldValue('NAME');
        const isin = block.getFieldValue('ISIN');
        const issuer = block.getFieldValue('ISSUER');
        const price = block.getFieldValue('PRICE');

        const code = `pub fn register_rwa_asset(env: Env, name: Symbol, isin: Symbol, issuer: Address, price: i128) -> Symbol {
        let asset_key = symbol_short!("${name.slice(0, 4).toUpperCase()}");

        // Store asset metadata
        env.storage().persistent().set(&symbol_short!("NAME"), &"${name}");
        env.storage().persistent().set(&symbol_short!("ISIN"), &"${isin}");
        env.storage().persistent().set(&symbol_short!("ISSUER"), &issuer);
        env.storage().persistent().set(&symbol_short!("PRICE"), &price);

        asset_key
    }`;

        return code;
    }

    block_rwa_custody(block) {
        this.addImport('use soroban_sdk::{Symbol, symbol_short, Map};');

        const custodian = block.getFieldValue('CUSTODIAN');
        const asset = block.getFieldValue('ASSET');
        const amount = block.getFieldValue('AMOUNT');

        const code = `pub fn register_custodian(env: Env, custodian: Address, asset: Symbol, amount: i128) -> bool {
        // Verify custodian authorization
        custodian.require_auth();

        // Store custody relationship
        let custody_key = symbol_short!("CUST");
        let mut custodies: Map<Address, i128> = env.storage()
            .persistent()
            .get(&custody_key)
            .unwrap_or_default();

        custodies.set(custodian.clone(), amount);
        env.storage().persistent().set(&custody_key, &custodies);

        true
    }`;

        return code;
    }

    block_rwa_settlement(block) {
        this.addImport('use soroban_sdk::{Symbol, symbol_short};');

        const seller = block.getFieldValue('SELLER');
        const buyer = block.getFieldValue('BUYER');
        const amount = block.getFieldValue('AMOUNT');
        const price = block.getFieldValue('PRICE');

        const code = `pub fn settle_transaction(env: Env, seller: Address, buyer: Address, amount: i128, price: i128) -> bool {
        // Verify seller authorization
        seller.require_auth();

        // Store settlement record
        let settlement_key = symbol_short!("SETL");
        env.storage().persistent().set(&settlement_key, &true);

        // Emit settlement event
        env.events().publish((
            symbol_short!("SETTLE"),
            seller.clone(),
            buyer.clone(),
        ), (amount, price));

        true
    }`;

        return code;
    }

    block_rwa_compliance(block) {
        this.addImport('use soroban_sdk::{Symbol, symbol_short};');

        const account = block.getFieldValue('ACCOUNT');
        const complianceType = block.getFieldValue('COMPLIANCE_TYPE');

        const code = `pub fn verify_compliance(env: Env, account: Address, compliance_type: Symbol) -> bool {
        match compliance_type {
            Symbol::new(&env, "${complianceType}") => {
                // Store compliance verification
                let compliance_key = symbol_short!("COMP");
                env.storage().persistent().set(&compliance_key, &true);
                true
            },
            _ => false
        }
    }`;

        return code;
    }

    block_rwa_redemption(block) {
        this.addImport('use soroban_sdk::{Symbol, symbol_short};');

        const from = block.getFieldValue('FROM');
        const amount = block.getFieldValue('AMOUNT');
        const reason = block.getFieldValue('REASON');

        const code = `pub fn redeem_assets(env: Env, from: Address, amount: i128, reason: Symbol) -> bool {
        // Verify redemption authorization
        from.require_auth();

        // Store redemption record
        let redemption_key = symbol_short!("REDM");
        env.storage().persistent().set(&redemption_key, &true);

        // Emit redemption event
        env.events().publish((
            symbol_short!("REDEEM"),
            from.clone(),
            reason.clone(),
        ), amount);

        true
    }`;

        return code;
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
        const bodyBlock = block.getInputTargetBlock('BODY');

        let addrCode = address ? this.fromBlock(address) : 'invoker';
        let code = `${addrCode}.require_auth();\n`;

        // Procesar el body si existe
        if (bodyBlock) {
            this.indentation++;
            let currentStatement = bodyBlock;
            while (currentStatement) {
                const statement = this.fromBlock(currentStatement);
                if (statement && statement.trim()) {
                    code += this.indent(statement) + '\n';
                }
                currentStatement = currentStatement.getNextBlock();
            }
            this.indentation--;
        }

        return code.replace(/\n$/, '');
    }

    block_role_based_check(block) {
        const address = block.getInputTargetBlock('ADDRESS');
        const role = block.getFieldValue('ROLE');

        let addressCode = address ? this.fromBlock(address) : 'account';

        return `// Verificar rol: ${role}\nif check_role(&env, &${addressCode}, "${role}") { /* authorized */ }`;
    }

    block_reentrancy_guard(block) {
        this.addImport('use soroban_sdk::Symbol;');

        const bodyBlock = block.getInputTargetBlock('BODY');

        let code = 'let guard_key = symbol_short!("REENT");\n';
        code += 'if env.storage().temporary().has(&guard_key) { panic!("Reentrancy detected"); }\n';
        code += 'env.storage().temporary().set(&guard_key, &true);\n';

        // Procesar el body si existe
        if (bodyBlock) {
            this.indentation++;
            let currentStatement = bodyBlock;
            while (currentStatement) {
                const statement = this.fromBlock(currentStatement);
                if (statement && statement.trim()) {
                    code += this.indent(statement) + '\n';
                }
                currentStatement = currentStatement.getNextBlock();
            }
            this.indentation--;
        }

        code += 'env.storage().temporary().remove(&guard_key);';

        return code.replace(/\n$/, '');
    }

    block_pause_functionality(block) {
        const action = block.getFieldValue('ACTION');

        const actionMap = {
            'PAUSE': 'env.storage().persistent().set(&symbol_short!("PAUSED"), &true);',
            'UNPAUSE': 'env.storage().persistent().set(&symbol_short!("PAUSED"), &false);',
            'CHECK': 'let is_paused = env.storage().persistent().get::<bool>(&symbol_short!("PAUSED")).unwrap_or(false);'
        };

        const actionCode = actionMap[action] || 'env.storage().persistent().set(&symbol_short!("PAUSED"), &true);';
        return `// ${action} contrato\n${actionCode}`;
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
            } else if (currentBlock.type.startsWith('rwa_')) {
                // RWA blocks generate functions, so add them to functions list
                if (code && code.trim()) {
                    functions.push(code);
                }
            } else if (currentBlock.type === 'hello_world_function' || currentBlock.type === 'counter_function') {
                // Hello World and Counter blocks generate functions
                if (code && code.trim()) {
                    functions.push(code);
                }
            } else if (code && code.trim()) {
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

        // Agregar imports básicos siempre
        // Usamos un solo import consolidado para evitar duplicados
        this.imports.clear();
        this.addImport('use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, symbol_short};');

        // Agregar imports adicionales si hay funciones que los necesitan
        const allCode = [...stateVars, ...functions, ...events].join('\n');
        if (allCode.includes('Map<') || allCode.includes('Map::<')) {
            this.addImport('use soroban_sdk::Map;');
        }
        if (allCode.includes('Vec<') || allCode.includes('Vec::<')) {
            this.addImport('use soroban_sdk::Vec;');
        }
        // Check for String type usage (as return type "-> String" or method call "String::")
        if (allCode.includes('String::') || allCode.includes('-> String') || allCode.match(/:\s*String[,\s\)]/)) {
            this.addImport('use soroban_sdk::String;');
        }
        if (allCode.includes('Bytes::') || allCode.includes('Bytes>') || allCode.includes('-> Bytes') || allCode.match(/:\s*Bytes[,\s\)]/)) {
            this.addImport('use soroban_sdk::Bytes;');
        }
        // Check for i128 usage (for token amounts)
        if (allCode.includes('i128')) {
            // i128 is a primitive, no import needed
        }

        // Deduplicar y ordenar imports
        const importsArray = Array.from(this.imports);
        const sortedImports = ['#![no_std]', ...importsArray.filter(i => !i.includes('#![no_std]'))];
        rust += sortedImports.join('\n') + '\n\n';

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

    // ========== HELLO WORLD FUNCTION ==========

    block_hello_world_function(block) {
        const message = block.getFieldValue('MESSAGE') || 'Hello, Stellar!';
        return `/// Returns a greeting message
    pub fn hello(env: Env) -> String {
        String::from_str(&env, "${message}")
    }`;
    }

    // ========== COUNTER FUNCTION ==========

    block_counter_function(block) {
        const increment = block.getFieldValue('INCREMENT') || 1;
        return `/// Takes a number and returns the number plus ${increment}
    pub fn increment(env: Env, value: u32) -> u32 {
        value + ${increment}
    }`;
    }

    reset() {
        this.indentation = 0;
        this.imports.clear();
        this.declarations = [];
        this.code = [];
        this.currentFunctionReturnType = null;
    }
}

// Crear instancia global
const rustGen = new RustGenerator();

console.log('✅ Generador Rust cargado correctamente');
