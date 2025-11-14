# Análisis Completo de Stellar SDK - Diagnóstico y Plan de Acción

**Fecha:** 2025-11-14
**Estado:** 🔴 CRÍTICO - Error de compatibilidad XDR
**Proyecto:** Tralalero Contracts App

---

## 📊 Estado Actual de Dependencias

### Dependencias NPM (Node.js - Backend y Server)

#### **Proyecto Principal** (`package.json`)
```json
{
  "@stellar/stellar-sdk": "^14.3.2"  // ✅ Instalado en node_modules
}
```

#### **Backend** (`backend/package.json`)
```json
{
  "@stellar/stellar-sdk": "^14.3.2"  // ✅ Instalado en node_modules
}
```

#### **Versiones Instaladas** (verificadas con `npm ls`)
- **Frontend/Server:** `@stellar/stellar-sdk@14.3.2`
- **Backend:** `@stellar/stellar-sdk@14.3.2`
- **Dependencia interna:** `@stellar/stellar-base@14.0.2`

---

### Dependencias CDN (Browser - Frontend HTML)

#### **index.html** (Puerto 3002 - Aplicación Principal)
```html
<script src="https://cdn.jsdelivr.net/npm/@stellar/stellar-sdk@12.3.0/dist/stellar-sdk.min.js"></script>
```
- **Versión:** v12.3.0
- **CDN:** jsDelivr
- **Tamaño:** ~800KB minificado
- **Estado:** ⚠️ DESACTUALIZADO para Protocol 24

#### **contract-interface.html** (Interfaz de Contratos)
```html
<script src="https://cdn.jsdelivr.net/npm/@stellar/stellar-sdk@12.3.0/dist/stellar-sdk.min.js"></script>
```
- **Versión:** v12.3.0
- **Estado:** ⚠️ DESACTUALIZADO para Protocol 24

---

## 🔍 Análisis del Problema Actual

### Error Principal
```
❌ XDR Read Error: unknown SorobanAuthorizedFunctionType member for value 2
```

**Ubicación del error:** `deployToStellar()` en `index.html:1935`

### Causa Raíz

#### 1. **Incompatibilidad de Protocolo XDR**

| Componente | Versión XDR | Soporte Protocol |
|------------|-------------|------------------|
| **Stellar Testnet** | Protocol 24 | XDR con nuevos enum values |
| **SDK v12.3.0 (Browser)** | Protocol ~21 | ❌ No conoce enum value `2` |
| **SDK v14.3.2 (Node.js)** | Protocol 24 | ✅ Soporta Protocol 24 |

**El problema:** SDK v12.3.0 en el browser no puede parsear las respuestas XDR que devuelve Soroban RPC porque fue compilado antes de que existiera Protocol 24.

#### 2. **Línea de Tiempo del Error**

```
1. ✅ WASM Upload → SUCCESS
   - Hash: 56a96e51340dcf16e778fcbbe70025811222ff1f49125217bd5337623a880eb2
   - Fuente: Soroban RPC

2. ✅ Account Loading → SUCCESS
   - Sequence: 6069617717936147
   - Fuente: Horizon Testnet

3. ✅ CREATE Transaction Building → SUCCESS
   - Fee: 100 stroops
   - Transaction construido localmente

4. ❌ Transaction Preparation → FAIL
   - server.prepareTransaction(createTx)
   - Soroban RPC devuelve XDR con Protocol 24
   - SDK v12.3.0 intenta parsear y falla
   - Error: "unknown SorobanAuthorizedFunctionType member for value 2"
```

---

## 🎯 El Dilema de las Versiones

### Versión 12.3.0 (Actual en Browser)

#### ✅ **Ventajas**
- `StellarSdk.SorobanRpc.Server` existe y funciona
- Probado y funcional para operaciones básicas
- CDN estable y disponible

