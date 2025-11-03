# 🚀 TRALALERO CONTRACTS - Guía del Usuario

## ¿Qué es Tralalero Contracts?

**Tralalero Contracts** es un constructor visual profesional de smart contracts inteligentes para la blockchain Stellar. Permite crear contratos complejos sin necesidad de escribir código Rust directamente, usando un sistema intuitivo de bloques visuales tipo Blockly.

---

## 📋 Características Principales

### ✅ 50+ Bloques Profesionales
Organizados en 10 categorías:
- 🚀 **Empezar**: Inicializar contrato
- 🎨 **Propiedades**: Nombre, versión, propietario, admin
- 📦 **Estado**: Variables, mapeos, eventos
- ⚙️ **Funciones**: Declaración y parámetros
- 🧠 **Lógica**: If/else, loops, comparadores
- 🔢 **Operaciones**: Aritmética, asignación
- ⭐ **Stellar**: Transferencias, pagos, trustlines
- 💰 **Token**: Mint, burn, transfer, balance
- 🏢 **RWA**: Assets, custody, settlement
- 🔐 **Seguridad**: Control de acceso, validaciones

### ✅ Generación Automática de Código Rust
- Conversión en tiempo real de bloques a código Rust válido
- Preview del código mientras diseñas
- Soporte para Soroban SDK

### ✅ Validación Profesional
- Verificación automática de estructura
- Detección de errores y advertencias
- Recomendaciones de mejores prácticas
- Información detallada sobre el contrato

### ✅ Gestión de Proyectos
- Guardar y cargar proyectos en localStorage
- Exportar/importar como JSON
- Hasta 10 proyectos simultáneos
- Historial de modificaciones

### ✅ Wallet Integration
- Conectar con Freighter
- Conectar con xBull
- Conectar con Albedo
- Soporte para Stellar Testnet

---

## 🎯 Flujo de Uso (4 Pasos)

### Paso 1: Conectar Wallet
1. Haz clic en **"Conectar Wallet"**
2. Elige tu wallet (Freighter, xBull o Albedo)
3. Autoriza la conexión en tu extensión
4. Verifica que estés en **Stellar Testnet**

