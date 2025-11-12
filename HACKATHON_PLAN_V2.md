# 🚀 Plan Hackathon Stellar - Tralalero Contracts V2

**Objetivo:** Ganar primer lugar en hackathon
**Timeline:** 48+ horas
**Estrategia:** Separar frontend (Vercel) + backend (Railway) con contratos precompilados

---

## Arquitectura Nueva

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                    │
│  - React/Blockly UI                                     │
│  - Firma con Freighter                                  │
│  - Llamadas a backend API                               │
└────────────────────────┬────────────────────────────────┘
                         │ API calls
                         ↓
┌─────────────────────────────────────────────────────────┐
│         RAILWAY/RENDER (Backend con Rust)               │
│  - Node.js + Express                                    │
│  - Cargo + compilador Rust                              │
│  - Contratos precompilados guardados                    │
└─────────────────────────────────────────────────────────┘
```

---

## Fase 1: Setup Backend Separado (1-2 horas)

### 1.1 Crear repo backend
- Mover `server.js` a repo separado (o rama backend)
- Mover carpeta `tralala/` (workspace Cargo)
- Crear `package.json` con dependencias necesarias

### 1.2 Deploy a Railway/Render
- Sign up en https://railway.app o https://render.com
- Deploy Node.js backend (gratis con límites generosos)
- Tiempo de compilación: 10+ minutos (no hay timeout)

### 1.3 Precompilar templates base localmente
- Compilar los 2-3 templates de contratos Rust existentes una sola vez
- Comando: `cargo build --target wasm32-unknown-unknown --release`
- Guardar archivos `.wasm` en backend (ej: `/backend/compiled/token.wasm`)
- NO hay recompilación en cada request

### 1.4 Implementar API endpoint
**Endpoint:** `POST /api/compile-contract`

```javascript
// Recibe:
{
  "templateType": "token",
  "config": {
    "symbol": "MTK",
    "name": "Mi Token",
    "decimals": 7,
    "features": ["mintable", "burnable"]
  }
}

// Retorna:
{
  "success": true,
  "wasmBase64": "AGFzbS0x...",
  "contractId": "uuid-xxx",
  "compiledAt": "2025-11-12T..."
}
```

---

## Fase 2: Separar Frontend (1-2 horas)

### 2.1 Actualizar endpoints en Vercel
- Cambiar `const API = 'http://localhost:3000'`
- A: `const API = 'https://backend-xyz.railway.app'`
- Actualizar `public/stepper-client.js` y `public/client.js`

### 2.2 Remover lógica de compilación de Vercel
- Borrar funciones `execAsync` que ejecutan `cargo build`
- Borrar referencias a `/tralala/` en servidor
- Simplificar endpoint `/api/build-smart-contract` para solo pedir WASM precompilado

### 2.3 Actualizar llamadas al backend
```javascript
// Antes (compilación en Vercel - NO FUNCIONA)
POST /api/build-smart-contract
  → cargo build en Vercel (TIMEOUT)

// Después (WASM precompilado - FUNCIONA)
POST /api/compile-contract
  → backend busca precompilado
  → retorna WASM inmediatamente
```

---

## Fase 3: Testing E2E (1 hora)

### Flujo completo a testear:
1. **Blockly (Frontend Vercel):** Usuario configura contrato con bloques
2. **Backend (Railway):** API retorna WASM precompilado
3. **Frontend:** Recibe WASM
4. **Freighter:** Usuario firma transacción de deployment
5. **Stellar:** Contrato se deploya a testnet

### Checklist:
- [ ] Backend responde sin timeout
- [ ] WASM se retorna correctamente
- [ ] Freighter firma sin errores
- [ ] Contrato aparece en Stellar Testnet
- [ ] Dashboard muestra contratos deployados

---

## Fase 4: Features & Polish (4-6 horas)

### 4.1 Agregar más templates precompilados
- Marketplace contract
- NFT contract
- Custom contract template

### 4.2 Dashboard de contratos
- Mostrar historial de contratos deployados
- Links a explorador Stellar
- Opción de interactuar con contrato

### 4.3 Mejorar UX
- Validación clara en Blockly
- Mensajes de error descriptivos
- Animaciones durante compilation

### 4.4 Documentación
- README para jueces
- Instrucciones de uso
- Explicación de arquitectura

---

## Beneficios de esta Arquitectura

✅ **Backend sin timeout:** Railway tiene 10+ minutos vs Vercel 15 segundos
✅ **Demo sin esperas:** WASM precompilados = respuesta inmediata
✅ **Frontend ligero:** Vercel solo sirve assets (sin compilación)
✅ **Escalable:** Agregar templates solo requiere precompilar local
✅ **Confiable:** Separación de concerns (compilación vs serving)

---

## Timeline Estimado

| Fase | Duración | Hito |
|------|----------|------|
| **Fase 1: Backend Setup** | 1-2h | Backend deployado, WASM precompilados |
| **Fase 2: Frontend Update** | 1-2h | Frontend apunta a backend, sin compilación |
| **Fase 3: Testing E2E** | 1h | Flujo completo funciona end-to-end |
| **Fase 4: Features** | 4-6h | Dashboard, templates, polish |
| **TOTAL** | **7-11 horas** | Listo para presentación |

---

## Contratos Precompilados (Placeholder)

```
backend/compiled/
├── token_basic.wasm          # Token simple (name, symbol, supply)
├── token_advanced.wasm       # Token con mintable+burnable+pausable
├── marketplace.wasm          # Marketplace contract (placeholder)
└── metadata.json             # Índice de contratos disponibles
```

---

## Próximos Pasos

1. ✅ Aprobar este plan
2. Crear backend en Railway/Render
3. Precompilar templates localmente
4. Implementar endpoint `/api/compile-contract`
5. Actualizar frontend
6. Testing E2E
7. Agregar features
8. 🎯 Presentación

---

**¿Listo para comenzar?**
