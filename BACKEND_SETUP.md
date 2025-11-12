# 🚀 Tralalero Contracts - Backend Precompiled Setup

Este documento describe la nueva arquitectura del hackathon que separa el backend (precompilación) del frontend (UI).

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                    │
│  - React/Blockly UI                                     │
│  - Firma con Freighter                                  │
│  - Llamadas a backend API                               │
└────────────────────────┬────────────────────────────────┘
                         │ API calls (REST)
                         ↓
┌─────────────────────────────────────────────────────────┐
│         RAILWAY/RENDER (Backend - Precompiled)          │
│  - Node.js + Express                                    │
│  - Contratos WASM precompilados                         │
│  - Respuesta inmediata (sin compilación)                │
└─────────────────────────────────────────────────────────┘
```

## ✨ Ventajas

- ✅ **Sin timeouts en Vercel** - La compilación ocurre offline
- ✅ **Respuesta inmediata** - WASM precompilados (~10ms vs 10+ minutos)
- ✅ **Demo fluida** - El usuario ve el progreso sin esperas
- ✅ **Escalable** - Agregar templates solo requiere precompilar localmente
- ✅ **Confiable** - Separación de concerns (compilación vs serving)

## 📋 Setup Local

### 1. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 2. Iniciar backend (para desarrollo)

```bash
npm start
# o para desarrollo con auto-reload:
npm run dev
```

El backend estará disponible en `http://localhost:3001`

### 3. Configurar el frontend para usar el backend

El frontend está configurado para usar el backend automáticamente:
- Desarrollo: `http://localhost:3001` (default)
- Producción: Variable de entorno `BACKEND_URL`

Iniciar frontend (desde raíz del proyecto):

```bash
npm start        # Puerto 3000
```

### 4. Flujo E2E local

1. Backend corriendo en `http://localhost:3001`
2. Frontend corriendo en `http://localhost:3000`
3. Usuario crea contrato en Blockly
4. Frontend llama `POST /api/build-smart-contract` en el backend
5. Backend retorna WASM precompilado en base64
6. Frontend recibe WASM y prepara deployment
7. Usuario firma con Freighter en frontend
8. Contrato se deploya a Stellar Testnet

## 🏗️ Estructura Backend

```
backend/
├── api.js                              # Servidor Express principal
├── package.json                        # Dependencias
├── compiled/
│   ├── token_basic.wasm               # Template básico compilado (~5KB)
│   ├── token_advanced.wasm            # Template avanzado compilado (~6KB)
│   └── metadata.json                  # Índice de templates disponibles
└── .gitignore
```

## 📡 Endpoints del Backend

### POST `/api/compile-contract`

Retorna WASM precompilado para un template.

**Request:**
```json
{
  "templateType": "token_basic" | "token_advanced",
  "config": {
    "name": "Mi Token",
    "symbol": "MTK",
    "decimals": 7,
    "initialSupply": 1000000
  }
}
```

**Response:**
```json
{
  "success": true,
  "contractId": "uuid-xxx",
  "templateType": "token_basic",
  "wasmBase64": "AGFzbS0x...",
  "wasmSize": 5120,
  "compiledAt": "2025-11-12T11:07:00Z",
  "message": "Template compiled (precompiled)"
}
```

### GET `/api/templates`

Lista templates disponibles.

**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "id": "token_basic",
      "name": "Basic Token",
      "description": "Simple token with transfer, mint, and burn",
      "features": ["transfer", "mint", "burn", "balance_query"]
    },
    {
      "id": "token_advanced",
      "name": "Advanced Token",
      "description": "Advanced token with pausable capabilities",
      "features": ["transfer", "mint", "burn", "pause", "admin_management"]
    }
  ]
}
```

### GET `/api/health`

Verificar que el backend está activo.

## 🚀 Deployment a Railway/Render

### Opción 1: Railway.app

```bash
# 1. Crear cuenta en https://railway.app
# 2. Conectar GitHub (opcional)
# 3. Crear nuevo proyecto
# 4. Seleccionar NodeJS
# 5. Conectar a repo o subir archivos manualmente
# 6. Variables de entorno:
#    PORT=3001 (optional, Railway asigna automáticamente)

