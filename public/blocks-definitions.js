/**
 * PROFESSIONAL BLOCK DEFINITIONS FOR SMART CONTRACTS
 * Complete block system for building smart contracts on Stellar
 */

// ============================================================================
// CATEGORY 1: 🚀 START (Initialization blocks)
// ============================================================================

Blockly.Blocks['contract_init'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🚀 Start Smart Contract");
        this.appendStatementInput("BODY")
            .setCheck(null);
        this.setColour("#8E24AA");
        this.setStyle("hat");
        this.setTooltip("Main block that starts a smart contract");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['contract_metadata'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("📄 Contract Metadata")
            .appendField(new Blockly.FieldTextInput("My Contract"), "TITLE");
        this.appendDummyInput()
            .appendField("Description:")
            .appendField(new Blockly.FieldTextInput("Description..."), "DESCRIPTION");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#8E24AA");
        this.setTooltip("Defines the title and description of the contract");
    }
};

// ============================================================================
// CATEGORY 2: 🎨 PROPERTIES (Contract configuration)
// ============================================================================

Blockly.Blocks['contract_name'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("📝 Contract Name")
            .appendField(new Blockly.FieldTextInput("MyContract"), "NAME");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#1E88E5");
        this.setTooltip("Defines the unique name of your contract");
    }
};

Blockly.Blocks['contract_version'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🔢 Version")
            .appendField(new Blockly.FieldTextInput("1.0.0"), "VERSION");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#1E88E5");
        this.setTooltip("Defines the semantic version of the contract");
    }
};

Blockly.Blocks['contract_owner'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("👤 Owner")
            .appendField(new Blockly.FieldTextInput("G..."), "ADDRESS");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#1E88E5");
        this.setTooltip("Defines the main owner's address");
    }
};

Blockly.Blocks['admin_address'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🔑 Administrator")
            .appendField(new Blockly.FieldTextInput("G..."), "ADDRESS");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#1E88E5");
        this.setTooltip("Defines the administrator's address (can be different from the owner)");
    }
};

Blockly.Blocks['contract_description'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("📖 Description")
            .appendField(new Blockly.FieldTextInput("Your description here"), "TEXT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#1E88E5");
        this.setTooltip("Describes the purpose and functionality of the contract");
    }
};

// ============================================================================
// CATEGORY 3: 📦 STATE (Variables and storage)
// ============================================================================

Blockly.Blocks['state_variable'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("📦 State Variable")
            .appendField(new Blockly.FieldTextInput("myVariable"), "VAR_NAME")
            .appendField("type:")
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
            .appendField("initial:")
            .appendField(new Blockly.FieldTextInput("0"), "INIT_VALUE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5E35B1");
        this.setTooltip("Defines a persistent state variable of the contract");
    }
};

Blockly.Blocks['state_map'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🗺️ Map")
            .appendField(new Blockly.FieldTextInput("myMap"), "MAP_NAME")
            .appendField("key:")
            .appendField(new Blockly.FieldDropdown([["Address", "ADDRESS"], ["String", "STRING"], ["i128", "I128"]]), "KEY_TYPE")
            .appendField("value:")
            .appendField(new Blockly.FieldDropdown([["i128", "I128"], ["bool", "BOOL"], ["String", "STRING"], ["Address", "ADDRESS"]]), "VALUE_TYPE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5E35B1");
        this.setTooltip("Defines a map (hash table) to store key-value pairs");
    }
};

Blockly.Blocks['state_event'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("📢 Event")
            .appendField(new Blockly.FieldTextInput("MyEvent"), "EVENT_NAME");
        this.appendStatementInput("PARAMS");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5E35B1");
        this.setTooltip("Defines an event that will be emitted when specific actions occur");
    }
};

Blockly.Blocks['event_parameter'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🔹 Parameter:")
            .appendField(new Blockly.FieldTextInput("param"), "PARAM_NAME")
            .appendField("type:")
            .appendField(new Blockly.FieldDropdown([["Address", "ADDRESS"], ["i128", "I128"], ["String", "STRING"], ["bool", "BOOL"]]), "PARAM_TYPE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7C4DFF");
        this.setTooltip("Defines a parameter for an event");
    }
};

