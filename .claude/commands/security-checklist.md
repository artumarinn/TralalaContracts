# 🛡️ Security Checklist for Soroban Contracts

**Purpose**: Pre-deployment security verification guide for Tralalero contracts

**When to Use**: Before deploying ANY contract to testnet or mainnet

---

## ⚡ Quick Security Audit (5 minutes)

### Authorization & Access Control
- [ ] All state-modifying functions have `require_auth()`
- [ ] Admin functions verify `invoker == admin`
- [ ] Public transfer functions require sender authorization
- [ ] Mint/burn functions restricted to authorized addresses only
- [ ] Pause functionality only callable by admin

### State Management & Logic
- [ ] No uninitialized storage reads (always check existence)
- [ ] All state transitions are atomic (no partial updates)
- [ ] Correct handling of token decimals (avoid precision loss)
- [ ] No unsafe conversions between number types
- [ ] Transfer amounts validated (non-zero, non-negative)

### Math & Numbers
- [ ] No integer overflow/underflow risks
- [ ] Multiplication before division (avoid rounding errors)
- [ ] Balance checks BEFORE state changes
- [ ] Total supply tracking is consistent
- [ ] Approve/allowance patterns prevent double-spending

### Transfers & Payments
- [ ] All `transfer()` calls check return success
- [ ] Insufficient balance errors handled properly
- [ ] Failed transfers don't leave inconsistent state
- [ ] No re-entrancy issues (single-threaded Soroban helps)
- [ ] Transfer events emitted correctly

### Events & Logging
- [ ] All critical operations emit events
- [ ] Event parameters include relevant context
- [ ] Event signatures match contract ABI
- [ ] No sensitive data in events

---

## 🔴 Common Soroban Vulnerabilities

### 1. Missing Authorization (HIGH RISK)

**Vulnerability**: Function modifies state without checking who called it

**Vulnerable Code**:
```rust
#[contract]
pub mod token {
    pub fn transfer(from: Address, to: Address, amount: i128) {
        // ❌ WRONG: No check who is calling this
        let from_balance = get_balance(&from);
        let to_balance = get_balance(&to);
        set_balance(&from, from_balance - amount);
        set_balance(&to, to_balance + amount);
    }
}
```

**Secure Code**:
```rust
#[contract]
pub mod token {
    pub fn transfer(from: Address, to: Address, amount: i128) {
        // ✅ CORRECT: Verify caller is authorized
        from.require_auth();

        let from_balance = get_balance(&from);
        require!(from_balance >= amount, "Insufficient balance");

        set_balance(&from, from_balance - amount);
        set_balance(&to, get_balance(&to) + amount);

        // Emit event
        TokenTransfer { from, to, amount }.publish();
    }
}
```

**How to Fix**:
1. Identify all functions that modify state
2. Add `require_auth()` or `invoker.require_auth()`
3. For admin functions: `require!(invoker == admin, "Unauthorized")`
4. Test that unauthorized calls fail

---

### 2. Uninitialized State Reads (HIGH RISK)

**Vulnerability**: Reading storage that doesn't exist causes panic

**Vulnerable Code**:
```rust
fn get_balance(account: &Address) -> i128 {
    // ❌ WRONG: Panics if account not initialized
    let key = account_balance_key(account);
    env.storage().persistent().get(&key).unwrap() // PANIC!
}
```

**Secure Code**:
```rust
fn get_balance(account: &Address) -> i128 {
    let key = account_balance_key(account);
    // ✅ CORRECT: Return 0 if not found
    env.storage().persistent().get(&key).unwrap_or(0)
}

fn has_account(account: &Address) -> bool {
    let key = account_balance_key(account);
    env.storage().persistent().has(&key)
}
```

---

### 3. Integer Overflow/Underflow (MEDIUM RISK)

**Vulnerability**: Arithmetic operations exceed i128 bounds

**Vulnerable Code**:
```rust
// ❌ WRONG: Could overflow if both balances are large
let new_balance = balance1 + balance2;

// ❌ WRONG: Could underflow
let remaining = balance - amount; // if amount > balance
```

**Secure Code**:
```rust
// ✅ CORRECT: Check before arithmetic
require!(balance >= amount, "Insufficient balance");
let remaining = balance - amount; // Now safe

// ✅ CORRECT: Use checked_add
let new_balance = balance1.checked_add(balance2)
    .ok_or(ContractError::Overflow)?;
```

