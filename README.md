# Tralalero Contracts

**Web3 without code. For students, by sharks.**

A visual, educational web application for creating and deploying Stellar blockchain smart contracts without writing a single line of code. Built with Blockly visual interface and Soroban Rust contracts.

---

## 🎯 Project Overview

Tralalero Contracts democratizes smart contract development by providing an intuitive, block-based interface for students and developers of all skill levels to create production-ready Soroban contracts. No coding experience required.

### Key Features

- **Visual Contract Builder**: Drag-and-drop Blockly interface for contract creation
- **Instant Compilation**: Precompiled WASM templates (~100ms response time)
- **One-Click Deployment**: Deploy contracts directly to Stellar Testnet
- **Professional Templates**: Token contracts with mint, burn, pause, and access control
- **Wallet Integration**: Freighter/xBull wallet support for transaction signing
- **Blockchain Verification**: Stellar Explorer integration for transparency

### Workflow

```
Wallet Connection → Template Selection → Visual Configuration (Blockly)
  → Compile → Deploy to Stellar → Verify on Explorer
```

---

## 👥 Team

| Name | Role | Expertise |
|------|------|-----------|
| **Ticiana Angelucci** | Blockchain Developer | Blockchain & Smart Contracts |
| **Matías Boldrini** | UX & Product Engineering | Frontend & Product Design |
| **Arturo Marín** | Blockchain & ML Developer | Smart Contracts & AI/ML |
| **Leo Cagliero** | Financial & Management Strategy | Web3 Strategy & Business |

---

## 🏗️ Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Vercel/Local - port 3000/3002)                   │
│ - Blockly visual contract builder                           │
│ - Wallet connection (Freighter/xBull)                      │
│ - Contract configuration interface                          │
└────────────────┬────────────────────────────────────────────┘
                 │ POST /api/compile-contract
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (Railway/Local - port 3001)                         │
│ - Loads precompiled WASM templates                         │
│ - Manages contract deployment to Stellar                   │
│ - Handles blockchain interactions                          │
└────────────────┬────────────────────────────────────────────┘
                 │ response: {wasmBase64, contractId}
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ STELLAR NETWORK                                             │
│ - Upload WASM to Soroban                                   │
│ - Deploy contract instances                                │
│ - Testnet by default                                       │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Benefits

| Metric | Value | Benefit |
|--------|-------|---------|
| Compilation time | <100ms | Instant feedback |
| WASM retrieval | 1 request | No build overhead |
| Vercel compatibility | ✅ | Works with 15s timeout |
| User wait time | ~3-5s | Fast deployment |

### Directory Structure

```
.
├── public/                          # Frontend assets
│   ├── index.html                   # Main app (87KB stepper interface)
│   ├── blockly-templates.js         # Block definitions & Blockly config
│   ├── stepper-client.js            # Stepper workflow & wallet integration
│   ├── rust-generator.js            # Block-to-Rust code generation
│   └── client.js                    # Blockly workspace management
│
├── backend/                         # Node.js Express backend
│   ├── api.js                       # REST API endpoints
│   ├── compiled/                    # Precompiled WASM templates
│   │   ├── token_basic.wasm         # Basic token (5.0 KB)
│   │   └── token_advanced.wasm      # Advanced token (5.8 KB)
│   └── package.json
│
├── tralala/                         # Rust/Soroban workspace
│   ├── Cargo.toml                   # Workspace configuration
│   ├── contracts/
│   │   ├── token_template_basic/    # Source: basic template
│   │   ├── token_template_advanced/ # Source: advanced template
│   │   └── hello-world/             # Example contract
│   │
│   ├── dynamic-contracts/           # Generated contracts (per user)
│   │   └── {symbol}_{id}/
│   │       ├── Cargo.toml
│   │       ├── src/
│   │       │   └── lib.rs           # Generated Rust code
│   │       └── target/wasm32-unknown-unknown/release/
│   │           └── {symbol}_{id}.wasm
│   │
│   └── compiled/                    # Metadata for deployed contracts
│       └── {contractId}.json
│
├── templates/                       # Handlebars contract templates
│   └── stellar_token_contract.hbs
│
├── server.js                        # Legacy server (port 3000)
├── package.json                     # Frontend/legacy dependencies
└── CLAUDE.md                        # Development guide
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ with npm
- Rust toolchain (for contract compilation)
- Stellar wallet: [Freighter](https://freighter.app/) or [xBull](https://xbull.app/)

### Installation

#### 1. Backend Setup (Must run first)

```bash
cd backend
npm install
npm start
# Backend running on http://localhost:3001
```

#### 2. Frontend Setup (New terminal)

```bash
# From root directory
npm install
npm start
# Frontend running on http://localhost:3000
# OR for port 3002:
npm run dev
```

#### 3. Environment Variables (Optional)

Create `.env` in root:
```bash
BACKEND_URL=http://localhost:3001  # Default location
PORT=3000                           # Frontend port
USE_BACKEND=true                    # Use precompiled (default)
```

### Quick Test

1. Open `http://localhost:3000` (or 3002)
2. Connect wallet (Freighter)
3. Select template (token_basic)
4. Configure contract
5. Deploy to Stellar Testnet

