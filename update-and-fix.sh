#!/bin/bash

# Script de Actualización Automática: Stellar SDK Best Practices
# Este script actualiza el SDK y aplica las mejores prácticas

echo "════════════════════════════════════════════════════"
echo "🚀 STELLAR SDK UPDATE & FIX SCRIPT"
echo "════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Verificar que estamos en el directorio correcto
echo "📁 Verificando directorio..."
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json${NC}"
    echo "   Por favor ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi
echo -e "${GREEN}✅ Directorio correcto${NC}"
echo ""

# Step 2: Actualizar SDK en raíz
echo "📦 Actualizando Stellar SDK en raíz..."
npm install @stellar/stellar-sdk@^12.3.0 --save
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SDK actualizado en raíz${NC}"
else
    echo -e "${RED}❌ Error actualizando SDK en raíz${NC}"
    exit 1
fi
echo ""

# Step 3: Actualizar SDK en backend
echo "📦 Actualizando Stellar SDK en backend..."
cd backend
npm install @stellar/stellar-sdk@^12.3.0 --save
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SDK actualizado en backend${NC}"
else
    echo -e "${RED}❌ Error actualizando SDK en backend${NC}"
    exit 1
fi
cd ..
echo ""

# Step 4: Verificar versiones
echo "🔍 Verificando versiones instaladas..."
ROOT_VERSION=$(npm list @stellar/stellar-sdk --depth=0 | grep @stellar/stellar-sdk | awk '{print $2}' | sed 's/@//')
BACKEND_VERSION=$(cd backend && npm list @stellar/stellar-sdk --depth=0 | grep @stellar/stellar-sdk | awk '{print $2}' | sed 's/@//' && cd ..)

echo "   Raíz: $ROOT_VERSION"
echo "   Backend: $BACKEND_VERSION"

if [[ $ROOT_VERSION == 12.3.* ]] && [[ $BACKEND_VERSION == 12.3.* ]]; then
    echo -e "${GREEN}✅ Versiones correctas instaladas${NC}"
else
    echo -e "${YELLOW}⚠️  Advertencia: Versiones no coinciden con 12.3.x${NC}"
fi
echo ""

# Step 5: Información sobre el código
echo "════════════════════════════════════════════════════"
echo "📋 PRÓXIMOS PASOS MANUALES:"
echo "════════════════════════════════════════════════════"
echo ""
echo "1️⃣  Reemplazar función deployToStellar() en public/index.html"
echo "    📄 El código correcto está en: deployment-fix-best-practices.js"
echo "    📍 Busca: async function deployToStellar("
echo "    🔄 Reemplaza toda la función con el código nuevo"
echo ""
echo "2️⃣  Reiniciar servidores:"
echo "    Terminal 1: cd backend && npm start"
echo "    Terminal 2: npm run dev"
echo ""
echo "3️⃣  Hard reload en navegador:"
echo "    Windows/Linux: Ctrl + Shift + R"
echo "    Mac: Cmd + Shift + R"
echo ""
echo "════════════════════════════════════════════════════"
echo "📚 DOCUMENTACIÓN COMPLETA:"
echo "════════════════════════════════════════════════════"
echo ""
echo "   📖 IMPLEMENTATION_GUIDE.md - Guía paso a paso completa"
echo "   📖 BEST_PRACTICES_FIX.md - Explicación de los cambios"
echo "   📖 deployment-fix-best-practices.js - Código correcto"
echo ""
echo "════════════════════════════════════════════════════"
echo "✅ ACTUALIZACIÓN DE SDK COMPLETADA"
echo "════════════════════════════════════════════════════"
echo ""
echo "🎯 Ahora sigue los pasos manuales de arriba para completar la implementación."
echo ""
