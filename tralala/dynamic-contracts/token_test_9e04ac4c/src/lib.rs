#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, IntoVal, Val, panic_with_error, symbol_short};

// Import what we need from the token SDK.
use soroban_token_sdk::{TokenUtils, metadata::TokenMetadata};

// --- STORAGE KEYS ---
// Using symbols for keys is efficient.
const ADMIN_KEY: Val = symbol_short!("ADMIN").into_val();

// --- CUSTOM ERRORS ---
#[derive(Debug)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Paused = 3,
    TransferLimitExceeded = 4,
}

// --- HELPER FUNCTIONS ---
fn get_admin(env: &Env) -> Address {
    env.storage().instance().get(&ADMIN_KEY).unwrap_or_else(|| panic_with_error!(env, Error::NotInitialized))
}

fn check_admin(env: &Env) {
    get_admin(env).require_auth();
}



#[contract]
pub struct TokenContract;

#[contractimpl]
impl TokenContract {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&ADMIN_KEY) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        env.storage().instance().set(&ADMIN_KEY, &admin);
        


        // Mint the initial supply of tokens to the admin.
        let initial_supply: i128 = 1000;
        if initial_supply > 0 {
            let token_utils = TokenUtils::new(&env);
            // We need to multiply by 10 to the power of decimals to get the correct value.
            let formatted_supply = initial_supply * 10i128.pow(2);
            token_utils.mint(&admin, &formatted_supply);
        }
    }

    pub fn metadata(env: Env) -> TokenMetadata {
        TokenMetadata {
            name: String::from_slice(&env, "Test Token"),
            symbol: String::from_slice(&env, "TEST"),
            decimals: 2,
        }
    }

    // --- ADMIN FUNCTIONS ---
    pub fn mint(env: Env, to: Address, amount: i128) {
        check_admin(&env);
        
        TokenUtils::new(&env).mint(&to, &amount);
    }


    // --- TOKEN FUNCTIONS ---
    pub fn burn(env: Env, from: Address, amount: i128) {
        
        from.require_auth();
        TokenUtils::new(&env).burn(&from, &amount);
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        
        from.require_auth();


        TokenUtils::new(&env).transfer(&from, &to, &amount)
    }

    // Other standard token functions
    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        TokenUtils::new(&env).allowance(&from, &spender)
    }

    pub fn approve(env: Env, from: Address, spender: Address, amount: i128, expiration_ledger: u32) {
        TokenUtils::new(&env).approve(&from, &spender, &amount, expiration_ledger)
    }

    pub fn balance(env: Env, id: Address) -> i128 {
        TokenUtils::new(&env).balance(&id)
    }

    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        
        spender.require_auth();


        TokenUtils::new(&env).transfer_from(&spender, &from, &to, &amount)
    }
}