// ============================================================================
// CATEGORY 4: ⚙️ FUNCTIONS (Definition and parameters)
// ============================================================================

Blockly.Blocks['function_declaration'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("⚙️ Function")
            .appendField(new Blockly.FieldTextInput("myFunction"), "FN_NAME")
            .appendField("returns:")
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
            .appendField("parameters");
        this.appendStatementInput("BODY")
            .appendField("body");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FF8F00");
        this.setTooltip("Defines a public function of the contract");
    }
};

Blockly.Blocks['function_parameter'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🔹 Parameter:")
            .appendField(new Blockly.FieldTextInput("param"), "PARAM_NAME")
            .appendField("type:")
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
        this.setTooltip("Defines a function parameter");
    }
};

Blockly.Blocks['function_return'] = {
    init: function() {
        this.appendValueInput("VALUE")
            .appendField("↩️ Return");
        this.setPreviousStatement(true, null);
        this.setColour("#FFB74D");
        this.setTooltip("Returns a value from the function");
    }
};

// ============================================================================
// CATEGORY 5: 🧠 LOGIC (Flow control)
// ============================================================================

Blockly.Blocks['if_statement'] = {
    init: function() {
        this.appendValueInput("CONDITION")
            .setCheck("Boolean")
            .appendField("if");
        this.appendStatementInput("THEN")
            .appendField("then");
        this.appendStatementInput("ELSE")
            .appendField("else");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#E91E63");
        this.setTooltip("Executes a block if the condition is true, another if it is false");
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
        this.setTooltip("Compares two values and returns true or false");
    }
};

Blockly.Blocks['logical_operator'] = {
    init: function() {
        this.appendValueInput("A")
            .setCheck("Boolean");
        this.appendValueInput("B")
            .setCheck("Boolean")
            .appendField(new Blockly.FieldDropdown([["AND", "AND"], ["OR", "OR"]]), "OP");
        this.setOutput(true, "Boolean");
        this.setColour("#E91E63");
        this.setTooltip("Combines two boolean conditions");
    }
};

Blockly.Blocks['loop_while'] = {
    init: function() {
        this.appendValueInput("CONDITION")
            .setCheck("Boolean")
            .appendField("while");
        this.appendStatementInput("BODY")
            .appendField("do");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#E91E63");
        this.setTooltip("Repeats a block while the condition is true");
    }
};

Blockly.Blocks['loop_for'] = {
    init: function() {
        this.appendValueInput("START")
            .setCheck("Number")
            .appendField("for i from");
        this.appendValueInput("END")
            .setCheck("Number")
            .appendField("to");
        this.appendStatementInput("BODY")
            .appendField("do");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#E91E63");
        this.setTooltip("Iterates a specific number of times");
    }
};

// ============================================================================
// CATEGORY 6: 🔢 OPERATIONS (Arithmetic and assignment)
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
        this.setTooltip("Performs an arithmetic operation between two numbers");
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
        this.setTooltip("Assigns a value to a variable");
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
        this.setTooltip("Increments or decrements a variable by 1");
    }
};

// ============================================================================
// CATEGORY 7: ⭐ STELLAR (Stellar-specific operations)
// ============================================================================

Blockly.Blocks['stellar_transfer'] = {
    init: function() {
        this.appendValueInput("FROM")
            .appendField("⭐ Transfer from");
        this.appendValueInput("TO")
            .appendField("to");
        this.appendValueInput("AMOUNT")
            .appendField("amount:");
        this.appendValueInput("ASSET")
            .appendField("asset:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FFC107");
        this.setTooltip("Performs an asset transfer on Stellar");
    }
};

Blockly.Blocks['stellar_payment'] = {
    init: function() {
        this.appendValueInput("DESTINATION")
            .appendField("💰 Pay to");
        this.appendValueInput("AMOUNT")
            .appendField("amount:");
        this.appendValueInput("ASSET_CODE")
            .appendField("code:");
        this.appendValueInput("ASSET_ISSUER")
            .appendField("issuer:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FFC107");
        this.setTooltip("Sends a payment on Stellar");
    }
};

