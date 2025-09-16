#!/bin/bash

# Fallback build script para cuando soroban-cli falla
# Este script permite que la app funcione sin compilación de smart contracts

set -e

echo "🔧 Iniciando build fallback..."

# Instalar dependencias Node.js
echo "📦 Instalando dependencias Node.js..."
npm install

# Crear directorios necesarios
echo "📁 Creando directorios..."
mkdir -p tralala/dynamic-contracts tralala/compiled

# Crear un mock de soroban-cli si no existe
if ! command -v soroban &> /dev/null; then
    echo "⚠️  soroban-cli no disponible, creando mock..."
    
    # Crear un script mock de soroban
    cat > /usr/local/bin/soroban << 'EOF'
#!/bin/bash
echo "Mock soroban-cli - Smart contract compilation disabled"
echo "Version: mock-1.0.0"
if [[ "$1" == "--version" ]]; then
    echo "soroban-cli mock-1.0.0"
    exit 0
fi
echo "Error: Smart contract compilation not available in this environment"
exit 1
EOF
    chmod +x /usr/local/bin/soroban
    
    # Configurar variable de entorno para indicar modo fallback
    echo "SOROBAN_FALLBACK_MODE=true" >> ~/.bashrc
fi

# Verificar que todo esté listo
echo "✅ Verificando configuración..."
node --version
npm --version

echo "🎉 Build fallback completado!"
echo "⚠️  Nota: Smart contracts pueden no estar disponibles"
