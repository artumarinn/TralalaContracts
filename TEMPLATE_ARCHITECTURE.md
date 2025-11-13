# TRALALERO CONTRACTS - COMPREHENSIVE TEMPLATE ANALYSIS

## Executive Summary

The Tralalero Contracts application uses a **dual-layer template system** combining Blockly visual blocks with Handlebars code generation to create Soroban smart contracts. The architecture supports both **simple token contracts** and **advanced contracts with enterprise features**.

---

## 1. BLOCKLY TEMPLATE DEFINITIONS

### Location
- **Main file**: `/Users/matiasboldrini/Documents/hackathon/tralalerocontracts-app/public/blockly-templates.js`
- **Alternate definitions**: `/Users/matiasboldrini/Documents/hackathon/tralalerocontracts-app/public/blocks-definitions.js`

### Block Categories

#### 1.1 Token Properties Block
```javascript
Blockly.Blocks['token_properties']
```
- **UI**: "🪙 Token Properties"
- **Fields**:
  - TOKEN_NAME: Text input (default: "MyToken")
  - TOKEN_SYMBOL: Text input (default: "MTK")
  - DECIMALS: Number input 0-18 (default: 6)
  - INITIAL_SUPPLY: Number input (default: 1,000,000)
- **Style**: property_blocks (blue)
- **Function**: Extracts core token configuration

#### 1.2 Feature Blocks (Boolean Toggles)
```javascript
Blockly.Blocks['feature_mintable']
Blockly.Blocks['feature_burnable']
Blockly.Blocks['feature_pausable']
```
- **UI Icons**: ✨ (Mintable), 🔥 (Burnable), ⏸️ (Pausable)
- **Input**: Checkbox (true/false)
- **Style**: powers_blocks (orange)
- **Features**:
  - **Mintable**: Enables `mint()` function to create new tokens
  - **Burnable**: Enables `burn()` function to destroy tokens
  - **Pausable**: Enables contract pause/unpause functionality

#### 1.3 Admin Configuration Block
```javascript
Blockly.Blocks['admin_config']
```
- **UI**: "🔐 Admin Address"
- **Field**: ADMIN (Stellar address input)
- **Style**: rules_blocks (purple)
- **Function**: Sets admin address with contract control permissions

#### 1.4 Function Declaration Blocks
```javascript
Blockly.Blocks['transfer_function']
Blockly.Blocks['balance_function']
Blockly.Blocks['mint_function']
Blockly.Blocks['burn_function']
```
- **UI**: "⚙️ [function] function"
- **Style**: advanced_blocks (dark)
- **Function**: Declares which standard token functions to include

### Code Generator: TokenCodeGenerator Object

**Location**: `/Users/matiasboldrini/Documents/hackathon/tralalerocontracts-app/public/blockly-templates.js` (Lines 122-460)

#### Key Methods

##### `extractConfig(workspace)`
- **Purpose**: Extracts configuration from all blocks in workspace
- **Input**: Blockly workspace object
- **Output**: Configuration object with structure:
```javascript
{
  tokenName: string,
  tokenSymbol: string,
  decimals: number,
  initialSupply: number,
  admin: string,
  features: {
    mintable: boolean,
    burnable: boolean,
    pausable: boolean
  },
  functions: string[] // ['transfer', 'balance', 'mint', 'burn']
}
```

##### `generateRustCode(config)`
- **Purpose**: Generates complete, valid Rust contract from configuration
- **Input**: Config object from extractConfig()
- **Output**: Full Rust contract code (~460 lines)
- **Features**:
  - Automatic storage key declaration (ADMIN_KEY, NAME_KEY, SYMBOL_KEY, DECIMALS_KEY, SUPPLY_KEY, BALANCE_KEY)
  - Conditional PAUSED_KEY if pausable enabled
  - Contract struct with #[contract] and #[contractimpl] macros
  - Initialization function with admin setup
  - Token metadata functions (name, symbol, decimals, total_supply)
  - Conditional feature implementation:
    - **Transfer**: Always included, with pausable check
    - **Balance**: Only if balance_function enabled
    - **Mint**: Only if mintable + mint_function
    - **Burn**: Only if burnable + burn_function
    - **Pause/Unpause/is_paused**: Only if pausable enabled