#### ❌ **Desventajas**
- **NO soporta Protocol 24** (Testnet actual)
- XDR definitions obsoletas
- No puede parsear respuestas de `prepareTransaction()`
- **Bloquea deployment completamente**

---

### Versión 14.3.2 (Instalada en Node.js)

#### ✅ **Ventajas**
- **Soporta Protocol 24** (XDR actualizado)
- Versión oficial recomendada por Stellar docs
- Instalada en `node_modules` (ya disponible)
- `package.json` campo `browser: "./dist/stellar-sdk.min.js"` indica soporte browser

#### ❌ **Desventajas** (SOSPECHADAS, necesitan verificación)
- **Posible:** `SorobanRpc` no exportado en browser bundle
- Anterior intento con v14.3.2 falló con `StellarSdk.SorobanRpc = undefined`
- Requiere Node.js 20+ para desarrollo (no afecta browser)

#### 🔬 **Files Disponibles en dist/**
```bash
stellar-sdk.min.js              (923 KB) ← Bundle completo
stellar-sdk-no-axios.min.js     (898 KB) ← Sin axios (HTTP client)
stellar-sdk-no-eventsource.min.js (796 KB) ← Sin EventSource (streaming)
stellar-sdk-minimal.min.js      (771 KB) ← Mínimo (sin axios ni events)
```

**Observación:** Hay 4 bundles diferentes. El problema podría ser que:
1. El bundle `stellar-sdk.min.js` NO exporta `SorobanRpc` correctamente
2. Necesitamos usar un bundle alternativo
3. La estructura de exports cambió en v14

---

### Versión 14.3.0 (Recomendada por Docs)

#### 📋 **Stellar Docs (Software Versions)**
- **Testnet Protocol:** 24
- **Core:** v24.0.0
- **RPC:** v24.0.0
- **Recomendación:** `@stellar/stellar-sdk@14.3.0`
- **Base:** `@stellar/stellar-base@14.0.0`

#### ✅ **Ventajas**
- Versión exacta recomendada oficialmente
- Existe en CDN (verificado con `curl`)
- Soporta Protocol 24 completamente

#### ❓ **Incógnitas**
- ¿Exporta `SorobanRpc.Server` en browser?
- ¿Mismo problema que v14.3.2?

---

### Versión 13.0.0 (Opción Intermedia)

#### ✅ **Ventajas**
- Más moderna que v12.3.0
- Más antigua que v14.x (podría tener exports estables)
- Existe en CDN (verificado con `curl`)

#### ❌ **Desventajas**
- Desconocido si soporta Protocol 24
- No recomendada oficialmente
- Sin garantías

---

## 🧪 Experimento Realizado

### Test File: `test-sdk-versions.html`

**Propósito:** Verificar qué versiones tienen `SorobanRpc.Server` en browser.

**Versiones probadas:**
1. v12.3.0 (actual)
2. v13.0.0 (intermedia)
3. v14.3.0 (recomendada)
4. v14.3.2 (instalada)

**Ejecutar test:**
```bash
open test-sdk-versions.html
```

**Resultados esperados:**
- ✅ Verde: `SorobanRpc.Server` disponible → **USAR ESTA VERSIÓN**
- ❌ Rojo: `SorobanRpc` o `Server` faltantes → **EVITAR**

---

## 📦 Estructura de Exports en SDK v14.3.2

### package.json Exports

```json
{
  "exports": {
    ".": {
      "browser": "./dist/stellar-sdk.min.js",  // ← Bundle principal
      "types": "./lib/index.d.ts",
      "default": "./lib/index.js"
    },
    "./contract": {
      "types": "./lib/contract/index.d.ts",
      "default": "./lib/contract/index.js"
    },
    "./rpc": {                                  // ← Módulo RPC separado
      "types": "./lib/rpc/index.d.ts",
      "default": "./lib/rpc/index.js"
    }
  }
}
```

### Hipótesis: ¿RPC es un export separado?

