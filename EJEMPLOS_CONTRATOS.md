# 📚 Ejemplos de Smart Contracts - Tralalero Contracts

Guía completa de ejemplos funcionales que puedes construir usando Tralalero Contracts. Cada ejemplo incluye instrucciones paso a paso y el código Rust esperado.

---

## 📑 Índice de Ejemplos

1. [Ejemplo 1: Token ERC20 Simple](#ejemplo-1-token-erc20-simple)
2. [Ejemplo 2: Token con Mint/Burn](#ejemplo-2-token-con-mintburn)
3. [Ejemplo 3: Sistema de Votación](#ejemplo-3-sistema-de-votación)
4. [Ejemplo 4: Crowdfunding](#ejemplo-4-crowdfunding)
5. [Ejemplo 5: RWA - Certificado de Propiedad](#ejemplo-5-rwa---certificado-de-propiedad)
6. [Ejemplo 6: Sistema de Staking](#ejemplo-6-sistema-de-staking)

---

## Ejemplo 1: Token ERC20 Simple

### Descripción
Un token básico que permite transferencias entre cuentas, con balance tracking y límites de aprobación.

### Bloques Necesarios

```
🔮 Mi Smart Contract
├── 📝 Nombre: MySimpleToken
├── 🔢 Versión: 1.0.0
├── 🔑 Administrador: Gxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
├── 📦 Variable: balances (MAP)
├── 📦 Variable: total_supply (I128) = 1000000
├── 📦 Variable: decimals (I128) = 6
│
├── ⚙️ Función: initialize()
│   └── 💰 Token: Inicializar Token
│
├── ⚙️ Función: transfer(to, amount)
│   ├── 🔐 Require: require_auth(sender)
│   ├── 💰 Token: Transferir(from, to, amount)
│   └── ↩️ Retornar: true
│
├── ⚙️ Función: balance_of(account)
│   ├── 💰 Token: Balance(account)
│   └── ↩️ Retornar: balance
│
└── ⚙️ Función: approve(spender, amount)
    └── ✅ Token: Allowance(owner, spender, amount)
```

### Código Rust Esperado

```rust
#![no_std]

use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, symbol_short};

const ADMIN: &str = "Gxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const TOTAL_SUPPLY: Symbol = symbol_short!("TOTAL_SUP");
const DECIMALS: Symbol = symbol_short!("DECIMALS");

#[contract]
pub struct SmartContract;

#[contractimpl]
impl SmartContract {
    pub fn initialize(env: Env) {
        let admin = Address::from_account_id(&env, ADMIN);
        env.storage().instance().set(&TOTAL_SUPPLY, &1000000i128);
        env.storage().instance().set(&DECIMALS, &6i128);
    }

    pub fn transfer(env: Env, to: Address, amount: i128) -> bool {
        let sender = env.invoker();
        sender.require_auth();

        // Get balances map
        let balances_key = symbol_short!("BALANCS");
        let mut balances = env.storage()
            .instance()
            .get::<Symbol, std::collections::HashMap<Address, i128>>(&balances_key)
            .unwrap_or_default();

        // Transfer logic
        let from_balance = balances.get(&sender).copied().unwrap_or(0);
        if from_balance < amount {
            return false;
        }

        balances.insert(sender.clone(), from_balance - amount);
        let to_balance = balances.get(&to).copied().unwrap_or(0);
        balances.insert(to.clone(), to_balance + amount);

        env.storage().instance().set(&balances_key, &balances);
        true
    }

    pub fn balance_of(env: Env, account: Address) -> i128 {
        let balances_key = symbol_short!("BALANCS");
        let balances = env.storage()
            .instance()
            .get::<Symbol, std::collections::HashMap<Address, i128>>(&balances_key)
            .unwrap_or_default();

        balances.get(&account).copied().unwrap_or(0)
    }

    pub fn approve(env: Env, spender: Address, amount: i128) -> bool {
        env.invoker().require_auth();

        let allowances_key = symbol_short!("ALLOWANS");
        let mut allowances = env.storage()
            .instance()
            .get::<Symbol, std::collections::HashMap<(Address, Address), i128>>(&allowances_key)
            .unwrap_or_default();

        allowances.insert((env.invoker(), spender), amount);
        env.storage().instance().set(&allowances_key, &allowances);
        true
    }
}
```

### Pasos para Construir

1. Arrastra "🔮 Mi Smart Contract" al workspace
2. Conécta "📝 Nombre del Contrato" → "MySimpleToken"
3. Conécta "🔢 Versión" → "1.0.0"
4. Conécta "🔑 Administrador" → tu dirección de wallet
5. Agrega variables de estado:
   - `balances` (MAP)
   - `total_supply` (I128) con valor inicial 1000000
   - `decimals` (I128) con valor inicial 6
6. Crea 4 funciones:
   - `initialize()` con bloque Token: Inicializar
   - `transfer(to, amount)` con validación
   - `balance_of(account)` que retorna el balance
   - `approve(spender, amount)` para aprobaciones

---

## Ejemplo 2: Token con Mint/Burn

### Descripción
Token con capacidad de acuñación y quemado de tokens, controlado por el administrador.

### Bloques Necesarios

```
🔮 Mi Smart Contract
├── 📝 Nombre: BurnableToken
├── 🔢 Versión: 1.0.0
├── 🔑 Administrador: Gxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
├── 📦 Variable: total_supply (I128) = 0
├── 📦 Variable: owner (ADDRESS)
│
├── ⚙️ Función: mint(to, amount)
│   ├── 🔐 Access Control: require_admin()
│   ├── 💰 Token: Acuñar(to, amount)
│   ├── 🔢 Operación: total_supply += amount
│   └── ↩️ Retornar: true
│
├── ⚙️ Función: burn(from, amount)
│   ├── 🔐 Require: require_auth(from)
│   ├── 💰 Token: Quemar(from, amount)
│   ├── 🔢 Operación: total_supply -= amount
│   └── ↩️ Retornar: true
│
└── ⚙️ Función: total_supply()
    └── ↩️ Retornar: total_supply
```

### Características Principales

- **Mint**: Solo el administrador puede crear nuevos tokens
- **Burn**: Cualquier usuario puede quemar sus propios tokens
- **Total Supply**: Rastreo automático del suministro total
- **Seguridad**: Control de acceso basado en roles

---

## Ejemplo 3: Sistema de Votación

### Descripción
Contrato que permite crear propuestas y que los token holders voten sobre ellas.

### Bloques Necesarios

```
🔮 Mi Smart Contract
├── 📝 Nombre: VotingContract
├── 🔢 Versión: 1.0.0
├── 🔑 Administrador: Gxxxxxxx...
├── 📦 Variable: proposals (MAP)
├── 📦 Variable: votes (MAP)
├── 📦 Variable: proposal_count (I128) = 0
│
├── ⚙️ Función: create_proposal(title, description)
│   ├── 🔐 Require: require_auth()
│   ├── 🔢 Operación: proposal_count++
│   ├── 📢 Evento: ProposalCreated
│   └── ↩️ Retornar: proposal_count
│
├── ⚙️ Función: vote(proposal_id, vote_type)
│   ├── 🔐 Require: require_auth()
│   ├── 🧠 Lógica: if vote_type == APPROVE
│   │   └── 💰 Token: Quemar tokens de votación
│   ├── 📢 Evento: VoteCasted
│   └── ↩️ Retornar: true
│
└── ⚙️ Función: get_proposal(proposal_id)
    ├── 🔐 Lógica: verificar existencia
    └── ↩️ Retornar: proposal data
```

### Funcionalidades

- Crear propuestas con descripción
- Votar en propuestas activas
- Rastrear votos y resultados
- Eventos para cada acción importante

---

## Ejemplo 4: Crowdfunding

### Descripción
Sistema de recaudación de fondos donde los inversores contribuyen XLM y reciben tokens de participación.

### Bloques Necesarios

```
🔮 Mi Smart Contract
├── 📝 Nombre: CrowdfundingContract
├── 🔢 Versión: 1.0.0
├── 🔑 Administrador: Gxxxxxxx...
├── 📦 Variable: goal_amount (I128) = 10000000000  // 1000 XLM
├── 📦 Variable: raised_amount (I128) = 0
├── 📦 Variable: contributions (MAP)
├── 📦 Variable: is_closed (BOOL) = false
│
├── ⚙️ Función: contribute(amount)
│   ├── 🔐 Require: require_auth()
│   ├── ⭐ Stellar: stellar_payment(amount)
│   ├── 🔢 Operación: raised_amount += amount
│   ├── 💰 Token: Acuñar participación tokens
│   ├── 📢 Evento: ContributionMade
│   └── ↩️ Retornar: true
│
├── ⚙️ Función: finalize()
│   ├── 🔐 Access Control: require_admin()
│   ├── 🧠 Lógica: if raised_amount >= goal_amount
│   │   └── 📢 Evento: FundingGoalReached
│   ├── 🔢 Operación: is_closed = true
│   └── ↩️ Retornar: true
│
└── ⚙️ Función: check_status()
    ├── ↩️ Retornar: {goal, raised, status}
```

### Características

- Aceptar contribuciones en XLM
- Calcular tokens de participación
- Rastrear objetivo y progreso
- Finalizar campaña cuando se alcanza meta

---

## Ejemplo 5: RWA - Certificado de Propiedad

### Descripción
Representa la propiedad de un activo real (propiedad, vehículo, etc.) mediante un smart contract.

### Bloques Necesarios

```
🔮 Mi Smart Contract
├── 📝 Nombre: PropertyCertificate
├── 🔢 Versión: 1.0.0
├── 🔑 Administrador: Gxxxxxxx...
├── 📦 Variable: owner (ADDRESS)
├── 📦 Variable: property_data (MAP)
│
├── 🏢 RWA: Definir Asset
│   ├── Nombre: RealProperty
│   ├── ISIN: US1234567890
│   ├── Emisor: Property Authority
│   └── Precio: 500000000  // $500,000
│
├── ⚙️ Función: register_property(address, location, value)
│   ├── 🔐 Access Control: require_admin()
│   ├── 🏢 RWA: register_custody(address)
│   ├── 📦 Variable: store property details
│   └── 📢 Evento: PropertyRegistered
│
├── ⚙️ Función: transfer_ownership(new_owner)
│   ├── 🔐 Require: require_auth(current_owner)
│   ├── 🏢 RWA: settlement(old_owner, new_owner)
│   ├── 📢 Evento: OwnershipTransferred
│   └── ↩️ Retornar: true
│
└── ⚙️ Función: get_property_info()
    ├── 🏢 RWA: compliance_check(account)
    └── ↩️ Retornar: property details
```

### Características RWA

- Representación inmutable de propiedad
- Transferencias supervisadas y auditables
- Verificación de cumplimiento KYC
- Liquidación automática de transacciones
- Custodia verificada

---

## Ejemplo 6: Sistema de Staking

### Descripción
Usuarios bloquean sus tokens para ganar recompensas durante un período determinado.

### Bloques Necesarios

```
🔮 Mi Smart Contract
├── 📝 Nombre: StakingContract
├── 🔢 Versión: 1.0.0
├── 🔑 Administrador: Gxxxxxxx...
├── 📦 Variable: stakes (MAP)
├── 📦 Variable: lock_period (I128) = 604800  // 7 days
├── 📦 Variable: reward_rate (I128) = 5  // 5% APY
├── 📦 Variable: total_staked (I128) = 0
│
├── ⚙️ Función: stake(amount, duration)
│   ├── 🔐 Require: require_auth()
│   ├── 💰 Token: Quemar(staker, amount)
│   ├── 🔢 Operación: total_staked += amount
│   ├── 📦 Variable: store stake info
│   ├── 📢 Evento: Staked
│   └── ↩️ Retornar: true
│
├── ⚙️ Función: claim_rewards()
│   ├── 🔐 Require: require_auth()
│   ├── 🧠 Lógica: if lock_period expired
│   ├── 🔢 Operación: calculate reward amount
│   ├── 💰 Token: Acuñar reward tokens
│   ├── 📢 Evento: RewardsClaimed
│   └── ↩️ Retornar: reward_amount
│
├── ⚙️ Función: unstake()
│   ├── 🔐 Require: require_auth()
│   ├── 🧠 Lógica: verify lock period complete
│   ├── 💰 Token: Acuñar tokens originales
│   ├── 📢 Evento: Unstaked
│   └── ↩️ Retornar: amount
│
└── ⚙️ Función: get_stake_info(account)
    └── ↩️ Retornar: {amount, locked_until, rewards}
```

### Características

- Bloqueo de tokens por período definido
- Cálculo automático de recompensas
- Desbloqueo controlado por tiempo
- Múltiples depósitos por usuario
- Rastreo de recompensas acumuladas

---

## 🎯 Casos de Uso por Industria

### Fintech
- ✅ Stablecoins
- ✅ Payment tokens
- ✅ Lending protocols
- ✅ Swap/DEX contracts

### Real World Assets (RWA)
- ✅ Property tokenization
- ✅ Commodity certificates
- ✅ Invoice financing
- ✅ Securities issuance

### Gaming & Metaverse
- ✅ In-game currencies
- ✅ NFT minting contracts
- ✅ Reward systems
- ✅ Governance tokens

### Supply Chain
- ✅ Product tracking
- ✅ Certification records
- ✅ Logistics coordination
- ✅ Authenticity verification

---

## 🧪 Testing Guidelines

Para cada contrato creado, verifica:

### 1. Validación ✅
```
- ✓ Nombre válido
- ✓ Versión correcta (X.Y.Z)
- ✓ Admin configurado
- ✓ Al menos una función
- ✓ Variables con tipos válidos
```

### 2. Funcionalidad
```
- ✓ Código compila sin errores
- ✓ Todas las funciones se generan
- ✓ Eventos se registran correctamente
- ✓ Lógica de seguridad presente
```

### 3. Seguridad
```
- ✓ require_auth() en funciones sensibles
- ✓ Access control para admin
- ✓ Validación de parámetros
- ✓ Control de overflow/underflow
```

### 4. Integración Stellar
```
- ✓ Importes correctos
- ✓ Tipos Soroban usados
- ✓ SDK version compatible
- ✓ Compatible con testnet
```

---

## 💾 Próximos Pasos

1. **Construye el contrato** usando los bloques
2. **Valida** haciendo clic en "Validar"
3. **Revisa el código** en la vista previa
4. **Guarda el proyecto** para referencia futura
5. **Despliega a Testnet** cuando esté listo
6. **Prueba las funciones** usando Stellar Laboratory

---

## 📞 Soporte y Recursos

- [Documentación Soroban](https://soroban.stellar.org/docs)
- [Stellar SDK Rust](https://docs.rs/soroban-sdk/)
- [Ejemplos en GitHub](https://github.com/stellar/soroban-examples)
- [Stellar Laboratory](https://laboratory.stellar.org/)

---

**¡Feliz construcción de smart contracts! 🚀**