Blockly.Blocks['stellar_trust_line'] = {
    init: function() {
        this.appendValueInput("ACCOUNT")
            .appendField("🔗 Set TrustLine for");
        this.appendValueInput("ASSET_CODE")
            .appendField("asset:");
        this.appendValueInput("ASSET_ISSUER")
            .appendField("issuer:");
        this.appendValueInput("LIMIT")
            .appendField("limit:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FFC107");
        this.setTooltip("Sets a trustline to allow receiving an asset");
    }
};

Blockly.Blocks['stellar_require_auth'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🔐 Require Authentication");
        this.appendValueInput("ADDRESS")
            .appendField("from");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FFC107");
        this.setTooltip("Requires an address to provide its signature");
    }
};

Blockly.Blocks['stellar_context'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("📋 Get Stellar Context")
            .appendField(new Blockly.FieldDropdown([
                ["Invoker", "INVOKER"],
                ["Contract Address", "CONTRACT"],
                ["Current Ledger", "LEDGER"],
                ["Timestamp", "TIMESTAMP"]
            ]), "CONTEXT");
        this.setOutput(true, null);
        this.setColour("#FFC107");
        this.setTooltip("Gets information from the execution context");
    }
};

// ============================================================================
// CATEGORY 8: 💰 TOKEN (Token operations)
// ============================================================================

Blockly.Blocks['token_symbol'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("💱 Token Symbol")
            .appendField(new Blockly.FieldTextInput("TOKEN"), "SYMBOL");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7B1FA2");
        this.setTooltip("Defines the unique token symbol (max 12 characters)");
    }
};

Blockly.Blocks['token_supply'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("📊 Initial Supply")
            .appendField(new Blockly.FieldNumber(1000, 0, Infinity, 1), "SUPPLY");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7B1FA2");
        this.setTooltip("Defines the initial amount of tokens to be created");
    }
};

Blockly.Blocks['token_decimals'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🔢 Decimals")
            .appendField(new Blockly.FieldNumber(2, 0, 18, 1), "DECIMALS");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7B1FA2");
        this.setTooltip("Defines the number of decimals (0-18)");
    }
};

Blockly.Blocks['token_init'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🪙 Initialize Token");
        this.appendValueInput("NAME")
            .appendField("name:");
        this.appendValueInput("SYMBOL")
            .appendField("symbol:");
        this.appendValueInput("DECIMALS")
            .appendField("decimals:");
        this.appendValueInput("SUPPLY")
            .appendField("supply:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7B1FA2");
        this.setTooltip("Initializes a fungible token with specific properties");
    }
};

Blockly.Blocks['token_mint'] = {
    init: function() {
        this.appendValueInput("TO")
            .appendField("🪙 Mint tokens for");
        this.appendValueInput("AMOUNT")
            .appendField("amount:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7B1FA2");
        this.setTooltip("Creates new tokens and assigns them to an address");
    }
};

Blockly.Blocks['token_burn'] = {
    init: function() {
        this.appendValueInput("FROM")
            .appendField("🔥 Burn tokens from");
        this.appendValueInput("AMOUNT")
            .appendField("amount:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7B1FA2");
        this.setTooltip("Destroys tokens by removing them from circulation");
    }
};

Blockly.Blocks['token_transfer'] = {
    init: function() {
        this.appendValueInput("FROM")
            .appendField("💸 Transfer from");
        this.appendValueInput("TO")
            .appendField("to");
        this.appendValueInput("AMOUNT")
            .appendField("amount:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7B1FA2");
        this.setTooltip("Transfers tokens between accounts");
    }
};

Blockly.Blocks['token_balance'] = {
    init: function() {
        this.appendValueInput("ACCOUNT")
            .appendField("📊 Token balance for");
        this.setOutput(true, "Number");
        this.setColour("#7B1FA2");
        this.setTooltip("Gets the token balance of an account");
    }
};

Blockly.Blocks['token_allowance'] = {
    init: function() {
        this.appendValueInput("OWNER")
            .appendField("✅ Allow");
        this.appendValueInput("SPENDER")
            .appendField("to spend up to");
        this.appendValueInput("AMOUNT")
            .appendField("amount:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7B1FA2");
        this.setTooltip("Authorizes an address to spend tokens on behalf of the owner");
    }
};

