#!/bin/bash

# Script para limpiar el repositorio antes de commit
# Ejecutar: bash cleanup-for-git.sh

echo "🧹 Limpiando archivos grandes para Git..."

# Eliminar directorios de compilación Rust (4.6GB+)
if [ -d "tralala/target" ]; then
    echo "🗑️  Eliminando tralala/target/ ($(du -sh tralala/target | cut -f1))"
    rm -rf tralala/target/
fi

if [ -d "tralala/dynamic-contracts" ]; then
    echo "🗑️  Eliminando tralala/dynamic-contracts/ ($(du -sh tralala/dynamic-contracts | cut -f1))"
    rm -rf tralala/dynamic-contracts/
fi

if [ -d "tralala/compiled" ]; then
    echo "🗑️  Eliminando tralala/compiled/ ($(du -sh tralala/compiled | cut -f1))"
    rm -rf tralala/compiled/
fi

# Eliminar node_modules si existe
if [ -d "node_modules" ]; then
    echo "🗑️  Eliminando node_modules/ ($(du -sh node_modules | cut -f1))"
    rm -rf node_modules/
fi

# Eliminar archivos de log
find . -name "*.log" -type f -delete 2>/dev/null
echo "🗑️  Eliminando archivos *.log"

# Eliminar archivos temporales
find . -name "*.tmp" -type f -delete 2>/dev/null
find . -name "*.temp" -type f -delete 2>/dev/null
find . -name "*.bak" -type f -delete 2>/dev/null
echo "🗑️  Eliminando archivos temporales"

# Eliminar archivos del sistema
find . -name ".DS_Store" -type f -delete 2>/dev/null
find . -name "Thumbs.db" -type f -delete 2>/dev/null
echo "🗑️  Eliminando archivos del sistema"

# Limpiar cache de Git
git gc --prune=now --aggressive 2>/dev/null || echo "ℹ️  No es un repositorio Git o no se pudo limpiar cache"

# Mostrar tamaño final
echo ""
echo "📊 Tamaño final del proyecto:"
du -sh . | grep -v ".git"

echo ""
echo "✅ Limpieza completada!"
echo ""
echo "📝 Archivos que SÍ se incluirán en Git:"
echo "   ✅ public/ (frontend)"
echo "   ✅ server.js (backend)"
echo "   ✅ package.json y package-lock.json"
echo "   ✅ tralala/contracts/token-templates/ (templates)"
echo "   ✅ templates/ (handlebars)"
echo "   ✅ Archivos de configuración (render.yaml, vercel.json, etc.)"
echo ""
echo "🚫 Archivos excluidos por .gitignore:"
echo "   ❌ tralala/target/ (4.6GB de compilaciones)"
echo "   ❌ tralala/dynamic-contracts/ (contratos generados)"
echo "   ❌ tralala/compiled/ (contratos compilados)"
echo "   ❌ node_modules/ (dependencias, se instalan con npm)"
echo ""
echo "🎯 Próximos pasos:"
echo "   1. git add ."
echo "   2. git commit -m 'Optimized for deployment'"
echo "   3. git push origin main"
echo "   4. Deploy en Render con funcionalidad completa"