### Current Limitations

1. **No visual code generation chain**: Blocks are configured but code generation is server-side
2. **Limited block composition**: Cannot nest blocks to create complex logic
3. **Fixed contract structure**: All generated contracts follow same pattern
4. **No error handling blocks**: No panic/error message customization

---

## 2. RUST CODE GENERATOR

### Location
- **File**: `/Users/matiasboldrini/Documents/hackathon/tralalerocontracts-app/public/rust-generator.js`

### RustGenerator Class Structure

#### Core Properties
```javascript
class RustGenerator {
  indentation: number
  imports: Set<string>
  declarations: string[]
  code: string[]
}
```

#### Key Methods

| Method | Purpose |
|--------|---------|
| `indent(text)` | Add indentation (2 spaces per level) |
| `addImport(statement)` | Collect imports for header |
| `addDeclaration(decl)` | Collect symbol/constant declarations |
| `addCode(code)` | Collect body code snippets |
| `fromBlock(block)` | Route block to generator method |
| `generateContract(block)` | Process entire contract structure |
| `buildContract(stateVars, functions, events)` | Assemble final Rust file |
| `reset()` | Clear state for new generation |

#### Supported Block Types (40+ methods)

**Contract Initialization**:
- `block_contract_init`: Sets #![no_std] and imports
- `block_contract_metadata`: Adds documentation comments
- `block_contract_name`: Documents contract name
- `block_contract_owner`: Sets owner address constant
- `block_admin_address`: Sets admin address

**State Variables** (6 methods):
- `block_state_variable`: Declares typed state vars (i32, i128, u32, u64, u128, bool, String, Address, Bytes, Map, Vec)
- `block_state_map`: Declares Map types with key/value
- `block_state_event`: Documents event definitions

**Functions** (4 methods):
- `block_function_declaration`: Creates pub fn with return type
- `block_function_parameter`: Defines function parameters
- `block_function_return`: Generates return statement
- Includes type mapping for standard Rust types

**Control Flow** (5 methods):
- `block_if_statement`: if/else blocks with indentation
- `block_loop_while`: while loops
- `block_loop_for`: for i in range loops
- `block_comparison_operator`: ==, !=, <, >, <=, >=
- `block_logical_operator`: &&, ||

**Operations** (5 methods):
- `block_arithmetic_operation`: +, -, *, /, %
- `block_variable_assignment`: let var = value;
- `block_increment_decrement`: +=1, -=1
- Operations type-map for proper Rust syntax

**Soroban/Stellar Operations** (3 methods):
- `block_stellar_transfer`: Invokes TokenClient::new().transfer()
- `block_stellar_payment`: Generates payment comment
- `block_stellar_require_auth`: Generates address.require_auth()

**Token Operations** (3 methods):
- `block_token_init`: Token initialization setup
- `block_token_mint`: Mint operation
- `block_token_burn`: Burn operation

**Security** (2 methods):
- `block_require_condition`: if !condition { panic!(...) }
- `block_access_control`: require_auth() for roles

**Literals** (3 methods):
- `block_number_literal`: Outputs numbers
- `block_string_literal`: Wraps strings in quotes
- `block_boolean_literal`: true/false

### Code Output Structure

**Default imports** (if no blocks specify):
```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env};
```

**State section** (if vars exist):
```rust
// ===== ESTADO =====
const KEY_NAME: Symbol = symbol_short!("KEY");
```

**Contract structure** (always):
```rust
#[contract]
pub struct SmartContract;

#[contractimpl]
impl SmartContract {
    // Functions here
}
```

### Current Status

**Functional**: ~70% complete
- Core Rust generation working
- Type mapping functional
- Indentation and structure correct

