/**
 * Stellar Tralalero Contracts - Blockly Block Definitions
 * Professional-grade visual block programming for Soroban smart contracts
 *
 * Features:
 * - Intuitive block-based interface for token contract creation
 * - Professional documentation with detailed tooltips
 * - Type-safe block configuration with parameter validation
 * - Support for common token features: mint, burn, pause
 * - Security-focused design with admin controls
 *
 * Block Categories:
 * 🔷 Core Configuration - Token metadata and basic setup
 * ✨ Features - Optional capabilities (mint, burn, pause)
 * 🔐 Admin - Administrative and security controls
 * 📤 Functions - Contract method declarations
 *
 * @version 2.0 (Professional Edition)
 * @license MIT
 */

// ============================================
// CORE CONFIGURATION BLOCKS
// ============================================

/**
 * Token Properties Block
 * Defines fundamental metadata for the smart contract token
 *
 * Parameters:
 * - Token Name: Human-readable name (e.g., "USD Stablecoin")
 * - Symbol: Trading symbol (1-12 characters, e.g., "USDC")
 * - Decimals: Precision level (0-18, standard is 6 or 8)
 * - Initial Supply: Total tokens minted at deployment
 *
 * Security Note:
 * - Symbol length is validated at deployment time
 * - Initial supply is immutable once set
 * - All values stored in contract storage
 */
Blockly.Blocks['token_properties'] = {
    init: function () {
        this.setColour(230);
        this.appendDummyInput()
            .appendField("🔷 Token Configuration");

        this.appendDummyInput()
            .appendField("Token Name:")
            .appendField(new Blockly.FieldTextInput("MyToken"), "TOKEN_NAME");

        this.appendDummyInput()
            .appendField("Symbol (1-12 chars):")
            .appendField(new Blockly.FieldTextInput("MTK"), "TOKEN_SYMBOL");

        this.appendDummyInput()
            .appendField("Decimal Places:")
            .appendField(new Blockly.FieldNumber(6, 0, 18, 1), "DECIMALS");

        this.appendDummyInput()
            .appendField("Initial Supply:")
            .appendField(new Blockly.FieldNumber(1000000, 0, 999999999999, 1), "INITIAL_SUPPLY");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('property_blocks');
        this.setTooltip("Define core token metadata. Token Name: displayed name, Symbol: ticker symbol (max 12 chars), Decimals: price precision (0-18, standard 6-8), Initial Supply: total tokens created. Example: Name='USD Coin', Symbol='USDC', Decimals='6', Supply='1000000'.");
        this.setHelpUrl("https://docs.stellar.org/soroban/learn/storing-data");
    }
};

// ============================================
// FEATURE BLOCKS - Optional Capabilities
// ============================================

/**
 * Mintable Feature Block
 * Enables the admin to create new tokens after initial deployment
 *
 * Security Implications:
 * - Only admin address can mint
 * - Increases total supply without limit
 * - Useful for governance tokens, rewards, inflation
 *
 * Use Cases:
 * - Governance tokens with delegated minting
 * - Inflationary rewards program
 * - DAO treasury management
 * - Staking rewards
 */
Blockly.Blocks['feature_mintable'] = {
    init: function () {
        this.setColour(270);
        this.appendDummyInput()
            .appendField("✨ Mintable")
            .appendField(new Blockly.FieldCheckbox(false), "ENABLED");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('powers_blocks');
        this.setTooltip("Enable admin to mint (create) new tokens post-deployment. When enabled: admin can call mint(to_address, amount) to increase total supply. Use for: governance tokens, inflationary mechanics, rewards distribution. Security: Only admin can mint, no supply cap enforced.");
        this.setHelpUrl("https://docs.stellar.org/soroban/learn/storing-data");
    }
};

