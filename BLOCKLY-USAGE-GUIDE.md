# Guía de Uso: Editor de Bloques Mejorado

## 🎯 Introducción

El editor de bloques ahora genera **código Rust compilable completo** sin placeholders ni TODOs. Esta guía te enseña cómo usar el nuevo sistema paso a paso.

---

## 📋 Paso 1: Acceder al Editor de Bloques

1. Abre `http://localhost:3000` (o tu URL de Tralalero Contracts)
2. Conecta tu wallet (Freighter, xBull, etc.)
3. Ve al **Paso 2: Configurar con Bloques**

---

## 🪙 Paso 2: Configurar Propiedades del Token

### Bloque: Token Properties

**Ubicación:** Categoría `🪙 Token` en el toolbox

**Campos:**
- **nombre:** Nombre del token (ej: "MyToken")
- **símbolo:** Código de 1-12 caracteres (ej: "MTK")
- **decimales:** Número de decimales (recomendado: 6-18)
- **supply inicial:** Cantidad inicial de tokens (ej: 1000000)

**Ejemplo:**
```
🪙 Token Properties
  nombre: MyAwesomeToken
  símbolo: MAT
  decimales: 6
  supply inicial: 1000000
```

### Bloque: Admin Config

**Ubicación:** Categoría `🪙 Token`

**Campo:**
- **admin:** Dirección Stellar de quien controla el contrato

**Ejemplo:**
```
🔐 Admin Address
  admin: GBQQHZKDUU43GWXE4ZZQTV3BQCL3I3ZZIQABKMLX4PQVFKZQ7E4OZWMK
```

---

## ✨ Paso 3: Seleccionar Características

**Ubicación:** Categoría `✨ Características`

Marca (TRUE) las características que deseas:

### ✨ Mintable
- **Permite:** Crear nuevos tokens después del deploy
- **Función generada:** `mint(to, amount)`
- **Requisito:** Solo el admin puede mintear

**Usa si:**
- Quieres inflación controlada
- Necesitas recompensar a usuarios
- Tu token debe crecer en supply

### 🔥 Burnable
- **Permite:** Quemar (destruir) tokens existentes
- **Función generada:** `burn(amount)`
- **Requisito:** Cualquiera puede quemar sus propios tokens

**Usa si:**
- Quieres deflación
- Necesitas mecanismo de escasez
- Tienes staking con recompensas

### ⏸️ Pausable
- **Permite:** Pausar todas las transferencias
- **Funciones generadas:** `pause()`, `unpause()`, `is_paused()`
- **Requisito:** Solo el admin puede pausar

**Usa si:**
- Necesitas emergencias o circuit breaker
- Detectas vulnerabilidades
- Necesitas upgrades sin código nuevo

---

## ⚙️ Paso 4: Seleccionar Funciones

**Ubicación:** Categoría `⚙️ Funciones`

Cada función que selecciones se incluirá en el código generado:

### ⚙️ transfer_function
Transfiere tokens de una cuenta a otra.

**Parámetros generados:**
```rust
pub fn transfer(env: Env, from: Address, to: Address, amount: i128)
```

**Validaciones incluidas:**
- ✅ Verifica autenticación del remitente
- ✅ Verifica saldo suficiente
- ✅ Si está pausable: verifica que no esté pausado
- ✅ Actualiza balances correctamente

### ⚙️ balance_function
Consulta el saldo de una cuenta.

**Parámetros generados:**
```rust
pub fn balance(env: Env, id: Address) -> i128
```

**Retorna:** Saldo de la cuenta (0 si no existe)

### ⚙️ mint_function
Crea nuevos tokens (requiere feature mintable).

**Parámetros generados:**
```rust
pub fn mint(env: Env, to: Address, amount: i128)
```

**Validaciones incluidas:**
- ✅ Solo el admin puede mintear
- ✅ Si está pausable: verifica que no esté pausado
- ✅ Aumenta balance del destinatario
- ✅ Aumenta total supply

### ⚙️ burn_function
Quema tokens (requiere feature burnable).

**Parámetros generados:**
```rust
pub fn burn(env: Env, from: Address, amount: i128)
```

**Validaciones incluidas:**
- ✅ Verifica autenticación
- ✅ Verifica saldo suficiente
- ✅ Si está pausable: verifica que no esté pausado
- ✅ Reduce balance
- ✅ Reduce total supply

---

## 🎨 Paso 5: Ordenar los Bloques

**Flujo recomendado:**
1. Arrastra `🔮 Mi Smart Contract` (bloque principal)
2. Conecta `🪙 Token Properties` dentro
3. Conecta `🔐 Admin Config` después
4. Añade características: `✨ Mintable`, `🔥 Burnable`, `⏸️ Pausable`
5. Añade funciones: `⚙️ transfer`, `⚙️ balance`, etc.

**Visualización:**
```
🔮 Mi Smart Contract
  ├── 🪙 Token Properties
  │   └── nombre: MyToken
  │   └── símbolo: MTK
  │   └── decimales: 6
  │   └── supply: 1000000
  │
  ├── 🔐 Admin Config
  │   └── admin: GBQQHZ...
  │
  ├── ✨ Mintable [TRUE]
  │
  ├── 🔥 Burnable [TRUE]
  │
  ├── ⏸️ Pausable [TRUE]
  │
  ├── ⚙️ transfer_function
  ├── ⚙️ balance_function
  ├── ⚙️ mint_function
  └── ⚙️ burn_function
```

---

## 📋 Paso 6: Revisar Código Generado

**Ubicación:** Paso 3 - Configuración Avanzada

### ¿Qué buscar?