---

## 📚 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Vanilla JavaScript + Blockly | Latest |
| **Backend** | Express.js (Node.js) | 4.19.2 |
| **Blockchain** | Stellar SDK | 14.3.2 |
| **Smart Contracts** | Rust + Soroban SDK | 23.0.1 |
| **Templating** | Handlebars | 4.7.8 |
| **Build Tool** | Cargo (Rust) | Latest |
| **Target** | WebAssembly (WASM) | wasm32-unknown-unknown |

---

## 🔌 API Endpoints

### Backend API (Port 3001)

#### Health Check
```http
GET /api/health
```
Response: `200 OK`

#### List Templates
```http
GET /api/templates
```
Response:
```json
{
  "templates": [
    {"id": "token_basic", "name": "Basic Token", "size": "5.0 KB"},
    {"id": "token_advanced", "name": "Advanced Token", "size": "5.8 KB"}
  ]
}
```

#### Compile Contract
```http
POST /api/compile-contract
Content-Type: application/json

{
  "templateType": "token_basic",
  "config": {
    "name": "My Token",
    "symbol": "MYTKN",
    "decimals": 7,
    "initialSupply": 1000000
  }
}
```

Response:
```json
{
  "success": true,
  "contractId": "abc123...",
  "wasmBase64": "AGFzbQEAAAA...",
  "wasmSize": 5120,
  "compiledAt": "2025-11-23T12:00:00Z",
  "templateType": "token_basic"
}
```

#### Deploy Contract
```http
POST /api/deploy-contract
Content-Type: application/json

{
  "wasmBase64": "AGFzbQEAAAA...",
  "userAddress": "GXXXXXX...",
  "contractData": {
    "name": "My Token",
    "symbol": "MYTKN"
  }
}
```

Response:
```json
{
  "success": true,
  "contractId": "CXXXXX...",
  "wasmId": "56a96e51...",
  "network": "Stellar Testnet",
  "explorerUrl": "https://stellar.expert/explorer/testnet/contract/CXXXXX..."
}
```

---

## 🧩 Blockly Blocks

Professional, documented blocks for contract creation:

1. **🔷 Token Configuration** - Name, symbol, decimals, initial supply
2. **✨ Mintable Feature** - Enable token creation (admin-only)
3. **🔥 Burnable Feature** - Enable token destruction
4. **⏸️ Pausable Feature** - Emergency freeze capability
5. **🔐 Admin Address** - Privileged access control
6. **📤 Transfer Function** - Peer-to-peer transfers
7. **💰 Balance Function** - Query account balances
8. **⚒️ Mint Function** - Create tokens (admin-only)
9. **🔥 Burn Function** - Destroy tokens

Each block includes:
- ✅ Comprehensive tooltips (200-300 characters)
- ✅ JSDoc documentation
- ✅ Field descriptions
- ✅ Use case examples
- ✅ Security warnings
- ✅ Links to Soroban documentation

---

## 📦 Contract Templates

### Precompiled Templates

#### token_basic
- **Size**: 5.0 KB WASM
- **Features**:
  - Token transfer
  - Balance queries
  - Admin configuration
- **Source**: `tralala/contracts/token_template_basic/`

#### token_advanced
- **Size**: 5.8 KB WASM
- **Features**:
  - Mint (create tokens)
  - Burn (destroy tokens)
  - Pause (freeze contract)
  - Access control
  - Admin management
- **Source**: `tralala/contracts/token_template_advanced/`

### Template Variables (Handlebars)

```handlebars
{{name}}              # Contract name
{{symbol}}            # Token symbol (max 12 chars)
{{decimals}}          # Decimal places
{{initial_supply}}    # Initial supply amount
{{#if mintable}}      # Conditional: mint feature
{{#if burnable}}      # Conditional: burn feature
{{#if pausable}}      # Conditional: pause feature
```

---

## 🔨 Development Tasks