**Posibilidad 1:** En v14+, `SorobanRpc` se movió a un módulo separado (`/rpc`) y el bundle browser no lo incluye por defecto.

**Posibilidad 2:** El bundle browser de v14.3.2 jsDelivr está corrupto o incompleto.

**Posibilidad 3:** La estructura de `StellarSdk` cambió:
```javascript
// v12.3.0
window.StellarSdk.SorobanRpc.Server  ✅

// v14.3.2
window.StellarSdk.rpc.Server  🤔 (nueva estructura?)
window.StellarSdk.Horizon.Server  (para Horizon)
```

---

## 🛠️ Plan de Acción - 3 Opciones

---

### **OPCIÓN A: Usar SDK Local (v14.3.2 desde node_modules)** ⭐ RECOMENDADA

#### Descripción
En lugar de CDN, servir `stellar-sdk.min.js` desde tu propio servidor (ya tienes v14.3.2 instalado).

#### Pasos

1. **Copiar bundle a carpeta pública**
   ```bash
   cp node_modules/@stellar/stellar-sdk/dist/stellar-sdk.min.js public/vendor/
   cp node_modules/@stellar/stellar-sdk/dist/stellar-sdk.min.js.LICENSE.txt public/vendor/
   ```

2. **Actualizar index.html**
   ```html
   <!-- Cambiar de CDN remoto -->
   <!-- <script src="https://cdn.jsdelivr.net/npm/@stellar/stellar-sdk@12.3.0/dist/stellar-sdk.min.js"></script> -->

   <!-- A bundle local -->
   <script src="/vendor/stellar-sdk.min.js"></script>
   ```

3. **Verificar exports**
   ```javascript
   console.log('StellarSdk:', window.StellarSdk);
   console.log('Keys:', Object.keys(window.StellarSdk));
   console.log('SorobanRpc:', window.StellarSdk.SorobanRpc);
   console.log('rpc:', window.StellarSdk.rpc);
   ```

4. **Ajustar código si es necesario**
   - Si `SorobanRpc` no existe pero `rpc` sí:
     ```javascript
     // const server = new StellarSdk.SorobanRpc.Server(url);
     const server = new StellarSdk.rpc.Server(url);
     ```

#### ✅ Ventajas
- Control total sobre la versión
- Garantiza compatibilidad con Protocol 24
- Mismo código en Node.js y Browser
- Sin dependencia de CDN externos

#### ❌ Desventajas
- Aumenta tamaño del bundle (~923 KB)
- Necesitas servir archivos estáticos

---

### **OPCIÓN B: Cambiar a CDN v14.3.0 (Oficial)**

#### Descripción
Usar la versión exacta recomendada por Stellar docs desde CDN.

#### Pasos

