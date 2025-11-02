# 🧪 Soroban Testing Patterns & Best Practices

**Comprehensive guide to testing Soroban smart contracts in Rust**

---

## Part 1: Testing Fundamentals

### Testing Pyramid for Soroban Contracts

```
                    ▲
                   /│\
                  / │ \
                 /  │  \  End-to-End (Testnet/Mainnet)
                /   │   \ - Live contract calls
               /────┼────\ - Real XLM spending
              /     │     \
             /      │      \
            /───────┼───────\ Integration Tests
           /        │        \ - Multi-contract calls
          /         │         \ - Storage interactions
         /          │          \
        /───────────┼───────────\ Unit Tests
       /            │            \ - Function logic
      /             │             \ - State changes
     /──────────────┼──────────────\ - Authorization
    /               │               \
```

### Testing Strategy (by Stage)

| Stage | When | Tools | Coverage | Cost |
|-------|------|-------|----------|------|
| **Unit** | During development | `#[test]` in contract | 80%+ | Free |
| **Integration** | Before testnet | `soroban-sdk` test utils | 90%+ | Free |
| **Testnet** | Pre-mainnet | Stellar SDK + CLI | 95%+ | ~1 XLM |
| **Mainnet** | Post-launch | Stellar SDK + CLI | N/A | Real $ |

---

## Part 2: Unit Testing Patterns

### 2.1 Basic Unit Test Structure

**Template**:
```rust
#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{Env, testutils::{Address, Ledger}};

    #[test]
    fn test_basic_operation() {
        // ARRANGE - Setup environment
        let env = Env::default();
        let contract_id = env.register_contract(None, Contract);

        // ACT - Execute the operation
        let result = contract.some_function(&env, arg1, arg2);

        // ASSERT - Verify results
        assert_eq!(result, expected_value);
    }
}
```

### 2.2 Environment Setup Patterns

**Pattern 1: Minimal Setup**
```rust
#[test]
fn test_minimal() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Contract);

    // Your test here
}
```

**Pattern 2: With Ledger Snapshot**
```rust
#[test]
fn test_with_ledger() {
    let env = Env::default();
    env.ledger().with_mut(|l| {
        l.sequence_number = 100;
        l.timestamp = 1_000_000;
    });

    let contract_id = env.register_contract(None, Contract);
    // Test with known ledger state
}
```

**Pattern 3: With Mock Addresses**
```rust
#[test]
fn test_with_addresses() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    let contract_id = env.register_contract(None, Contract);

    // Now use admin and user in tests
}
```

### 2.3 Testing Token Transfer Logic

**Vulnerable Code** (tests would catch this):
```rust
pub fn transfer(from: Address, to: Address, amount: i128) {
    from.require_auth();

    let from_balance = get_balance(&from);
    // ❌ BUG: No check for overflow!
    set_balance(&from, from_balance - amount);
    set_balance(&to, get_balance(&to) + amount);
}
```

