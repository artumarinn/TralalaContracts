# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tralalero Contracts** is an educational web application for creating and deploying Stellar blockchain smart contracts without coding knowledge. It uses a visual Blockly-based interface to generate Soroban Rust contracts that compile to WebAssembly and deploy to Stellar Testnet.

The application follows a **stepper workflow**: wallet connection → template selection → visual configuration → review & deploy.

## Development Commands

### Running the Application

```bash
npm install                 # Install dependencies
npm start                   # Production mode (PORT 3000)
npm run dev                 # Development mode (PORT 3002)
npm run dev:3001           # Development mode (PORT 3001)
npm run dev:3003           # Development mode (PORT 3003)
```

### Testing

```bash
node test-blockly-templates.js  # Test Blockly template definitions
```

### Building Contracts

Contracts are built automatically during the API request flow, but you can manually compile a contract with:

```bash
cd tralala/dynamic-contracts/{contractName}
cargo build --target wasm32-unknown-unknown --release
```

### Cargo Workspace

The `tralala/` directory is a Rust workspace that manages all contract compilation:

```bash
cd tralala
cargo build --target wasm32-unknown-unknown --release  # Build all contracts
cargo build --package {symbol}_{id} --target wasm32-unknown-unknown --release  # Build specific contract
```

## Architecture Overview

### High-Level Flow

```
User UI (Stepper)
    ↓
Blockly Visual Programming
    ↓
Backend API (/api/build-smart-contract)
    ↓
Contract Code Generation (Handlebars Template)
    ↓
Async Cargo Compilation to WASM
    ↓
Contract Optimization & Storage
    ↓
Stellar Blockchain Deployment
```

### Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Backend** | Express.js (Node.js) | Handles API requests and contract generation |
| **Frontend** | Vanilla JavaScript + Blockly | Visual block-based contract editor |
| **Blockchain** | Stellar SDK 11.3.0 | Transaction building and Horizon API |
| **Smart Contracts** | Rust + Soroban SDK 23.0.1 | Contract implementation compiled to WASM |
| **Templating** | Handlebars | Blockly config → Rust code generation |
| **Wallet Integration** | Freighter/xBull | User authentication and transaction signing |

### Key Directories

- **`public/`** - Frontend assets and JavaScript modules
  - `index.html` - Main 87KB stepper interface
  - `stepper-client.js` - Stepper flow and wallet integration
  - `blockly-templates.js` - Block definitions for contract creation
  - `rust-generator.js` - Converts blocks to Rust code
  - `client.js` - Blockly workspace management and theming

- **`server.js`** - Express backend (1,340 lines)
  - Handles contract generation and compilation
  - Manages file system operations for dynamic contracts
  - Exposes REST API endpoints for contract interaction

- **`templates/`** - Handlebars contract templates
  - `stellar_token_contract.hbs` - Template for token generation

- **`tralala/`** - Rust/Soroban workspace
  - `contracts/hello-world/` - Example contract
  - `dynamic-contracts/` - Generated contracts (one directory per contract)
  - `compiled/` - Output contract metadata (JSON files)

### Contract Generation Pipeline

1. **User Configuration**: User selects template and configures via Blockly blocks
2. **Blockly Serialization**: Block configuration is serialized to JSON
3. **Code Generation**: Backend generates Rust contract from Handlebars template + config
4. **Directory Creation**: Creates unique directory `tralala/dynamic-contracts/{symbol}_{id}/`
5. **Cargo Build**: Spawns async `cargo build` process to compile to WASM
6. **Progress Tracking**: Frontend polls `/api/compilation-progress/{id}` for status
7. **Storage**: Compiled metadata saved to `tralala/compiled/{contractId}.json`
8. **Deployment**: Contract ready for user deployment to Stellar blockchain

### API Endpoints

Key endpoints for contract operations:

- `POST /api/build-smart-contract` - Generate and compile contract asynchronously
- `GET /api/compilation-progress/:id` - Monitor compilation progress
- `POST /api/deploy-contract` - Deploy contract to Stellar Testnet
- `POST /api/interact-contract` - Call contract methods
- `GET /api/user-contracts/:address` - List user's deployed contracts

See `server.js` for full endpoint documentation.

### Network Configuration

The application is **hardcoded for Stellar Testnet**:
- Horizon Server: `https://horizon-testnet.stellar.org`
- Network: `StellarSdk.Networks.TESTNET`

There is no environment-based network switching.

### Frontend State Management

- Global `appState` object tracks user progress through stepper
- Blockly workspace persisted in browser localStorage
- Contract configuration stored as JSON serialization

### Blockly Customization