1. **Cambiar script tag**
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@stellar/stellar-sdk@14.3.0/dist/stellar-sdk.min.js"></script>
   ```

2. **Ejecutar test**
   ```bash
   open test-sdk-versions.html
   ```

3. **Si `SorobanRpc.Server` existe → SUCCESS**
   - Actualizar `contract-interface.html` también
   - Commit y deploy

4. **Si falla (como v14.3.2):**
   - Investigar exports:
     ```javascript
     console.log(Object.keys(window.StellarSdk));
     ```
   - Intentar alternativas:
     - `StellarSdk.rpc.Server`
     - `StellarSdk.Horizon.Server`

#### ✅ Ventajas
- Cambio mínimo (1 línea)
- Usa versión oficial recomendada
- CDN global (jsDelivr)

#### ❌ Desventajas
- Podría tener mismo problema que v14.3.2
- Dependencia de CDN externo

---

### **OPCIÓN C: Workaround con JSON-RPC Directo** ⚠️ NO RECOMENDADA

#### Descripción
Mantener v12.3.0 pero evitar `prepareTransaction()` usando fetch directo a Soroban RPC.

#### Pasos (Complejo)

1. **Preparar transacción manualmente**
   ```javascript
   // En lugar de:
   // const prepared = await server.prepareTransaction(tx);

   // Hacer:
   const response = await fetch('https://soroban-testnet.stellar.org', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       jsonrpc: '2.0',
       id: 1,
       method: 'simulateTransaction',
       params: {
         transaction: tx.toXDR() // XDR base64
       }
     })
   });
   ```

2. **Parsear respuesta manualmente**
   ```javascript
   const result = await response.json();

   // Extraer footprint, recursos, etc. SIN usar SDK
   const footprint = result.result.footprint;
   const resources = result.result.cost;

   // Inyectar manualmente en transaction
   tx.operations[0].footprint = footprint;
   // ... más lógica manual
   ```

3. **Enviar con Freighter**
   ```javascript
   const xdr = tx.toXDR();
   const signed = await window.freighterApi.signTransaction(xdr);
   // Submit...
   ```

#### ✅ Ventajas
- Mantiene v12.3.0 (conocido)
- Control granular

#### ❌ Desventajas
- **MUY complejo** (100+ líneas de código)
- Propenso a errores
- Difícil de mantener
- Parsing manual de XDR (riesgoso)
- **NO RECOMENDADO**

---

## 🎯 Recomendación Final

### **OPCIÓN A: SDK Local v14.3.2** es la mejor opción porque:

1. ✅ **Ya tienes la versión instalada** (0 downloads necesarios)
2. ✅ **Garantiza Protocol 24** (XDR actualizado)
3. ✅ **Control total** (no depende de CDN)
4. ✅ **Debugging fácil** (puedes inspeccionar el bundle)
5. ✅ **Consistencia** (misma versión en Node.js y Browser)

### Plan de Ejecución (Opción A)

#### Fase 1: Setup (5 minutos)
```bash
# 1. Crear directorio vendor
mkdir -p public/vendor

# 2. Copiar SDK
cp node_modules/@stellar/stellar-sdk/dist/stellar-sdk.min.js public/vendor/
cp node_modules/@stellar/stellar-sdk/dist/stellar-sdk.min.js.LICENSE.txt public/vendor/

# 3. Verificar
ls -lh public/vendor/
```

#### Fase 2: Actualizar HTML (2 minutos)
```html
<!-- public/index.html -->
<script src="/vendor/stellar-sdk.min.js"></script>

<!-- public/contract-interface.html -->
<script src="/vendor/stellar-sdk.min.js"></script>
```

#### Fase 3: Debug Exports (3 minutos)
```javascript
// Añadir al inicio de index.html después de cargar SDK
console.log('🔍 Stellar SDK Debug:');
console.log('Version:', StellarSdk.version || 'unknown');
console.log('Keys:', Object.keys(StellarSdk));
console.log('SorobanRpc:', StellarSdk.SorobanRpc);
console.log('rpc:', StellarSdk.rpc);
console.log('Horizon:', StellarSdk.Horizon);
```

#### Fase 4: Ajustar Código si Necesario (10 minutos)

**Escenario 1: `SorobanRpc` existe**
```javascript
// ✅ No cambiar nada
const server = new StellarSdk.SorobanRpc.Server(url);
```

**Escenario 2: Solo existe `rpc`**
```javascript
// 🔧 Reemplazar en deployToStellar()
// Buscar todas las instancias de:
// StellarSdk.SorobanRpc.Server

// Reemplazar con:
const SorobanRpc = StellarSdk.rpc || StellarSdk.SorobanRpc;
const server = new SorobanRpc.Server(url);
```

**Escenario 3: Estructura completamente diferente**
```javascript
// 🔬 Investigar manualmente
console.log(StellarSdk);