**Incomplete**:
- Not fully integrated with Blockly workspace
- Mainly documentation/test generator
- RustGenerator instance created globally but may not be actively used in all flows

---

## 3. HANDLEBARS CONTRACT TEMPLATES

### Template Directory Structure

```
tralala/contracts/token-templates/
├── stellar_token_contract.hbs        [v1 - Basic, used in /templates symlink]
├── stellar_token_contract_v23.hbs    [v2 - Improved error handling]
├── simple_token.hbs                  [v3 - Simple version for basic features]
└── advanced_token.hbs                [v4 - Enterprise features]

templates/
└── stellar_token_contract.hbs        [Symlink/Copy of main template]
```

### Template 1: stellar_token_contract.hbs

**Location**: `/Users/matiasboldrini/Documents/hackathon/tralalerocontracts-app/tralala/contracts/token-templates/stellar_token_contract.hbs`

**Type**: Original basic template with manual balance management

**Features**:
- Basic token contract
- Manual balance tracking via persistent storage
- Conditional pausable support
- Core functions: initialize, name, symbol, decimals, total_supply, transfer, balance

**Handlebars Variables**:
- `token_name`: Token name string
- `token_symbol`: Token symbol string
- `token_decimals`: Decimal places
- `pausable_enabled`: Boolean for pause feature
- `mint_enabled`: Boolean for mint function
- `burn_enabled`: Boolean for burn function

**Storage Keys**:
```rust
const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
const NAME_KEY: Symbol = symbol_short!("NAME");
const SYMBOL_KEY: Symbol = symbol_short!("SYMBOL");
const DECIMALS_KEY: Symbol = symbol_short!("DECIMALS");
const SUPPLY_KEY: Symbol = symbol_short!("SUPPLY");
const BALANCE_KEY: Symbol = symbol_short!("BALANCE");
{{#if pausable_enabled}}const PAUSED_KEY: Symbol = symbol_short!("PAUSED");{{/if}}
```

**Functions**:
- `initialize(admin, name, symbol, decimals, initial_supply)`: Initialize contract
- `name()`, `symbol()`, `decimals()`: Metadata getters
- `total_supply()`, `balance(id)`: Supply/balance queries
- `transfer(from, to, amount)`: Transfer with balance check
- `mint(to, amount)` [if mint_enabled]: Admin-only mint
- `burn(from, amount)` [if burn_enabled]: Token burning
- `pause()`, `unpause()`, `is_paused()` [if pausable_enabled]: Pause management

**Limitations**:
- Manual balance management (no TokenUtils)
- No standard token interface support
- Simple error handling (panic! calls)

---

### Template 2: stellar_token_contract_v23.hbs

**Location**: `/Users/matiasboldrini/Documents/hackathon/tralalerocontracts-app/tralala/contracts/token-templates/stellar_token_contract_v23.hbs`

**Type**: Improved version with TokenUtils integration

**Key Differences from v1**:
- Uses Soroban TokenUtils for standard token operations
- Proper error enum with u32 repr (TokenSDK compatible)
- Uses IntoVal and Val for storage keys
- Helper functions: get_admin(), check_admin(), is_paused(), require_not_paused()

**Error Enum**:
```rust
#[derive(Debug)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Paused = 3,
    TransferLimitExceeded = 4,
}
```

**Storage Keys (Val-based)**:
```rust
const ADMIN_KEY: Val = symbol_short!("ADMIN").into_val();
const PAUSED_KEY: Val = symbol_short!("PAUSED").into_val();
const LIMIT_KEY: Val = symbol_short!("LIMIT").into_val();
```

**Helper Functions**:
- `get_admin(env)`: Retrieves admin or panics
- `check_admin(env)`: Verifies admin auth
- `is_paused(env)`: Checks pause status
- `require_not_paused(env)`: Requires unpaused state

