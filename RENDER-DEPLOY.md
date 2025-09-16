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

### Error "soroban-cli compilation failed" (exit code 101)

**Problema:** El error más común en Render es la falla de compilación de soroban-cli.

**Soluciones implementadas:**

1. **Múltiples versiones de fallback:** El build intentará instalar diferentes versiones de soroban-cli
2. **Modo fallback automático:** Si la compilación falla, la app funcionará con tokens simples
3. **Dependencias optimizadas:** Se instalan todas las dependencias necesarias para Alpine/Ubuntu

**Para verificar antes del deploy:**

```bash
npm run verify-render
```

### Build Fails - Pasos de diagnóstico

1. **Verificar logs en Render dashboard**
2. **Ejecutar verificación local:**
   ```bash
   npm run render-ready
   ```
3. **Si persiste el error, el build usará modo fallback automáticamente**

### Smart Contracts No Compilan

- ✅ **Render (modo completo):** Rust + soroban-cli instalado correctamente
- ⚠️ **Render (modo fallback):** Solo tokens simples, smart contracts deshabilitados
- ❌ **Vercel:** Solo tokens simples (sin Rust)

**La app detecta automáticamente qué funcionalidades están disponibles.**

### Timeout en Build

- **Primer build:** 10-15 minutos (instala Rust + soroban-cli)
- **Builds subsecuentes:** 3-5 minutos (usa cache)
- **Modo fallback:** 1-2 minutos (solo Node.js)

### Verificación de Estado

Una vez deployado, visita `/api/compilation-status` para ver el estado:

```json
{
  "available": true,
  "tools": {
    "cargo": true,
    "rustc": true,
    "soroban": true,
    "wasm32Target": true
  },
  "message": "Compilación de smart contracts disponible"
}
```

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
