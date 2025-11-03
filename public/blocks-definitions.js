/**
 * DEFINICIONES DE BLOQUES PROFESIONALES PARA SMART CONTRACTS
 * Sistema completo de bloques para construir contratos inteligentes en Stellar
 */

// ============================================================================
// CATEGORÍA 1: 🚀 EMPEZAR (Bloques de inicialización)
// ============================================================================

Blockly.Blocks['contract_init'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🚀 Iniciar Smart Contract");
        this.appendStatementInput("BODY")
            .setCheck(null);
        this.setColour("#8E24AA");
        this.setStyle("hat");
        this.setTooltip("Bloque principal que inicia un smart contract");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['contract_metadata'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("📄 Metadatos del Contrato")
            .appendField(new Blockly.FieldTextInput("Mi Contrato"), "TITLE");
        this.appendDummyInput()
            .appendField("Descripción:")
            .appendField(new Blockly.FieldTextInput("Descripción..."), "DESCRIPTION");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#8E24AA");
        this.setTooltip("Define el título y descripción del contrato");
    }
};

// ============================================================================
// CATEGORÍA 2: 🎨 PROPIEDADES (Configuración del contrato)
// ============================================================================

Blockly.Blocks['contract_name'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("📝 Nombre del Contrato")
            .appendField(new Blockly.FieldTextInput("MiContrato"), "NAME");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#1E88E5");
        this.setTooltip("Define el nombre único de tu contrato");
    }
};

Blockly.Blocks['contract_version'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🔢 Versión")
            .appendField(new Blockly.FieldTextInput("1.0.0"), "VERSION");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#1E88E5");
        this.setTooltip("Define la versión semántica del contrato");
    }
};

Blockly.Blocks['contract_owner'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("👤 Propietario")
            .appendField(new Blockly.FieldTextInput("G..."), "ADDRESS");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#1E88E5");
        this.setTooltip("Define la dirección del propietario principal");
    }
};

Blockly.Blocks['admin_address'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🔑 Administrador")
            .appendField(new Blockly.FieldTextInput("G..."), "ADDRESS");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#1E88E5");
        this.setTooltip("Define la dirección del administrador (puede ser diferente al propietario)");
    }
};

Blockly.Blocks['contract_description'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("📖 Descripción")
            .appendField(new Blockly.FieldTextInput("Tu descripción aquí"), "TEXT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#1E88E5");
        this.setTooltip("Describe el propósito y funcionalidad del contrato");
    }
};

// ============================================================================
// CATEGORÍA 3: 📦 ESTADO (Variables y almacenamiento)
// ============================================================================

Blockly.Blocks['state_variable'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("📦 Variable de Estado")
            .appendField(new Blockly.FieldTextInput("miVariable"), "VAR_NAME")
            .appendField("tipo:")
            .appendField(new Blockly.FieldDropdown([
                ["i32", "I32"],
                ["i128", "I128"],
                ["i64", "I64"],
                ["u32", "U32"],
                ["u64", "U64"],
                ["u128", "U128"],
                ["bool", "BOOL"],
                ["String", "STRING"],
                ["Address", "ADDRESS"],
                ["Bytes", "BYTES"],
                ["Map", "MAP"],
                ["Vec", "VEC"]
            ]), "VAR_TYPE")
            .appendField("inicio:")
            .appendField(new Blockly.FieldTextInput("0"), "INIT_VALUE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5E35B1");
        this.setTooltip("Define una variable de estado persistente del contrato");
    }
};

Blockly.Blocks['state_map'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🗺️ Mapeo")
            .appendField(new Blockly.FieldTextInput("miMapa"), "MAP_NAME")
            .appendField("clave:")
            .appendField(new Blockly.FieldDropdown([["Address", "ADDRESS"], ["String", "STRING"], ["i128", "I128"]]), "KEY_TYPE")
            .appendField("valor:")
            .appendField(new Blockly.FieldDropdown([["i128", "I128"], ["bool", "BOOL"], ["String", "STRING"], ["Address", "ADDRESS"]]), "VALUE_TYPE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5E35B1");
        this.setTooltip("Define un mapeo (tabla hash) para almacenar pares clave-valor");
    }
};

Blockly.Blocks['state_event'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("📢 Evento")
            .appendField(new Blockly.FieldTextInput("MiEvento"), "EVENT_NAME");
        this.appendStatementInput("PARAMS");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5E35B1");
        this.setTooltip("Define un evento que se emitirá cuando ocurran acciones específicas");
    }
};

