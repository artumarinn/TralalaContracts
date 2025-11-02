# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tralalero Contracts** is a visual smart contract builder for Stellar that uses a kid-friendly block interface to generate Soroban Rust contracts. Users can connect their wallets, configure contracts using Blockly-style blocks, and deploy to the Stellar testnet.

### Tech Stack
- **Backend**: Node.js/Express
- **Frontend**: HTML5, CSS, JavaScript (Blockly for visual programming)
- **Blockchain**: Stellar SDK, Soroban contracts (Rust)
- **Smart Contracts**: Rust with Soroban SDK

## Project Structure

```
root/
├── server.js                    # Express backend (main application logic)
├── package.json                 # Node dependencies
├── public/                      # Frontend static files
│   ├── index.html              # Main UI page
│   ├── stepper-client.js        # Step-by-step wizard logic
│   ├── client.js                # Blockly interface & block definitions
│   ├── contract-interface.html  # Alternative contract config interface
│   └── style.css                # UI styling
├── templates/                   # Handlebars templates
│   └── stellar_token_contract.hbs  # Token contract template
└── tralala/                     # Rust Soroban project
    ├── Cargo.toml               # Rust workspace config
    ├── contracts/               # Base contract templates
    │   ├── hello-world/         # Example contract
    │   └── token-templates/     # Token contract templates (simple & advanced)
    └── dynamic-contracts/       # Generated user contracts (UUIDs)
```

## Core Architecture

### 1. Frontend Flow (3-4 Step Stepper)

**Step 1: Wallet Connection** (`stepper-client.js:5-25`)
- Connect via Freighter, xBull, or Albedo wallets
- Verify Stellar testnet access
- Store wallet address in `appState.walletAddress`

**Step 2: Contract Configuration** (`stepper-client.js:64-80`)
- User chooses between:
  - **Block-based approach** (`client.js`): Blockly visual editor for advanced contracts
  - **Form-based approach** (`stepper-client.js`): Direct token configuration
- Stores contract data in `appState.tokenData`

**Step 3: Smart Contract Setup**
- Configure token properties (name, symbol, decimals, supply)
- Select features (mintable, burnable, pausable, etc.)
- Set security/economics parameters

**Step 4: Deploy**
- Generate contract code from template
- Compile Rust code
- Deploy to Stellar testnet

### 2. Backend Endpoints (`server.js`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/generate-code` | POST | Generate Rust contract from Handlebars template |
| `/api/build-transaction` | POST | Create Stellar transaction for token creation |
| `/api/build-smart-contract` | POST | Generate advanced smart contract with custom features |
| `/api/compile-contract` | POST | Compile generated Rust contract |
| `/api/deploy-contract` | POST | Deploy contract to Stellar |
| `/api/interact-contract` | POST | Call contract functions |
| `/api/contract-state/:contractAddress` | GET | Query contract state |
| `/api/contract-history/:contractAddress` | GET | Get contract transaction history |
| `/api/user-balance/:userAddress/:assetCode/:assetIssuer` | GET | Check user balance |
| `/api/user-contracts/:userAddress` | GET | List user's deployed contracts |

### 3. Smart Contract Generation Pipeline

1. **Template Selection** (`server.js:316`)
   - Detects advanced features (staking, governance, whitelist, etc.)
   - Chooses between `simple_token.hbs` or `advanced_token.hbs`

2. **Contract Generation** (`server.js:257-376`)
   - Creates unique directory: `tralala/dynamic-contracts/{symbol}_{type}_{uuid}/`
   - Generates `Cargo.toml` and `src/lib.rs` from template
   - Includes deployment helper code

3. **Compilation** (`server.js:591-748`)
   - Runs `cargo build --release --target wasm32-unknown-unknown`
   - Outputs WASM binary for Soroban deployment

4. **Deployment** (`server.js:749-833`)
   - Creates Soroban contract on Stellar testnet
   - Handles fund management and account setup
   - Returns contract address and transaction hash

### 4. Blockly Integration (`client.js`)

