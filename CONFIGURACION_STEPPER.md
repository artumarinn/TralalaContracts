# Configuración del Stepper de Tralalero Contracts

## 🎯 Nuevo Sistema de Stepper

He implementado un sistema de stepper moderno que guía al usuario paso a paso para crear su token de Stellar. El sistema reemplaza la interfaz de bloques anterior con una experiencia más intuitiva.

## 📋 Pasos del Stepper

### Paso 1: Conectar Wallet

- El usuario puede elegir entre Freighter, xBull o Albedo
- Se integra con Stellar Wallets Kit para manejo unificado
- La dirección del wallet se usa automáticamente como administrador

### Paso 2: Información Básica

- Nombre del token
- Símbolo del token (máximo 12 caracteres)
- Número de decimales (2-8)

### Paso 3: Suministro Inicial

- Cantidad inicial de tokens
- Dirección del administrador (automática desde wallet)

### Paso 4: Características Avanzadas

- ¿Puede el administrador crear más tokens? (Mint)
- ¿Se pueden quemar tokens? (Burn)
- ¿Se puede pausar el contrato?
- Límite máximo por transferencia

### Paso 5: Revisar y Crear

- Resumen completo de la configuración
- Creación del token en la red Stellar
- Enlaces a exploradores de blockchain

## 🛠️ Configuración Requerida

### 1. Archivo .env

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Clave secreta de la cuenta del servidor (debe tener XLM para crear tokens)
STELLAR_SECRET_KEY=tu_clave_secreta_aqui

# Red de Stellar (TESTNET para desarrollo)
STELLAR_NETWORK=TESTNET

# URL del servidor Horizon
HORIZON_URL=https://horizon-testnet.stellar.org
```

### 2. Obtener Clave Secreta

1. Ve a https://laboratory.stellar.org/#account-creator?network=testnet
2. Genera una nueva cuenta
3. Copia la clave secreta (Secret Key)
4. Funda la cuenta con XLM usando el Friendbot
5. Pega la clave secreta en el archivo .env

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Ejecutar el Servidor

```bash
npm start
```

## 🎨 Características del Stepper

- **Diseño Moderno**: Interfaz limpia y profesional
- **Validación en Tiempo Real**: Errores mostrados inmediatamente
- **Navegación Intuitiva**: Botones anterior/siguiente con validación
- **Integración de Wallets**: Soporte para múltiples wallets de Stellar
- **Resumen Visual**: Vista previa completa antes de crear el token
- **Feedback Visual**: Estados de carga y resultados claros

## 🔧 Archivos Modificados

- `public/index.html`: Nueva interfaz con stepper
- `public/stepper-client.js`: Lógica del stepper y manejo de wallets
- `server.js`: API actualizada para recibir datos del stepper
- `package.json`: Dependencias actualizadas

## 🚀 Uso

1. Abre http://localhost:3000
2. Conecta tu wallet de Stellar
3. Completa los pasos del stepper
4. Revisa la configuración
5. ¡Crea tu token!

## 📱 Compatibilidad

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Wallets: Freighter, xBull, Albedo
- Red: Stellar Testnet