Blockly.Blocks['event_parameter'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🔹 Parámetro:")
            .appendField(new Blockly.FieldTextInput("param"), "PARAM_NAME")
            .appendField("tipo:")
            .appendField(new Blockly.FieldDropdown([["Address", "ADDRESS"], ["i128", "I128"], ["String", "STRING"], ["bool", "BOOL"]]), "PARAM_TYPE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7C4DFF");
        this.setTooltip("Define un parámetro para un evento");
    }
};

// ============================================================================
// CATEGORÍA 4: ⚙️ FUNCIONES (Definición y parámetros)
// ============================================================================

Blockly.Blocks['function_declaration'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("⚙️ Función")
            .appendField(new Blockly.FieldTextInput("miFuncion"), "FN_NAME")
            .appendField("retorna:")
            .appendField(new Blockly.FieldDropdown([
                ["void", "VOID"],
                ["i32", "I32"],
                ["i128", "I128"],
                ["bool", "BOOL"],
                ["String", "STRING"],
                ["Address", "ADDRESS"],
                ["Bytes", "BYTES"],
                ["Vec", "VEC"]
            ]), "RET_TYPE");
        this.appendStatementInput("PARAMS")
            .appendField("parámetros");
        this.appendStatementInput("BODY")
            .appendField("cuerpo");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FF8F00");
        this.setTooltip("Define una función pública del contrato");
    }
};

Blockly.Blocks['function_parameter'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🔹 Parámetro:")
            .appendField(new Blockly.FieldTextInput("param"), "PARAM_NAME")
            .appendField("tipo:")
            .appendField(new Blockly.FieldDropdown([
                ["i32", "I32"],
                ["i128", "I128"],
                ["bool", "BOOL"],
                ["String", "STRING"],
                ["Address", "ADDRESS"],
                ["Bytes", "BYTES"],
                ["Vec", "VEC"]
            ]), "PARAM_TYPE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FFB74D");
        this.setTooltip("Define un parámetro de función");
    }
};

Blockly.Blocks['function_return'] = {
    init: function() {
        this.appendValueInput("VALUE")
            .appendField("↩️ Retornar");
        this.setPreviousStatement(true, null);
        this.setColour("#FFB74D");
        this.setTooltip("Retorna un valor de la función");
    }
};

// ============================================================================
// CATEGORÍA 5: 🧠 LÓGICA (Control de flujo)
// ============================================================================

Blockly.Blocks['if_statement'] = {
    init: function() {
        this.appendValueInput("CONDITION")
            .setCheck("Boolean")
            .appendField("si");
        this.appendStatementInput("THEN")
            .appendField("entonces");
        this.appendStatementInput("ELSE")
            .appendField("si no");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#E91E63");
        this.setTooltip("Ejecuta un bloque si la condición es verdadera, otro si es falsa");
    }
};

Blockly.Blocks['comparison_operator'] = {
    init: function() {
        this.appendValueInput("A")
            .setCheck(null);
        this.appendValueInput("B")
            .setCheck(null)
            .appendField(new Blockly.FieldDropdown([
                ["==", "EQ"],
                ["!=", "NEQ"],
                ["<", "LT"],
                [">", "GT"],
                ["<=", "LTE"],
                [">=", "GTE"]
            ]), "OP");
        this.setOutput(true, "Boolean");
        this.setColour("#E91E63");
        this.setTooltip("Compara dos valores y retorna verdadero o falso");
    }
};

Blockly.Blocks['logical_operator'] = {
    init: function() {
        this.appendValueInput("A")
            .setCheck("Boolean");
        this.appendValueInput("B")
            .setCheck("Boolean")
            .appendField(new Blockly.FieldDropdown([["Y", "AND"], ["O", "OR"]]), "OP");
        this.setOutput(true, "Boolean");
        this.setColour("#E91E63");
        this.setTooltip("Combina dos condiciones booleanas");
    }
};

Blockly.Blocks['loop_while'] = {
    init: function() {
        this.appendValueInput("CONDITION")
            .setCheck("Boolean")
            .appendField("mientras");
        this.appendStatementInput("BODY")
            .appendField("hacer");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#E91E63");
        this.setTooltip("Repite un bloque mientras la condición sea verdadera");
    }
};

