# TRALALERO CONTRACTS - QUICK REFERENCE GUIDE

## File Locations Summary

```
PROJECT ROOT
├── public/
│   ├── blockly-templates.js          [8 block types + TokenCodeGenerator]
│   ├── blocks-definitions.js         [Alternate block definitions]
│   ├── rust-generator.js             [RustGenerator class - 40+ block handlers]
│   └── client.js                     [Blockly workspace management]
│
├── server.js                         [Express backend + Handlebars rendering]
│
├── templates/
│   └── stellar_token_contract.hbs    [v1 template reference]
│
├── tralala/                          [Rust workspace]
│   ├── Cargo.toml                    [Workspace config]
│   ├── contracts/
│   │   ├── hello-world/              [Example contract]
│   │   ├── token_template_basic/     [Precompiled basic token]
│   │   ├── token_template_advanced/  [Precompiled advanced token]
│   │   └── token-templates/
│   │       ├── stellar_token_contract.hbs    [v1 - 238 lines]
│   │       ├── stellar_token_contract_v23.hbs [v2 - 164 lines]
│   │       ├── simple_token.hbs               [v3 - 238 lines]
│   │       └── advanced_token.hbs             [v4 - 683 lines]
│   ├── dynamic-contracts/            [Generated contracts]
│   │   └── {symbol}_{id}/
│   │       ├── Cargo.toml
│   │       ├── src/lib.rs
│   │       └── target/wasm32-unknown-unknown/release/{name}.wasm
│   └── compiled/                     [Contract metadata JSON]
│       └── {contractId}.json
│
└── TEMPLATE_ARCHITECTURE.md          [This documentation]
```

---

## Block Types at a Glance

### 1. Token Properties Block
```
🪙 Token Properties
├─ TOKEN_NAME (text): Default "MyToken"
├─ TOKEN_SYMBOL (text): Default "MTK"
├─ DECIMALS (0-18): Default 6
└─ INITIAL_SUPPLY (number): Default 1,000,000
```

### 2-4. Feature Blocks (Boolean)
```
✨ Mintable     [checkbox] → Enables mint() function
🔥 Burnable     [checkbox] → Enables burn() function
⏸️ Pausable     [checkbox] → Enables pause/unpause()
```

### 5. Admin Configuration
```
🔐 Admin Address
└─ ADMIN (Stellar address): Sets admin permissions
```

### 6-9. Function Declaration Blocks
```
⚙️ transfer_function  → Includes transfer()
⚙️ balance_function   → Includes balance()
⚙️ mint_function      → Includes mint() [needs mintable=true]
⚙️ burn_function      → Includes burn() [needs burnable=true]
```

---

## Template Comparison Matrix

| Feature | v1 | v2 | v3 | v4 |
|---------|----|----|----|----|
| **Storage Type** | Symbol | Val | Symbol | Symbol |
| **Balance Management** | Manual | TokenUtils | Manual | Manual |
| **Error Handling** | panic! | Error enum | panic! | Error enum |
| **Pausable** | Optional | Optional | Optional | Optional |
| **Mint/Burn** | Optional | Optional | Optional | Optional |
| **Transfer Limit** | No | Yes | No | Yes |
| **Access Control** | No | No | No | Yes |
| **Staking** | No | No | No | Yes |
| **Governance** | No | No | No | Yes |
| **Freezeable** | No | No | No | Yes |
| **Whitelist** | No | No | No | Yes |
| **Transaction Fee** | No | No | No | Yes |
| **Burn Rate** | No | No | No | Yes |
| **Staking Rewards** | No | No | No | Yes |
| **Lines of Code** | 238 | 164 | 238 | 683 |
| **Recommended Use** | Basic | Simple | Basic | Enterprise |

---

## Contract Generation Flow

```
USER INTERFACE (Blockly)
   ↓
   [Select Token Properties]
   [Choose Features]
   ↓
FRONTEND
   ↓
   TokenCodeGenerator.extractConfig(workspace)
   ↓
   POST /api/build-smart-contract
   ↓
BACKEND (server.js)
   ↓
   [Validate Input]
   ↓
   [Check Advanced Features]
   ├─ stakeable?
   ├─ governance?
   ├─ accessControl?
   ├─ whitelistEnabled?
   ├─ freezeable?
   └─ transactionFee > 0?
   ↓
   [Select Template]
   ├─ advanced_token.hbs (if any advanced feature)
   └─ simple_token.hbs (if all basic)
   ↓
   [Handlebars Compilation]
   ├─ Read template file
   ├─ Compile with contractData variables
   └─ Generate Rust code
   ↓
   [Write to Disk]
   ├─ Create tralala/dynamic-contracts/{name}/
   ├─ Write Cargo.toml
   └─ Write src/lib.rs
   ↓
   [Async Background Process]
   ├─ cargo build --target wasm32-unknown-unknown --release
   ├─ soroban contract optimize --wasm [path]
   ├─ Save metadata to tralala/compiled/{id}.json
   └─ (Optional) stellar contract deploy --wasm [path] --network testnet
   ↓
   [Return Progress URL]
   └─ GET /api/compilation-progress/{contractId}
   ↓
FRONTEND
   ↓
   [Poll Progress]
   ├─ compiling (10%)
   ├─ checking (50%)
   ├─ optimizing (60%)
   ├─ saving (75%)
   ├─ deploying (80%)
   └─ completed (100%)
   ↓
USER SEES STATUS + CONTRACT ADDRESS
```

---

## Code Generation Decision Tree

