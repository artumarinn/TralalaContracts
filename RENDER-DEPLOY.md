# 🚀 Deploy Rápido en Render

Guía específica para deployar **Tralalero Contracts** en Render con funcionalidad completa.

## ⚡ Deploy en 3 Pasos

### 1. Preparar el Repositorio

```bash
# Limpiar archivos grandes (5GB+ → ~10MB)
npm run clean

# Verificar que todo esté listo
git add .
git commit -m "Optimized for Render deployment"
git push origin main
```

### 2. Crear Servicio en Render

1. Ve a [render.com](https://render.com) y crea cuenta
2. Click **"New +"** → **"Web Service"**
3. Conecta tu repositorio GitHub
4. Render detectará automáticamente `render.yaml`

### 3. Configuración Automática

✅ **Build Command:** Configurado automáticamente  
✅ **Start Command:** `npm start`  
✅ **Variables de entorno:** Pre-configuradas  
✅ **Rust + Soroban:** Se instala automáticamente

## 🎯 Lo que Instala Automáticamente

El `render.yaml` configurará:

- ✅ Node.js y dependencias
- ✅ Rust compiler y Cargo
- ✅ WebAssembly target (`wasm32-unknown-unknown`)
- ✅ Soroban CLI para smart contracts
- ✅ Directorios necesarios

## 📊 Tamaños de Archivos

| Estado        | Tamaño | Descripción                 |
| ------------- | ------ | --------------------------- |
| **Antes**     | ~5.2GB | Con archivos de compilación |
| **Después**   | ~10MB  | Solo código fuente esencial |
| **En Render** | ~500MB | Con dependencias instaladas |

## 🔧 Variables de Entorno (Pre-configuradas)

```yaml
NODE_ENV=production
STELLAR_NETWORK=TESTNET
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
ENABLE_CONTRACT_COMPILATION=true
LOG_LEVEL=info
```

## ⚠️ Troubleshooting

### Build Fails

```bash
# Si el build falla, verificar logs en Render dashboard
# Render instala Rust automáticamente, puede tomar 5-10 minutos
```

### Smart Contracts No Compilan

- ✅ **Render:** Funcionalidad completa con Rust
- ❌ **Vercel:** Solo tokens simples (sin Rust)

### Timeout en Build

- El primer build toma más tiempo (instala Rust)
- Builds subsecuentes son más rápidos (cache)

## 🎉 Resultado Final

Una vez deployado tendrás:

- 🌐 **URL pública:** `https://tu-app.onrender.com`
- 🔒 **HTTPS automático** (necesario para wallets)
- 🚀 **Smart contracts completos** con compilación Rust
- 💰 **Tokens Stellar** con funcionalidad avanzada
- 🎮 **Interfaz Blockly** completamente funcional

## 📞 Soporte

Si algo falla:

1. Revisa los **logs en Render dashboard**
2. Verifica que el repositorio esté limpio: `npm run check`
3. Re-trigger el deploy desde Render

## 🔄 Updates Futuros

Para actualizar la app:

```bash
git add .
git commit -m "Update"
git push origin main
```

Render redeploya automáticamente.