### Running Locally

**Terminal 1 - Backend**
```bash
cd backend
npm install  # First time only
npm start    # Port 3001
```

**Terminal 2 - Frontend**
```bash
npm install  # First time only
npm start    # Port 3000
# OR
npm run dev  # Port 3002
```

### Building Contracts

#### Automatic (via API)
The backend automatically serves precompiled WASM for templates.

#### Manual Compilation
```bash
cd tralala
cargo build --target wasm32-unknown-unknown --release
```

#### Optimize Contract
```bash
soroban contract optimize --wasm target/wasm32-unknown-unknown/release/*.wasm
```

### Testing

Run Blockly template tests:
```bash
node test-blockly-templates.js
```

### Adding a New Block

1. Define block in `public/blockly-templates.js`
2. Add color category to theme in `public/client.js`
3. Add code generation logic to `public/rust-generator.js`
4. Update Handlebars template if needed

### Creating a New Template

1. Create `.hbs` file in `tralala/contracts/token-templates/`
2. Use Handlebars conditionals for optional features
3. Register in backend contract generation logic
4. Precompile WASM and add to `backend/compiled/`
5. Update Blockly blocks to configure template variables

---

## 🌐 Network Configuration

**Current Configuration**: Stellar Testnet (hardcoded)

- **Horizon Server**: `https://horizon-testnet.stellar.org`
- **Network**: `StellarSdk.Networks.TESTNET`
- **Soroban RPC**: Testnet endpoint
- **Wallet Signers**: Freighter/xBull extensions

### Contract Verification

All deployed contracts are verified on:
```
https://stellar.expert/explorer/testnet/contract/{contractId}
```

---

## 🔐 Security Considerations

- **Wallet Security**: User wallets never stored server-side
  - Signing handled by Freighter/xBull extensions
  - Private keys never leave user's browser
- **Token Validation**: Strict validation (12 char max, uppercase + numbers)
- **Account Verification**: Horizon API verification before transactions
- **WASM Sandbox**: Contracts run in Stellar's secured environment
- **No Private Key Storage**: All keys managed by wallet extensions

---

## 📊 Performance

| Metric | Target | Achieved |
|--------|--------|----------|
| Compilation time | <1s | 100ms |
| Template load time | <5s | <3-5s |
| WASM retrieval | <100ms | ~100ms |
| Deployment confirmation | <30s | Variable (network dependent) |

---

## 🚨 Known Issues

### SDK Version Compatibility (CRITICAL)

**Status**: Under investigation

**Issue**: Stellar SDK v12.3.0 (browser) incompatible with Protocol 24
- Browser SDK doesn't recognize new XDR enum values
- Testnet upgraded to Protocol 24 (Oct 2025)
- Deployment blocked at transaction preparation step

**Affected Files**:
- `public/index.html:340` - CDN script tag
- `public/contract-interface.html:529` - CDN script tag

**Solution**: Upgrade to Stellar SDK v14.3.2 (already in Node.js)

**Workaround**: Implement local SDK serving (in progress)

---

## 📝 Development Commands

```bash
# Frontend development
npm install              # Install dependencies
npm start               # Start on port 3000
npm run dev             # Start on port 3002

# Backend development
cd backend
npm install             # Install dependencies
npm start               # Start on port 3001
npm run dev             # Same as start

# Contract development
cd tralala
cargo build --target wasm32-unknown-unknown --release
cargo test

# Testing
node test-blockly-templates.js
```

---

## 🔗 Useful Links

- [Stellar Docs](https://developers.stellar.org/)
- [Soroban Smart Contracts](https://soroban.stellar.org/)
- [Blockly Developer Guide](https://developers.google.com/blockly/guides/overview)
- [Freighter Wallet](https://freighter.app/)
- [Stellar Expert Explorer](https://stellar.expert/)

---

## 📧 Support & Feedback

For issues, feature requests, or feedback:

- **GitHub Issues**: [Report an issue](https://github.com/yourusername/tralalerocontracts/issues)
- **Documentation**: See `CLAUDE.md` for detailed development guide
- **Team**: Contact the Tralalero team

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎓 Educational Purpose

Tralalero Contracts is built specifically for educational purposes, making blockchain smart contract development accessible to students and newcomers without requiring deep technical knowledge.

**Learn more**: Visit our [website](https://tralalerocontracts.com) | Follow us on [Twitter](https://twitter.com/tralalero)

---

**Built with by the Tralalero Team**

*Web3 without code. For students, by sharks.*

Last updated: November 23, 2025
