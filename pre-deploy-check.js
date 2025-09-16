#!/usr/bin/env node

/**
 * Verificación final antes de deployment en Render
 * Ejecutar con: node pre-deploy-check.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificación final para deployment en Render...\n');

const checks = {
    essentialFiles: false,
    templates: false,
    packageJson: false,
    renderConfig: false,
    gitignore: false,
    noLargeFiles: false
};

function checkFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${description}: ${filePath}`);
        return true;
    } else {
        console.log(`❌ ${description}: ${filePath} - FALTANTE`);
        return false;
    }
}

function checkDirectorySize(dirPath, maxSizeMB = 100) {
    try {
        const { execSync } = require('child_process');
        const sizeOutput = execSync(`du -sm "${dirPath}" 2>/dev/null || echo "0"`, { encoding: 'utf8' });
        const sizeMB = parseInt(sizeOutput.split('\t')[0]);

        if (sizeMB <= maxSizeMB) {
            console.log(`✅ Tamaño de ${dirPath}: ${sizeMB}MB (límite: ${maxSizeMB}MB)`);
            return true;
        } else {
            console.log(`⚠️  Tamaño de ${dirPath}: ${sizeMB}MB (excede límite: ${maxSizeMB}MB)`);
            return false;
        }
    } catch (error) {
        console.log(`⚠️  No se pudo verificar tamaño de ${dirPath}`);
        return true; // Asumir OK si no se puede verificar
    }
}

function checkTemplates() {
    const templateFiles = [
        'tralala/contracts/token-templates/simple_token.hbs',
        'tralala/contracts/token-templates/advanced_token.hbs',
        'tralala/contracts/token-templates/stellar_token_contract.hbs'
    ];

    let allExist = true;
    templateFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ Template: ${file}`);
        } else {
            console.log(`❌ Template faltante: ${file}`);
            allExist = false;
        }
    });

    return allExist;
}

function checkPackageJson() {
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const requiredScripts = ['start', 'clean', 'check'];
        const requiredDeps = ['express', '@stellar/stellar-sdk', 'handlebars'];

        let allGood = true;

        // Verificar scripts
        requiredScripts.forEach(script => {
            if (packageJson.scripts && packageJson.scripts[script]) {
                console.log(`✅ Script: ${script}`);
            } else {
                console.log(`❌ Script faltante: ${script}`);
                allGood = false;
            }
        });

        // Verificar dependencias críticas
        requiredDeps.forEach(dep => {
            if (packageJson.dependencies && packageJson.dependencies[dep]) {
                console.log(`✅ Dependencia: ${dep}`);
            } else {
                console.log(`❌ Dependencia faltante: ${dep}`);
                allGood = false;
            }
        });

        return allGood;
    } catch (error) {
        console.log('❌ Error leyendo package.json');
        return false;
    }
}

function checkLargeDirectories() {
    const prohibitedDirs = [
        'tralala/target',
        'tralala/dynamic-contracts',
        'tralala/compiled',
        'node_modules'
    ];

    let allGood = true;
    prohibitedDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            console.log(`❌ Directorio grande presente: ${dir} (debe estar en .gitignore)`);
            allGood = false;
        } else {
            console.log(`✅ Directorio grande ausente: ${dir}`);
        }
    });

    return allGood;
}

async function runChecks() {
    console.log('=== ARCHIVOS ESENCIALES ===');
    checks.essentialFiles =
        checkFileExists('server.js', 'Servidor principal') &&
        checkFileExists('public/index.html', 'Frontend principal') &&
        checkFileExists('public/client.js', 'Cliente Blockly') &&
        checkFileExists('public/stepper-client.js', 'Cliente Stepper');

    console.log('\n=== TEMPLATES DE SMART CONTRACTS ===');
    checks.templates = checkTemplates();

    console.log('\n=== CONFIGURACIÓN DEL PROYECTO ===');
    checks.packageJson = checkPackageJson();

    console.log('\n=== CONFIGURACIÓN DE DEPLOYMENT ===');
    checks.renderConfig = checkFileExists('render.yaml', 'Configuración Render');
    checks.gitignore = checkFileExists('.gitignore', 'GitIgnore optimizado');

    console.log('\n=== VERIFICACIÓN DE TAMAÑOS ===');
    checks.noLargeFiles = checkLargeDirectories();

    // Verificar tamaño total del proyecto
    console.log('\n=== TAMAÑO TOTAL ===');
    checkDirectorySize('.', 50); // Máximo 50MB para el repo

    console.log('\n=== RESUMEN FINAL ===');

    const allChecks = Object.values(checks).every(check => check);

    if (allChecks) {
        console.log('🎉 ¡TODO LISTO PARA DEPLOYMENT EN RENDER!');
        console.log('');
        console.log('📋 Próximos pasos:');
        console.log('   1. git add .');
        console.log('   2. git commit -m "Ready for Render deployment"');
        console.log('   3. git push origin main');
        console.log('   4. Crear Web Service en render.com');
        console.log('   5. Conectar repositorio GitHub');
        console.log('   6. Render detectará render.yaml automáticamente');
        console.log('');
        console.log('⏱️  Tiempo estimado de build en Render: 10-15 minutos');
        console.log('🎯 Funcionalidad: Completa (tokens + smart contracts)');
    } else {
        console.log('❌ HAY PROBLEMAS QUE RESOLVER');
        console.log('');
        console.log('🔧 Ejecutar para solucionar:');
        console.log('   npm run clean    # Limpiar archivos grandes');
        console.log('   npm run check    # Verificar setup');
        console.log('   npm install      # Instalar dependencias');
    }

    console.log('\n📊 Estado del repositorio:');
    console.log(`   ✅ Archivos esenciales: ${checks.essentialFiles ? 'OK' : 'FALTA'}`);
    console.log(`   ✅ Templates: ${checks.templates ? 'OK' : 'FALTA'}`);
    console.log(`   ✅ Package.json: ${checks.packageJson ? 'OK' : 'FALTA'}`);
    console.log(`   ✅ Render config: ${checks.renderConfig ? 'OK' : 'FALTA'}`);
    console.log(`   ✅ GitIgnore: ${checks.gitignore ? 'OK' : 'FALTA'}`);
    console.log(`   ✅ Sin archivos grandes: ${checks.noLargeFiles ? 'OK' : 'HAY ARCHIVOS GRANDES'}`);
}

// Verificar si estamos en el directorio correcto
if (!fs.existsSync('package.json') || !fs.existsSync('server.js')) {
    console.log('❌ Error: Ejecutar desde el directorio raíz del proyecto');
    console.log('   Debe contener package.json y server.js');
    process.exit(1);
}

runChecks().catch(error => {
    console.error('❌ Error durante verificación:', error.message);
    process.exit(1);
});
