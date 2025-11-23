#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, String};

const NAME: Symbol = symbol_short!("NAME");
const SYMBOL: Symbol = symbol_short!("SYMBOL");
const DECIMALS: Symbol = symbol_short!("DECIMALS");
const ADMIN: Symbol = symbol_short!("ADMIN");
const SUPPLY: Symbol = symbol_short!("SUPPLY");
const PAUSED: Symbol = symbol_short!("PAUSED");

#[contract]
pub struct TokenAdvanced;

#[contractimpl]
impl TokenAdvanced {
    pub fn initialize(env: Env, admin: Address, name: String, symbol: String, decimals: u32, initial_supply: i128) {
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&NAME, &name);
        env.storage().instance().set(&SYMBOL, &symbol);
        env.storage().instance().set(&DECIMALS, &decimals);
        env.storage().instance().set(&SUPPLY, &initial_supply);
        env.storage().instance().set(&PAUSED, &false);
        env.storage().persistent().set(&admin, &initial_supply);
    }

    pub fn name(env: Env) -> String {
        env.storage().instance().get(&NAME).unwrap()
    }

    pub fn symbol(env: Env) -> String {
        env.storage().instance().get(&SYMBOL).unwrap()
    }

    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&DECIMALS).unwrap()
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage().instance().get(&SUPPLY).unwrap_or(0)
    }

    pub fn balance(env: Env, owner: Address) -> i128 {
        env.storage().persistent().get(&owner).unwrap_or(0)
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        Self::require_not_paused(&env);

        let from_balance: i128 = env.storage().persistent().get(&from).unwrap_or(0);
        let to_balance: i128 = env.storage().persistent().get(&to).unwrap_or(0);

        if from_balance < amount {
            panic!("Insufficient balance");
        }

        env.storage().persistent().set(&from, &(from_balance - amount));
        env.storage().persistent().set(&to, &(to_balance + amount));
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        admin.require_auth();
        Self::require_not_paused(&env);

        let balance: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        let supply: i128 = env.storage().instance().get(&SUPPLY).unwrap_or(0);

        env.storage().persistent().set(&to, &(balance + amount));
        env.storage().instance().set(&SUPPLY, &(supply + amount));
    }

    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();
        Self::require_not_paused(&env);

        let balance: i128 = env.storage().persistent().get(&from).unwrap_or(0);
        let supply: i128 = env.storage().instance().get(&SUPPLY).unwrap_or(0);

        if balance < amount {
            panic!("Insufficient balance to burn");
        }

        env.storage().persistent().set(&from, &(balance - amount));
        env.storage().instance().set(&SUPPLY, &(supply - amount));
    }

    pub fn pause(env: Env) {
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        admin.require_auth();
        env.storage().instance().set(&PAUSED, &true);
    }

    pub fn unpause(env: Env) {
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        admin.require_auth();
        env.storage().instance().set(&PAUSED, &false);
    }

    pub fn is_paused(env: Env) -> bool {
        env.storage().instance().get(&PAUSED).unwrap_or(false)
    }

    fn require_not_paused(env: &Env) {
        let paused: bool = env.storage().instance().get(&PAUSED).unwrap_or(false);
        if paused {
            panic!("Contract is paused");
        }
    }
}
