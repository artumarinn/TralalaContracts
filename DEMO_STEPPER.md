# 🎮 Demo del Stepper de Tralalero Contracts

## 🚀 Cómo Probar el Nuevo Sistema

### 1. Preparación

```bash
# Instalar dependencias
npm install

# Crear archivo .env con tu clave secreta
echo "STELLAR_SECRET_KEY=tu_clave_secreta_aqui" > .env

# Iniciar servidor
npm start
```

### 2. Abrir la Aplicación

Ve a http://localhost:3000 en tu navegador

### 3. Flujo de Uso

#### Paso 1: Conectar Wallet 🔗

- Haz clic en uno de los botones de wallet (Freighter, xBull, o Albedo)
- Acepta la conexión en tu wallet
- Verás tu dirección y el estado "Wallet Conectado"

#### Paso 2: Información Básica 🎨

- **Nombre del Token**: Ej. "Mi Token Mágico"
- **Símbolo**: Ej. "MAGIC" (máximo 12 caracteres)
- **Decimales**: Selecciona 2 (recomendado)

#### Paso 3: Suministro Inicial 💰

- **Cantidad Inicial**: Ej. 1000
- **Administrador**: Se llena automáticamente con tu dirección

#### Paso 4: Características Avanzadas ✨

- Marca/desmarca las opciones según prefieras:
  - ✅ Puede crear más tokens (Mint)
  - ✅ Se pueden quemar tokens (Burn)
  - ✅ Se puede pausar el contrato
- **Límite de Transferencia**: 0 (sin límite)

#### Paso 5: Revisar y Crear 🚀

- Revisa el resumen de tu token
- Haz clic en "Crear Token"
- Espera a que se procese la transacción
- ¡Ve los enlaces a los exploradores!

## 🎯 Características Destacadas

### ✅ Validación en Tiempo Real

- Errores mostrados inmediatamente
- Validación de formato de símbolo
- Verificación de campos requeridos

### ✅ Navegación Intuitiva

- Botones anterior/siguiente
- Progreso visual en el stepper
- Estados de pasos (activo, completado)

### ✅ Integración de Wallets

- Soporte para múltiples wallets
- Conexión automática
- Detección de red (testnet)

### ✅ Feedback Visual

- Estados de carga durante creación
- Mensajes de éxito/error
- Enlaces a exploradores de blockchain

## 🔧 Solución de Problemas

### Error: "STELLAR_SECRET_KEY no está configurada"

- Crea un archivo `.env` con tu clave secreta
- Asegúrate de que la cuenta tenga XLM suficiente

### Error: "Wallet no detectado"

- Instala Freighter desde freighter.app
- O usa xBull o Albedo como alternativa

### Error: "Balance insuficiente"

- La cuenta del servidor necesita al menos 6 XLM
- Usa el Friendbot de Stellar para fondear

## 📱 Capturas de Pantalla

El stepper incluye:

- Interfaz moderna con colores atractivos
- Indicadores de progreso animados
- Formularios con validación
- Resumen visual antes de crear
- Resultados con enlaces a exploradores

## 🎉 ¡Listo!

El nuevo sistema de stepper hace que crear tokens de Stellar sea:

- **Más fácil**: Paso a paso guiado
- **Más seguro**: Validación completa
- **Más profesional**: Interfaz moderna
- **Más intuitivo**: Sin necesidad de conocimientos técnicos