**Standard Token Functions**:
- `initialize(admin)`: Single admin parameter
- `metadata()`: Returns TokenMetadata struct
- `transfer(from, to, amount)`: Uses TokenUtils::transfer()
- `approve(from, spender, amount, expiration)`: Standard approve
- `allowance(from, spender)`: Get allowance
- `transfer_from(spender, from, to, amount)`: Allowance-based transfer
- `balance(id)`: Uses TokenUtils::balance()
- `mint(to, amount)` [if enabled]: Uses TokenUtils::mint()
- `burn(from, amount)` [if enabled]: Uses TokenUtils::burn()

**Features**:
- Transfer limit checking [if transfer_limit enabled]
- Pause support [if pausable_enabled]
- Follows Soroban token SDK conventions

---

### Template 3: simple_token.hbs

**Location**: `/Users/matiasboldrini/Documents/hackathon/tralalerocontracts-app/tralala/contracts/token-templates/simple_token.hbs`

**Type**: Simplified version for basic token features

**Handlebars Variables**:
- `token_name`: Token name
- `token_symbol`: Token symbol
- `token_decimals`: Decimal places
- `initial_supply`: Initial token supply
- `mint_enabled`: Enable mint function
- `burn_enabled`: Enable burn function
- `pausable_enabled`: Enable pause/unpause

**Storage Keys**:
```rust
const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
const NAME_KEY: Symbol = symbol_short!("NAME");
const SYMBOL_KEY: Symbol = symbol_short!("SYMBOL");
const DECIMALS_KEY: Symbol = symbol_short!("DECIMALS");
const SUPPLY_KEY: Symbol = symbol_short!("SUPPLY");
const BALANCE_KEY: Symbol = symbol_short!("BALANCE");
```

**Functions**:
- `initialize(env, admin, name, symbol, decimals, initial_supply)`
- `name(env)`, `symbol(env)`, `decimals(env)`, `total_supply(env)`
- `balance(env, id)`
- `transfer(env, from, to, amount)` - with pausable check
- `mint(env, to, amount)` [if enabled]
- `burn(env, from, amount)` [if enabled]
- `pause(env)`, `unpause(env)`, `is_paused(env)` [if pausable]

**Key Features**:
- Conditional pausable functionality
- Conditional mint/burn inclusion
- Manual balance management
- Simple error handling with panic!()

**Use Case**: Projects with basic token requirements, no advanced features

---

### Template 4: advanced_token.hbs (MOST COMPREHENSIVE)

**Location**: `/Users/matiasboldrini/Documents/hackathon/tralalerocontracts-app/tralala/contracts/token-templates/advanced_token.hbs`

**Type**: Enterprise-grade token contract with extensive features

**Handlebars Variables** (40+ parameters):

**Basic Token Properties**:
```handlebars
{{contract_name}}      - Smart contract struct name
{{token_name}}         - Full token name
{{token_symbol}}       - Token symbol
{{token_decimals}}     - Decimal places
{{initial_supply}}     - Initial supply amount
{{admin_address}}      - Admin wallet address
```

**Feature Flags** (Sections 1-4):
```handlebars
{{#if mint_enabled}}...{{/if}}
{{#if burn_enabled}}...{{/if}}
{{#if pausable_enabled}}...{{/if}}
{{#if upgrade_enabled}}...{{/if}}
{{#if access_control_enabled}}...{{/if}}
```

**Advanced Features** (Section 5):
```handlebars
{{#if features.stakeable}}...{{/if}}
{{#if features.governance}}...{{/if}}
{{#if features.timeLock}}...{{/if}}
```

**Security Configuration** (Section 6):
```handlebars
{{#if security.freezeable}}...{{/if}}
{{#if security.whitelistEnabled}}...{{/if}}
{{#if security.transferLimit}}{{security.transferLimit}}{{/if}}
```

**Economic Features** (Section 7):
```handlebars
{{#if economics.transactionFee}}{{economics.transactionFee}}{{/if}}
{{#if economics.burnRate}}{{economics.burnRate}}{{/if}}
{{#if economics.stakingReward}}{{economics.stakingReward}}{{/if}}
```

