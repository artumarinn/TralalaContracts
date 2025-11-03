# 🧪 Guía de Testing - Tralalero Contracts

Guía completa para probar todos los aspectos del sistema de construcción de smart contracts.

---

## 📋 Tabla de Contenidos

1. [Setup de Testing](#setup-de-testing)
2. [Tests Funcionales](#tests-funcionales)
3. [Tests de Validación](#tests-de-validación)
4. [Tests de Integración](#tests-de-integración)
5. [Tests de Seguridad](#tests-de-seguridad)
6. [Checklist Final](#checklist-final)

---

## Setup de Testing

### Requisitos Previos

```bash
# Herramientas necesarias
- Node.js 16+
- npm/yarn
- Freighter Wallet (instalada en el navegador)
- Firefox o Chrome
- Git

# Verificar instalación
node --version    # v16+
npm --version     # 8+
```

### Iniciar el Servidor

```bash
# En terminal 1 - Start Node server
npm run dev
# Esperado: ✅ Servidor escuchando en puerto 3001

# En terminal 2 - (Opcional) Watch para cambios
npm run dev:watch
```

### Acceder a la Aplicación

```
URL: http://localhost:3001
Navegador recomendado: Chrome/Firefox
Cuenta Stellar Testnet: Necesaria (crear en https://friendbot.stellar.org/)
```

---

## 🧪 Tests Funcionales

### Test 1: Conexión de Wallet

#### Pasos
1. Abre http://localhost:3001
2. Verifica que Step 1 esté activo (Conectar Wallet)
3. Haz clic en "Conectar Freighter"
4. Autoriza en la extensión del wallet
5. Verifica que aparezca la dirección del wallet

#### Resultados Esperados
```
✅ Wallet conectada exitosamente
✅ Se muestra dirección pública (G...)
✅ Se habilita navegación a Step 2
✅ LocalStorage contiene walletAddress
✅ Console: "Wallet conectada: Gxxxxxxx..."
```

#### Código de Prueba (Console)
```javascript
// Verificar estado de wallet
console.log(appState.walletAddress);  // Debe mostrar dirección G...
console.log(window.freighter);         // Debe estar disponible
```

---

### Test 2: Crear Contrato Simple

#### Pasos
1. Conecta wallet (Test 1)
2. Haz clic "Siguiente" → Step 2
3. Arrastra "🔮 Mi Smart Contract" al workspace
4. Conecta "📝 Nombre del Contrato" → "MyToken"
5. Conecta "🔢 Versión" → "1.0.0"
6. Conecta "🔑 Administrador" → tu dirección

#### Resultados Esperados
```
✅ Bloques se agregan al workspace
✅ Vista previa actualiza automáticamente
✅ Código Rust aparece en preview
✅ Mensaje: "✅ Contrato válido"
✅ No hay errores rojos
```

#### Verificar en Console
```javascript
// Obtener workspace
const workspace = blocklyWorkspace;
console.log(workspace.getBlocksByType('contract_settings').length);  // 1

// Obtener código generado
const code = updateCodePreview();
console.log(code.includes('pub struct SmartContract'));  // true
```

---

### Test 3: Validación de Contrato

#### Pasos
1. Crea un contrato incompleto (falta el admin)
2. Haz clic en "Validar"
3. Revisa los errores mostrados
4. Agrega el bloque admin
5. Valida nuevamente

#### Resultados Esperados - Antes
```
❌ Errores encontrados:
- Debes especificar al menos un administrador o propietario

⚠️ Advertencias:
- Considera agregar una descripción del contrato
- El contrato no tiene variables de estado
```

#### Resultados Esperados - Después
```
✅ Contrato completamente válido

ℹ️ Información:
- ✅ Nombre del contrato válido: MyToken
- ✅ Versión: 1.0.0
- ✅ Administrador configurado
```

#### Verificar en Console
```javascript
// Usar validador directamente
const report = validator.validate(blocklyWorkspace);
console.log(report.isValid);           // true
console.log(report.errorCount);        // 0
console.log(report.warningCount);      // 0-1
```

---

### Test 4: Gestión de Proyectos

#### Test 4a: Guardar Proyecto

Pasos:
1. Crea un contrato (Test 2)
2. Presiona Ctrl+S o abre menú de proyectos
3. Dale nombre: "MyFirstToken"
4. Confirma guardado

Resultados:
```
✅ Mensaje: "Proyecto 'MyFirstToken' guardado correctamente"
✅ LocalStorage contiene el proyecto
✅ Puedes ver el proyecto en el listado
```

Verificar:
```javascript
const projects = projectManager.getAllProjects();
console.log(projects.length > 0);      // true
console.log(projects[0].name);         // "MyFirstToken"
```

#### Test 4b: Cargar Proyecto

Pasos:
1. Borra el workspace (Clear)
2. Abre lista de proyectos
3. Selecciona "MyFirstToken"
4. Haz clic "Cargar"

Resultados:
```
✅ Workspace se restaura con el proyecto
✅ Todos los bloques reaparecen
✅ Código preview se actualiza
✅ Datos idénticos al guardado
```

#### Test 4c: Exportar Proyecto

Pasos:
1. En lista de proyectos, haz clic "Exportar"
2. Se descarga "MyFirstToken.json"
3. Abre el archivo en editor de texto

Resultados:
```
✅ Archivo JSON válido
✅ Contiene estructura: {id, name, timestamp, xml, version}
✅ XML es válido (contiene bloques)
✅ Tamaño razonable (< 100KB)
```

#### Test 4d: Importar Proyecto

Pasos:
1. Arrastra "MyFirstToken.json" al editor
2. O usa opción "Importar"
3. Confirma importación

Resultados:
```
✅ Proyecto se importa correctamente
✅ Aparece en lista de proyectos
✅ Workspace se carga automáticamente
✅ Código idéntico al original
```

---

### Test 5: Generación de Código Rust

#### Test 5a: Token Simple

Pasos:
1. Crea contrato con bloques de token
2. Agrega: Token Initialize, Token Mint, Token Transfer
3. Revisa preview de código

Resultados Esperados:
```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, ...};

#[contract]
pub struct SmartContract;

#[contractimpl]
impl SmartContract {
    pub fn initialize(env: Env) { ... }
    pub fn mint(env: Env, to: Address, amount: i128) { ... }
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) { ... }
}
```

Verificar:
```javascript
const code = document.getElementById('codePreview').innerText;
console.log(code.includes('pub fn initialize'));    // true
console.log(code.includes('pub fn mint'));          // true
console.log(code.includes('pub fn transfer'));      // true
console.log(!code.includes('ERROR'));               // true
```

#### Test 5b: Contrato con Lógica

Pasos:
1. Crea función con If/Else
2. Agrega comparación
3. Revisa generación de lógica

Resultados:
```rust
if amount > 0 {
    // Transfer logic
} else {
    // Error handling
}
```

---

### Test 6: Integración Stellar

#### Test 6a: Bloques Stellar en Código

Pasos:
1. Agrega bloque "⭐ Stellar: Transfer"
2. Agrega bloque "⭐ Stellar: Require Auth"
3. Revisa preview

Resultados Esperados:
```
✅ Aparecen imports de Stellar
✅ env.invoker() en código
✅ require_auth() llamada
✅ Transacciones correctamente formadas
```

Verificar en Console:
```javascript
const code = document.getElementById('codePreview').innerText;
console.log(code.includes('env.invoker'));          // true
console.log(code.includes('require_auth'));         // true
```

#### Test 6b: RWA Assets

Pasos:
1. Agrega "🏢 RWA: Definir Asset"
2. Configura Asset (nombre, ISIN, emisor, precio)
3. Revisa código generado

Resultados:
```
✅ Estructura RWA aparece en código
✅ Custodio configurado
✅ Liquidación incluida
✅ Compliance checks presentes
```

---

## ✅ Tests de Validación

### Test 7: Validación de Tipos

#### Test 7a: Tipos Válidos

Pasos:
1. Crea variables con tipos: I32, I64, I128, U32, BOOL, STRING, ADDRESS
2. Valida contrato

Resultados:
```
✅ Todos los tipos se aceptan
✅ Sin errores de tipo
✅ Código genera correctamente
```

#### Test 7b: Tipos Inválidos

Pasos:
1. Intenta crear variable con tipo "INVALID_TYPE"
2. Valida

Resultados:
```
❌ Error: Variable 'xxx': tipo inválido 'INVALID_TYPE'
```

---

### Test 8: Validación de Nombres

#### Test 8a: Nombres Válidos

Pasos:
1. Crea variables: `my_token`, `total_supply`, `_internal_flag`
2. Valida

Resultados:
```
✅ Todos los nombres válidos
✅ Siguen snake_case
✅ Empiezan con letra o _
```

#### Test 8b: Nombres Inválidos

Pasos:
1. Intenta nombres: `123invalid`, `my-token`, `@special`
2. Valida

Resultados:
```
❌ Error: nombre debe ser identificador válido
❌ Error: debe empezar con letra o _
```

---

### Test 9: Validación de Duplicados

#### Pasos
1. Crea dos variables con mismo nombre: `balance`
2. Valida

#### Resultados
```
❌ Error: Variable 'balance': nombre duplicado
```

---

## 🔒 Tests de Seguridad

### Test 10: Control de Acceso

#### Test 10a: require_auth()

Pasos:
1. Crea función sensible (transfer, burn)
2. Agrega "🔐 Require: require_auth()"
3. Revisa código

Resultados:
```rust
pub fn transfer(...) {
    let sender = env.invoker();
    sender.require_auth();  // ✅ Presente
    ...
}
```

#### Test 10b: Access Control Role

Pasos:
1. Crea función admin (mint)
2. Agrega "🔐 Access Control: require_admin()"
3. Revisa validación

Resultados:
```
✅ Verificación de admin
✅ Error si no es admin
```

---

### Test 11: Validaciones de Parámetros

Pasos:
1. Crea función transfer(to, amount)
2. Agrega validación: amount > 0
3. Agrega validación: to != sender

Resultados:
```
✅ Validaciones presentes en código
✅ Evita transferencias a sí mismo
✅ Evita montos negativos
```

---

### Test 12: Protección Reentrancy

Pasos:
1. Crea función que llama otra función
2. Agrega "🔐 Reentrancy Guard"
3. Revisa código

Resultados:
```
✅ Guard presente
✅ Prevents recursive calls
✅ Código seguro
```

---

## 🔗 Tests de Integración

### Test 13: Wallet + Contrato + Validación

Pasos:
1. Conecta wallet
2. Crea contrato completo
3. Valida
4. Guarda proyecto
5. Recarga página
6. Carga proyecto

Resultados:
```
✅ Todos los pasos funcionan
✅ Estado se mantiene
✅ Integración perfecta
```

---

### Test 14: Frontend + Backend

Pasos:
1. Crea contrato en UI
2. Haz clic "Crear Token" (si está disponible)
3. Observa compilación en backend
4. Verifica respuesta

Resultados:
```
✅ Backend recibe datos correctamente
✅ Compila sin errores
✅ WASM se genera
✅ Respuesta con dirección del contrato
```

---

## 📊 Checklist Final

### Antes de Deployment

```
UI/UX
- [ ] Stepper funciona (4 pasos)
- [ ] Wallet connection visible
- [ ] Blockly carga y es interactivo
- [ ] Preview actualiza en real-time
- [ ] Modals aparecen correctamente
- [ ] Responsive en mobile (opcional)

Bloques
- [ ] 46+ bloques disponibles
- [ ] Todos los bloques aparecen correctamente
- [ ] Bloques se conectan sin problemas
- [ ] Colores y categorías claras
- [ ] Tooltips informativos

Código
- [ ] Rust generator funciona
- [ ] Preview muestra código válido
- [ ] Importes correctos
- [ ] Estructura de contrato correcta
- [ ] No hay errores de sintaxis

Validación
- [ ] Validador detecta errores
- [ ] Validador detecta advertencias
- [ ] Mensajes son claros
- [ ] Información útil proporcionada

Proyectos
- [ ] Guardar funciona
- [ ] Cargar funciona
- [ ] Exportar genera JSON válido
- [ ] Importar restaura proyecto
- [ ] Storage info correcta
- [ ] Límite 10 proyectos respetado

Integración
- [ ] Wallet se conecta
- [ ] Datos de wallet se almacenan
- [ ] Transiciones de pasos fluidas
- [ ] No hay memoria leaks
- [ ] Console sin errores críticos
```

---

## 🔍 Debugging

### Console Útil

```javascript
// Ver estado de la aplicación
console.log(appState);

// Ver todos los proyectos
console.log(projectManager.getAllProjects());

// Ver workspace
console.log(blocklyWorkspace);

// Validar manualmente
console.log(validator.validate(blocklyWorkspace));

// Ver uso de storage
console.log(projectManager.getStorageInfo());

// Ver código generado
console.log(RustGenerator.prototype.generateContract);
```

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "blocklyDiv not found" | Duplicate IDs | Verificar un solo blocklyDiv en HTML |
| "workspace undefined" | Inicialización incompleta | Esperar a que Blockly cargue |
| "Code not generating" | Generator sin bloques | Asegurar bloques conectados |
| "localStorage full" | >5MB de datos | Eliminar proyectos antiguos |
| "Wallet not connecting" | Extensión no instalada | Instalar Freighter |

---

## 📝 Reporte de Bugs

Si encuentras un bug:

1. **Reproduc ibilidad**: ¿Puedes repetir el error?
2. **Pasos exactos**: Describe los pasos exactos
3. **Comportamiento esperado**: Qué debería pasar
4. **Comportamiento real**: Qué pasó realmente
5. **Screenshots**: Si es posible, incluye
6. **Console errors**: Copia errores de F12
7. **Ambiente**: Navegador, OS, versión

---

## ✨ Recomendaciones de Testing

1. **Automatizar**: Crear pruebas de Jest para validador
2. **E2E**: Usar Playwright para flujos completos
3. **Performance**: Medir tiempo de generación de código
4. **Memoria**: Monitorear leaks con DevTools
5. **Accesibilidad**: Probar navegación con keyboard
6. **Compatibilidad**: Probar en Chrome, Firefox, Safari

---

**¡Gracias por probar Tralalero Contracts! 🚀**