Blockly.Blocks['loop_for'] = {
    init: function() {
        this.appendValueInput("START")
            .setCheck("Number")
            .appendField("para i desde");
        this.appendValueInput("END")
            .setCheck("Number")
            .appendField("hasta");
        this.appendStatementInput("BODY")
            .appendField("hacer");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#E91E63");
        this.setTooltip("Itera un número específico de veces");
    }
};

// ============================================================================
// CATEGORÍA 6: 🔢 OPERACIONES (Aritmética y asignación)
// ============================================================================

Blockly.Blocks['arithmetic_operation'] = {
    init: function() {
        this.appendValueInput("A")
            .setCheck("Number");
        this.appendValueInput("B")
            .setCheck("Number")
            .appendField(new Blockly.FieldDropdown([["+", "ADD"], ["-", "MINUS"], ["*", "MULT"], ["/", "DIV"], ["%", "MOD"]]), "OP");
        this.setOutput(true, "Number");
        this.setColour("#4CAF50");
        this.setTooltip("Realiza una operación aritmética entre dos números");
    }
};

Blockly.Blocks['variable_assignment'] = {
    init: function() {
        this.appendValueInput("VALUE")
            .appendField("📝")
            .appendField(new Blockly.FieldTextInput("variable"), "VAR")
            .appendField("=");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4CAF50");
        this.setTooltip("Asigna un valor a una variable");
    }
};

Blockly.Blocks['increment_decrement'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput("variable"), "VAR")
            .appendField(new Blockly.FieldDropdown([["+1", "INC"], ["-1", "DEC"]]), "OP");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4CAF50");
        this.setTooltip("Incrementa o decrementa una variable en 1");
    }
};

// ============================================================================
// CATEGORÍA 7: ⭐ STELLAR (Operaciones específicas de Stellar)
// ============================================================================

Blockly.Blocks['stellar_transfer'] = {
    init: function() {
        this.appendValueInput("FROM")
            .appendField("⭐ Transferir de");
        this.appendValueInput("TO")
            .appendField("a");
        this.appendValueInput("AMOUNT")
            .appendField("cantidad:");
        this.appendValueInput("ASSET")
            .appendField("asset:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FFC107");
        this.setTooltip("Realiza una transferencia de assets en Stellar");
    }
};

Blockly.Blocks['stellar_payment'] = {
    init: function() {
        this.appendValueInput("DESTINATION")
            .appendField("💰 Pagar a");
        this.appendValueInput("AMOUNT")
            .appendField("cantidad:");
        this.appendValueInput("ASSET_CODE")
            .appendField("código:");
        this.appendValueInput("ASSET_ISSUER")
            .appendField("emisor:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FFC107");
        this.setTooltip("Envía un pago en Stellar");
    }
};

Blockly.Blocks['stellar_trust_line'] = {
    init: function() {
        this.appendValueInput("ACCOUNT")
            .appendField("🔗 Establecer TrustLine para");
        this.appendValueInput("ASSET_CODE")
            .appendField("asset:");
        this.appendValueInput("ASSET_ISSUER")
            .appendField("emisor:");
        this.appendValueInput("LIMIT")
            .appendField("límite:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FFC107");
        this.setTooltip("Establece un trustline para permitir recibir un asset");
    }
};

Blockly.Blocks['stellar_require_auth'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🔐 Requerir Autenticación");
        this.appendValueInput("ADDRESS")
            .appendField("de");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FFC107");
        this.setTooltip("Requiere que una dirección proporcione su firma");
    }
};

Blockly.Blocks['stellar_context'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("📋 Obtener Contexto Stellar")
            .appendField(new Blockly.FieldDropdown([
                ["Invoker", "INVOKER"],
                ["Contract Address", "CONTRACT"],
                ["Current Ledger", "LEDGER"],
                ["Timestamp", "TIMESTAMP"]
            ]), "CONTEXT");
        this.setOutput(true, null);
        this.setColour("#FFC107");
        this.setTooltip("Obtiene información del contexto de ejecución");
    }
};

// ============================================================================
// CATEGORÍA 8: 💰 TOKEN (Operaciones de tokens)
// ============================================================================

Blockly.Blocks['token_symbol'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("💱 Símbolo del Token")
            .appendField(new Blockly.FieldTextInput("TOKEN"), "SYMBOL");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7B1FA2");
        this.setTooltip("Define el símbolo único del token (máx 12 caracteres)");
    }
};

