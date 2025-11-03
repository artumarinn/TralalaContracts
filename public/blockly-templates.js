/**
 * Blockly Block Templates for Tralalero Contracts
 * Define bloques mejorados que generan código Rust completo y válido
 */

// ============================================
// BLOCK DEFINITIONS - Bloques mejorados
// ============================================

Blockly.Blocks['token_properties'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🪙 Token Properties")
            .appendField("nombre:")
            .appendField(new Blockly.FieldTextInput("MyToken"), "TOKEN_NAME")
            .appendField("símbolo:")
            .appendField(new Blockly.FieldTextInput("MTK"), "TOKEN_SYMBOL");
        this.appendDummyInput()
            .appendField("decimales:")
            .appendField(new Blockly.FieldNumber(6, 0, 18), "DECIMALS")
            .appendField("supply inicial:")
            .appendField(new Blockly.FieldNumber(1000000, 0), "INITIAL_SUPPLY");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('property_blocks');
        this.setTooltip("Define las propiedades del token");
    }
};

Blockly.Blocks['feature_mintable'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("✨ Mintable")
            .appendField(new Blockly.FieldCheckbox(false), "ENABLED");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('powers_blocks');
        this.setTooltip("Permite crear nuevos tokens");
    }
};

Blockly.Blocks['feature_burnable'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🔥 Burnable")
            .appendField(new Blockly.FieldCheckbox(false), "ENABLED");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('powers_blocks');
        this.setTooltip("Permite quemar tokens");
    }
};

Blockly.Blocks['feature_pausable'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("⏸️ Pausable")
            .appendField(new Blockly.FieldCheckbox(false), "ENABLED");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('powers_blocks');
        this.setTooltip("Permite pausar transferencias");
    }
};

Blockly.Blocks['admin_config'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🔐 Admin Address")
            .appendField(new Blockly.FieldTextInput("GBQQHZKDUU..."), "ADMIN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('rules_blocks');
        this.setTooltip("Dirección del administrador del contrato");
    }
};

Blockly.Blocks['transfer_function'] = {
    init: function () {
        this.appendDummyInput().appendField("⚙️ transfer function");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('advanced_blocks');
        this.setTooltip("Implementa la función transfer");
    }
};

Blockly.Blocks['balance_function'] = {
    init: function () {
        this.appendDummyInput().appendField("⚙️ balance function");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('advanced_blocks');
        this.setTooltip("Implementa la función balance");
    }
};

Blockly.Blocks['mint_function'] = {
    init: function () {
        this.appendDummyInput().appendField("⚙️ mint function");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('advanced_blocks');
        this.setTooltip("Implementa la función mint");
    }
};

Blockly.Blocks['burn_function'] = {
    init: function () {
        this.appendDummyInput().appendField("⚙️ burn function");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('advanced_blocks');
        this.setTooltip("Implementa la función burn");
    }
};

// ============================================
// CODE GENERATOR - Generador de código mejorado
// ============================================

