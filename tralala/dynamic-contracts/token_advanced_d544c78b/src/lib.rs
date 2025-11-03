#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol, symbol_short};

// Storage keys
const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
const NAME_KEY: Symbol = symbol_short!("NAME");
const SYMBOL_KEY: Symbol = symbol_short!("SYMBOL");
const DECIMALS_KEY: Symbol = symbol_short!("DECIMALS");
const SUPPLY_KEY: Symbol = symbol_short!("SUPPLY");
const BALANCE_KEY: Symbol = symbol_short!("BALANCE");

#[contract]
pub struct TokenContract;

#[contractimpl]
impl TokenContract {
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
        env.storage().instance().set(&SUPPLY_KEY, &initial_supply);
        

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
            .unwrap_or_else(|| String::from_str(&env, "MiContrato"))
    }

    /// Get token symbol
    pub fn symbol(env: Env) -> String {
        env.storage()
            .instance()
            .get(&SYMBOL_KEY)
            .unwrap_or_else(|| String::from_str(&env, "TOKEN"))
    }

    /// Get token decimals
    pub fn decimals(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DECIMALS_KEY)
            .unwrap_or(2)
    }

    /// Get total supply
    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&SUPPLY_KEY)
            .unwrap_or(0)
    }

    /// Get balance of an account
    pub fn balance(env: Env, id: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&(BALANCE_KEY, id))
            .unwrap_or(0)
    }

    /// Transfer tokens
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        
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
    }




    /// Get admin address
    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&ADMIN_KEY).unwrap()
    }
}