**Comprehensive Test Suite**:
```rust
#[cfg(test)]
mod transfer_tests {
    use super::*;
    use soroban_sdk::{Env, testutils::Address};

    fn setup() -> (Env, Address, Address, Address) {
        let env = Env::default();
        let admin = Address::generate(&env);
        let alice = Address::generate(&env);
        let bob = Address::generate(&env);

        let contract_id = env.register_contract(None, Contract);
        env.register_contract_alias(contract_id.clone(), symbol_short!("TOK"));

        (env, admin, alice, bob)
    }

    #[test]
    fn test_transfer_success() {
        let (env, _admin, alice, bob) = setup();

        // Mint 1000 to alice
        set_balance(&env, &alice, 1000);

        // Alice transfers 100 to bob
        alice.require_auth();  // Simulate authorization
        transfer(&env, &alice, &bob, 100);

        // Verify balances
        assert_eq!(get_balance(&env, &alice), 900);
        assert_eq!(get_balance(&env, &bob), 100);
    }

    #[test]
    fn test_transfer_insufficient_balance() {
        let (env, _admin, alice, bob) = setup();

        set_balance(&env, &alice, 50);

        // Should fail - alice only has 50
        let result = transfer(&env, &alice, &bob, 100);

        assert!(result.is_err());
        assert_eq!(get_balance(&env, &alice), 50); // Unchanged
        assert_eq!(get_balance(&env, &bob), 0);     // Unchanged
    }

    #[test]
    fn test_transfer_zero_amount() {
        let (env, _admin, alice, bob) = setup();

        set_balance(&env, &alice, 100);

        // Zero transfers should be rejected
        let result = transfer(&env, &alice, &bob, 0);

        assert!(result.is_err());
    }

    #[test]
    fn test_transfer_negative_amount() {
        let (env, _admin, alice, bob) = setup();

        set_balance(&env, &alice, 100);

        // Negative transfers should be rejected
        let result = transfer(&env, &alice, &bob, -100);

        assert!(result.is_err());
    }

    #[test]
    fn test_transfer_to_same_address() {
        let (env, _admin, alice, _bob) = setup();

        set_balance(&env, &alice, 100);

        // Self-transfer - should it be allowed?
        let result = transfer(&env, &alice, &alice, 100);

        // Your policy: allow or deny?
        // If allow: assert_eq!(get_balance(&env, &alice), 100);
        // If deny: assert!(result.is_err());
    }

    #[test]
    fn test_transfer_large_amount() {
        let (env, _admin, alice, bob) = setup();

        let large_amount = i128::MAX - 1000;
        set_balance(&env, &alice, large_amount);

        // Transfer almost all
        transfer(&env, &alice, &bob, large_amount);

        assert_eq!(get_balance(&env, &alice), 0);
        assert_eq!(get_balance(&env, &bob), large_amount);
    }

    #[test]
    fn test_transfer_without_auth() {
        let (env, _admin, alice, bob) = setup();

        set_balance(&env, &alice, 100);

        // Try to transfer without authorization
        // Should panic or return error
        let result = std::panic::catch_unwind(|| {
            transfer(&env, &alice, &bob, 50);
        });

        assert!(result.is_err());
    }
}
```

### 2.4 Testing Authorization Patterns

**Bad Authorization** (test catches it):
```rust
pub fn withdraw(amount: i128) {
    // ❌ WRONG: No authorization check!
    let caller = get_caller();  // How do we know it's the right person?
    let balance = get_balance(&caller);
    set_balance(&caller, balance - amount);
}
```

**Good Authorization Test**:
```rust
#[test]
fn test_authorization_required() {
    let env = Env::default();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    set_balance(&env, &alice, 100);

    // Bob tries to withdraw from Alice's account
    // This should FAIL because bob is not authorized

    let result = alice_contract.withdraw(&env, &bob, 50);

    assert!(result.is_err(), "Unauthorized withdraw should fail");
    assert_eq!(get_balance(&env, &alice), 100, "Balance should be unchanged");
}

#[test]
fn test_authorization_succeeds_for_owner() {
    let env = Env::default();
    let alice = Address::generate(&env);

    set_balance(&env, &alice, 100);

    // Alice authorizes herself and withdraws
    // This requires mocking the authorization context

    env.mock_all_auths();  // Allow all auths for this test

    alice_contract.withdraw(&env, &alice, 50);

    assert_eq!(get_balance(&env, &alice), 50, "Balance should decrease");
}
```

### 2.5 Testing Mint/Burn Patterns

**Complete Mint/Burn Test Suite**:
```rust
#[cfg(test)]
mod mint_burn_tests {
    use super::*;
    use soroban_sdk::Env;

    #[test]
    fn test_mint_increases_balance() {
        let env = Env::default();
        let alice = Address::generate(&env);

        assert_eq!(get_balance(&env, &alice), 0);

        mint(&env, &alice, 100);

        assert_eq!(get_balance(&env, &alice), 100);
        assert_eq!(get_total_supply(&env), 100);
    }

    #[test]
    fn test_mint_only_admin() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let alice = Address::generate(&env);

        set_admin(&env, &admin);

        env.mock_all_auths();

        // Non-admin tries to mint
        let result = mint(&env, &alice, 100);

        assert!(result.is_err(), "Non-admin should not mint");
    }

    #[test]
    fn test_burn_decreases_balance() {
        let env = Env::default();
        let alice = Address::generate(&env);

        mint(&env, &alice, 100);
        assert_eq!(get_balance(&env, &alice), 100);

        env.mock_all_auths();
        burn(&env, &alice, 30);

        assert_eq!(get_balance(&env, &alice), 70);
        assert_eq!(get_total_supply(&env), 70);
    }

    #[test]
    fn test_burn_insufficient_balance() {
        let env = Env::default();
        let alice = Address::generate(&env);

        mint(&env, &alice, 50);

        env.mock_all_auths();

        let result = burn(&env, &alice, 100);

        assert!(result.is_err(), "Cannot burn more than owned");
        assert_eq!(get_balance(&env, &alice), 50);
    }

    #[test]
    fn test_total_supply_tracking() {
        let env = Env::default();
        let alice = Address::generate(&env);
        let bob = Address::generate(&env);

        mint(&env, &alice, 100);
        mint(&env, &bob, 200);

        assert_eq!(get_total_supply(&env), 300);

        env.mock_all_auths();
        burn(&env, &alice, 50);

        assert_eq!(get_total_supply(&env), 250);
    }
}
```