const TokenCodeGenerator = {
    /**
     * Extrae la configuración desde los bloques
     */
    extractConfig(workspace) {
        const config = {
            tokenName: "MyToken",
            tokenSymbol: "MTK",
            decimals: 6,
            initialSupply: 1000000,
            admin: "GBQQHZKDUU...",
            features: {
                mintable: false,
                burnable: false,
                pausable: false
            },
            functions: []
        };

        const blocks = workspace.getAllBlocks(false);
        blocks.forEach(block => {
            switch (block.type) {
                case 'token_properties':
                    config.tokenName = block.getFieldValue('TOKEN_NAME') || "MyToken";
                    config.tokenSymbol = block.getFieldValue('TOKEN_SYMBOL') || "MTK";
                    config.decimals = block.getFieldValue('DECIMALS') || 6;
                    config.initialSupply = block.getFieldValue('INITIAL_SUPPLY') || 1000000;
                    break;
                case 'feature_mintable':
                    config.features.mintable = block.getFieldValue('ENABLED') === 'TRUE';
                    break;
                case 'feature_burnable':
                    config.features.burnable = block.getFieldValue('ENABLED') === 'TRUE';
                    break;
                case 'feature_pausable':
                    config.features.pausable = block.getFieldValue('ENABLED') === 'TRUE';
                    break;
                case 'admin_config':
                    config.admin = block.getFieldValue('ADMIN') || "GBQQHZKDUU...";
                    break;
                case 'transfer_function':
                    if (!config.functions.includes('transfer')) config.functions.push('transfer');
                    break;
                case 'balance_function':
                    if (!config.functions.includes('balance')) config.functions.push('balance');
                    break;
                case 'mint_function':
                    if (!config.functions.includes('mint')) config.functions.push('mint');
                    break;
                case 'burn_function':
                    if (!config.functions.includes('burn')) config.functions.push('burn');
                    break;
            }
        });

        return config;
    },

    /**
     * Genera código Rust completo y válido
     */
    generateRustCode(config) {
        const contractName = (config.tokenName || 'MyToken').replace(/[^A-Za-z0-9_]/g, '');

        let code = `#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol, symbol_short};

// Storage keys
const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
const NAME_KEY: Symbol = symbol_short!("NAME");
const SYMBOL_KEY: Symbol = symbol_short!("SYMBOL");
const DECIMALS_KEY: Symbol = symbol_short!("DECIMALS");
const SUPPLY_KEY: Symbol = symbol_short!("SUPPLY");
const BALANCE_KEY: Symbol = symbol_short!("BALANCE");`;

        if (config.features.pausable) {
            code += `
const PAUSED_KEY: Symbol = symbol_short!("PAUSED");`;
        }

        code += `

#[contract]
pub struct ${contractName}Contract;

#[contractimpl]
impl ${contractName}Contract {
    /// Initialize the token contract
    pub fn initialize(
        env: Env,
        admin: Address,
        name: String,
        symbol: String,
        decimals: u32,
        initial_supply: i128
    ) {
        // Check if already initialized
        if env.storage().instance().has(&ADMIN_KEY) {
            panic!();
        }

        // Store metadata
        env.storage().instance().set(&ADMIN_KEY, &admin);
        env.storage().instance().set(&NAME_KEY, &name);
        env.storage().instance().set(&SYMBOL_KEY, &symbol);
        env.storage().instance().set(&DECIMALS_KEY, &decimals);
        env.storage().instance().set(&SUPPLY_KEY, &initial_supply);`;

        if (config.features.pausable) {
            code += `
        env.storage().instance().set(&PAUSED_KEY, &false);`;
        }

        code += `

        // Mint initial supply to admin
        if initial_supply > 0 {
            env.storage().persistent().set(&(BALANCE_KEY, &admin), &initial_supply);
        }
    }

    /// Get token name
    pub fn name(env: Env) -> String {
        env.storage()
            .instance()
            .get(&NAME_KEY)
            .unwrap_or_else(|| String::from_str(&env, "${config.tokenName}"))
    }

    /// Get token symbol
    pub fn symbol(env: Env) -> String {
        env.storage()
            .instance()
            .get(&SYMBOL_KEY)
            .unwrap_or_else(|| String::from_str(&env, "${config.tokenSymbol}"))
    }

    /// Get token decimals
    pub fn decimals(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DECIMALS_KEY)
            .unwrap_or(${config.decimals})
    }

    /// Get total supply
    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&SUPPLY_KEY)
            .unwrap_or(0)
    }`;

        // Balance function
        if (config.functions.includes('balance')) {
            code += `

    /// Get balance of an account
    pub fn balance(env: Env, id: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&(BALANCE_KEY, id))
            .unwrap_or(0)
    }`;
        }

        // Transfer function
        if (config.functions.includes('transfer')) {
            code += `

    /// Transfer tokens
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {`;
            if (config.features.pausable) {
                code += `
        // Check if paused
        let paused: bool = env.storage().instance().get(&PAUSED_KEY).unwrap_or(false);
        if paused {
            panic!();
        }`;
            }
            code += `

        from.require_auth();

        if amount <= 0 {
            return;
        }

        // Get current balances
        let from_balance: i128 = env.storage()
            .persistent()
            .get(&(BALANCE_KEY, &from))
            .unwrap_or(0);

        if from_balance < amount {
            panic!();
        }

        let to_balance: i128 = env.storage()
            .persistent()
            .get(&(BALANCE_KEY, &to))
            .unwrap_or(0);

        // Update balances
        env.storage()
            .persistent()
            .set(&(BALANCE_KEY, &from), &(from_balance - amount));
        env.storage()
            .persistent()
            .set(&(BALANCE_KEY, &to), &(to_balance + amount));
    }`;
        }

        // Mint function
        if (config.features.mintable && config.functions.includes('mint')) {
            code += `

    /// Mint new tokens (admin only)
    pub fn mint(env: Env, to: Address, amount: i128) {
        // Check admin auth
        let admin: Address = env.storage().instance().get(&ADMIN_KEY).unwrap();
        admin.require_auth();`;
            if (config.features.pausable) {
                code += `

        // Check if paused
        let paused: bool = env.storage().instance().get(&PAUSED_KEY).unwrap_or(false);
        if paused {
            panic!();
        }`;
            }
            code += `

        if amount <= 0 {
            return;
        }

        // Get current balance and supply
        let current_balance: i128 = env.storage()
            .persistent()
            .get(&(BALANCE_KEY, &to))
            .unwrap_or(0);
        let current_supply: i128 = env.storage()
            .instance()
            .get(&SUPPLY_KEY)
            .unwrap_or(0);

        // Update balance and supply
        env.storage()
            .persistent()
            .set(&(BALANCE_KEY, &to), &(current_balance + amount));
        env.storage()
            .instance()
            .set(&SUPPLY_KEY, &(current_supply + amount));
    }`;
        }

        // Burn function
        if (config.features.burnable && config.functions.includes('burn')) {
            code += `

    /// Burn tokens
    pub fn burn(env: Env, from: Address, amount: i128) {`;
            if (config.features.pausable) {
                code += `
        // Check if paused
        let paused: bool = env.storage().instance().get(&PAUSED_KEY).unwrap_or(false);
        if paused {
            panic!();
        }`;
            }
            code += `

        from.require_auth();

        if amount <= 0 {
            return;
        }

        // Get current balance and supply
        let current_balance: i128 = env.storage()
            .persistent()
            .get(&(BALANCE_KEY, &from))
            .unwrap_or(0);

        if current_balance < amount {
            panic!();
        }

        let current_supply: i128 = env.storage()
            .instance()
            .get(&SUPPLY_KEY)
            .unwrap_or(0);

        // Update balance and supply
        env.storage()
            .persistent()
            .set(&(BALANCE_KEY, &from), &(current_balance - amount));
        env.storage()
            .instance()
            .set(&SUPPLY_KEY, &(current_supply - amount));
    }`;
        }

        // Pause functions
        if (config.features.pausable) {
            code += `

    /// Pause the contract (admin only)
    pub fn pause(env: Env) {
        let admin: Address = env.storage().instance().get(&ADMIN_KEY).unwrap();
        admin.require_auth();
        env.storage().instance().set(&PAUSED_KEY, &true);
    }

    /// Unpause the contract (admin only)
    pub fn unpause(env: Env) {
        let admin: Address = env.storage().instance().get(&ADMIN_KEY).unwrap();
        admin.require_auth();
        env.storage().instance().set(&PAUSED_KEY, &false);
    }

    /// Check if contract is paused
    pub fn is_paused(env: Env) -> bool {
        env.storage().instance().get(&PAUSED_KEY).unwrap_or(false)
    }`;
        }

        code += `

    /// Get admin address
    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&ADMIN_KEY).unwrap()
    }
}`;

        return code;
    }
};