```
START: User submits contractData
│
├─ Check features.stakeable
├─ Check features.governance
├─ Check features.accessControl
├─ Check security.whitelistEnabled
├─ Check security.freezeable
└─ Check economics.transactionFee > 0
│
├─ ANY TRUE?
│  ├─ YES → Use advanced_token.hbs (683 lines, 30+ functions)
│  └─ NO  → Use simple_token.hbs (238 lines, core functions)
│
↓ Handlebars compilation
│
├─ Render storage keys
├─ Render error enum
├─ Render helper functions
├─ Render core functions (initialize, name, symbol, etc.)
├─ Render feature-specific functions
└─ Render metadata comments
│
↓ Write to disk
│
├─ Create directory structure
├─ Generate Cargo.toml from template
├─ Write rendered Rust code to src/lib.rs
└─ Register in workspace Cargo.toml
│
↓ Compile
│
├─ cargo build → WASM binary
├─ soroban optimize → Reduced size
└─ Save metadata JSON
```

---

## Key Variables in Handlebars Templates

### Basic Configuration
```handlebars
{{contract_name}}      - Struct name for contract
{{token_name}}         - Full name of token
{{token_symbol}}       - Token symbol (e.g., "MTK")
{{token_decimals}}     - Decimal places
{{initial_supply}}     - Supply at initialization
{{admin_address}}      - Admin wallet address
```

### Feature Flags
```handlebars
{{#if mint_enabled}}...{{/if}}
{{#if burn_enabled}}...{{/if}}
{{#if pausable_enabled}}...{{/if}}
{{#if upgrade_enabled}}...{{/if}}
{{#if access_control_enabled}}...{{/if}}
{{#if features.stakeable}}...{{/if}}
{{#if features.governance}}...{{/if}}
{{#if features.timeLock}}...{{/if}}
```

### Security & Economics
```handlebars
{{#if security.freezeable}}...{{/if}}
{{#if security.whitelistEnabled}}...{{/if}}
{{security.transferLimit}}           - Max transfer amount
{{economics.transactionFee}}         - Fee percentage
{{economics.burnRate}}               - Burn percentage
{{economics.stakingReward}}          - Staking reward %
{{timeLockDays}}                     - Timelock duration
```

---

## RustGenerator Block Types (40+)

### Categories
- **Contract**: 5 methods (init, metadata, name, owner, description)
- **State Variables**: 6 methods (variable, map, event)
- **Functions**: 4 methods (declaration, parameter, return)
- **Control Flow**: 5 methods (if/else, while, for, comparison, logical)
- **Operations**: 5 methods (arithmetic, assignment, increment)
- **Stellar**: 3 methods (transfer, payment, require_auth)
- **Token**: 3 methods (init, mint, burn)
- **Security**: 2 methods (require_condition, access_control)
- **Literals**: 3 methods (number, string, boolean)

---

## Common Customization Points

### To Add a New Feature
1. Create conditional block in template: `{{#if feature_name}}`
2. Add feature flag to contractData in backend
3. Add storage keys inside conditional
4. Add functions inside conditional
5. Update template selection logic if needed
6. Test with both simple and advanced templates

### To Add a New Block Type
1. Define in blockly-templates.js: `Blockly.Blocks['block_name']`
2. Add case in TokenCodeGenerator.extractConfig()
3. Optionally add handler in RustGenerator: `block_[name](block)`
4. Add to client.js toolbox definition
5. Test code generation

### To Create a New Template Version
1. Copy existing template to new file (e.g., `enterprise_token.hbs`)
2. Modify Handlebars conditional sections
3. Update template selection logic in server.js
4. Test with cargo build
5. Document variables and features

---

## Troubleshooting Quick Tips

| Problem | Solution |
|---------|----------|
| Template not rendering | Check Handlebars variable names match exactly |
| Compilation timeout | Increase timeout in server.js line 518 |
| WASM not generated | Check Cargo.toml crate-type = ["cdylib"] |
| Feature not including | Verify boolean flag is exactly true (not string "true") |
| Storage key collision | Use unique prefixes for different features |
| Block not recognized | Check block type in extractConfig() switch statement |

---

## Important Constants

```javascript
// server.js
PORT = 3000
TESTNET_URL = "https://horizon-testnet.stellar.org"
WASM_TARGET = "wasm32-unknown-unknown"
COMPILE_TIMEOUT = 600000 (ms) = 10 minutes
MAX_TOKEN_CODE = 12 characters
DECIMALS_RANGE = 0-18

// Rust workspace
SOROBAN_SDK_VERSION = "23.0.1"
PROFILE_OPT_LEVEL = 2
LTO = "thin"
```

---

## API Endpoints

```
POST /api/build-smart-contract
├─ Input: contractData, userAddress
├─ Returns: contractId, progressUrl
└─ Async: Background compilation starts

GET /api/compilation-progress/:compilationId
├─ Returns: status, progress%, message
└─ Long-polling until completed

Other endpoints in server.js (may vary):
POST /api/deploy-contract
POST /api/interact-contract
GET /api/user-contracts/:address
```

---

## Template Statistics

**Total Feature Combinations**: 2^15 = 32,768+ possible contracts

**Most Common**:
- Basic token (no features): simple_token.hbs
- Token + Pausable: simple_token.hbs (with pausable_enabled=true)
- Enterprise token: advanced_token.hbs

**Largest Template**: advanced_token.hbs (683 lines, supports 30+ functions)

**Smallest Template**: stellar_token_contract_v23.hbs (164 lines, focused on TokenUtils)