Blockly.Blocks['token_supply'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("📊 Suministro Inicial")
            .appendField(new Blockly.FieldNumber(1000, 0, Infinity, 1), "SUPPLY");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7B1FA2");
        this.setTooltip("Define la cantidad inicial de tokens a crear");
    }
};

Blockly.Blocks['token_decimals'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🔢 Decimales")
            .appendField(new Blockly.FieldNumber(2, 0, 18, 1), "DECIMALS");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7B1FA2");
        this.setTooltip("Define la cantidad de decimales (0-18)");
    }
};

Blockly.Blocks['token_init'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🪙 Inicializar Token");
        this.appendValueInput("NAME")
            .appendField("nombre:");
        this.appendValueInput("SYMBOL")
            .appendField("símbolo:");
        this.appendValueInput("DECIMALS")
            .appendField("decimales:");
        this.appendValueInput("SUPPLY")
            .appendField("suministro:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7B1FA2");
        this.setTooltip("Inicializa un token fungible con propiedades específicas");
    }
};

Blockly.Blocks['token_mint'] = {
    init: function() {
        this.appendValueInput("TO")
            .appendField("🪙 Acuñar tokens para");
        this.appendValueInput("AMOUNT")
            .appendField("cantidad:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7B1FA2");
        this.setTooltip("Crea nuevos tokens y los asigna a una dirección");
    }
};

Blockly.Blocks['token_burn'] = {
    init: function() {
        this.appendValueInput("FROM")
            .appendField("🔥 Quemar tokens de");
        this.appendValueInput("AMOUNT")
            .appendField("cantidad:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7B1FA2");
        this.setTooltip("Destruye tokens eliminándolos de circulación");
    }
};

Blockly.Blocks['token_transfer'] = {
    init: function() {
        this.appendValueInput("FROM")
            .appendField("💸 Transferir desde");
        this.appendValueInput("TO")
            .appendField("a");
        this.appendValueInput("AMOUNT")
            .appendField("cantidad:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7B1FA2");
        this.setTooltip("Transfiere tokens entre cuentas");
    }
};

Blockly.Blocks['token_balance'] = {
    init: function() {
        this.appendValueInput("ACCOUNT")
            .appendField("📊 Balance de tokens para");
        this.setOutput(true, "Number");
        this.setColour("#7B1FA2");
        this.setTooltip("Obtiene el balance de tokens de una cuenta");
    }
};

Blockly.Blocks['token_allowance'] = {
    init: function() {
        this.appendValueInput("OWNER")
            .appendField("✅ Permitir a");
        this.appendValueInput("SPENDER")
            .appendField("gastar hasta");
        this.appendValueInput("AMOUNT")
            .appendField("cantidad:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7B1FA2");
        this.setTooltip("Autoriza a una dirección a gastar tokens en nombre del propietario");
    }
};

// ============================================================================
// CATEGORÍA 9: 🏢 RWA (Real World Assets)
// ============================================================================

Blockly.Blocks['rwa_asset'] = {
    init: function() {
        this.appendValueInput("NAME")
            .appendField("🏢 Definir RWA")
            .appendField("nombre:");
        this.appendValueInput("ISIN")
            .appendField("ISIN:");
        this.appendValueInput("ISSUER")
            .appendField("emisor:");
        this.appendValueInput("PRICE")
            .appendField("precio inicial:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#C62828");
        this.setTooltip("Define un activo del mundo real con propiedades");
    }
};

Blockly.Blocks['rwa_custody'] = {
    init: function() {
        this.appendValueInput("CUSTODIAN")
            .appendField("🔒 Custodio")
            .appendField("dirección:");
        this.appendValueInput("ASSET")
            .appendField("asset:");
        this.appendValueInput("AMOUNT")
            .appendField("cantidad:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#C62828");
        this.setTooltip("Establece un custodio para mantener RWAs");
    }
};

Blockly.Blocks['rwa_settlement'] = {
    init: function() {
        this.appendValueInput("SELLER")
            .appendField("📋 Liquidación - Vendedor:");
        this.appendValueInput("BUYER")
            .appendField("Comprador:");
        this.appendValueInput("AMOUNT")
            .appendField("Cantidad:");
        this.appendValueInput("PRICE")
            .appendField("Precio:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#C62828");
        this.setTooltip("Ejecuta una liquidación de transacción de RWA");
    }
};

