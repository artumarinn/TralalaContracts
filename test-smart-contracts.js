// Test suite completo para Smart Contracts
// Ejecutar con: node test-smart-contracts.js

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Configuración de tests
const TEST_CONFIG = {
    serverUrl: 'http://localhost:3000',
    testWalletAddress: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37', // Test wallet
    timeout: 30000,
    verbose: true
};

// Colores para output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Utilidades de testing
class TestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            errors: []
        };
    }

    log(message, color = colors.reset) {
        if (TEST_CONFIG.verbose) {
            console.log(`${color}${message}${colors.reset}`);
        }
    }

    async test(name, testFn) {
        this.tests.push({ name, testFn });
    }

    async run() {
        this.log('\n🚀 Iniciando Test Suite de Smart Contracts\n', colors.bright + colors.cyan);

        for (const test of this.tests) {
            try {
                this.log(`\n🧪 Ejecutando: ${test.name}`, colors.yellow);
                await test.testFn();
                this.results.passed++;
                this.log(`✅ PASÓ: ${test.name}`, colors.green);
            } catch (error) {
                this.results.failed++;
                this.results.errors.push({ test: test.name, error: error.message });
                this.log(`❌ FALLÓ: ${test.name}`, colors.red);
                this.log(`   Error: ${error.message}`, colors.red);
            }
        }

        this.printResults();
    }

    printResults() {
        this.log('\n📊 RESULTADOS DEL TESTING', colors.bright + colors.blue);
        this.log('================================', colors.blue);
        this.log(`✅ Tests Pasados: ${this.results.passed}`, colors.green);
        this.log(`❌ Tests Fallidos: ${this.results.failed}`, colors.red);
        this.log(`📈 Porcentaje de Éxito: ${((this.results.passed / this.tests.length) * 100).toFixed(1)}%`, colors.cyan);

        if (this.results.errors.length > 0) {
            this.log('\n🐛 ERRORES DETALLADOS:', colors.red);
            this.results.errors.forEach(({ test, error }) => {
                this.log(`  • ${test}: ${error}`, colors.red);
            });
        }

        this.log('');
    }

    async assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    async assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, but got ${actual}`);
        }
    }

    async assertContains(haystack, needle, message) {
        if (!haystack.includes(needle)) {
            throw new Error(message || `Expected "${haystack}" to contain "${needle}"`);
        }
    }
}

// Test data
const TEST_CONTRACTS = {
    simple: {
        name: 'Token Simple Test',
        symbol: 'TST',
        decimals: 2,
        supply: 1000,
        features: {
            mintable: true,
            burnable: true,
            pausable: false,
            upgradeable: false,
            accessControl: false
        }
    },
    advanced: {
        name: 'Token Avanzado Test',
        symbol: 'TAT',
        decimals: 4,
        supply: 10000,
        features: {
            mintable: true,
            burnable: true,
            pausable: true,
            upgradeable: true,
            accessControl: true,
            governance: true,
            stakeable: true
        },
        security: {
            transferLimit: 1000,
            whitelistEnabled: true,
            freezeable: true
        },
        economics: {
            transactionFee: 2,
            burnRate: 1,
            stakingReward: 5
        }
    }
};

// Funciones auxiliares
async function makeRequest(endpoint, method = 'GET', body = null) {
    const url = `${TEST_CONFIG.serverUrl}${endpoint}`;
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        timeout: TEST_CONFIG.timeout
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    return { response, data };
}

// Tests de compilación
async function testSimpleContractCompilation(runner) {
    const { response, data } = await makeRequest('/api/compile-contract', 'POST', {
        tokenData: TEST_CONTRACTS.simple,
        userAddress: TEST_CONFIG.testWalletAddress
    });

    await runner.assert(response.ok, 'Request should succeed');
    await runner.assert(data.success, 'Compilation should succeed');
    await runner.assert(data.contractId, 'Should return contract ID');
    await runner.assert(data.wasmPath, 'Should return WASM path');

    // Verificar que el archivo WASM existe
    await runner.assert(fs.existsSync(data.wasmPath), 'WASM file should exist');

    return data.contractId;
}

async function testAdvancedContractCompilation(runner) {
    const { response, data } = await makeRequest('/api/build-smart-contract', 'POST', {
        code: TEST_CONTRACTS.advanced.symbol,
        amount: TEST_CONTRACTS.advanced.supply,
        userAddress: TEST_CONFIG.testWalletAddress,
        contractData: TEST_CONTRACTS.advanced
    });

    await runner.assert(response.ok, 'Request should succeed');
    await runner.assert(data.success, 'Advanced compilation should succeed');
    await runner.assert(data.contractId, 'Should return contract ID');
    await runner.assert(data.advancedFeatures, 'Should detect advanced features');
    await runner.assertEqual(data.templateUsed, 'advanced_token.hbs', 'Should use advanced template');

    // Verificar características específicas
    await runner.assert(data.smartContractFeatures.governance, 'Should have governance feature');
    await runner.assert(data.smartContractFeatures.stakeable, 'Should have staking feature');

    return data.contractId;
}

async function testContractValidation(runner) {
    // Test con datos inválidos
    const { response, data } = await makeRequest('/api/compile-contract', 'POST', {
        tokenData: {
            name: '', // Nombre vacío - debería fallar
            symbol: 'INVALID_SYMBOL_TOO_LONG',
            decimals: -1,
            supply: 0
        },
        userAddress: TEST_CONFIG.testWalletAddress
    });

    await runner.assert(!data.success || response.status >= 400, 'Should fail with invalid data');
}

// Tests de despliegue
async function testContractDeployment(runner) {
    // Primero compilar un contrato
    const contractId = await testSimpleContractCompilation(runner);

    const { response, data } = await makeRequest('/api/deploy-contract', 'POST', {
        contractId,
        userAddress: TEST_CONFIG.testWalletAddress,
        networkPassphrase: 'TESTNET'
    });

    await runner.assert(response.ok, 'Deploy request should succeed');
    await runner.assert(data.success, 'Deploy should succeed');
    await runner.assert(data.deployTransactionXDR, 'Should return deploy transaction XDR');

    return { contractId, deployTransactionXDR: data.deployTransactionXDR };
}

// Tests de interacción
async function testContractInteraction(runner) {
    const mockContractAddress = 'C' + 'A'.repeat(55); // Mock contract address

    const { response, data } = await makeRequest('/api/interact-contract', 'POST', {
        contractAddress: mockContractAddress,
        method: 'transfer',
        params: [TEST_CONFIG.testWalletAddress, '100'],
        userAddress: TEST_CONFIG.testWalletAddress
    });

    await runner.assert(response.ok, 'Interaction request should succeed');
    await runner.assert(data.success, 'Interaction should succeed');
    await runner.assert(data.interactionTransactionXDR, 'Should return interaction transaction XDR');
    await runner.assertEqual(data.method, 'transfer', 'Should return correct method');
}

// Tests de estado del contrato
async function testContractState(runner) {
    const mockContractAddress = 'C' + 'A'.repeat(55);

    const { response, data } = await makeRequest(`/api/contract-state/${mockContractAddress}`);

    // Este test puede fallar si el contrato no existe, pero debería manejar el error graciosamente
    if (response.ok) {
        await runner.assert(data.contractAddress, 'Should return contract address');
    } else {
        await runner.assert(response.status === 404 || response.status === 500, 'Should handle missing contract gracefully');
    }
}

// Tests de historial
async function testContractHistory(runner) {
    const mockContractAddress = 'C' + 'A'.repeat(55);

    const { response, data } = await makeRequest(`/api/contract-history/${mockContractAddress}?limit=10`);

    if (response.ok) {
        await runner.assert(Array.isArray(data.history), 'History should be an array');
        await runner.assert(typeof data.count === 'number', 'Count should be a number');
    } else {
        await runner.assert(response.status === 404 || response.status === 500, 'Should handle missing contract gracefully');
    }
}

// Tests de balance de usuario
async function testUserBalance(runner) {
    const { response, data } = await makeRequest(
        `/api/user-balance/${TEST_CONFIG.testWalletAddress}/TST/${TEST_CONFIG.testWalletAddress}`
    );

    if (response.ok) {
        await runner.assert(data.hasOwnProperty('balance'), 'Should return balance property');
        await runner.assert(data.hasOwnProperty('hasToken'), 'Should return hasToken property');
    } else {
        await runner.assert(response.status === 404 || response.status === 500, 'Should handle account errors gracefully');
    }
}

// Tests de contratos del usuario
async function testUserContracts(runner) {
    const { response, data } = await makeRequest(`/api/user-contracts/${TEST_CONFIG.testWalletAddress}`);

    await runner.assert(response.ok, 'User contracts request should succeed');
    await runner.assert(data.success, 'Should return success');
    await runner.assert(Array.isArray(data.contracts), 'Contracts should be an array');
    await runner.assert(typeof data.count === 'number', 'Count should be a number');
}

// Tests de error handling
async function testErrorHandling(runner) {
    // Test con datos faltantes
    const { response: response1 } = await makeRequest('/api/compile-contract', 'POST', {});
    await runner.assert(response1.status >= 400, 'Should return error for missing data');

    // Test con dirección inválida
    const { response: response2 } = await makeRequest('/api/user-contracts/INVALID_ADDRESS');
    await runner.assert(response2.status >= 400, 'Should return error for invalid address');

    // Test con método no existente
    const { response: response3 } = await makeRequest('/api/nonexistent-endpoint');
    await runner.assert(response3.status === 404, 'Should return 404 for nonexistent endpoint');
}

// Tests de performance
async function testPerformance(runner) {
    const startTime = Date.now();

    // Test multiple compilation requests
    const promises = [];
    for (let i = 0; i < 3; i++) {
        promises.push(makeRequest('/api/compile-contract', 'POST', {
            tokenData: {
                ...TEST_CONTRACTS.simple,
                name: `Performance Test ${i}`,
                symbol: `PT${i}`
            },
            userAddress: TEST_CONFIG.testWalletAddress
        }));
    }

    await Promise.all(promises);

    const endTime = Date.now();
    const duration = endTime - startTime;

    await runner.assert(duration < 60000, `Performance test should complete in under 60 seconds (took ${duration}ms)`);

    runner.log(`⚡ Performance: 3 compilations completed in ${duration}ms`, colors.cyan);
}

// Tests de integridad de archivos
async function testFileIntegrity(runner) {
    // Verificar que los directorios necesarios existen
    const requiredDirs = [
        path.join(__dirname, 'tralala', 'contracts', 'token-templates'),
        path.join(__dirname, 'tralala', 'compiled'),
        path.join(__dirname, 'tralala', 'dynamic-contracts')
    ];

    for (const dir of requiredDirs) {
        await runner.assert(fs.existsSync(dir), `Required directory should exist: ${dir}`);
    }

    // Verificar que los templates existen
    const requiredTemplates = [
        path.join(__dirname, 'tralala', 'contracts', 'token-templates', 'simple_token.hbs'),
        path.join(__dirname, 'tralala', 'contracts', 'token-templates', 'advanced_token.hbs')
    ];

    for (const template of requiredTemplates) {
        await runner.assert(fs.existsSync(template), `Template should exist: ${template}`);
    }
}

// Ejecutar todos los tests
async function runAllTests() {
    const runner = new TestRunner();

    // Tests de compilación
    await runner.test('Compilación de contrato simple', () => testSimpleContractCompilation(runner));
    await runner.test('Compilación de contrato avanzado', () => testAdvancedContractCompilation(runner));
    await runner.test('Validación de datos de contrato', () => testContractValidation(runner));

    // Tests de despliegue
    await runner.test('Despliegue de contrato', () => testContractDeployment(runner));

    // Tests de interacción
    await runner.test('Interacción con contrato', () => testContractInteraction(runner));
    await runner.test('Estado del contrato', () => testContractState(runner));
    await runner.test('Historial del contrato', () => testContractHistory(runner));

    // Tests de usuario
    await runner.test('Balance de usuario', () => testUserBalance(runner));
    await runner.test('Contratos del usuario', () => testUserContracts(runner));

    // Tests de sistema
    await runner.test('Manejo de errores', () => testErrorHandling(runner));
    await runner.test('Performance', () => testPerformance(runner));
    await runner.test('Integridad de archivos', () => testFileIntegrity(runner));

    await runner.run();

    // Generar reporte
    const report = {
        timestamp: new Date().toISOString(),
        results: runner.results,
        config: TEST_CONFIG,
        totalTests: runner.tests.length
    };

    fs.writeFileSync(
        path.join(__dirname, 'test-results.json'),
        JSON.stringify(report, null, 2)
    );

    runner.log('📄 Reporte guardado en: test-results.json', colors.blue);

    // Exit code basado en resultados
    process.exit(runner.results.failed > 0 ? 1 : 0);
}

// Verificar que el servidor está corriendo
async function checkServer() {
    try {
        const { response } = await makeRequest('/');
        if (!response.ok) {
            throw new Error('Server not responding correctly');
        }
        console.log('✅ Servidor detectado y funcionando');
        return true;
    } catch (error) {
        console.error('❌ Error: El servidor no está corriendo en', TEST_CONFIG.serverUrl);
        console.error('   Inicia el servidor con: node server.js');
        console.error('   Error:', error.message);
        process.exit(1);
    }
}

// Main execution
if (require.main === module) {
    console.log('🧪 Iniciando Test Suite para Smart Contracts');
    console.log('============================================');

    checkServer().then(() => {
        runAllTests().catch(error => {
            console.error('❌ Error fatal en test suite:', error);
            process.exit(1);
        });
    });
}

module.exports = {
    TestRunner,
    runAllTests,
    TEST_CONFIG,
    TEST_CONTRACTS
};