### 2.6 Testing Events

**Event Test Pattern**:
```rust
#[test]
fn test_transfer_emits_event() {
    let env = Env::default();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    set_balance(&env, &alice, 100);

    // Clear any previous events
    env.events().unwrap().clear();

    env.mock_all_auths();
    transfer(&env, &alice, &bob, 50);

    // Get published events
    let events = env.events().unwrap().all();

    assert_eq!(events.len(), 1, "Should emit one event");

    let event = &events[0];
    // Verify event contains correct data
    // (This depends on how you structure events)
}
```

---

## Part 3: Integration Testing Patterns

### 3.1 Multi-Contract Interaction

**Testing Token + Marketplace Contract**:
```rust
#[cfg(test)]
mod integration_tests {
    use super::*;
    use soroban_sdk::Env;

    #[test]
    fn test_token_marketplace_flow() {
        let env = Env::default();

        // Deploy token contract
        let token_id = env.register_contract(None, TokenContract);

        // Deploy marketplace contract
        let market_id = env.register_contract(None, MarketplaceContract);

        let alice = Address::generate(&env);
        let bob = Address::generate(&env);

        // Initialize token
        env.mock_all_auths();
        token_contract.init(&env, 1000);
        token_contract.mint(&env, &alice, 500);

        // Initialize marketplace
        market_contract.init(&env, &token_id);

        // Alice lists NFT for 100 tokens
        let nft_id = "nft_001";
        market_contract.list(&env, &alice, nft_id, 100);

        // Bob buys it
        market_contract.buy(&env, &bob, nft_id);

        // Verify:
        // - Alice received 100 tokens
        // - Bob received NFT
        // - Marketplace fee collected
        assert_eq!(token_contract.balance_of(&env, &alice), 600);
    }
}
```

### 3.2 State Persistence Testing

```rust
#[test]
fn test_state_persistence() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Contract);
    let alice = Address::generate(&env);

    // Initialize
    contract.init(&env);
    contract.set_value(&env, &alice, 42);

    // Read back
    let value = contract.get_value(&env, &alice);
    assert_eq!(value, 42);

    // Update and verify
    contract.set_value(&env, &alice, 100);
    assert_eq!(contract.get_value(&env, &alice), 100);
}
```

---

## Part 4: Testing Soroban-Specific Features

### 4.1 Testing Decimal Precision

```rust
#[cfg(test)]
mod decimal_tests {
    use super::*;

    const DECIMAL_PLACES: u32 = 7;
    const MULTIPLIER: i128 = 10_i128.pow(DECIMAL_PLACES);

    #[test]
    fn test_decimal_conversion() {
        // 1.5 tokens
        let human_amount = 15_i128 / 10;  // 1.5
        let units = human_to_units(human_amount);

        assert_eq!(units, 15_000_000);  // 1.5 * 10^7
    }

    #[test]
    fn test_decimal_precision_loss() {
        // Very small amount
        let units = 1;  // 0.0000001 tokens
        let human = units_to_human(units);

        assert_eq!(human, 0);  // Lost due to rounding

        // Test boundary
        let units = MULTIPLIER;  // Exactly 1.0
        let human = units_to_human(units);
        assert_eq!(human, 1);
    }

    #[test]
    fn test_decimal_math() {
        let amount1 = 10_000_000;  // 1.0
        let amount2 = 20_000_000;  // 2.0

        let sum = amount1 + amount2;
        assert_eq!(sum, 30_000_000);  // 3.0

        let product = (amount1 * amount2) / MULTIPLIER;
        assert_eq!(product, 20_000_000);  // 2.0
    }
}
```