**Metadata**:
```handlebars
{{license}}         - License (e.g., "MIT")
{{timeLockDays}}    - Days for timelock
```

**Storage Keys** (Dynamic):
```rust
const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
{{#if pausable_enabled}}const PAUSED_KEY: Symbol = symbol_short!("PAUSED");{{/if}}
{{#if access_control_enabled}}const ROLES_KEY: Symbol = symbol_short!("ROLES");{{/if}}
{{#if upgrade_enabled}}const CONTRACT_VERSION: Symbol = symbol_short!("VERSION");{{/if}}
{{#if features.stakeable}}const STAKING_POOL: Symbol = symbol_short!("STAKING");{{/if}}
{{#if features.governance}}const PROPOSAL_COUNT: Symbol = symbol_short!("PROP_CNT");{{/if}}
{{#if features.timeLock}}const TIMELOCK_PERIOD: Symbol = symbol_short!("TIMELOCK");{{/if}}
{{#if security.freezeable}}const FROZEN_KEY: Symbol = symbol_short!("FROZEN");{{/if}}
{{#if security.whitelistEnabled}}const WHITELIST_KEY: Symbol = symbol_short!("WLIST");{{/if}}
```

**Error Enum**:
```rust
pub enum ContractError {
    AlreadyInitialized = 1,
    Unauthorized = 2,
    InsufficientBalance = 3,
    ContractPaused = 4,
    AccountFrozen = 5,
    NotWhitelisted = 6,
    TransferLimitExceeded = 7,
    InvalidAmount = 8,
    TimeLockActive = 9,
}
```

**Core Functions**:

1. **initialize()**: Sets admin, token metadata, optional features
2. **name/symbol/decimals/total_supply()**: Standard metadata
3. **balance(id)**: Get account balance
4. **transfer(from, to, amount)**: With all security checks
   - Pause check
   - Frozen account check
   - Whitelist check
   - Transfer limit check
   - Transaction fee deduction
   - Burn rate deduction

**Conditional Features**:

A. **Mint/Burn** (if enabled):
- `mint(to, amount)`: Creates tokens, role-based or admin-only
- `burn(from, amount)`: Destroys tokens, role-based

B. **Pausable** (if enabled):
- `pause()`: Admin-only pause
- `unpause()`: Admin-only unpause
- `is_paused()`: Check pause status

C. **Access Control** (if enabled):
- `has_role(role, account)`: Role checking
- `grant_role(role, account)`: Grant role to address
- Roles: ADMIN (0), MINTER (1), BURNER (2), PAUSER (3)

D. **Staking** (if features.stakeable):
- `stake(from, amount)`: Deposit tokens for rewards
- `unstake(to, amount)`: Withdraw + claim rewards
- `staking_balance(account)`: Get staked amount
- Reward calculation: `amount * reward_rate * time_staked / (100 * 365 * 24 * 60 * 60)`

E. **Governance** (if features.governance):
- `create_proposal(proposer, description)`: Create proposal
- `vote(voter, proposal_id, support)`: Cast vote (token-weighted)
- Stores proposal votes and tracks voting history

F. **Security - Freezeable** (if security.freezeable):
- `freeze_account(account)`: Admin-only account freeze
- `unfreeze_account(account)`: Admin-only unfreeze
- `is_frozen(account)`: Check frozen status

G. **Security - Whitelist** (if security.whitelistEnabled):
- `add_to_whitelist(account)`: Admin adds address
- `remove_from_whitelist(account)`: Admin removes address
- `is_whitelisted(account)`: Check whitelist status

H. **Upgradeable** (if upgrade_enabled):
- `upgrade(new_wasm_hash)`: Store upgrade authorization
- `version()`: Get contract version string

I. **Statistics**:
- `get_stats()`: Returns (total_supply, staking_total, holder_count, is_paused)

**Advanced Template Statistics**:
- Lines of code: ~680 lines
- Features: 15+ conditional sections
- Functions: 30+ optional functions
- Type safety: Result<T, ContractError> throughout
- Logging: Comprehensive log!() calls for debugging