✅ **Debe incluir:**
- `#![no_std]` - Declaración de no estándar
- `use soroban_sdk::...` - Imports correctos
- `#[contract]` - Decorador de contrato
- `pub fn initialize(...)` - Constructor
- Tus funciones seleccionadas
- Validaciones (require_auth, checks de pausa, etc.)

❌ **NO debe incluir:**
- `// TODO` - Placeholders incompletos
- `panic!("not implemented")` - Funciones sin implementar
- Errores de sintaxis Rust

### Ejemplo de código correcto:
```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol, symbol_short};

const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
// ... más constantes ...

#[contract]
pub struct MyTokenContract;

#[contractimpl]
impl MyTokenContract {
    pub fn initialize(env: Env, admin: Address, ...) {
        // Constructor implementado correctamente
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        // Función completamente implementada
        from.require_auth();
        // ... lógica completa ...
    }

    // Más funciones ...
}
```

---

## 🚀 Paso 7: Desplegar Contrato

### Opción A: Deploy Automático (Recomendado)

1. Ve a **Paso 4: Revisar y Desplegar**
2. Verifica la configuración
3. Haz clic en **"Desplegar en Testnet"**
4. Autoriza en tu wallet

### Opción B: Compilar Localmente

Si quieres compilar antes:

```bash
cd tralala
cargo build --release --target wasm32-unknown-unknown
```

**Requisitos:**
- Rust instalado (https://rustup.rs/)
- Soroban CLI: `cargo install soroban-cli`

---

## 🧪 Ejemplos de Configuración

### Ejemplo 1: Token Simple (Sin Mint)

```
Configuración:
  Nombre: SimpleToken
  Símbolo: SMP
  Decimals: 6
  Supply: 1000000

Características:
  Mintable: FALSE
  Burnable: FALSE
  Pausable: FALSE

Funciones:
  transfer ✓
  balance ✓
```

**Resultado:** Token básico, solo transferencias.

---

### Ejemplo 2: Token Controlado

```
Configuración:
  Nombre: ControlledToken
  Símbolo: CTL
  Decimals: 8
  Supply: 5000000

Características:
  Mintable: TRUE
  Burnable: TRUE
  Pausable: TRUE

Funciones:
  transfer ✓
  balance ✓
  mint ✓
  burn ✓
```

**Resultado:** Token con control total del admin (puedocrear, quemar, pausar).

---

### Ejemplo 3: Token Deflacionario

```
Configuración:
  Nombre: DeflatToken
  Símbolo: DFL
  Decimals: 6
  Supply: 10000000

Características:
  Mintable: FALSE  (no más inflación)
  Burnable: TRUE   (quema mecánica)
  Pausable: FALSE  (no se para)

Funciones:
  transfer ✓
  balance ✓
  burn ✓
```

**Resultado:** Token que solo disminuye en cantidad (deflacionario).

---

## ⚠️ Validaciones Automáticas

El sistema valida automáticamente:

| Validación | Descripción | Fix |
|-----------|-------------|-----|
| Nombre del token | Debe estar presente | Añade Token Properties |
| Admin address | Debe empezar con G | Verifica dirección Stellar |
| Símbolo | 1-12 caracteres | Usa código válido |
| Decimales | 0-18 | Usa rango válido |
| Supply inicial | > 0 | Pon cantidad válida |

**Indicador:** Se mostrará "✅ Configuración válida" cuando todo esté correcto.

---

## 🔒 Seguridad

### Automáticamente Incluido:

✅ **require_auth()** en funciones sensibles
- transfer: Requiere auth del remitente
- mint: Requiere auth del admin
- burn: Requiere auth del propietario

✅ **Validaciones de Cantidad**
- No permite cantidades <= 0
- Verifica saldo antes de transferir
- Verifica supply antes de quemar

✅ **Pausable**
- Si está habilitado, todas las operaciones verifican paused flag
- Admin puede pausar/reanudar

---

## 📞 Solución de Problemas

### Problema: "Falta el bloque principal"

**Causa:** No arrastraste `🔮 Mi Smart Contract`

**Solución:**
1. Ve a categoría `🚀 Empezar`
2. Arrastra `🔮 Mi Smart Contract`
3. Conecta otros bloques dentro

---

### Problema: "La dirección del administrador no está configurada"

**Causa:** El bloque admin está vacío

**Solución:**
1. Busca el bloque `🔐 Admin Config`
2. Ingresa tu dirección Stellar (comienza con G)
3. Ej: `GBQQHZKDUU43GWXE4ZZQTV3BQCL3...`

---

### Problema: "El código generado tiene TODO"

**Causa:** No estás usando los nuevos bloques

**Solución:**
1. Asegúrate de usar bloques de `✨ Características`
2. Verifica que tengas bloques en `⚙️ Funciones`
3. Haz click en "🔄 Actualizar" vista previa

---

### Problema: "Deploy falla"

**Causas comunes:**
1. Wallet no está en testnet
2. Dirección admin inválida
3. Nombre del token duplicado

**Solución:**
1. Verifica que Freighter esté en testnet
2. Usa dirección Stellar válida
3. Prueba con nombre diferente

---

## 📚 Recursos

- **Soroban Docs:** https://soroban.stellar.org/docs
- **Stellar SDK:** https://developers.stellar.org/
- **Blockly Docs:** https://developers.google.com/blockly

---

## ✨ Conclusión

¡Ahora tienes un sistema completo para generar smart contracts sin escribir código Rust! Los bloques han sido diseñados para ser:

- **Intuitivos:** Cada bloque tiene un propósito claro
- **Seguros:** Incluyen validaciones automáticas
- **Compilables:** Código listo para deployment
- **Extensibles:** Fácil agregar más funcionalidades

Happy building! 🚀

