# TRALALERO TEMPLATES - DOCUMENTATION INDEX

Welcome! This directory contains comprehensive documentation about the template system used to generate Soroban smart contracts in the Tralalero application.

## Quick Navigation

### For Developers New to Templates
Start here: **TEMPLATE_QUICK_REFERENCE.md**
- Visual diagrams and flowcharts
- Quick lookup tables
- Common customization points
- Troubleshooting guide

### For Deep Technical Understanding
Read: **TEMPLATE_ARCHITECTURE.md**
- Complete system architecture
- Line-by-line explanations
- All variables and functions documented
- API endpoint details

## What Are Templates?

The Tralalero Contracts application uses a **two-layer template system** to generate smart contracts:

1. **Blockly Layer**: Visual block-based interface for users
2. **Handlebars Layer**: Server-side template rendering to Rust code

Users drag blocks in Blockly → Configure token properties → Backend generates Rust contract → Compiles to WebAssembly → Deploys to Stellar

## Documentation Files

### TEMPLATE_ARCHITECTURE.md (934 lines, 29 KB)
**Comprehensive Technical Reference**

1. Blockly Template Definitions
   - 8 block types defined
   - TokenCodeGenerator object
   - extractConfig() and generateRustCode() methods

2. Rust Code Generator
   - RustGenerator class structure
   - 40+ block handler methods
   - Type mapping system
   - Current integration status

3. Handlebars Contract Templates
   - 4 template versions analyzed
   - stellar_token_contract.hbs (v1)
   - stellar_token_contract_v23.hbs (v2)
   - simple_token.hbs (v3)
   - advanced_token.hbs (v4) - Most comprehensive

4. Contract Types Available
   - Precompiled contracts
   - Dynamic contract generation
   - Naming conventions

5. Code Generation Pipeline
   - API endpoint details
   - Processing steps 1-13
   - Response structures
   - Status tracking

6. Rust Workspace Structure
   - Cargo.toml configuration
   - Workspace members
   - Compilation targets

7. Limitations and Issues
   - Templates limitations table
   - Code generation issues
   - Block definition issues

8. Template Selection Tree
   - Decision logic for template choice
   - Feature detection
   - Advanced vs. simple selection

9. Key Files Reference
   - 9 main files listed
   - Lines of code per file
   - Purpose of each

10. Summary Statistics
    - Block types count
    - Template versions
    - Features supported
    - Generation path

### TEMPLATE_QUICK_REFERENCE.md (346 lines, 10 KB)
**Developer Cheatsheet**

1. File Location Summary
   - Complete directory tree
   - File purposes
   - Organization

2. Block Types at a Glance
   - Token Properties block
   - Feature blocks (Mintable, Burnable, Pausable)
   - Admin Configuration
   - Function declarations

3. Template Comparison Matrix
   - 15 features compared across 4 templates
   - Line counts
   - Recommended use cases

4. Contract Generation Flow
   - Visual ASCII flowchart
   - Frontend and backend steps
   - Progress tracking

5. Code Generation Decision Tree
   - Feature detection logic
   - Template selection
   - Rendering process

6. Key Variables in Templates
   - Handlebars variables listed
   - Grouped by category
   - Usage examples

7. RustGenerator Block Types
   - 40+ methods categorized
   - 9 categories total
   - Purpose of each type

8. Customization Guide
   - How to add new feature
   - How to add new block
   - How to create new template

9. Troubleshooting Tips
   - Common problems and solutions
   - Quick fixes
   - Configuration tips

10. Important Constants
    - Port numbers
    - Timeout values
    - Version numbers
    - Limits and ranges

11. API Endpoints
    - POST /api/build-smart-contract
    - GET /api/compilation-progress
    - Other endpoints

12. Template Statistics
    - Feature combinations
    - Most common templates
    - Largest and smallest templates

## The 4 Template Versions

### v1: stellar_token_contract.hbs (238 lines)
**Basic Token**
- Manual balance tracking
- Simple error handling (panic!)
- Conditional pausable support
- Use case: Educational, simple tokens

### v2: stellar_token_contract_v23.hbs (164 lines)
**Improved with TokenUtils**
- Uses Soroban TokenUtils
- Proper error enum
- Transfer limit support
- Use case: Standard token implementation

