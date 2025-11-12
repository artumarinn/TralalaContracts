# ⚡ Quickstart - Tralalero Contracts Backend

Copia y pega estos comandos para tener todo corriendo en < 5 minutos.

## 🏃 Local Setup

### Terminal 1: Backend

```bash
cd backend
npm install
npm start
```

✅ Backend corriendo en `http://localhost:3001`

### Terminal 2: Frontend

```bash
npm install
npm start
```

✅ Frontend corriendo en `http://localhost:3000`

## 🧪 Test Rápido

```bash
# Test health check
curl http://localhost:3001/api/health

# Test templates
curl http://localhost:3001/api/templates

# Test compile (copy-paste en terminal)
curl -X POST http://localhost:3001/api/compile-contract \
  -H "Content-Type: application/json" \
  -d '{"templateType":"token_basic","config":{"name":"Test","symbol":"TST","decimals":7,"initialSupply":1000000}}'
```

## ✅ Verificar

- [ ] Backend responde en `http://localhost:3001`
- [ ] Frontend carga en `http://localhost:3000`
- [ ] Puedes conectar Freighter wallet
- [ ] Puedes crear un contrato en Blockly
- [ ] Backend retorna WASM en < 100ms

## 🚀 Production Deploy

### Railway Backend

```bash
# 1. Push a GitHub
git push origin main

# 2. En https://railway.app:
#    - New Project → Deploy from GitHub
#    - Select repo
#    - Deploy

# 3. Copiar URL (ej: https://my-backend.railway.app)
```

### Vercel Frontend

```bash
# 1. En https://vercel.com:
#    - New Project → Import GitHub repo
#    - Add Environment Variable:
#      BACKEND_URL=https://my-backend.railway.app
#    - Deploy

# 2. Copiar URL (ej: https://my-frontend.vercel.app)
```

## 🎯 Flujo E2E

1. Abrir frontend
2. Conectar Freighter
3. Crear token en Blockly
4. Click "Build"
   - Frontend llama `/api/build-smart-contract`
   - Backend retorna WASM precompilado
   - ✨ < 100ms
5. Click "Deploy"
6. Firma con Freighter
7. ✅ Contrato en Stellar!

## 📦 Estructura

```
.
├── backend/                    ← Node.js Express
│   ├── api.js                 ← Main server
│   ├── compiled/              ← Precompiled WASM
│   │   ├── token_basic.wasm
│   │   ├── token_advanced.wasm
│   │   └── metadata.json
│   └── package.json
├── server.js                   ← Frontend server (updated)
├── public/                     ← Frontend assets
├── tralala/                    ← Rust workspace
└── BACKEND_SETUP.md           ← Full documentation
```

## 🔧 Variables de Entorno

### Backend
- `PORT` - Default 3001

### Frontend
- `BACKEND_URL` - Default http://localhost:3001
- `USE_BACKEND` - Default true

## 🆘 Troubleshoot

| Problema | Solución |
|----------|----------|
| Port 3001 en uso | `lsof -ti:3001 \| xargs kill -9` |
| Backend no carga | `cd backend && npm install` |
| WASM error | Verificar `backend/compiled/` existe |
| Frontend no ve backend | Verificar `BACKEND_URL` env var |

## 📚 Más Info

- `BACKEND_SETUP.md` - Setup detallado
- `HACKATHON_DEPLOYMENT.md` - Deploy a producción
- `CLAUDE.md` - Documentación del proyecto

---

**⏱️ Tiempo total: 5 minutos**
