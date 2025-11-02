# 🚀 Tralalero Contracts - Smart Command Router

**Quick Navigation**: Find the RIGHT command for YOUR task in seconds.

---

## 🎯 Find Your Command by What You Need

### 💻 "I'm Writing/Testing Code"

| Task | Command | Why |
|------|---------|-----|
| Write a Soroban contract | `/soroban-helper` | Rust patterns, SDK examples, best practices |
| Check security before deploy | `/security-checklist` | Pre-deployment audit checklist |
| Debug a contract issue | `/debug-testing` | Testing strategies + debugging tips |
| Set up development environment | `/dev-workflow` | Complete setup guide + daily workflow |

### 🚀 "I'm Deploying"

| Task | Command | Why |
|------|---------|-----|
| Full deployment guide | `/deploy-helper` | Step-by-step deployment workflow |
| Deploy via CLI | `/stellar-cli-full` | All CLI deployment commands |
| Verify deployment works | `/debug-testing` | Testing deployed contracts |

### 🎨 "I'm Building the Interface"

| Task | Command | Why |
|------|---------|-----|
| Add/modify Blockly blocks | `/blockly-helper` | Block definitions, categories, themes |
| Add new contract feature | `/dev-workflow` | Feature workflow from start to deploy |

### 📚 "I'm Learning Stellar"

| Task | Command | Why |
|------|---------|-----|
| Understand Stellar CLI | `/stellar-cli` | Quick reference for common commands |
| Deep dive into CLI | `/stellar-cli-full` | Complete reference with all flags |
| Learn Soroban patterns | `/soroban-helper` | SDK usage, patterns, examples |

### 🆘 "I'm Stuck"

| Problem | Command | Why |
|---------|---------|-----|
| Code won't compile | `/soroban-helper` + `/dev-workflow` | Rust patterns + troubleshooting |
| Deployment failed | `/deploy-helper` + `/debug-testing` | Deployment steps + debugging |
| Test is failing | `/debug-testing` + `/soroban-helper` | Test strategies + contract patterns |
| Security concerns | `/security-checklist` | Vulnerability audit |
| Don't know where to start | `/dev-workflow` | Overview of entire process |

---

## 📋 Complete Command Reference

### 1. `/stellar-cli` - Stellar CLI Quick Reference
**Speed**: ⚡ Quick | **Depth**: Medium | **Size**: ~110 lines

Quick lookup for common Stellar CLI commands. Start here if you just need syntax.

**Key Sections**:
- Installation (3 methods)
- Smart contract deployment
- Account & key management
- Network configuration
- Soroban-specific commands

**Ask me about**: `How do I...? [deploy/invoke/extend/configure]`

---

### 2. `/stellar-cli-full` - Complete Stellar CLI 2025 Reference
**Speed**: 📚 Comprehensive | **Depth**: Very Deep | **Size**: ~450 lines

Everything about Stellar CLI. Use this when `/stellar-cli` doesn't have enough detail.

**Key Sections**:
- Complete installation guide
- ALL contract commands with flags
- Network & identity management
- Transaction building
- Troubleshooting guide
- 2025 updates

**Ask me about**: `Show me [all commands / detailed examples / troubleshooting]`

---

### 3. `/soroban-helper` - Soroban Contract Patterns & SDK
**Speed**: 📖 Learning | **Depth**: Very Deep | **Size**: ~220 lines

Rust patterns, SDK usage, and examples for writing Soroban contracts.

**Key Sections**:
- Contract structure & SDK basics
- Mintable, burnable, pausable patterns
- Staking & governance patterns
- Access control patterns
- Error handling
- Performance tips
- Best practices

**Ask me about**: `Show me [pattern / example / how to implement]`

---

### 4. `/deploy-helper` - Deployment Workflow & Verification
**Speed**: 🚀 Practical | **Depth**: Deep | **Size**: ~300 lines

Complete guide to deploying contracts and verifying they work.

**Key Sections**:
- Step-by-step deployment workflow
- Backend API endpoints
- Manual CLI deployment
- Testing deployed contracts
- Verifying on-chain state
- Debugging deployment issues
- Funding & gas management

**Ask me about**: `How do I [deploy / test / verify]?`

---

### 5. `/security-checklist` - Pre-Deployment Security Audit ⭐ NEW
**Speed**: ✓ Checklist | **Depth**: Medium | **Size**: ~350 lines

CRITICAL: Run through this BEFORE deploying any contract to mainnet.

**Key Sections**:
- 5-minute quick security audit
- 7 common Soroban vulnerabilities
- Secure code examples
- Testing checklist
- Pre-deployment checklist
- How to use this guide