// ============================================================================
// CATEGORY 9: 🏢 RWA (Real World Assets)
// ============================================================================

Blockly.Blocks['rwa_asset'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🏢 Define RWA")
            .appendField("name:")
            .appendField(new Blockly.FieldTextInput("Real Estate Bond"), "NAME");
        this.appendDummyInput()
            .appendField("ISIN:")
            .appendField(new Blockly.FieldTextInput("US0378331005"), "ISIN");
        this.appendDummyInput()
            .appendField("issuer:")
            .appendField(new Blockly.FieldTextInput("Acme Corp"), "ISSUER");
        this.appendDummyInput()
            .appendField("initial price:")
            .appendField(new Blockly.FieldNumber(100.00, 0, 999999, 0.01), "PRICE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#C62828");
        this.setTooltip("Defines a real-world asset with properties. Name: asset name (e.g., 'Real Estate Bond'), ISIN: unique identifier (12 characters), Issuer: entity that issues (e.g., 'Acme Corp'), Price: initial value of the asset");
    }
};

Blockly.Blocks['rwa_custody'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🔒 Custodian")
            .appendField("address:")
            .appendField(new Blockly.FieldTextInput("GBBD47..."), "CUSTODIAN");
        this.appendDummyInput()
            .appendField("asset:")
            .appendField(new Blockly.FieldTextInput("Real Estate Bond"), "ASSET");
        this.appendDummyInput()
            .appendField("amount:")
            .appendField(new Blockly.FieldNumber(1000, 0, 999999999, 1), "AMOUNT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#C62828");
        this.setTooltip("Establishes a custodian to hold RWAs. Address: wallet that holds the asset, Asset: name of the asset (must match the defined one), Amount: amount of assets under custody");
    }
};

Blockly.Blocks['rwa_settlement'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("📋 Settlement - Seller:")
            .appendField(new Blockly.FieldTextInput("GBAE4..."), "SELLER");
        this.appendDummyInput()
            .appendField("Buyer:")
            .appendField(new Blockly.FieldTextInput("GBBD4..."), "BUYER");
        this.appendDummyInput()
            .appendField("Amount:")
            .appendField(new Blockly.FieldNumber(500, 0, 999999999, 1), "AMOUNT");
        this.appendDummyInput()
            .appendField("Price:")
            .appendField(new Blockly.FieldNumber(50000.00, 0, 999999999, 0.01), "PRICE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#C62828");
        this.setTooltip("Executes an RWA transaction settlement. Seller: selling address, Buyer: buying address, Amount: amount of assets to transfer, Price: total price of the transaction");
    }
};

Blockly.Blocks['rwa_compliance'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("⚖️ Verify Compliance")
            .appendField("account:")
            .appendField(new Blockly.FieldTextInput("GBAE4..."), "ACCOUNT");
        this.appendDummyInput()
            .appendField("type:")
            .appendField(new Blockly.FieldDropdown([
                ["KYC", "KYC"],
                ["AML", "AML"],
                ["Jurisdiction", "JURISDICTION"],
                ["Accredited", "ACCREDITED"]
            ]), "COMPLIANCE_TYPE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#C62828");
        this.setTooltip("Verifies regulatory compliance requirements. Account: address to verify, Type: KYC (identity verification), AML (anti-money laundering), Jurisdiction (geographic restriction), Accredited (investment status)");
    }
};

Blockly.Blocks['rwa_redemption'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🔄 Redemption - From:")
            .appendField(new Blockly.FieldTextInput("GBAE4..."), "FROM");
        this.appendDummyInput()
            .appendField("Amount:")
            .appendField(new Blockly.FieldNumber(100, 0, 999999999, 1), "AMOUNT");
        this.appendDummyInput()
            .appendField("Reason:")
            .appendField(new Blockly.FieldTextInput("Investment settlement"), "REASON");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#C62828");
        this.setTooltip("Processes an RWA redemption. From: redeeming address, Amount: amount of assets to redeem, Reason: reason for redemption (e.g., 'Investment settlement')");
    }
};