---

## 4. CURRENT CONTRACT TYPES AVAILABLE

### Precompiled Contracts (Built-in)

Located in `/Users/matiasboldrini/Documents/hackathon/tralalerocontracts-app/tralala/contracts/`

| Name | Location | Template | Features |
|------|----------|----------|----------|
| **hello-world** | `contracts/hello-world/` | Example | Basic "Hello World" contract |
| **token_template_basic** | `contracts/token_template_basic/` | simple_token.hbs | Basic token, minimal features |
| **token_template_advanced** | `contracts/token_template_advanced/` | advanced_token.hbs | Full-featured enterprise token |

### Dynamic Contracts (Generated at Runtime)

**Location**: `tralala/dynamic-contracts/[contract_name]/`

**Naming Convention**: `{symbol}_{random_id}`
- Example: `mtk_a53ee33e/`, `test_8f2b3c1a/`

**Each contains**:
- `Cargo.toml` - Package manifest (generated from template)
- `src/lib.rs` - Contract code (Handlebars rendered)
- `target/wasm32-unknown-unknown/release/[name].wasm` - Compiled binary

**Generation Flow**:
1. User configures token via Blockly interface
2. Backend receives contractData JSON
3. Backend selects template (simple vs advanced)
4. Handlebars compiles template with contractData variables
5. Generated Rust code written to new contract directory
6. Cargo build spawned asynchronously
7. WASM binary stored in target/
8. Metadata saved to `tralala/compiled/{contractId}.json`

---

## 5. RUST CODE GENERATION PIPELINE

### Backend Architecture

**Server File**: `/Users/matiasboldrini/Documents/hackathon/tralalerocontracts-app/server.js` (1,340+ lines)

### API Endpoint: POST /api/build-smart-contract

**Input** (JSON):
```javascript
{
  code: "MTK",                    // Token code (max 12 chars)
  amount: 1000000,                // Initial supply
  userAddress: "GB...",           // Issuer Stellar address
  contractData: {
    name: "MyToken",
    symbol: "MTK",
    decimals: 6,
    supply: 1000000,
    features: {
      mintable: boolean,
      burnable: boolean,
      pausable: boolean,
      upgradeable: boolean,
      accessControl: boolean,
      stakeable: boolean,
      governance: boolean,
      timeLock: boolean
    },
    security: {
      transferLimit: number,
      whitelistEnabled: boolean,
      freezeable: boolean
    },
    economics: {
      transactionFee: number,
      burnRate: number,
      stakingReward: number
    },
    metadata: {
      securityContact: string,
      license: string
    }
  }
}
```

### Processing Steps

**Step 1: Validation** (Lines ~269-350)
- Check backend enabled/disabled
- Validate input data structure
- Extract contractData and userAddress

**Step 2: Determine Template Selection** (Lines ~778-790)
```javascript
hasAdvancedFeatures = 
  stakeable || governance || 
  accessControl || whitelistEnabled || 
  freezeable || (transactionFee > 0)

templateFile = hasAdvancedFeatures ? 
  'advanced_token.hbs' : 'simple_token.hbs'
```

**Step 3: Prepare Template Variables** (Lines ~733-775)
```javascript
templateData = {
  contract_name: contractData.name.replace(/\s+/g, ''),
  token_name: contractData.name,
  token_symbol: contractData.symbol,
  token_decimals: contractData.decimals || 2,
  initial_supply: contractData.supply,
  mint_enabled: contractData.features?.mintable,
  burn_enabled: contractData.features?.burnable,
  pausable_enabled: contractData.features?.pausable,
  // ... all feature flags and settings
}
```

**Step 4: Render Handlebars Template** (Lines ~791-793)
```javascript
const templateContent = await fs.readFile(templatePath, 'utf-8');
const template = handlebars.compile(templateContent);
const rustCode = template(templateData);
```