// Buscar en docs:
// https://stellar.github.io/js-stellar-sdk/
```

#### Fase 5: Test Completo (5 minutos)
1. Abrir http://localhost:3002
2. Hard refresh (Cmd+Shift+R)
3. Conectar wallet
4. Compilar contrato
5. Deployar
6. Verificar en Stellar Explorer

---

## 📝 Checklist de Migración

### Pre-Migration
- [ ] Hacer backup de `public/index.html`
- [ ] Hacer backup de `public/contract-interface.html`
- [ ] Commit actual: `git commit -m "backup before SDK migration"`

### Migration (Opción A)
- [ ] Crear `public/vendor/` directory
- [ ] Copiar `stellar-sdk.min.js` desde node_modules
- [ ] Copiar `stellar-sdk.min.js.LICENSE.txt`
- [ ] Actualizar script tag en `index.html`
- [ ] Actualizar script tag en `contract-interface.html`
- [ ] Añadir debug logs después de cargar SDK

### Testing
- [ ] Reiniciar servidor (`npm start`)
- [ ] Hard refresh browser
- [ ] Verificar console logs (SDK version, keys, exports)
- [ ] Conectar Freighter wallet
- [ ] Compilar contrato (verificar WASM)
- [ ] Deployar contrato
- [ ] Verificar NO aparece error XDR
- [ ] Verificar se obtiene Contract ID
- [ ] Verificar link a Stellar Explorer funciona

### Rollback Plan
Si falla:
```bash
# 1. Restaurar backup
git checkout public/index.html
git checkout public/contract-interface.html

# 2. Eliminar vendor
rm -rf public/vendor

# 3. Reiniciar servidor
npm start

# 4. Probar con versión anterior
# (debería volver a SDK v12.3.0 desde CDN)
```

---

## 🔗 Referencias

### Documentación Oficial
- [Stellar Software Versions](https://developers.stellar.org/docs/networks/software-versions)
- [Stellar SDK GitHub](https://github.com/stellar/js-stellar-sdk)
- [Stellar SDK Docs](https://stellar.github.io/js-stellar-sdk/)
- [Soroban RPC Docs](https://developers.stellar.org/docs/data/rpc)

### Archivos del Proyecto
- `package.json:22` - SDK v14.3.2 dependency
- `backend/package.json:22` - SDK v14.3.2 dependency
- `public/index.html:340` - SDK v12.3.0 CDN script
- `public/index.html:1677` - `SorobanRpc.Server` instantiation
- `public/index.html:1935` - Error XDR location
- `public/contract-interface.html:529` - SDK v12.3.0 CDN script

### Errores Documentados
- XDR Error: "unknown SorobanAuthorizedFunctionType member for value 2"
- Location: `deployToStellar()` at `index.html:1935`
- Context: `server.prepareTransaction(createTx)`

---

## 📊 Resumen Ejecutivo

| Aspecto | Estado Actual | Estado Objetivo |
|---------|--------------|-----------------|
| **Node.js SDK** | ✅ v14.3.2 instalado | ✅ v14.3.2 (OK) |
| **Browser SDK** | ❌ v12.3.0 (Protocol ~21) | ✅ v14.3.2 (Protocol 24) |
| **XDR Support** | ❌ Incompatible | ✅ Compatible |
| **Deployment** | 🔴 BLOQUEADO | 🟢 FUNCIONAL |
| **Testnet Protocol** | Protocol 24 | Protocol 24 |

### Tiempo Estimado de Fix
- **Opción A (Local SDK):** 20-30 minutos
- **Opción B (CDN v14.3.0):** 10-15 minutos (si funciona)
- **Opción C (Workaround):** 2-3 horas (NO recomendado)

### Riesgo
- **Opción A:** 🟢 BAJO (tienes fallback fácil)
- **Opción B:** 🟡 MEDIO (depende de exports)
- **Opción C:** 🔴 ALTO (complejo, propenso a errores)

---

**Última Actualización:** 2025-11-14 10:48 UTC
**Autor:** Claude Code Analysis
**Prioridad:** 🔴 CRÍTICA - Bloquea deployment a Stellar Testnet
