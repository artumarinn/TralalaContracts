#!/usr/bin/env node

// Script para verificar que el setup esté listo para Render
console.log('🔍 Verificando configuración para deployment en Render...\n');

const fs = require('fs');
const path = require('path');

let issues = [];
let warnings = [];
let success = [];

// Verificar archivos críticos
const criticalFiles = [
    'render.yaml',
    'package.json',
    'server.js',
    'fallback-build.sh'
];

console.log('📁 Verificando archivos críticos...');
criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        success.push(`✅ ${file} existe`);
    } else {
        issues.push(`❌ Archivo faltante: ${file}`);
    }
});

// Verificar render.yaml
if (fs.existsSync('render.yaml')) {
    const renderYaml = fs.readFileSync('render.yaml', 'utf8');

    if (renderYaml.includes('buildCommand:')) {
        success.push('✅ render.yaml tiene buildCommand configurado');
    } else {
        issues.push('❌ render.yaml no tiene buildCommand configurado');
    }

    if (renderYaml.includes('fallback-build.sh')) {
        success.push('✅ render.yaml incluye script de fallback');
    } else {
        warnings.push('⚠️  render.yaml no incluye script de fallback');
    }

    if (renderYaml.includes('soroban-cli')) {
        success.push('✅ render.yaml intenta instalar soroban-cli');
    } else {
        warnings.push('⚠️  render.yaml no intenta instalar soroban-cli');
    }
}

// Verificar package.json
if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (packageJson.scripts && packageJson.scripts.start) {
        success.push('✅ package.json tiene script start');
    } else {
        issues.push('❌ package.json no tiene script start');
    }

    if (packageJson.engines && packageJson.engines.node) {
        success.push('✅ package.json especifica versión de Node.js');
    } else {
        warnings.push('⚠️  package.json no especifica versión de Node.js');
    }
}

// Verificar server.js
if (fs.existsSync('server.js')) {
    const serverJs = fs.readFileSync('server.js', 'utf8');

    if (serverJs.includes('checkCompilationTools')) {
        success.push('✅ server.js tiene verificación de herramientas de compilación');
    } else {
        warnings.push('⚠️  server.js no verifica herramientas de compilación');
    }

    if (serverJs.includes('fallbackMode')) {
        success.push('✅ server.js maneja modo fallback');
    } else {
        warnings.push('⚠️  server.js no maneja modo fallback');
    }

    if (serverJs.includes('/api/compilation-status')) {
        success.push('✅ server.js tiene endpoint de status de compilación');
    } else {
        warnings.push('⚠️  server.js no tiene endpoint de status');
    }
}

// Verificar script de fallback
if (fs.existsSync('fallback-build.sh')) {
    const stats = fs.statSync('fallback-build.sh');
    if (stats.mode & parseInt('111', 8)) {
        success.push('✅ fallback-build.sh es ejecutable');
    } else {
        issues.push('❌ fallback-build.sh no es ejecutable (ejecuta: chmod +x fallback-build.sh)');
    }
}

// Verificar tamaño del repositorio
const getDirectorySize = (dirPath) => {
    let size = 0;
    try {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                if (!['node_modules', '.git', 'target'].includes(file)) {
                    size += getDirectorySize(filePath);
                }
            } else {
                size += stats.size;
            }
        });
    } catch (error) {
        // Ignorar errores de permisos
    }
    return size;
};

const repoSize = getDirectorySize('.');
const repoSizeMB = (repoSize / (1024 * 1024)).toFixed(2);

if (repoSize < 50 * 1024 * 1024) { // 50MB
    success.push(`✅ Tamaño del repositorio: ${repoSizeMB}MB (optimizado para Render)`);
} else if (repoSize < 100 * 1024 * 1024) { // 100MB
    warnings.push(`⚠️  Tamaño del repositorio: ${repoSizeMB}MB (puede ser lento en Render)`);
} else {
    issues.push(`❌ Tamaño del repositorio: ${repoSizeMB}MB (demasiado grande para Render)`);
}

// Mostrar resultados
console.log('\n📊 Resultados de la verificación:\n');

if (success.length > 0) {
    console.log('🎉 Configuraciones correctas:');
    success.forEach(item => console.log(`   ${item}`));
    console.log('');
}

if (warnings.length > 0) {
    console.log('⚠️  Advertencias:');
    warnings.forEach(item => console.log(`   ${item}`));
    console.log('');
}

if (issues.length > 0) {
    console.log('❌ Problemas que deben solucionarse:');
    issues.forEach(item => console.log(`   ${item}`));
    console.log('');
}

// Conclusión
if (issues.length === 0) {
    console.log('🚀 ¡Todo listo para deployment en Render!');
    console.log('\n📝 Pasos siguientes:');
    console.log('   1. git add .');
    console.log('   2. git commit -m "Ready for Render deployment"');
    console.log('   3. git push origin main');
    console.log('   4. Crear servicio en render.com');
    console.log('   5. Conectar repositorio GitHub');
    console.log('   6. Render detectará automáticamente render.yaml');

    if (warnings.length > 0) {
        console.log('\n💡 Nota: Las advertencias no impiden el deployment, pero podrían afectar el rendimiento.');
    }
} else {
    console.log('❌ Hay problemas que deben solucionarse antes del deployment.');
    console.log('   Soluciona los problemas listados arriba y ejecuta este script nuevamente.');
    process.exit(1);
}

console.log('\n🔗 Documentación: RENDER-DEPLOY.md');
console.log('🆘 Si tienes problemas: revisa los logs en Render dashboard');