**Step 5: Create Contract Directory** (Lines ~796-798)
```javascript
const contractDir = path.join(
  __dirname, 
  'tralala', 
  'dynamic-contracts', 
  contractName
);
await fse.ensureDir(contractDir);
await fse.ensureDir(path.join(contractDir, 'src'));
```

**Step 6: Write Cargo.toml** (Lines ~800-830)
```toml
[package]
name = "generated_contract_name"
version = "1.0.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = { version = "23.0.1" }
```

**Step 7: Write Rust Source** (Line ~840)
```javascript
await fs.writeFile(
  path.join(contractDir, 'src', 'lib.rs'),
  rustCode
);
```

**Step 8: Async Background Compilation** (Lines ~502-701)
- Status: "compiling" (10%)
- Command: `cargo build --target wasm32-unknown-unknown --release`
- Timeout: 600 seconds (10 minutes)
- Buffer: 10MB max output

**Step 9: WASM Verification** (Lines ~537-561)
- Check file exists at: `target/wasm32-unknown-unknown/release/{name}.wasm`
- Status: "checking" (50%)

**Step 10: WASM Optimization** (Lines ~563-579)
- Command: `soroban contract optimize --wasm [path]`
- Status: "optimizing" (60%)
- Non-fatal if fails (continues with unoptimized)

**Step 11: Save Contract Metadata** (Lines ~581-609)
- Location: `tralala/compiled/{contractId}.json`
- Stores: ID, name, data, features, WASM path, Rust code, timestamp

**Step 12: Auto-Deployment Attempt** (Lines ~620-677)
- Status: "deploying" (80%)
- Command: `stellar contract deploy --wasm [path] --network testnet --source [identity]`
- Non-fatal if fails (backend deployed without deployment)

**Step 13: Final Status Update** (Lines ~680-688)
- Status: "completed" (100%)
- Includes contractAddress (if deployed) and deploymentSuccessful flag

### Response Object

**Immediate Response** (sent before compilation):
```javascript
{
  success: true,
  contractId: "uuid",
  contractName: "symbol_randomid",
  progressUrl: "/api/compilation-progress/{contractId}",
  message: "Compilación en progreso..."
}
```

**Final Status** (via polling /api/compilation-progress/{contractId}):
```javascript
{
  status: "completed" | "compiling" | "deploying" | "error",
  progress: 0-100,
  message: "Status message",
  contractName: "name",
  contractAddress: "if deployed",
  deploymentSuccessful: boolean,
  error: boolean,
  timestamp: Date
}
```

---

## 6. RUST WORKSPACE STRUCTURE

### Root Cargo.toml

**Location**: `/Users/matiasboldrini/Documents/hackathon/tralalerocontracts-app/tralala/Cargo.toml`

```toml
[workspace]
resolver = "2"
members = [
    "contracts/hello-world",
    "contracts/token_template_basic",
    "contracts/token_template_advanced",
    "dynamic-contracts/mtk_*"
]

[workspace.dependencies]
soroban-sdk = "23.0.1"

[profile.release]
opt-level = 2
overflow-checks = false
debug = 0
strip = "symbols"
debug-assertions = false
panic = "abort"
codegen-units = 256
lto = "thin"
```

### Individual Contract Cargo.toml

**File**: `/Users/matiasboldrini/Documents/hackathon/tralalerocontracts-app/tralala/contracts/token_template_basic/Cargo.toml`

```toml
[package]
name = "token_template_basic"
version = "1.0.0"
edition = "2021"
authors = ["Tralalero"]
description = "Basic token contract template compiled to WASM"
license = "MIT"

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = { workspace = true }

[dev-dependencies]
soroban-sdk = { workspace = true, features = ["testutils"] }
```

### Compilation Command

**Build all**:
```bash
cd tralala
cargo build --target wasm32-unknown-unknown --release
```

**Build specific**:
```bash
cargo build --package token_template_basic --target wasm32-unknown-unknown --release
```

**Output**:
```
target/wasm32-unknown-unknown/release/{package_name}.wasm
```

---

## 7. LIMITATIONS AND ISSUES