### 4.2 Testing Storage Limits

```rust
#[test]
fn test_storage_limits() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Contract);

    // Try to create massive storage
    for i in 0..10000 {
        let key = format!("key_{}", i);
        contract.set_data(&env, &key, vec![0; 1000]);
    }

    // This might hit limits - test accordingly
}
```

### 4.3 Testing Authorization Context

```rust
#[test]
fn test_require_auth() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Contract);
    let alice = Address::generate(&env);

    // Mock alice's authorization
    alice.require_auth();  // This succeeds

    // Try unauthorized call
    let bob = Address::generate(&env);
    let result = std::panic::catch_unwind(|| {
        alice.require_auth();  // Wait, this is the same as above...
        // Actually testing require_auth is tricky in unit tests
    });
}
```

---

## Part 5: Test Configuration & Best Practices

### 5.1 Test Organization

**By Functionality**:
```rust
#[cfg(test)]
mod transfer_tests { /* tests */ }

#[cfg(test)]
mod authorization_tests { /* tests */ }

#[cfg(test)]
mod mint_tests { /* tests */ }

#[cfg(test)]
mod integration_tests { /* tests */ }
```

**By Concern**:
```rust
#[cfg(test)]
mod happy_path_tests { /* positive cases */ }

#[cfg(test)]
mod error_cases_tests { /* negative cases */ }

#[cfg(test)]
mod edge_case_tests { /* boundary conditions */ }
```

### 5.2 Useful Test Helpers

```rust
#[cfg(test)]
mod test_helpers {
    use super::*;
    use soroban_sdk::Env;

    pub fn setup_test_env() -> (Env, Address, Address) {
        let env = Env::default();
        let admin = Address::generate(&env);
        let user = Address::generate(&env);

        let contract_id = env.register_contract(None, Contract);
        contract.init(&env, &admin);

        (env, admin, user)
    }

    pub fn mint_to_all(
        env: &Env,
        contract: &Contract,
        addresses: &[Address],
        amount: i128,
    ) {
        for addr in addresses {
            contract.mint(env, addr, amount);
        }
    }

    pub fn assert_balance(
        env: &Env,
        contract: &Contract,
        address: &Address,
        expected: i128,
    ) {
        let actual = contract.balance_of(env, address);
        assert_eq!(actual, expected);
    }
}
```

### 5.3 Running Tests

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_transfer_success

# Run tests in release mode
cargo test --release

# Run with backtrace for debugging
RUST_BACKTRACE=1 cargo test

# Run tests with output
cargo test -- --nocapture

# Run single-threaded (for debugging)
cargo test -- --test-threads=1
```

---

## Part 6: Testing Anti-Patterns (What NOT to Do)

### ❌ Anti-Pattern 1: Tests That Are Too Broad
```rust
#[test]
fn test_everything() {
    // DON'T DO THIS
    // Tests 10 things at once
    // If it fails, what broke?
    mint(&env, &alice, 100);
    transfer(&env, &alice, &bob, 50);
    burn(&env, &alice, 25);
    approve(&env, &alice, &charlie, 10);
    transfer_from(&env, &charlie, &alice, &bob, 5);

    assert_eq!(get_balance(&env, &alice), 25);
    // Too many things - hard to debug
}
```

**✅ Better**: One test per behavior
```rust
#[test]
fn test_mint_works() {
    // Single responsibility
    mint(&env, &alice, 100);
    assert_eq!(get_balance(&env, &alice), 100);
}