- Theme: Custom "tralalerotheme" with Zelos base
- Color-coded block categories:
  - Purple: Start/setup blocks
  - Blue: Property/configuration blocks
  - Purple: Rules/behavior blocks
  - Orange: Powers/advanced features
  - Pink: Advanced options

Block definitions located in `blockly-templates.js` and `blocks-definitions.js`.

## Important Implementation Details

### Contract File Structure

When a contract is generated, the following files are created:

```
tralala/dynamic-contracts/{symbol}_{id}/
├── Cargo.toml                    # Package configuration
├── src/
│   ├── lib.rs                    # Main contract code (generated from template)
│   └── deploy.rs                 # Deployment helper (if needed)
└── target/
    └── wasm32-unknown-unknown/
        └── release/
            └── {symbol}_{id}.wasm  # Compiled WebAssembly binary
```

### Handlebars Template Variables

Templates use conditional blocks for feature flags:

```handlebars
{{#if feature_name}}
// Feature-specific code
{{/if}}
```

Common variables:
- `name` - Contract name
- `symbol` - Token symbol (max 12 chars, uppercase + numbers)
- `initial_supply` - Initial token supply
- `decimals` - Token decimal places
- Feature flags: `mintable`, `burnable`, `pausable`, `governance`, etc.

### Compilation and Optimization

1. **Cargo Compilation**: Outputs WASM to `target/wasm32-unknown-unknown/release/`
2. **Soroban Optimization** (optional): Reduces binary size with `soroban contract optimize`
3. **Storage**: Metadata and source stored in `tralala/compiled/`

### Error Handling in Backend

- Input validation for token codes (12 char limit, uppercase + numbers only)
- Account verification via Horizon API
- Compilation errors captured and returned to frontend
- Progress tracking allows recovery from failed builds

## Common Development Tasks

### Adding a New Block Type

1. Define block in `blockly-templates.js` or `blocks-definitions.js`
2. Add color category to theme in `client.js`
3. Add code generation logic to `rust-generator.js`
4. Update Handlebars template variables if needed

### Creating a New Contract Template

1. Create `.hbs` file in `templates/` or `tralala/contracts/token-templates/`
2. Use conditional blocks for optional features: `{{#if feature}} ... {{/if}}`
3. Register template in backend contract generation logic
4. Update Blockly blocks to configure new template variables

### Debugging Contract Compilation

Check the compilation progress via:
```bash
# Frontend automatically polls this
GET /api/compilation-progress/{compilationId}
```

Or manually check compilation output:
```bash
cd tralala/dynamic-contracts/{contractName}
cat target/debug/build/*/output  # Check build output
```

### Adding a New API Endpoint

1. Add route in `server.js`
2. Handle Stellar SDK operations (if blockchain interaction needed)
3. Use proper error handling and logging
4. Return JSON responses with clear error messages

## Configuration & Constants

### Important Constants in `server.js`

- `PORT`: Default 3000 (override with `PORT` environment variable)
- `TESTNET_URL`: Hardcoded to Stellar Testnet
- Contract output directory: `tralala/compiled/` and `tralala/dynamic-contracts/`

### Dependencies (see `package.json`)

- `@stellar/stellar-sdk@^11.3.0` - Stellar network interaction
- `express@^4.19.2` - Web framework
- `handlebars@^4.7.8` - Template rendering
- `body-parser@^1.20.2` - Request parsing (now part of express.json())
- `fs-extra@^11.2.0` - File system operations
- `uuid@^9.0.1` - Unique ID generation
- `dotenv@^16.4.5` - Environment configuration (currently commented out)

### Rust Dependencies (see `tralala/Cargo.toml`)

- `soroban-sdk@23.0.1` - Soroban smart contract framework
- Release profile optimized for WASM: `opt-level=2`, `lto=thin`, `strip=symbols`

## Notes for Future Development

1. **No Build Step**: Frontend is plain JavaScript - no webpack/bundler used
2. **Testnet Only**: Network is hardcoded - changing to mainnet requires code modification
3. **Async Compilation**: Long-running builds use background tasks with progress polling
4. **File-Based Storage**: Contracts stored on filesystem under version control
5. **Handlebars Caching**: Backend caches compiled templates for performance
6. **Blockly Persistence**: Uses browser localStorage for workspace state
7. **UUID Generation**: Each contract gets a unique ID via uuid v4 for directory naming

## Security Considerations

- User wallets are never stored - only Freighter/xBull extensions handle signing
- Token codes validated strictly (12 char max, uppercase + numbers)
- Account existence verified via Horizon API before transactions
- No private keys handled server-side
- WASM contracts run in Stellar's sandboxed environment
