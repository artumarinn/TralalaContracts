#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol, symbol_short};

// --- STORAGE KEYS ---
const ADMIN_KEY: Symbol = symbol_short!("ADMIN");

// --- CUSTOM ERRORS ---
#[derive(Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
}

impl From<Error> for soroban_sdk::Error {
    fn from(error: Error) -> Self {
        soroban_sdk::Error::from_contract_error(error as u32)
    }
}

// --- HELPER FUNCTIONS ---
fn get_admin(env: &Env) -> Result<Address, Error> {
    env.storage()
        .instance()
        .get(&ADMIN_KEY)
        .ok_or(Error::NotInitialized)
}

fn check_admin(env: &Env) -> Result<(), Error> {
    let admin = get_admin(env)?;
    admin.require_auth();
    Ok(())
}


#[contract]
pub struct TokenContract;

#[contractimpl]
impl TokenContract {
    /// Initialize the token contract
    pub fn initialize(env: Env, admin: Address, name: String, symbol: String, decimals: u32, initial_supply: i128) -> Result<(), Error> {
        if env.storage().instance().has(&ADMIN_KEY) {
            return Err(Error::AlreadyInitialized);
        }
        
        env.storage().instance().set(&ADMIN_KEY, &admin);
        

        // Store token metadata
        env.storage().instance().set(&symbol_short!("NAME"), &name);
        env.storage().instance().set(&symbol_short!("SYMBOL"), &symbol);
        env.storage().instance().set(&symbol_short!("DECIMALS"), &decimals);

        // Mint initial supply to admin if specified
        if initial_supply > 0 {
            let balance_key = symbol_short!("BALANCE");
            env.storage().persistent().set(&(balance_key, &admin), &initial_supply);
            
            // Set total supply
            env.storage().instance().set(&symbol_short!("SUPPLY"), &initial_supply);
        }

        Ok(())
    }

    /// Get token name
    pub fn name(env: Env) -> String {
        env.storage()
            .instance()
            .get(&symbol_short!("NAME"))
            .unwrap_or_else(|| String::from_str(&env, "Test Token"))
    }

    /// Get token symbol
    pub fn symbol(env: Env) -> String {
        env.storage()
            .instance()
            .get(&symbol_short!("SYMBOL"))
            .unwrap_or_else(|| String::from_str(&env, "TEST"))
    }

    /// Get token decimals
    pub fn decimals(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&symbol_short!("DECIMALS"))
            .unwrap_or(2)
    }

    /// Get total supply
    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&symbol_short!("SUPPLY"))
            .unwrap_or(0)
    }

    /// Get balance of an account
    pub fn balance(env: Env, id: Address) -> i128 {
        let balance_key = symbol_short!("BALANCE");
        env.storage()
            .persistent()
            .get(&(balance_key, id))
            .unwrap_or(0)
    }

    /// Transfer tokens
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) -> Result<(), Error> {
        from.require_auth();

        if amount <= 0 {
            return Ok(());
        }

        let balance_key = symbol_short!("BALANCE");
        
        // Get current balances
        let from_balance: i128 = env.storage()
            .persistent()
            .get(&(balance_key, &from))
            .unwrap_or(0);
            
        if from_balance < amount {
            panic!(); // Insufficient balance
        }

        let to_balance: i128 = env.storage()
            .persistent()
            .get(&(balance_key, &to))
            .unwrap_or(0);

        // Update balances
        env.storage()
            .persistent()
            .set(&(balance_key, &from), &(from_balance - amount));
        env.storage()
            .persistent()
            .set(&(balance_key, &to), &(to_balance + amount));

        Ok(())
    }

    /// Mint new tokens (admin only)
    pub fn mint(env: Env, to: Address, amount: i128) -> Result<(), Error> {
        check_admin(&env)?;

        if amount <= 0 {
            return Ok(());
        }

        let balance_key = symbol_short!("BALANCE");
        let current_balance: i128 = env.storage()
            .persistent()
            .get(&(balance_key, &to))
            .unwrap_or(0);

        // Update balance
        env.storage()
            .persistent()
            .set(&(balance_key, &to), &(current_balance + amount));

        // Update total supply
        let current_supply = Self::total_supply(env.clone());
        env.storage()
            .instance()
            .set(&symbol_short!("SUPPLY"), &(current_supply + amount));

        Ok(())
    }

    /// Burn tokens
    pub fn burn(env: Env, from: Address, amount: i128) -> Result<(), Error> {
        from.require_auth();

        if amount <= 0 {
            return Ok(());
        }

        let balance_key = symbol_short!("BALANCE");
        let current_balance: i128 = env.storage()
            .persistent()
            .get(&(balance_key, &from))
            .unwrap_or(0);

        if current_balance < amount {
            panic!(); // Insufficient balance
        }

        // Update balance
        env.storage()
            .persistent()
            .set(&(balance_key, &from), &(current_balance - amount));

        // Update total supply
        let current_supply = Self::total_supply(env.clone());
        env.storage()
            .instance()
            .set(&symbol_short!("SUPPLY"), &(current_supply - amount));

        Ok(())
    }


    /// Get admin address
    pub fn admin(env: Env) -> Result<Address, Error> {
        get_admin(&env)
    }
}