**Ask me about**: `Check [contract / architecture / specific vulnerability]`

---

### 6. `/blockly-helper` - Visual Interface & Block Development
**Speed**: 🎨 Practical | **Depth**: Very Deep | **Size**: ~350 lines

Build, modify, and customize Blockly blocks for visual contract development.

**Key Sections**:
- Block definition templates
- Block categories & styling
- Code generation
- Blockly events & listeners
- Theme customization
- Adding new block types (step-by-step)
- Integration tips

**Ask me about**: `How do I [add block / customize / debug block issue]?`

---

### 7. `/debug-testing` - Testing Strategies & Debugging
**Speed**: 🔧 Hands-on | **Depth**: Deep | **Size**: ~350 lines

Test your code and debug issues effectively.

**Key Sections**:
- Testing endpoints with curl
- Common test scenarios
- Blockly interface testing
- Browser DevTools debugging
- Server log inspection
- Contract file inspection
- Performance testing
- Regression checklist

**Ask me about**: `How do I [test / debug / verify]?`

---

### 8. `/dev-workflow` - Setup, Daily Workflow, Best Practices
**Speed**: 📋 Comprehensive | **Depth**: Very Deep | **Size**: ~450 lines

Everything from initial setup to daily development practices.

**Key Sections**:
- Complete environment setup
- Daily development workflow
- Adding new features (step-by-step)
- Modifying frontend
- Testing strategies
- Troubleshooting guide
- Git best practices
- Code review checklist

**Ask me about**: `Walk me through [setup / workflow / adding feature]`

---

## 💡 Command Chaining Examples

### Scenario 1: Deploying Your First Contract

```
1. /dev-workflow → Complete setup
2. /soroban-helper → Write contract
3. /security-checklist → Verify security
4. /deploy-helper → Deploy
5. /debug-testing → Verify it works
```

### Scenario 2: Adding a New Feature

```
1. /soroban-helper → Learn pattern
2. /blockly-helper → Add visual block
3. /dev-workflow → Integration steps
4. /debug-testing → Test it
5. /security-checklist → Verify safety
```

### Scenario 3: Debugging a Failed Deployment

```
1. /debug-testing → Find the issue
2. /soroban-helper → Fix contract logic
3. /deploy-helper → Re-deploy
4. /debug-testing → Verify fix
```

### Scenario 4: Pre-Launch Security Check

```
1. /security-checklist → Run audit
2. /soroban-helper → Fix issues
3. /debug-testing → Comprehensive tests
4. /deploy-helper → Final deployment
```

---

## 🚀 How to Use These Commands

### Format
```
/command-name Your question here
```

### Examples
```
/soroban-helper Show me a token contract pattern
/deploy-helper What's the full deployment workflow?
/security-checklist How do I check for vulnerabilities?
/debug-testing How do I test an endpoint?
/blockly-helper How do I add a new block type?
```

### Tips
1. **Be specific**: Include what you're building or debugging
2. **Follow chains**: Use related commands together
3. **Ask for examples**: All commands have code examples
4. **Request explanations**: Commands explain the "why"

---

## 📚 Related Documentation

- **CLAUDE.md** - High-level architecture & configuration
- **AGENTS_AND_COMMANDS.md** - Overview of all agents/commands
- **AGENTS_SKILLS_EVALUATION.md** - System health & recommendations
- **.claude/skills/** - Knowledge bases for stellar-contract-expert

---

## 🔗 External Resources

- [Stellar Documentation](https://developers.stellar.org/docs)
- [Soroban SDK Docs](https://soroban.stellar.org/docs)
- [Blockly Developer Guide](https://developers.google.com/blockly)
- [Stellar CLI Reference](https://developers.stellar.org/docs/tools/cli)
- [OpenZeppelin Stellar](https://docs.openzeppelin.com/stellar-contracts)

---

## ✨ Pro Tips

1. **Most common workflow**: `/dev-workflow` → `/soroban-helper` → `/security-checklist` → `/deploy-helper`
2. **Get stuck?** Start with `/debug-testing` to identify the problem
3. **Before mainnet**: ALWAYS run through `/security-checklist`
4. **Learning Rust/Soroban?** Go: `/soroban-helper` → `/debug-testing` → try something → ask questions
5. **Command not enough?** Ask follow-up questions in the same context

---

**Last Updated**: November 2, 2025
**Commands**: 8 (including `/security-checklist` ⭐ NEW)
**Agent**: `stellar-contract-expert`
**Status**: Optimized & Ready