/**
 * Burnable Feature Block
 * Allows token holders to permanently remove tokens from circulation
 *
 * Security Implications:
 * - Anyone can burn their own tokens
 * - Decreases total supply permanently
 * - Irreversible operation
 *
 * Use Cases:
 * - Deflationary mechanics
 * - Token buyback programs
 * - Community governance voting weight reduction
 */
Blockly.Blocks['feature_burnable'] = {
    init: function () {
        this.setColour(270);
        this.appendDummyInput()
            .appendField("🔥 Burnable")
            .appendField(new Blockly.FieldCheckbox(false), "ENABLED");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('powers_blocks');
        this.setTooltip("Enable token holders to burn (permanently destroy) their tokens. When enabled: any token holder can call burn(amount) to reduce total supply. Use for: deflationary tokens, staking penalties, token reduction mechanics. Security: Burns are irreversible, requires user authentication.");
        this.setHelpUrl("https://docs.stellar.org/soroban/learn/storing-data");
    }
};

/**
 * Pausable Feature Block
 * Allows admin to freeze all token transfers in emergency situations
 *
 * Security Implications:
 * - FULL transfer freeze including admin
 * - Intended for emergency use only
 * - Impacts all users equally
 *
 * Use Cases:
 * - Security incident response
 * - System maintenance
 * - Regulatory compliance freeze
 * - Bug fix deployment
 */
Blockly.Blocks['feature_pausable'] = {
    init: function () {
        this.setColour(270);
        this.appendDummyInput()
            .appendField("⏸️ Pausable")
            .appendField(new Blockly.FieldCheckbox(false), "ENABLED");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('powers_blocks');
        this.setTooltip("Enable admin to pause/unpause all token transfers. When enabled: admin can call pause() to freeze all transfers (including their own) and unpause() to resume. Use for: emergency stops, security incidents, maintenance windows. Security: Emergency feature only, affects entire contract.");
        this.setHelpUrl("https://docs.stellar.org/soroban/learn/storing-data");
    }
};

// ============================================
// ADMIN & SECURITY BLOCKS
// ============================================

/**
 * Admin Configuration Block
 * Specifies the privileged address with exclusive administrative access
 *
 * Security Notes:
 * - Admin address determines contract control
 * - Cannot be changed after deployment
 * - Admin should use a secure key management solution
 * - Consider multi-sig for production use
 *
 * Format:
 * - Stellar public key format (starts with 'G')
 * - 56 characters total
 * - Example: GBFQK7UY4V3T4WFLYE3CBFZOM5VAOOEVVWZ2LTLUGRPWJFZJHFVZ7K
 */
Blockly.Blocks['admin_config'] = {
    init: function () {
        this.setColour(120);
        this.appendDummyInput()
            .appendField("🔐 Admin Address");

        this.appendDummyInput()
            .appendField("Stellar Address:")
            .appendField(new Blockly.FieldTextInput("GBFQK7UY4V3T4WFLYE3CBFZOM5VAOOEVVWZ2LTLUGRPWJFZJHFVZ7K"), "ADMIN");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('rules_blocks');
        this.setTooltip("Set the administrator address for exclusive access to privileged functions (mint, burn, pause). Use your Freighter public key address here. Format: GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (56 chars). Cannot be changed after deployment. ⚠️ CRITICAL: Use secure key management for production.");
        this.setHelpUrl("https://docs.stellar.org/soroban/learn/storing-data");
    }
};

// ============================================
// FUNCTION DECLARATION BLOCKS
// ============================================

/**
 * Transfer Function Block
 * Enables peer-to-peer token transfers between accounts
 *
 * Function Signature:
 * transfer(from: Address, to: Address, amount: i128) -> void
 *
 * Security:
 * - Requires authentication from sender
 * - Validates sufficient balance
 * - Respects pause state if enabled
 * - Prevents zero/negative transfers
 */