Blockly.Blocks['rwa_compliance'] = {
    init: function() {
        this.appendValueInput("ACCOUNT")
            .appendField("⚖️ Verificar Cumplimiento");
        this.appendDummyInput()
            .appendField("tipo:")
            .appendField(new Blockly.FieldDropdown([
                ["KYC", "KYC"],
                ["AML", "AML"],
                ["Jurisdicción", "JURISDICTION"],
                ["Acreditado", "ACCREDITED"]
            ]), "COMPLIANCE_TYPE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#C62828");
        this.setTooltip("Verifica requisitos de cumplimiento regulatorio");
    }
};

Blockly.Blocks['rwa_redemption'] = {
    init: function() {
        this.appendValueInput("FROM")
            .appendField("🔄 Redención - Desde:");
        this.appendValueInput("AMOUNT")
            .appendField("Cantidad:");
        this.appendValueInput("REASON")
            .appendField("Razón:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#C62828");
        this.setTooltip("Procesa una redención de RWA");
    }
};

// ============================================================================
// CATEGORÍA 10: 🔐 SEGURIDAD (Control y protección)
// ============================================================================

Blockly.Blocks['require_condition'] = {
    init: function() {
        this.appendValueInput("CONDITION")
            .setCheck("Boolean")
            .appendField("🔍 Requiere");
        this.appendValueInput("MESSAGE")
            .appendField("mensaje de error:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#D32F2F");
        this.setTooltip("Valida una condición - falla si es falsa");
    }
};

Blockly.Blocks['access_control'] = {
    init: function() {
        this.appendValueInput("ADDRESS")
            .appendField("🔐 Control de Acceso - Solo");
        this.appendDummyInput()
            .appendField("rol:")
            .appendField(new Blockly.FieldDropdown([
                ["Admin", "ADMIN"],
                ["Owner", "OWNER"],
                ["Minter", "MINTER"],
                ["Burner", "BURNER"],
                ["Custom", "CUSTOM"]
            ]), "ROLE");
        this.appendStatementInput("BODY")
            .appendField("permitir");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#D32F2F");
        this.setTooltip("Restringe el acceso a ciertos roles");
    }
};

Blockly.Blocks['role_based_check'] = {
    init: function() {
        this.appendValueInput("ADDRESS")
            .appendField("👤 Verificar Rol");
        this.appendDummyInput()
            .appendField("tiene rol:")
            .appendField(new Blockly.FieldDropdown([
                ["Admin", "ADMIN"],
                ["Owner", "OWNER"],
                ["Minter", "MINTER"],
                ["Burner", "BURNER"]
            ]), "ROLE");
        this.setOutput(true, "Boolean");
        this.setColour("#D32F2F");
        this.setTooltip("Verifica si una dirección tiene un rol específico");
    }
};

Blockly.Blocks['reentrancy_guard'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🛡️ Protección Anti-Reentrancia");
        this.appendStatementInput("BODY")
            .appendField("ejecutar");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#D32F2F");
        this.setTooltip("Protege contra ataques de reentrancia");
    }
};

Blockly.Blocks['pause_functionality'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("⏸️")
            .appendField(new Blockly.FieldDropdown([["Pausar", "PAUSE"], ["Reanudar", "UNPAUSE"]]), "ACTION")
            .appendField("contrato");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#D32F2F");
        this.setTooltip("Pausa o reanuda todas las operaciones del contrato");
    }
};

// ============================================================================
// VALORES LITERALES Y UTILIDADES
// ============================================================================

Blockly.Blocks['number_literal'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(0), "VALUE");
        this.setOutput(true, "Number");
        this.setColour("#4CAF50");
        this.setTooltip("Un número");
    }
};

Blockly.Blocks['string_literal'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('"')
            .appendField(new Blockly.FieldTextInput("texto"), "VALUE")
            .appendField('"');
        this.setOutput(true, "String");
        this.setColour("#4CAF50");
        this.setTooltip("Una cadena de texto");
    }
};

Blockly.Blocks['boolean_literal'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["verdadero", "TRUE"], ["falso", "FALSE"]]), "VALUE");
        this.setOutput(true, "Boolean");
        this.setColour("#4CAF50");
        this.setTooltip("Un valor booleano (verdadero o falso)");
    }
};

console.log('✅ Bloques profesionales cargados correctamente');