// ============================================================================
// CATEGORY 10: 🔐 SECURITY (Control and protection)
// ============================================================================

Blockly.Blocks['require_condition'] = {
    init: function() {
        this.appendValueInput("CONDITION")
            .setCheck("Boolean")
            .appendField("🔍 Requires");
        this.appendValueInput("MESSAGE")
            .appendField("error message:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#D32F2F");
        this.setTooltip("Validates a condition - fails if it is false");
    }
};

Blockly.Blocks['access_control'] = {
    init: function() {
        this.appendValueInput("ADDRESS")
            .appendField("🔐 Access Control - Only");
        this.appendDummyInput()
            .appendField("role:")
            .appendField(new Blockly.FieldDropdown([
                ["Admin", "ADMIN"],
                ["Owner", "OWNER"],
                ["Minter", "MINTER"],
                ["Burner", "BURNER"],
                ["Custom", "CUSTOM"]
            ]), "ROLE");
        this.appendStatementInput("BODY")
            .appendField("allow");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#D32F2F");
        this.setTooltip("Restricts access to certain roles");
    }
};

Blockly.Blocks['role_based_check'] = {
    init: function() {
        this.appendValueInput("ADDRESS")
            .appendField("👤 Verify Role");
        this.appendDummyInput()
            .appendField("has role:")
            .appendField(new Blockly.FieldDropdown([
                ["Admin", "ADMIN"],
                ["Owner", "OWNER"],
                ["Minter", "MINTER"],
                ["Burner", "BURNER"]
            ]), "ROLE");
        this.setOutput(true, "Boolean");
        this.setColour("#D32F2F");
        this.setTooltip("Verifies if an address has a specific role");
    }
};

Blockly.Blocks['reentrancy_guard'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🛡️ Re-entrancy Guard");
        this.appendStatementInput("BODY")
            .appendField("execute");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#D32F2F");
        this.setTooltip("Protects against re-entrancy attacks");
    }
};

Blockly.Blocks['pause_functionality'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("⏸️")
            .appendField(new Blockly.FieldDropdown([["Pause", "PAUSE"], ["Resume", "UNPAUSE"]]), "ACTION")
            .appendField("contract");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#D32F2F");
        this.setTooltip("Pauses or resumes all contract operations");
    }
};

// ============================================================================
// LITERAL VALUES AND UTILITIES
// ============================================================================

Blockly.Blocks['number_literal'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(0), "VALUE");
        this.setOutput(true, "Number");
        this.setColour("#4CAF50");
        this.setTooltip("A number");
    }
};

Blockly.Blocks['string_literal'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('"')
            .appendField(new Blockly.FieldTextInput("text"), "VALUE")
            .appendField('"');
        this.setOutput(true, "String");
        this.setColour("#4CAF50");
        this.setTooltip("A string of text");
    }
};

Blockly.Blocks['boolean_literal'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["true", "TRUE"], ["false", "FALSE"]]), "VALUE");
        this.setOutput(true, "Boolean");
        this.setColour("#4CAF50");
        this.setTooltip("A boolean value (true or false)");
    }
};

// ============================================================================
// CATEGORY: 👋 HELLO WORLD (Simple greeting contract)
// ============================================================================

Blockly.Blocks['hello_world_function'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("👋 Hello World Function");
        this.appendDummyInput()
            .appendField("Message:")
            .appendField(new Blockly.FieldTextInput("Hello, Stellar!"), "MESSAGE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#43A047");
        this.setTooltip("Creates a function that returns a greeting message. Perfect for learning Soroban smart contracts!");
    }
};

// ============================================================================
// CATEGORY: 🔢 COUNTER (Increment function)
// ============================================================================

Blockly.Blocks['counter_function'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🔢 Counter Function");
        this.appendDummyInput()
            .appendField("Increment by:")
            .appendField(new Blockly.FieldNumber(1, 1, 100), "INCREMENT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7B1FA2");
        this.setTooltip("Creates an increment function that adds a value to the input number and returns the result.");
    }
};

console.log('✅ Professional blocks loaded successfully');