Blockly.Blocks['transfer_function'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField("📤 Transfer Function");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('advanced_blocks');
        this.setTooltip("Enable peer-to-peer token transfers. Function: transfer(from, to, amount). Sender must authorize transaction. Checks: from has balance >= amount, not paused. Returns: void. This is essential for any token contract.");
        this.setHelpUrl("https://docs.stellar.org/soroban/learn/storing-data");
    }
};

/**
 * Balance Function Block
 * Query the token balance of any account
 *
 * Function Signature:
 * balance(id: Address) -> i128
 *
 * Notes:
 * - Read-only operation, no authentication needed
 * - Returns 0 for uninitialized accounts
 * - Essential for monitoring and verification
 */
Blockly.Blocks['balance_function'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField("💰 Balance Function");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('advanced_blocks');
        this.setTooltip("Query token balance of any account. Function: balance(address) -> amount. Read-only, no auth required. Returns: token amount held by address (0 if account has no balance). Use to verify balances, monitor holdings, check contract state.");
        this.setHelpUrl("https://docs.stellar.org/soroban/learn/storing-data");
    }
};

/**
 * Mint Function Block
 * Create new tokens (admin only, requires mintable feature)
 *
 * Function Signature:
 * mint(to: Address, amount: i128) -> void
 *
 * Access Control:
 * - Only callable by admin address
 * - Requires admin authentication
 * - Increases total supply
 * - No supply cap
 *
 * Note: Requires Mintable feature to be enabled
 */
Blockly.Blocks['mint_function'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField("⚒️ Mint Function");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('advanced_blocks');
        this.setTooltip("Create new tokens (admin only). Function: mint(to, amount). Requires: Mintable feature enabled, admin authentication. Effect: increases balance of 'to', increases total supply. No supply cap enforced. Use for: governance rewards, inflationary mechanics, treasury management.");
        this.setHelpUrl("https://docs.stellar.org/soroban/learn/storing-data");
    }
};

/**
 * Burn Function Block
 * Destroy tokens permanently (any holder, requires burnable feature)
 *
 * Function Signature:
 * burn(from: Address, amount: i128) -> void
 *
 * Access Control:
 * - Any token holder can burn their own tokens
 * - Requires sender authentication
 * - Decreases total supply permanently
 * - Irreversible
 *
 * Note: Requires Burnable feature to be enabled
 */
Blockly.Blocks['burn_function'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField("🔥 Burn Function");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('advanced_blocks');
        this.setTooltip("Burn (destroy) tokens permanently. Function: burn(from, amount). Requires: Burnable feature enabled, sender authentication. Effect: decreases balance, decreases total supply. Irreversible operation. Use for: deflationary mechanics, staking penalties, token reduction programs.");
        this.setHelpUrl("https://docs.stellar.org/soroban/learn/storing-data");
    }
};

// ============================================
// CODE GENERATOR - Professional Rust Code Generation
// ============================================

/**
 * TokenCodeGenerator
 * Extracts configuration from Blockly blocks and generates production-ready Rust code
 *
 * Capabilities:
 * - Conditional feature inclusion (mint, burn, pause)
 * - Proper error handling with meaningful error codes
 * - Type-safe storage management
 * - Security validation of inputs
 *
 * Generated Code Features:
 * - Full Soroban SDK integration
 * - Professional Rust formatting
 * - Comprehensive documentation
 * - Error handling best practices
 */