#[test]
fn test_transfer_after_mint() {
    mint(&env, &alice, 100);
    transfer(&env, &alice, &bob, 50);
    assert_eq!(get_balance(&env, &bob), 50);
}
```

### ❌ Anti-Pattern 2: Weak Assertions
```rust
#[test]
fn test_transfer() {
    transfer(&env, &alice, &bob, 50);
    assert!(get_balance(&env, &bob) > 0);  // Too weak!
}
```

**✅ Better**: Explicit assertions
```rust
#[test]
fn test_transfer() {
    transfer(&env, &alice, &bob, 50);
    assert_eq!(get_balance(&env, &bob), 50);  // Exact
}
```

### ❌ Anti-Pattern 3: Implicit Test Setup
```rust
#[test]
fn test_transfer() {
    // Where does alice come from?
    // What's alice's balance?
    // Is contract initialized?
    transfer(&env, &alice, &bob, 50);
    assert_eq!(get_balance(&env, &bob), 50);
}
```

**✅ Better**: Explicit setup
```rust
#[test]
fn test_transfer() {
    let env = Env::default();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    setup_contract(&env);
    mint(&env, &alice, 100);

    transfer(&env, &alice, &bob, 50);
    assert_eq!(get_balance(&env, &bob), 50);
}
```

---

## Part 7: Testing Checklist

### Pre-Testing Checklist
- [ ] All public functions have at least one test
- [ ] Authorization is tested for sensitive functions
- [ ] Error cases are tested (insufficient balance, unauthorized, etc.)
- [ ] Edge cases tested (zero amount, max i128, etc.)
- [ ] State changes are verified after each operation

### Coverage Goals
- [ ] Unit test coverage: 80%+
- [ ] Integration test coverage: Key workflows only
- [ ] Error paths: 100% (every error branch)
- [ ] Authorization: 100% (every auth check)

### Pre-Deployment Testing
- [ ] All tests pass: `cargo test --release`
- [ ] WASM builds: `cargo build --release --target wasm32-unknown-unknown`
- [ ] Contract compiles without warnings
- [ ] No `unwrap()` on user input
- [ ] No `panic!()` on user input

---

## Part 8: Common Test Scenarios by Contract Type

### Token Contract Tests

**Minimum test coverage**:
1. Initialization
2. Mint (happy path + unauthorized)
3. Transfer (happy path + insufficient + unauthorized)
4. Burn (happy path + insufficient)
5. Approve/Transfer-from (happy path + insufficient)
6. Balance queries

### Staking Contract Tests

**Minimum test coverage**:
1. Stake (happy path + insufficient)
2. Unstake (happy path + not staked)
3. Claim rewards (happy path + nothing to claim)
4. Reward calculation
5. Time passage (using ledger.sequence)

### Governance Contract Tests

**Minimum test coverage**:
1. Create proposal
2. Vote (happy path + already voted)
3. Execute (happy path + not enough votes)
4. Voting power
5. Time-based voting windows

---

## Part 9: Advanced Testing Topics

### Fuzzing (Property-Based Testing)

```rust
#[test]
fn prop_transfer_is_additive() {
    // For any two amounts that sum < i128::MAX,
    // transferring them sequentially = transferring sum

    let env = Env::default();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    for amount1 in (0..1000).step_by(100) {
        for amount2 in (0..1000).step_by(100) {
            mint(&env, &alice, amount1 + amount2);

            transfer(&env, &alice, &bob, amount1);
            transfer(&env, &alice, &bob, amount2);

            assert_eq!(get_balance(&env, &bob), amount1 + amount2);
        }
    }
}
```

### Snapshot Testing

```rust
#[test]
fn test_contract_structure() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Contract);

    // Serialize contract state
    let state = contract.export_state(&env);
    let json = serde_json::to_string(&state).unwrap();

    // Compare to snapshot
    insta::assert_snapshot!(json);
}
```

---

## Part 10: Testing Resources

### Official Documentation
- [Soroban Testing Guide](https://soroban.stellar.org/docs/learn/testing)
- [Rust Testing Book](https://doc.rust-lang.org/book/ch11-00-testing.html)
- [soroban-sdk test utilities](https://docs.rs/soroban-sdk/latest/soroban_sdk/testutils/)

### Example Test Files
- [Token example tests](https://github.com/stellar/rs-soroban-sdk/blob/main/examples/token/src/test.rs)
- [Testutils docs](https://docs.rs/soroban-sdk/latest/soroban_sdk/testutils/)

---

## Summary: Testing Best Practices

1. **Test One Thing**: Each test tests ONE behavior
2. **Clear Names**: `test_transfer_success`, `test_transfer_insufficient_balance`
3. **Arrange-Act-Assert**: Setup → Execute → Verify
4. **Test Errors**: Every error case needs a test
5. **Test Boundaries**: Zero, max, negative values
6. **Mock External**: Use test utilities for env/addresses
7. **No Side Effects**: Tests should be independent
8. **Fast Tests**: Unit tests should run in < 1 second
9. **Deterministic**: Same input = same output
10. **Document Why**: Add comments for non-obvious tests

---

**Last Updated**: November 2, 2025
**Level**: Intermediate to Advanced
**Use with**: `/contract-testing.md` command
