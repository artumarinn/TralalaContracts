#!/usr/bin/env node

/**
 * Script de verificación de setup para Tralalero Contracts
 * Ejecutar con: node check-setup.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execAsync = util.promisify(exec);

console.log('🔍 Verificando setup de Tralalero Contracts...\n');

const checks = {
    node: false,
    npm: false,
    rust: false,
    cargo: false,
    wasm32: false,
    soroban: false,
    directories: false,
    dependencies: false
};

async function checkCommand(command, name) {
    try {
        const { stdout } = await execAsync(`${command} --version`);
        console.log(`✅ ${name}: ${stdout.trim()}`);
        return true;
    } catch (error) {
        console.log(`❌ ${name}: No encontrado`);
        return false;
    }
}

async function checkDirectories() {
    const dirs = [
        'public',
        'tralala',
        'tralala/contracts',
        'tralala/dynamic-contracts',
        'tralala/compiled'
    ];

    let allExist = true;
    for (const dir of dirs) {
        if (fs.existsSync(dir)) {
            console.log(`✅ Directorio: ${dir}`);
        } else {
            console.log(`❌ Directorio faltante: ${dir}`);
            allExist = false;
        }
    }
    return allExist;
}

async function checkDependencies() {
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const nodeModulesExists = fs.existsSync('node_modules');

        if (nodeModulesExists) {
            console.log('✅ node_modules existe');
            console.log(`✅ Dependencias principales: ${Object.keys(packageJson.dependencies).length}`);
            return true;
        } else {
            console.log('❌ node_modules no existe - ejecutar npm install');
            return false;
        }
    } catch (error) {
        console.log('❌ Error leyendo package.json');
        return false;
    }
}

async function checkWasm32Target() {
    try {
        const { stdout } = await execAsync('rustup target list --installed');
        if (stdout.includes('wasm32-unknown-unknown')) {
            console.log('✅ wasm32-unknown-unknown target instalado');
            return true;
        } else {
            console.log('❌ wasm32-unknown-unknown target no instalado');
            console.log('   Ejecutar: rustup target add wasm32-unknown-unknown');
            return false;
        }
    } catch (error) {
        console.log('❌ No se puede verificar targets de Rust');
        return false;
    }
}

async function runChecks() {
    console.log('=== VERIFICACIÓN DE HERRAMIENTAS BÁSICAS ===');
    checks.node = await checkCommand('node', 'Node.js');
    checks.npm = await checkCommand('npm', 'npm');

    console.log('\n=== VERIFICACIÓN DE HERRAMIENTAS RUST ===');
    checks.rust = await checkCommand('rustc', 'Rust compiler');
    checks.cargo = await checkCommand('cargo', 'Cargo');

    if (checks.rust && checks.cargo) {
        checks.wasm32 = await checkWasm32Target();
        checks.soroban = await checkCommand('soroban', 'Soroban CLI');
    }

    console.log('\n=== VERIFICACIÓN DE ESTRUCTURA DEL PROYECTO ===');
    checks.directories = await checkDirectories();
    checks.dependencies = await checkDependencies();

    console.log('\n=== RESUMEN ===');

    const essential = checks.node && checks.npm && checks.directories && checks.dependencies;
    const smartContracts = checks.rust && checks.cargo && checks.wasm32;

    if (essential) {
        console.log('✅ CONFIGURACIÓN BÁSICA: OK');
        console.log('   - La app puede ejecutarse');
        console.log('   - Tokens simples funcionarán');
    } else {
        console.log('❌ CONFIGURACIÓN BÁSICA: FALTA');
        console.log('   - Ejecutar: npm install');
        console.log('   - Verificar Node.js >= 16');
    }

    if (smartContracts) {
        console.log('✅ SMART CONTRACTS: OK');
        console.log('   - Compilación de contratos disponible');
        console.log('   - Funcionalidad completa');
    } else {
        console.log('⚠️  SMART CONTRACTS: LIMITADO');
        console.log('   - Solo tokens simples sin compilación');
        console.log('   - Para funcionalidad completa:');
        console.log('     1. curl --proto="=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh');
        console.log('     2. source ~/.cargo/env');
        console.log('     3. rustup target add wasm32-unknown-unknown');
        console.log('     4. cargo install soroban-cli (opcional)');
    }

    console.log('\n=== COMANDOS DISPONIBLES ===');
    console.log('npm start          - Ejecutar servidor');
    console.log('npm run dev        - Desarrollo con nodemon');
    console.log('npm run setup      - Setup inicial');
    console.log('node check-setup.js - Este script');

    if (essential) {
        console.log('\n🚀 ¡Todo listo! Ejecutar: npm start');
    } else {
        console.log('\n🔧 Completar setup antes de continuar');
    }
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