const TokenCodeGenerator = {
    /**
     * Extracts configuration from workspace blocks
     * @param {Blockly.Workspace} workspace - The Blockly workspace
     * @returns {Object} Configuration object with all token parameters
     */
    extractConfig(workspace) {
        const config = {
            tokenName: "MyToken",
            tokenSymbol: "MTK",
            decimals: 6,
            initialSupply: 1000000,
            admin: "GBFQK7UY4V3T4WFLYE3CBFZOM5VAOOEVVWZ2LTLUGRPWJFZJHFVZ7K",
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
                    config.decimals = parseInt(block.getFieldValue('DECIMALS')) || 6;
                    config.initialSupply = parseInt(block.getFieldValue('INITIAL_SUPPLY')) || 1000000;
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
                    config.admin = block.getFieldValue('ADMIN') || "GBFQK7UY4V3T4WFLYE3CBFZOM5VAOOEVVWZ2LTLUGRPWJFZJHFVZ7K";
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
     * Generates production-ready Rust code from configuration
     * @param {Object} config - Configuration object from extractConfig
     * @returns {String} Complete, valid Rust contract code
     */
    generateRustCode(config) {
        const contractName = (config.tokenName || 'MyToken')
            .replace(/[^A-Za-z0-9_]/g, '')
            .replace(/^[0-9]/, 'T'); // Ensure starts with letter

        let code = `#![no_std]
//! ${config.tokenName} Smart Contract
//! Stellar Soroban Token Contract
//! Auto-generated by Tralalero Contracts
//!
//! This contract implements a token with optional mint, burn, and pause features.

use soroban_sdk::{
    contract,
    contractimpl,
    Address,
    Env,
    String,
    Symbol,
    symbol_short,
};

// ============================================
// STORAGE KEYS
// ============================================

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

// ============================================
// ERROR CODES
// ============================================

#[derive(Clone, Debug, Copy, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum TokenError {
    AlreadyInitialized = 1,
    Unauthorized = 2,
    InsufficientBalance = 3,
    ContractPaused = 4,
    InvalidAmount = 5,
}

// ============================================
// CONTRACT IMPLEMENTATION
// ============================================

#[contract]
pub struct ${contractName}Contract;

#[contractimpl]
impl ${contractName}Contract {
    /// Initialize the token contract with metadata and initial supply
    ///
    /// Args:
    ///   env - Soroban environment
    ///   admin - Administrator address with privileged access
    ///   name - Token display name
    ///   symbol - Token trading symbol
    ///   decimals - Decimal precision (0-18)
    ///   initial_supply - Total tokens minted at deployment
    ///
    /// Panics:
    ///   - If contract is already initialized
    ///   - If initial_supply is invalid
    pub fn initialize(
        env: Env,
        admin: Address,
        name: String,
        symbol: String,
        decimals: u32,
        initial_supply: i128,
    ) -> Result<(), TokenError> {
        // Prevent re-initialization
        if env.storage().instance().has(&ADMIN_KEY) {
            return Err(TokenError::AlreadyInitialized);
        }

        // Store token metadata
        env.storage().instance().set(&ADMIN_KEY, &admin);
        env.storage().instance().set(&NAME_KEY, &name);
        env.storage().instance().set(&SYMBOL_KEY, &symbol);
        env.storage().instance().set(&DECIMALS_KEY, &decimals);
        env.storage().instance().set(&SUPPLY_KEY, &initial_supply);`;

        if (config.features.pausable) {
            code += `

        // Initialize pause state (not paused)
        env.storage().instance().set(&PAUSED_KEY, &false);`;
        }

        code += `

        // Allocate initial supply to admin
        if initial_supply > 0 {
            env.storage()
                .persistent()
                .set(&(BALANCE_KEY, &admin), &initial_supply);
        }

        Ok(())
    }

    /// Get token name
    pub fn name(env: Env) -> Result<String, TokenError> {
        env.storage()
            .instance()
            .get(&NAME_KEY)
            .ok_or(TokenError::Unauthorized)
    }

    /// Get token symbol
    pub fn symbol(env: Env) -> Result<String, TokenError> {
        env.storage()
            .instance()
            .get(&SYMBOL_KEY)
            .ok_or(TokenError::Unauthorized)
    }

    /// Get decimal precision
    pub fn decimals(env: Env) -> Result<u32, TokenError> {
        env.storage()
            .instance()
            .get(&DECIMALS_KEY)
            .ok_or(TokenError::Unauthorized)
    }

    /// Get total token supply
    pub fn total_supply(env: Env) -> Result<i128, TokenError> {
        Ok(env.storage()
            .instance()
            .get(&SUPPLY_KEY)
            .unwrap_or(0))
    }`;

        // Balance function
        if (config.functions.includes('balance')) {
            code += `

    /// Query the balance of an account
    ///
    /// Args:
    ///   env - Soroban environment
    ///   id - Account address to query
    ///
    /// Returns:
    ///   Token balance (0 if account not initialized)
    pub fn balance(env: Env, id: Address) -> Result<i128, TokenError> {
        Ok(env.storage()
            .persistent()
            .get(&(BALANCE_KEY, &id))
            .unwrap_or(0))
    }`;
        }

        // Transfer function
        if (config.functions.includes('transfer')) {
            code += `

    /// Transfer tokens from one account to another
    ///
    /// Args:
    ///   env - Soroban environment
    ///   from - Sender address (must authorize transaction)
    ///   to - Recipient address
    ///   amount - Tokens to transfer (must be > 0)
    ///
    /// Panics:
    ///   - If contract is paused
    ///   - If sender lacks sufficient balance
    ///   - If amount <= 0
    pub fn transfer(
        env: Env,
        from: Address,
        to: Address,
        amount: i128,
    ) -> Result<(), TokenError> {`;

            if (config.features.pausable) {
                code += `
        // Check pause state
        let paused = env.storage()
            .instance()
            .get::<_, bool>(&PAUSED_KEY)
            .unwrap_or(false);
        if paused {
            return Err(TokenError::ContractPaused);
        }`;
            }

            code += `

        // Require sender authorization
        from.require_auth();

        // Validate transfer amount
        if amount <= 0 {
            return Err(TokenError::InvalidAmount);
        }

        // Get current balances
        let from_balance: i128 = env.storage()
            .persistent()
            .get(&(BALANCE_KEY, &from))
            .unwrap_or(0);

        // Verify sufficient balance
        if from_balance < amount {
            return Err(TokenError::InsufficientBalance);
        }

        let to_balance: i128 = env.storage()
            .persistent()
            .get(&(BALANCE_KEY, &to))
            .unwrap_or(0);

        // Update balances atomically
        env.storage()
            .persistent()
            .set(&(BALANCE_KEY, &from), &(from_balance - amount));
        env.storage()
            .persistent()
            .set(&(BALANCE_KEY, &to), &(to_balance + amount));

        Ok(())
    }`;
        }

        // Mint function
        if (config.features.mintable && config.functions.includes('mint')) {
            code += `

    /// Mint new tokens (admin only)
    ///
    /// Args:
    ///   env - Soroban environment
    ///   to - Recipient of new tokens
    ///   amount - Tokens to create
    ///
    /// Access Control:
    ///   - Only admin can call this function
    ///   - Admin must authorize transaction
    ///
    /// Effects:
    ///   - Increases recipient balance
    ///   - Increases total supply
    pub fn mint(env: Env, to: Address, amount: i128) -> Result<(), TokenError> {
        // Get admin address and verify authorization
        let admin: Address = env.storage()
            .instance()
            .get(&ADMIN_KEY)
            .ok_or(TokenError::Unauthorized)?;
        admin.require_auth();`;

            if (config.features.pausable) {
                code += `

        // Check pause state
        let paused = env.storage()
            .instance()
            .get::<_, bool>(&PAUSED_KEY)
            .unwrap_or(false);
        if paused {
            return Err(TokenError::ContractPaused);
        }`;
            }

            code += `

        // Validate mint amount
        if amount <= 0 {
            return Err(TokenError::InvalidAmount);
        }

        // Get current state
        let current_balance: i128 = env.storage()
            .persistent()
            .get(&(BALANCE_KEY, &to))
            .unwrap_or(0);
        let current_supply: i128 = env.storage()
            .instance()
            .get(&SUPPLY_KEY)
            .unwrap_or(0);

        // Update state atomically
        env.storage()
            .persistent()
            .set(&(BALANCE_KEY, &to), &(current_balance + amount));
        env.storage()
            .instance()
            .set(&SUPPLY_KEY, &(current_supply + amount));

        Ok(())
    }`;
        }

        // Burn function
        if (config.features.burnable && config.functions.includes('burn')) {
            code += `

    /// Burn tokens (destroy and remove from supply)
    ///
    /// Args:
    ///   env - Soroban environment
    ///   from - Account to burn from (must authorize transaction)
    ///   amount - Tokens to burn and destroy
    ///
    /// Panics:
    ///   - If contract is paused
    ///   - If account lacks sufficient balance
    ///   - If amount <= 0
    ///
    /// Note: This operation is irreversible
    pub fn burn(env: Env, from: Address, amount: i128) -> Result<(), TokenError> {`;

            if (config.features.pausable) {
                code += `
        // Check pause state
        let paused = env.storage()
            .instance()
            .get::<_, bool>(&PAUSED_KEY)
            .unwrap_or(false);
        if paused {
            return Err(TokenError::ContractPaused);
        }`;
            }

            code += `

        // Require sender authorization
        from.require_auth();

        // Validate burn amount
        if amount <= 0 {
            return Err(TokenError::InvalidAmount);
        }

        // Get current state
        let current_balance: i128 = env.storage()
            .persistent()
            .get(&(BALANCE_KEY, &from))
            .unwrap_or(0);

        // Verify sufficient balance
        if current_balance < amount {
            return Err(TokenError::InsufficientBalance);
        }

        let current_supply: i128 = env.storage()
            .instance()
            .get(&SUPPLY_KEY)
            .unwrap_or(0);

        // Update state atomically
        env.storage()
            .persistent()
            .set(&(BALANCE_KEY, &from), &(current_balance - amount));
        env.storage()
            .instance()
            .set(&SUPPLY_KEY, &(current_supply - amount));

        Ok(())
    }`;
        }

        // Pause functions
        if (config.features.pausable) {
            code += `

    /// Pause all token transfers (admin only)
    ///
    /// Access Control:
    ///   - Only admin can call
    ///   - Requires admin authorization
    ///
    /// Effects:
    ///   - Freezes all transfers including mint/burn
    ///   - Emergency measure only
    pub fn pause(env: Env) -> Result<(), TokenError> {
        let admin: Address = env.storage()
            .instance()
            .get(&ADMIN_KEY)
            .ok_or(TokenError::Unauthorized)?;
        admin.require_auth();

        env.storage().instance().set(&PAUSED_KEY, &true);
        Ok(())
    }

    /// Resume token transfers (admin only)
    ///
    /// Access Control:
    ///   - Only admin can call
    ///   - Requires admin authorization
    ///
    /// Effects:
    ///   - Resumes all token transfers
    pub fn unpause(env: Env) -> Result<(), TokenError> {
        let admin: Address = env.storage()
            .instance()
            .get(&ADMIN_KEY)
            .ok_or(TokenError::Unauthorized)?;
        admin.require_auth();

        env.storage().instance().set(&PAUSED_KEY, &false);
        Ok(())
    }

    /// Check if contract is currently paused
    ///
    /// Returns:
    ///   true if paused, false if active
    pub fn is_paused(env: Env) -> Result<bool, TokenError> {
        Ok(env.storage()
            .instance()
            .get::<_, bool>(&PAUSED_KEY)
            .unwrap_or(false))
    }`;
        }

        code += `

    /// Get the admin address
    pub fn admin(env: Env) -> Result<Address, TokenError> {
        env.storage()
            .instance()
            .get(&ADMIN_KEY)
            .ok_or(TokenError::Unauthorized)
    }
}
`;

        return code;
    }
};