---

### 4. Improper Decimal Handling (MEDIUM RISK)

**Vulnerability**: Losing precision with wrong decimal operations

**Vulnerable Code**:
```rust
// ❌ WRONG: 100 / 1e7 = 0 (rounded down)
let human_amount = total_amount / 10_000_000;

// ❌ WRONG: Loses precision
let amount_in_units = 1_500_000 / 1_000_000; // Result: 1, not 1.5
```

**Secure Code**:
```rust
// ✅ CORRECT: Multiply before divide
const DECIMAL_PLACES: u32 = 7;
const MULTIPLIER: i128 = 10_i128.pow(DECIMAL_PLACES);

fn human_to_units(human_amount: i128) -> i128 {
    human_amount * MULTIPLIER  // Multiply FIRST
}

fn units_to_human(units: i128) -> i128 {
    units / MULTIPLIER  // Then divide
}
```

---

### 5. State Inconsistency (MEDIUM RISK)

**Vulnerability**: Partial state updates leave contract in bad state

**Vulnerable Code**:
```rust
pub fn transfer(from: Address, to: Address, amount: i128) {
    from.require_auth();

    let from_balance = get_balance(&from);
    require!(from_balance >= amount, "Insufficient balance");

    set_balance(&from, from_balance - amount); // State 1
    // ❌ If next line fails, from is debited but to not credited!
    set_balance(&to, get_balance(&to) + amount); // State 2
}
```

**Secure Code**:
```rust
pub fn transfer(from: Address, to: Address, amount: i128) -> Result<(), Error> {
    from.require_auth();

    // ✅ CORRECT: Validate EVERYTHING first
    require!(amount > 0, "Amount must be positive");
    let from_balance = get_balance(&from);
    require!(from_balance >= amount, "Insufficient balance");

    // ✅ Then update atomically
    set_balance(&from, from_balance - amount);
    set_balance(&to, get_balance(&to) + amount);

    // ✅ Emit event AFTER successful update
    TokenTransfer { from, to, amount }.publish();
    Ok(())
}
```

---

### 6. Allowance / Approve Race Condition (MEDIUM RISK)

**Vulnerability**: User can approve 0 then immediately spend old allowance

**Vulnerable Code**:
```rust
pub fn approve(spender: Address, amount: i128) {
    owner.require_auth();
    // ❌ WRONG: Can be exploited
    set_allowance(&owner, &spender, amount);
}

pub fn transfer_from(spender: Address, from: Address, to: Address, amount: i128) {
    spender.require_auth();
    let allowance = get_allowance(&from, &spender);
    require!(allowance >= amount, "Insufficient allowance");

    set_allowance(&from, &spender, allowance - amount);
    // ... transfer logic
}
```

**Secure Code**:
```rust
// ✅ CORRECT: Require reset to 0 first
pub fn approve(spender: Address, new_amount: i128) {
    owner.require_auth();

    let current = get_allowance(&owner, &spender);
    require!(
        current == 0 || new_amount == 0,
        "Non-zero to non-zero not allowed. Set to 0 first."
    );

    set_allowance(&owner, &spender, new_amount);
}

// OR use increase_allowance / decrease_allowance pattern
pub fn increase_allowance(spender: Address, delta: i128) {
    owner.require_auth();
    let current = get_allowance(&owner, &spender);
    set_allowance(&owner, &spender, current + delta);
}
```

---

### 7. Event Emission Failures (LOW RISK)

**Vulnerability**: Events not emitted = no audit trail

**Vulnerable Code**:
```rust
pub fn transfer(from: Address, to: Address, amount: i128) {
    // ... transfer logic ...

    // ❌ WRONG: What if this fails?
    TokenTransfer { from, to, amount }.publish();
}
```

**Secure Code**:
```rust
pub fn transfer(from: Address, to: Address, amount: i128) {
    // ✅ CORRECT: Update state FIRST, emit AFTER
    set_balance(&from, from_balance - amount);
    set_balance(&to, to_balance + amount);

    // Now emit (shouldn't fail, but state is already updated)
    TokenTransfer { from, to, amount }.publish();
}
```

---

## 📋 Testing Checklist Before Deploy