**💡 Tip**: Necesitarás Freighter instalado. [Descárgalo aquí](https://freighter.app/)

### Paso 2: Construir tu Contrato con Bloques
1. Arrastra bloques desde la izquierda
2. Conéctalos para formar tu lógica
3. El preview de código se actualiza automáticamente
4. Puedes ver el código Rust generado en tiempo real

**Ejemplo básico:**
```
Mi Smart Contract
├── Nombre: MiToken
├── Versión: 1.0.0
├── Admin: Gxxxxxxx...
├── Variable: totalSupply (i128)
└── Función: transfer()
```

### Paso 3: Validar y Configurar
1. Haz clic en **"Validar"** para verificar tu contrato
2. Revisa errores, advertencias e información
3. Descarga o copia el código Rust si lo deseas
4. Continúa al siguiente paso

**Qué valida el sistema:**
- ✅ Nombre del contrato válido
- ✅ Versión semántica correcta
- ✅ Admin/Propietario configurado
- ✅ Al menos una función
- ✅ Variables de estado con tipos válidos
- ✅ Identificadores correctos
- ✅ Sin duplicados

### Paso 4: Revisar y Exportar
1. Ve el resumen completo de tu contrato
2. Descarga el código Rust compilado
3. Opcionalmente, despliega a Stellar Testnet
4. Recibe la dirección del contrato

---

## 🎨 Construyendo tu Primer Contrato

### Ejemplo: Token Simple

**Paso a paso:**

1. **Bloque de Inicio**: Arrastra "🔮 Mi Smart Contract"
2. **Nombre**: Conécta "📝 Nombre del Contrato" → `MiPrimerToken`
3. **Version**: Conécta "🔢 Versión" → `1.0.0`
4. **Admin**: Conécta "🔑 Administrador" → tu dirección de wallet
5. **Variables**: Conécta "📦 Variable de estado" → `totalSupply` (i128)
6. **Función**: Conécta "⚙️ Función" → `transfer()` (VOID)

**Resultado:**
```rust
#![no_std]

use soroban_sdk::{contract, contractimpl, Address, Env};

const ADMIN: &str = "Gxxxxxxx...";
const TOTAL_SUPPLY: Symbol = symbol_short!("TOTAL_SUP");

#[contract]
pub struct SmartContract;

#[contractimpl]
impl SmartContract {
    pub fn initialize(env: Env, admin: Address) {
        // Inicialización automática
    }

    pub fn transfer(env: Env) {
        // TODO: Implementar transferencia
    }
}
```

---

## 💾 Gestión de Proyectos

### Guardar un Proyecto
1. Presiona **Ctrl+S** o abre el menú de proyectos
2. Dale un nombre descriptivo (ej: "Token ERC20")
3. Se guarda automáticamente en localStorage

### Cargar un Proyecto
1. Haz clic en el icono de **📁 Proyectos**
2. Selecciona un proyecto de la lista
3. Haz clic en **"Cargar"**
4. Tu contrato se recarga en el editor

### Exportar Proyecto
1. En la lista de proyectos, haz clic en **"Exportar"**
2. Se descarga un archivo JSON
3. Puedes compartirlo o guardarlo

### Importar Proyecto
1. Arrastra un archivo JSON al editor
2. O selecciona "Importar" en el menú
3. El proyecto se carga automáticamente

---

## 🔍 Validación y Errores

### Tipos de Mensajes

**❌ Errores**
- Impiden que continúes
- Ejemplos:
  - "El nombre del contrato es requerido"
  - "Variable 'contador': nombre duplicado"
  - "Función debe tener al menos un parámetro"

**⚠️ Advertencias**
- No impiden continuar, pero deberías revisar
- Ejemplos:
  - "Considera agregar una descripción"
  - "El contrato no tiene seguridad"
  - "Versión debería seguir X.Y.Z"

**ℹ️ Información**
- Datos sobre tu contrato
- Ejemplos:
  - "✅ Nombre del contrato válido"
  - "✅ 3 variable(s) de estado"
  - "✅ Integración Stellar detectada"

### Cómo Arreglar Errores

| Error | Solución |
|-------|----------|
| "nombre del contrato es requerido" | Arrastra "📝 Nombre del Contrato" |
| "tipo inválido" | Usa tipos válidos: i32, i128, bool, String, Address |
| "nombre duplicado" | Usa nombres únicos para variables |
| "identificador inválido" | Usa letras, números y guiones bajos |

---

## 🛠️ Bloques por Categoría

### 🎨 Propiedades
```
📝 Nombre del Contrato → "MiContrato"
🔢 Versión → "1.0.0"
👤 Propietario → "Gxxxxxxx..."
🔑 Administrador → "Gxxxxxxx..."
📖 Descripción → "Mi primer smart contract"
```

### 📦 Estado
```
📦 Variable: nombre(tipo) = valor_inicial
🗺️ Mapeo: clave→valor
📢 Evento: EventoName
🔹 Parámetro: param(tipo)
```

### ⚙️ Funciones
```
⚙️ Función: nombre() → tipo_retorno
🔹 Parámetro: param(tipo)
↩️ Retornar: valor
```

### 💰 Token
```
🪙 Inicializar Token
🪙 Acuñar (to, amount)
🔥 Quemar (from, amount)
💸 Transferir (from, to, amount)
📊 Balance (account)
✅ Allowance (owner, spender, amount)
```

### 🏢 RWA
```
🏢 Definir RWA (nombre, ISIN, emisor, precio)
🔒 Custodio (dirección, asset, cantidad)
📋 Liquidación (vendedor, comprador, cantidad, precio)
⚖️ Cumplimiento (cuenta, tipo)
🔄 Redención (desde, cantidad, razón)
```

---

## 🚀 Despliegue a Stellar

### Antes de Desplegar
1. ✅ Validar el contrato (botón "Validar")
2. ✅ No debe haber errores (advertencias está bien)
3. ✅ Wallet debe estar conectada
4. ✅ Tener XLM en cuenta (para fees de testnet)

### Proceso de Despliegue
1. Haz clic en **"Crear Token"** (paso 4)
2. El sistema ejecutará:
   - 🔍 Validación
   - ⚙️ Compilación
   - 📦 Build WASM
   - 📁 Exportación/Deployment
3. Recibirás la **dirección del contrato**
4. Verifica en [Stellar Laboratory](https://laboratory.stellar.org/)

### Fondo de Testnet
Si necesitas XLM gratuitos para Testnet:

```bash
# Opción 1: Freighter (automático)
# El wallet te ofrecerá fondos cuando lo necesites

# Opción 2: Friendbot (manual)
curl https://friendbot.stellar.org?addr=GXXXXXXX
```

---

## ⚙️ Ejemplos de Contratos

### 1. Token ERC20 Simple

```
Mi Smart Contract
├── Nombre: SimpleToken
├── Versión: 1.0.0
├── Admin: Gxxxxxx
├── Variable: balances (map)
├── Variable: totalSupply (i128)
├── Función: transfer(to, amount)
├── Función: mint(to, amount)
└── Función: burn(amount)
```

### 2. Contrato RWA

```
Mi Smart Contract
├── Nombre: RealWorldAsset
├── Admin: Gxxxxxx
├── RWA Asset: EuroStablecoin
├── RWA Custody: custodian_address
├── Función: settle(buyer, seller, amount)
└── RWA Compliance: KYC check
```

### 3. Contrato con Lógica

```
Mi Smart Contract
├── Nombre: ConditionalTransfer
├── Variable: owner (address)
├── Función: transfer(to, amount)
│   ├── Si: owner.require_auth()
│   ├── Si: amount > 0
│   └── Entonces: transfer(to, amount)
```

---

## 🐛 Solución de Problemas

### "Blockly no está cargado"
- **Causa**: Los scripts aún se cargan
- **Solución**: Espera unos segundos y recarga la página

### "El preview de código no se actualiza"
- **Causa**: Cambios muy rápidos (debounce)
- **Solución**: Espera 300ms después de editar, o usa "🔄 Actualizar"

### "No puedo validar el contrato"
- **Causa**: Faltan bloques esenciales
- **Solución**: Verifica que tengas nombre y al menos una función

### "Error al guardar proyecto"
- **Causa**: localStorage lleno (>5MB)
- **Solución**: Elimina proyectos antiguos o limpia storage

### "Wallet no conecta"
- **Causa**: Extensión no instalada o no es Testnet
- **Solución**: Instala Freighter, asegúrate de estar en Testnet

---

## 📚 Recursos

- [Documentación de Soroban](https://soroban.stellar.org/)
- [Stellar SDK](https://developers.stellar.org/)
- [Stellar Laboratory](https://laboratory.stellar.org/)
- [Freighter Wallet](https://freighter.app/)
- [Testnet Friendbot](https://friendbot.stellar.org/)

---

## 💡 Mejores Prácticas

1. **Nombra bien**: Usa nombres descriptivos y snake_case
2. **Documenta**: Agrega descripciones a tus contratos
3. **Valida siempre**: Ejecuta validación antes de desplegar
4. **Guarda frecuentemente**: Usa "Guardar Proyecto" regularmente
5. **Prueba en Testnet**: Despliega primero en testnet antes de mainnet
6. **Revisa el código**: Examina el Rust generado
7. **Usa control de acceso**: Siempre valida quién puede llamar funciones
8. **Maneja errores**: Usa bloques de validación (require_condition)

---

## 🎓 Guía de Aprendizaje

### Nivel 1: Básico (30 min)
- [ ] Conectar wallet
- [ ] Crear contrato simple con nombre, versión, admin
- [ ] Agregar una variable de estado
- [ ] Ver el código Rust generado
- [ ] Guardar proyecto

### Nivel 2: Intermedio (1 hora)
- [ ] Crear múltiples variables
- [ ] Definir varias funciones
- [ ] Agregar lógica (if/else)
- [ ] Usar validaciones (require_condition)
- [ ] Validar contrato

### Nivel 3: Avanzado (2-3 horas)
- [ ] Integración Stellar (transfer, payment)
- [ ] Crear token completo (mint, burn, transfer)
- [ ] RWA implementation
- [ ] Control de acceso avanzado
- [ ] Desplegar a testnet

---

## 📞 Soporte

Si encuentras problemas:
1. Verifica la consola del navegador (F12)
2. Lee los mensajes de error cuidadosamente
3. Intenta validar tu contrato
4. Revisa esta guía
5. Reporta el problema con detalles

---

**¡Feliz construcción de contratos inteligentes! 🚀**