Block categories and types:
- **🚀 Empezar** (Start): Contract initialization
- **🎨 Propiedades** (Properties): Contract name, version, admin address
- **📋 Variables** (State): Define state variables with types
- **⚙️ Funciones** (Functions): Define contract functions
- **📍 Reglas** (Rules): Add contract rules/logic
- **🔥 Poderes** (Powers): Advanced features
- **🤖 Avanzado** (Advanced): Complex operations

## Common Commands

### Development
```bash
npm install              # Install dependencies
npm start               # Start Express server (port 3000)
node test-stellar.js    # Test Stellar SDK connection
node test-smart-contracts.js  # Test contract generation
```

### Rust/Soroban
```bash
cd tralala
cargo build --release --target wasm32-unknown-unknown  # Compile contracts
cargo test              # Run contract tests
```

### Testing
```bash
node error-handling-tests.js      # Test error handling
node test-blocks.html             # Visual block testing (browser)
```

## Key Technical Patterns

### 1. Form Data Handling
- User input flows through `appState` object (`stepper-client.js:5-25`)
- Token data validated before submission to backend
- Asset code: max 12 characters, uppercase alphanumeric only (`server.js:66-72`)

### 2. Handlebars Templating
- Contract templates use Handlebars syntax for dynamic code generation
- Templates located in `templates/` and `tralala/contracts/token-templates/`
- Variables injected from `templateData` object (`server.js:264-306`)

### 3. Stellar SDK Integration
- Hardcoded to **TESTNET** (`server.js:17-19`)
- Uses `@stellar/stellar-sdk` package (v11.3.0+)
- Account funding via Friendbot for testnet (commented in code)
- Transaction building follows Stellar protocol v15+

### 4. File System Organization
- Dynamic contracts use UUID-based naming for uniqueness
- Each contract gets isolated directory under `tralala/dynamic-contracts/`
- Cargo workspace structure allows parallel compilation

## Important Configuration

### Network Settings
- **Network**: Stellar TESTNET (hardcoded, not configurable)
- **Horizon Server**: `https://horizon-testnet.stellar.org`
- **Network Passphrase**: `StellarTestNetwork ; September 2015` (from SDK)

### Validation Rules
- Token code: 1-12 uppercase alphanumeric characters
- Amount: Must be positive number
- User address: Required for all transactions
- Admin address: Defaults to user wallet or specified account

### Template Features
Advanced features require special flags:
- `mint_enabled`, `burn_enabled`, `pausable_enabled`
- `upgrade_enabled`, `access_control_enabled`
- `stakeable`, `governance`, `timeLock`
- Security: transfer limits, whitelist, freeze capabilities
- Economics: transaction fees, burn rates, staking rewards

## Common Workflows

### Adding a New Contract Feature
1. Update block definition in `client.js` (add new Blockly.Blocks entry)
2. Add corresponding Handlebars template variables
3. Extend `templateData` in `/api/build-smart-contract` endpoint
4. Update contract template in `tralala/contracts/token-templates/`
5. Test via `/api/build-smart-contract` endpoint

### Debugging Contract Generation
- Check console logs in `server.js` (prefixed with 🔧, 📝, etc.)
- Inspect generated files in `tralala/dynamic-contracts/{contract-name}/`
- Review `Cargo.toml` and `src/lib.rs` for correctness

### Testing a New Contract
- Use `cargo test` in the contract directory
- Check compilation: `cargo build --release --target wasm32-unknown-unknown`
- Deploy via `/api/deploy-contract` endpoint to testnet

## Error Handling

- All endpoints return JSON with `success`, `error`, and optional `details` fields
- Validation errors thrown before database operations
- Stellar SDK errors provide detailed Horizon response data
- Check browser console for frontend errors during development

## Security Notes

- Private keys for signing generated dynamically (never persisted except in response)
- User addresses validated before transaction building
- No authentication/authorization layer (testnet-only, non-production)
- Wallet connection handled client-side via wallet browser extension
- Contract code is user-controlled and unsigned (testnet)
