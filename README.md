# 🎮 Tralalero Contracts

Una aplicación web que permite crear smart contracts de Stellar usando bloques visuales, diseñada para que sea fácil como un juego de niños.

## 📋 Requisitos del Sistema

### Para Desarrollo Local

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Rust** y **Cargo** (para compilación de smart contracts)
- **Stellar CLI** (opcional, para deployment automático)

### Para Deployment en Producción

- Los servicios cloud manejan Node.js automáticamente
- La compilación de smart contracts puede estar limitada en algunos servicios

## 🚀 Instalación y Setup

### 1. Clonar el repositorio

```bash
git clone <tu-repo-url>
cd tralalerocontracts-app
```

### 2. Instalar dependencias de Node.js

```bash
npm install
# o usar el script de setup
npm run setup
```

### 3. Instalar Rust y herramientas (para desarrollo local)

```bash
# Instalar Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Agregar target para WebAssembly
rustup target add wasm32-unknown-unknown

# Instalar Stellar CLI (opcional)
cargo install soroban-cli
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
# o
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 🌐 Deployment

### Vercel (Recomendado para frontend + API)

1. **Conectar con GitHub:**

   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu repositorio de GitHub
   - Vercel detectará automáticamente la configuración

2. **Variables de entorno (opcional):**

   ```
   NODE_ENV=production
   STELLAR_NETWORK=TESTNET
   ```

3. **Limitaciones en Vercel:**
   - ⚠️ La compilación de smart contracts puede fallar
   - Solo funciona la creación de tokens simples (sin compilación Rust)

### Render (Recomendado para funcionalidad completa)

1. **Crear nuevo Web Service:**

   - Ve a [render.com](https://render.com)
   - Conecta tu repositorio
   - Usa estas configuraciones:
     ```
     Build Command: npm install
     Start Command: npm start
     ```

2. **Variables de entorno:**

   ```
   NODE_ENV=production
   PORT=(auto-asignado)
   ```

3. **Ventajas de Render:**
   - ✅ Permite instalación de Rust/Cargo
   - ✅ Compilación completa de smart contracts
   - ✅ Persistent filesystem para archivos temporales

### Railway

1. **Deploy directo:**

   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

2. **Configuración automática:** Railway detecta Node.js automáticamente

### Heroku

1. **Setup:**
   ```bash
   heroku create tu-app-name
   heroku buildpacks:add heroku/nodejs
   heroku buildpacks:add https://github.com/emk/heroku-buildpack-rust
   git push heroku main
   ```

## 🔧 Configuración por Servicio

### ✅ Servicios Compatibles (Funcionalidad Completa)

- **Render** - Mejor opción
- **Railway** - Buena alternativa
- **Heroku** - Con buildpack de Rust
- **DigitalOcean App Platform**
- **VPS tradicional** (Ubuntu/CentOS)

### ⚠️ Servicios con Limitaciones

- **Vercel** - Solo tokens simples, sin smart contracts compilados
- **Netlify Functions** - Limitaciones similares a Vercel
- **AWS Lambda** - Requiere configuración especial

## 📁 Estructura del Proyecto

```
tralalerocontracts-app/
├── public/                 # Frontend (HTML, CSS, JS)
│   ├── index.html         # Página principal
│   ├── client.js          # Lógica de Blockly
│   ├── stepper-client.js  # Lógica del stepper
│   └── style.css          # Estilos
├── server.js              # Servidor Express
├── package.json           # Dependencias Node.js
├── vercel.json           # Configuración Vercel
├── render.yaml           # Configuración Render
├── Dockerfile            # Para containerización
└── tralala/              # Smart contracts Rust
    ├── contracts/        # Templates de contratos
    ├── dynamic-contracts/# Contratos generados
    └── compiled/         # Contratos compilados
```

## 🐛 Problemas Comunes y Soluciones

### "Rust/Cargo not found"

- **Causa:** Rust no está instalado en el servidor
- **Solución:** Usar Render o Railway que permiten buildpacks personalizados

### "Permission denied" al crear archivos

- **Causa:** Servicios serverless no permiten escritura
- **Solución:** La app funcionará sin compilación, solo tokens simples

### "Port already in use"

- **Causa:** Puerto 3000 hardcodeado en desarrollo
- **Solución:** Ya solucionado con `process.env.PORT || 3000`

### Wallet no conecta

- **Causa:** HTTPS requerido en producción para wallets
- **Solución:** Todos los servicios mencionados usan HTTPS automáticamente

## 🔐 Seguridad

- ✅ No se almacenan claves privadas
- ✅ Los usuarios firman transacciones en su wallet
- ✅ Solo se usa red TESTNET
- ✅ No hay variables de entorno sensibles

## 🎯 Funcionalidades por Servicio

| Servicio | Tokens Simples | Smart Contracts | Rust Compilation   | Costo  |
| -------- | -------------- | --------------- | ------------------ | ------ |
| Vercel   | ✅             | ⚠️              | ❌                 | Gratis |
| Render   | ✅             | ✅              | ✅                 | Gratis |
| Railway  | ✅             | ✅              | ✅                 | Gratis |
| Heroku   | ✅             | ✅              | ✅ (con buildpack) | Gratis |

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs del servicio de deployment
2. Verifica que las dependencias estén instaladas
3. Confirma que el puerto esté configurado correctamente
4. Para smart contracts, asegúrate de que Rust esté disponible

## 🚀 Próximos Pasos

1. **Deploy en Render** (recomendado)
2. Configurar dominio personalizado
3. Agregar monitoreo con logs
4. Implementar caché para compilaciones
5. Agregar tests automatizados
