#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, String};

const NAME: Symbol = symbol_short!("NAME");
const SYMBOL: Symbol = symbol_short!("SYMBOL");
const DECIMALS: Symbol = symbol_short!("DECIMALS");
const ADMIN: Symbol = symbol_short!("ADMIN");

#[contract]
pub struct TokenBasic;

#[contractimpl]
impl TokenBasic {
    pub fn initialize(env: Env, admin: Address, name: String, symbol: String, decimals: u32) {
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&NAME, &name);
        env.storage().instance().set(&SYMBOL, &symbol);
        env.storage().instance().set(&DECIMALS, &decimals);
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

    pub fn balance(env: Env, owner: Address) -> i128 {
        env.storage().persistent().get(&owner).unwrap_or(0)
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        let from_balance: i128 = env.storage().persistent().get(&from).unwrap_or(0);
        let to_balance: i128 = env.storage().persistent().get(&to).unwrap_or(0);

        if from_balance < amount {
            panic!("Insufficient balance");
        }

        env.storage().persistent().set(&from, &(from_balance - amount));
        env.storage().persistent().set(&to, &(to_balance + amount));
    }
}