### Unit Tests
- [ ] Test normal transfer: `A → B → C`
- [ ] Test insufficient balance rejection
- [ ] Test zero amount rejection
- [ ] Test same address transfer (if allowed)
- [ ] Test mint to new account
- [ ] Test burn from account
- [ ] Test pause/resume if implemented
- [ ] Test whitelist add/remove if implemented

### Authorization Tests
- [ ] Unauthorized user cannot call admin functions
- [ ] Unauthorized user cannot transfer from another account
- [ ] Owner can transfer their own tokens
- [ ] Approved spender can transfer on behalf

### Edge Cases
- [ ] Very large amounts (near i128 max)
- [ ] Very small amounts (1 unit)
- [ ] Decimal precision at boundaries
- [ ] Simultaneous operations (if applicable)
- [ ] Empty contract state

### Integration Tests
- [ ] Deploy contract successfully
- [ ] Initialize contract state
- [ ] Execute transfer and verify on-chain state
- [ ] Query balances match internal accounting
- [ ] Events appear in transaction history

---

## 🔍 Pre-Deployment Checklist

### Code Review
- [ ] All TODOs/FIXMEs resolved
- [ ] No hardcoded test addresses or keys
- [ ] No println! macros (use events instead)
- [ ] No unwrap() on user input (use ? or handle errors)
- [ ] Code matches contract spec

### Compilation
- [ ] Builds without warnings
- [ ] All tests pass: `cargo test --release`
- [ ] Compiles to WASM: `cargo build --release --target wasm32-unknown-unknown`
- [ ] WASM file exists in `target/wasm32-unknown-unknown/release/`

### Documentation
- [ ] Contract has rustdoc comments
- [ ] All public functions documented
- [ ] Error types documented
- [ ] Parameter validation documented
- [ ] Admin functions clearly marked

### Security Review
- [ ] All authorization checks present
- [ ] No uninitialized state reads
- [ ] No obvious overflow/underflow
- [ ] Decimals handled correctly
- [ ] Events emitted appropriately
- [ ] No hard-coded critical values

### Deployment
- [ ] Correct network (TESTNET or MAINNET)
- [ ] Admin address correct
- [ ] Initial supply correct
- [ ] Decimal places correct
- [ ] Contract funded with XLM for gas
- [ ] Have backup of contract address and keys

---

## 🛠️ How to Use This Checklist

### For Your First Contract
1. Run through **Quick Security Audit** (5 min)
2. Read the **Common Vulnerabilities** section
3. Verify your code doesn't have any
4. Run **Testing Checklist**
5. Complete **Pre-Deployment Checklist**

### For Subsequent Contracts
1. Quick Security Audit
2. Skim relevant vulnerability sections
3. Testing Checklist
4. Pre-Deployment Checklist

### If You Get a Bug Report
1. Match bug to vulnerability type
2. Fix using the "Secure Code" pattern
3. Add test case for that bug
4. Re-run full test suite

---

## 📚 Related Resources

**In This Project**:
- `/soroban-helper` - Contract patterns and examples
- `/deploy-helper` - Deployment verification
- `/debug-testing` - Testing strategies

**External Resources**:
- [Stellar Contract Development Guide](https://developers.stellar.org/docs/build/guides/contract-development)
- [Soroban Security Best Practices](https://soroban.stellar.org/docs/learn/security)
- [OpenZeppelin Stellar Contracts](https://docs.openzeppelin.com/stellar-contracts/)
- [Rust Memory Safety](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html)

---

## 💡 Pro Tips

1. **Test authorization FIRST**
   - Most bugs come from missing auth checks
   - Add them before other logic

2. **Use OpenZeppelin implementations**
   - They're battle-tested
   - Save time and reduce bugs
   - Available via `/soroban-helper`

3. **Emit events for everything**
   - Easier debugging
   - Better transparency
   - Required for audit trail

4. **Keep contracts small**
   - Easier to audit
   - Faster to compile
   - Less gas on deployment

5. **Test on testnet first**
   - Multiple iterations allowed
   - Low stakes for bugs
   - Build confidence

---

## ⚠️ Remember

> **Smart contracts are immutable.**
> A bug deployed to mainnet is permanent.
> An hour of security checking saves months of pain.

Run this checklist EVERY time before deploying.

---

**Last Updated**: November 2, 2025
**Maintained by**: Claude Code
**Related Commands**: `/soroban-helper`, `/deploy-helper`, `/debug-testing`
