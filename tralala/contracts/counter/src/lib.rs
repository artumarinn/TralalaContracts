#![no_std]
use soroban_sdk::{contract, contractimpl, Env};

#[contract]
pub struct CounterContract;

/// A simple counter contract that increments a number by 1.
/// Perfect for learning Soroban smart contracts!
#[contractimpl]
impl CounterContract {
    /// Takes a number and returns the number plus 1.
    pub fn increment(_env: Env, value: u32) -> u32 {
        value + 1
    }
}