# 7. Deploy automático o manual:
git push origin main  # Si está conectado a GitHub
```

### Opción 2: Render.com

```bash
# 1. Crear cuenta en https://render.com
# 2. Conectar GitHub
# 3. Crear "New Web Service"
# 4. Seleccionar NodeJS
# 5. Build command: npm install
# 6. Start command: npm start
# 7. Environment variables: (ninguna requerida)
# 8. Deploy
```

### Configurar Frontend para Producción

Una vez deployado el backend (ej: `https://tralalero-backend.railway.app`):

```bash
# En Vercel o donde sea que hostees el frontend, agregar:
# Environment variable:
# BACKEND_URL=https://tralalero-backend.railway.app

# Rebuild y deploy
```

## 🔧 Agregar Nuevos Templates

### 1. Crear contrato Rust en `tralala/contracts/`

```bash
mkdir -p tralala/contracts/token_nft_template
```

### 2. Actualizar `tralala/Cargo.toml` con el nuevo miembro

```toml
[workspace]
members = [
    "contracts/hello-world",
    "contracts/token_template_basic",
    "contracts/token_template_advanced",
    "contracts/token_nft_template",  # <-- Nuevo
    "dynamic-contracts/mtk_*"
]
```

### 3. Compilar a WASM

```bash
cd tralala
cargo build --target wasm32-unknown-unknown --release --package token_nft_template
```

### 4. Copiar a backend

```bash
cp tralala/target/wasm32-unknown-unknown/release/token_nft_template.wasm \
   backend/compiled/token_nft.wasm
```

### 5. Actualizar `backend/compiled/metadata.json`

```json
{
  "templates": [
    // ... existing templates ...
    {
      "id": "token_nft",
      "name": "NFT Contract",
      "description": "NFT collection contract",
      "filename": "token_nft.wasm",
      "size_bytes": 12345,
      "features": ["mint", "burn", "transfer"],
      "compiled_at": "2025-11-12T12:00:00Z"
    }
  ]
}
```

### 6. Restart backend

```bash
# Backend auto-carga metadata.json en startup
npm start
```

## 📊 Rendimiento

### Tiempos de respuesta

| Operación | Tiempo | Nota |
|-----------|--------|------|
| Compilación dinámica | 10-15 minutos | ❌ Vercel timeout (15s) |
| Precompilado (backend) | ~10-50ms | ✅ Inmediato |
| Roundtrip HTTP | ~200-500ms | Con latencia normal |
| Firma Freighter | ~1-3 segundos | Usuario firma |
| Deployment a Stellar | ~5-10 segundos | Incluye broadcast |

### Tamaños de WASM

| Template | Size |
|----------|------|
| token_basic.wasm | 5.0 KB |
| token_advanced.wasm | 5.8 KB |
| (Total) | ~11 KB |

## 🐛 Troubleshooting

### Backend no inicia

```bash
# Verificar que node_modules está instalado
cd backend
npm install

# Verificar permisos en archivos WASM compilados
ls -l compiled/*.wasm

# Verificar metadata.json
cat compiled/metadata.json | jq .
```

### Frontend no puede conectar al backend

```bash
# 1. Verificar que backend está corriendo
curl http://localhost:3001/api/health

# 2. Verificar BACKEND_URL en frontend
# Debería ser http://localhost:3001 para desarrollo

# 3. Si estás en producción, cambiar BACKEND_URL a URL de Railway/Render
```

### WASM no se carga correctamente

```bash
# Verificar que los archivos WASM existen
ls -lh backend/compiled/*.wasm

# Verificar que metadata.json tiene los nombres correctos
cat backend/compiled/metadata.json | jq '.templates[].filename'
```

## 📚 Referencias

- [Soroban SDK](https://soroban.stellar.org)
- [Railway.app Docs](https://docs.railway.app)
- [Render.com Docs](https://render.com/docs)
- [Stellar SDK](https://github.com/stellar/js-stellar-sdk)

---

**¿Preguntas?** Revisa el CLAUDE.md para más información del proyecto.