### Template Limitations

| Issue | Severity | Description | Impact |
|-------|----------|-------------|--------|
| No inline storage type mappings | Medium | Templates hardcode storage keys, no abstraction | Cannot easily add new storage features |
| Limited error types | Medium | advanced_token has 9 errors, may not cover all cases | Users see generic errors |
| Manual feature composition | Low | Cannot enable conflicting features | Good separation but less flexibility |
| No event emission | High | No logging of important state changes | No contract event history |
| Whitelist is opt-in only | Medium | No blacklist functionality | Cannot block addresses |
| No supply cap | Medium | Mintable tokens can grow infinitely | Potential token inflation |
| No delegation system | Low | Governance doesn't use voting power delegation | Limited for large DAOs |
| Staking rewards hardcoded formula | Low | `reward_rate * time / (365 * 86400)` | Cannot adjust reward curves dynamically |

### Code Generation Issues

| Issue | Severity | Description |
|-------|----------|-------------|
| RustGenerator not fully integrated | Medium | Defined but appears unused in actual flow; only Handlebars used |
| No runtime validation | High | Feature combinations not validated (e.g., governance without voting) |
| Storage key collisions possible | Medium | No namespace isolation for dynamic contracts |
| No version compatibility tracking | Medium | Generated contracts may not work with future SDK changes |
| Template caching may stale | Low | Handlebars caches templates; changes require restart |

### Block Definition Issues

| Issue | Severity |
|-------|----------|
| Limited block nesting | High |
| No loop/conditional block composition | High |
| Fixed to token contract type | Medium |
| No custom block creation UI | Medium |

---

## 8. TEMPLATE SELECTION DECISION TREE

```
User enters contractData
↓
Has ANY advanced feature?
├─ stakeable: YES
├─ governance: YES  
├─ accessControl: YES
├─ security.whitelistEnabled: YES
├─ security.freezeable: YES
├─ economics.transactionFee > 0: YES
│
└─ All NO: Use simple_token.hbs
   └─ YES: Use advanced_token.hbs
   
                ↓
        [Handlebars Render]
        ↓
    [Write Rust to disk]
    ↓
[Compile to WASM]
```

---

## 9. KEY FILES REFERENCE

| File | Lines | Purpose |
|------|-------|---------|
| `public/blockly-templates.js` | 461 | Block defs + TokenCodeGenerator |
| `public/blocks-definitions.js` | 461 | Alternative block definitions |
| `public/rust-generator.js` | 563 | RustGenerator class (unused?) |
| `server.js` | 1340+ | Contract generation pipeline |
| `templates/stellar_token_contract.hbs` | 238 | v1 Basic template |
| `tralala/contracts/token-templates/simple_token.hbs` | 238 | v3 Simplified template |
| `tralala/contracts/token-templates/advanced_token.hbs` | 683 | v4 Enterprise template |
| `tralala/contracts/token-templates/stellar_token_contract_v23.hbs` | 164 | v2 Improved template |
| `tralala/Cargo.toml` | 27 | Workspace configuration |

---

## 10. SUMMARY STATISTICS

**Total Block Types**: 8 (properties, 3 features, admin, 4 functions)

**Template Versions**: 4 active
- v1: Basic (238 lines)
- v2: Improved (164 lines)
- v3: Simple (238 lines)
- v4: Advanced (683 lines)

**Features Supported**: 15+ major categories
- Basic: Token properties, mint, burn, transfer, balance
- Advanced: Pausable, access control, staking, governance
- Security: Freezeable, whitelist, transfer limits
- Economics: Transaction fees, burn rates, staking rewards

**Code Generation Path**:
Blockly UI → Extract Config → Handlebars Template → Render Rust → Write to Disk → Cargo Compile → WASM Binary

**Current Architecture**:
- Frontend: Blockly (8 blocks) + RustGenerator class (unused)
- Backend: Express + Handlebars (4 templates) + Cargo (compilation)
- Blockchain: Stellar SDK + Soroban

