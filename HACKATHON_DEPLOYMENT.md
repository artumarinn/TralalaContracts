# 🚀 Hackathon Deployment - Tralalero Contracts

Guía rápida para deployar la arquitectura de dos servidores del Hackathon Stellar.

## 📋 Resumen de Cambios Implementados

### Antes (No funciona)
```
Vercel Frontend → cargo build (10+ minutos) → TIMEOUT ❌
```

### Ahora (Funciona perfectamente)
```
Vercel Frontend → Railway Backend (precompilado) → WASM (10ms) ✅
```

## 🚀 Deployment en 5 Minutos

### 1️⃣ Deploy Backend a Railway.app

```bash
# 1. Crear cuenta gratuita en https://railway.app (con GitHub)

# 2. Desde tu repo local:
git add -A
git commit -m "feat: Add precompiled backend for Stellar contracts"
git push origin main

# 3. En Railway Dashboard:
#    - Click "New Project"
#    - Select "Deploy from GitHub"
#    - Choose "tralalerocontracts-app" repo
#    - Click "Deploy"

# 4. Railway detecta Node.js automáticamente
#    - Build: npm install
#    - Start: npm start (desde backend/)
#    - Port: 3001 (Railway asigna automáticamente)

# 5. Esperar deploy (2-3 minutos)
# 6. Copiar URL del backend (ej: https://tralalero-backend-prod.up.railway.app)
```

### 2️⃣ Deploy Frontend a Vercel

```bash
# 1. Crear cuenta en https://vercel.com (con GitHub)

# 2. En Vercel Dashboard:
#    - Click "Add New..."
#    - Select "Project"
#    - Import "tralalerocontracts-app"
#    - Select root directory

# 3. Environment Variables:
#    Agregar variable:
#    BACKEND_URL=https://tralalero-backend-prod.up.railway.app

# 4. Deploy (automático)
# 5. Tu frontend estará en: https://tralalero-contracts.vercel.app (o similar)
```

## ✅ Verificar Deployment

### Backend Health Check

```bash
curl https://tralalero-backend-prod.up.railway.app/api/health
# Respuesta:
# {
#   "success": true,
#   "status": "Backend is running",
#   "environment": "Stellar Testnet",
#   "templates_available": 2
# }
```

### Frontend

Abrir en navegador: `https://tralalero-contracts.vercel.app`

1. Conectar wallet Freighter ✓
2. Seleccionar template (Basic o Advanced) ✓
3. Configurar token en Blockly ✓
4. Build → Respuesta inmediata ✓
5. Review & Deploy ✓
6. Firma con Freighter ✓
7. Contrato en Stellar Testnet ✓

## 🔧 Si algo no funciona

### Backend no inicia en Railway

```bash
# 1. Verificar logs en Railway Dashboard:
#    - Click project
#    - Click "Deployments"
#    - Ver "Logs" tab

# 2. Errores comunes:
#    - "Cannot find module" → falta npm install
#    - "Port already in use" → Railway maneja esto automáticamente
#    - "WASM files not found" → verificar que /backend/compiled/ existe
```

### Frontend no ve al backend

```bash
# 1. Verificar variable de entorno en Vercel:
#    - Vercel Dashboard → Proyect Settings → Environment Variables
#    - Debe tener: BACKEND_URL=https://[tu-railway-url]

# 2. Si cambió el URL del backend:
#    - Actualizar en Vercel
#    - Trigger rebuild (Settings → Deployments)

# 3. Verificar CORS (debería estar permitido):
#    - Backend: permite requests desde Vercel ✓
#    - Frontend: llama a API como fetch ✓
```

### La compilación sigue siendo lenta

```bash
# 1. Verificar que backend está siendo usado:
#    - Abrir DevTools del navegador
#    - Network tab
#    - Debe ver POST /api/build-smart-contract
#    - Respuesta en < 100ms

# 2. Si toma > 1 segundo:
#    - Latencia de red
#    - Revisar conexión a internet

# 3. Verificar que frontend NOT está compilando:
#    - No debe haber proceso `cargo build` corriendo
#    - server.js debe tener USE_BACKEND=true
```

## 📊 Monitoreo

### Logs en Tiempo Real

#### Railway Backend

```bash
# En Railway Dashboard:
# 1. Click al proyecto
# 2. Click "Deployments"
# 3. Ver logs en vivo
```

#### Vercel Frontend

```bash
# En Vercel Dashboard:
# 1. Click proyecto
# 2. Click "Deployments"
# 3. Ver edge function logs
```

### Métricas

| Métrica | Valor | OK? |
|---------|-------|-----|
| Backend Response Time | < 50ms | ✓ |
| Frontend Build Time | 0ms | ✓ |
| Network Roundtrip | < 500ms | ✓ |
| Stellar Deployment | ~5-10s | ✓ |
| **Total Flow** | **~10 segundos** | ✓ |

## 🎯 Arquitectura Final

```
┌─────────────────────────────────┐
│     USUARIO (Navegador)         │
│  https://tralalero-contracts... │
└────────────────┬────────────────┘
                 │ HTTPS
                 ↓
┌─────────────────────────────────┐
│   VERCEL (Frontend React)       │
│  - Blockly UI                   │
│  - Freighter Wallet             │
│  - Stellar SDK                  │
└────────────────┬────────────────┘
                 │ fetch()
                 │ POST /api/build-smart-contract
                 ↓
┌─────────────────────────────────┐
│   RAILWAY (Backend Node.js)     │
│  - Express Server               │
│  - Precompiled WASM (11KB)      │
│  - Metadata Index               │
└─────────────────────────────────┘
                 │
                 │ Base64 WASM
                 ↓
┌─────────────────────────────────┐
│   STELLAR TESTNET               │
│  - Horizon API                  │
│  - Deploy Contract              │
│  - Soroban                      │
└─────────────────────────────────┘
```

## 💡 Tips Finales

1. **Commit y push regularmente** - Railway redeploy automáticamente
2. **Revisar Railway logs** si hay problemas
3. **Testear en local primero** con `npm start` en backend y frontend
4. **BACKEND_URL** es la clave - debe estar en Vercel env vars
5. **WASM size** es mínimo (5KB) - muy rápido

## 🎊 ¡Listo para el Hackathon!

Tu aplicación está pronta para:
- ✅ Demo sin esperas
- ✅ Compilación instantánea
- ✅ Deployment a Stellar
- ✅ Escala de usuarios
- ✅ Evaluación de jueces

---

**Duración total del setup: ~5 minutos**
**Duración del deployment: ~5 minutos**
**Total: ~10 minutos para estar listo**

🚀 ¡Buena suerte en el hackathon!