### v3: simple_token.hbs (238 lines)
**Simplified**
- Basic features only
- Clean, understandable code
- Minimal dependencies
- Use case: Quick tokens, no advanced features

### v4: advanced_token.hbs (683 lines)
**Enterprise-Grade**
- 30+ optional functions
- 15+ feature flags
- Role-based access control
- Staking and governance
- Security features (freeze, whitelist)
- Economics (fees, burn rate, rewards)
- Use case: Production, complex requirements

## Key Concepts

### Template Selection Logic
```
IF any of these are enabled:
  - stakeable
  - governance
  - accessControl
  - whitelistEnabled
  - freezeable
  - transactionFee > 0
THEN use: advanced_token.hbs
ELSE use: simple_token.hbs
```

### Code Generation Path
```
Blockly UI
  ↓
Extract Config (TokenCodeGenerator.extractConfig)
  ↓
POST to Backend (/api/build-smart-contract)
  ↓
Select Template (simple vs. advanced)
  ↓
Handlebars Render
  ↓
Write Rust to Disk
  ↓
Cargo Build (async)
  ↓
WASM Binary
  ↓
Optional: Stellar Deployment
```

## Common Tasks

### I want to understand how a contract is generated
→ Read TEMPLATE_ARCHITECTURE.md Section 5 (Code Generation Pipeline)

### I need to add a new feature to contracts
→ Read TEMPLATE_QUICK_REFERENCE.md "Common Customization Points"

### I want to see all supported features
→ Check TEMPLATE_QUICK_REFERENCE.md "Template Comparison Matrix"

### I'm debugging template issues
→ See TEMPLATE_QUICK_REFERENCE.md "Troubleshooting Tips"

### I need to find a specific file
→ Check TEMPLATE_ARCHITECTURE.md Section 9 (Key Files Reference)

### I want to understand Blockly blocks
→ Read TEMPLATE_ARCHITECTURE.md Section 1 (Blockly Template Definitions)

### I need RustGenerator documentation
→ See TEMPLATE_ARCHITECTURE.md Section 2 (Rust Code Generator)

## Important Files to Know

**Frontend Code**:
- `/public/blockly-templates.js` - Block definitions and TokenCodeGenerator
- `/public/rust-generator.js` - RustGenerator class (40+ methods)
- `/public/client.js` - Blockly workspace management

**Backend Code**:
- `/server.js` - Express backend and Handlebars rendering

**Templates**:
- `/templates/stellar_token_contract.hbs` - v1 Basic
- `/tralala/contracts/token-templates/` - All 4 template versions

**Output**:
- `/tralala/dynamic-contracts/` - Generated contracts
- `/tralala/compiled/` - Contract metadata JSON

## Known Issues and Limitations

**Critical Issues**:
- RustGenerator defined but not integrated into main flow
- No event emission/contract logging
- Limited error type coverage

**High Priority**:
- Cannot compose complex logic with blocks
- All tokens follow same contract structure

**Medium Priority**:
- No supply cap for mintable tokens
- Possible storage key collisions
- Template caching may stale

## Feature Statistics

**Blocks**: 8 types
**Templates**: 4 versions
**Features**: 15+ major categories
**Possible Combinations**: 2^15 = 32,768+

**Supported Features**:
- Basic: Mint, Burn, Transfer, Balance
- Advanced: Pausable, Staking, Governance
- Security: Freezeable, Whitelist, Role-based Access
- Economics: Transaction Fees, Burn Rate, Staking Rewards

## Getting Help

**For quick answers**: Check TEMPLATE_QUICK_REFERENCE.md
**For detailed info**: Check TEMPLATE_ARCHITECTURE.md
**For troubleshooting**: See Troubleshooting Tips section
**For customization**: See Common Customization Points section

## Document Versions

Created: 2025-11-12
Last Updated: 2025-11-12
Format: Markdown
Total Documentation: 1,280 lines across 2 files

---

**Start Reading**:
1. New to templates? → TEMPLATE_QUICK_REFERENCE.md
2. Need details? → TEMPLATE_ARCHITECTURE.md
3. Have questions? → This file (search by topic)

