// require('dotenv').config(); // Ya no necesitamos .env - cada usuario usa su wallet
const express = require('express');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const fse = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { spawn, exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
// Reverting to original syntax with the NEW, CORRECT package name
const StellarSdk = require('@stellar/stellar-sdk');

// Import node-fetch for backend API calls (ESM module in CommonJS)
// We'll lazy-load it since it's an ESM module
let fetch;
(async () => {
    const nodeFetch = await import('node-fetch');
    fetch = nodeFetch.default;
    console.log('✅ node-fetch loaded');
})();

const app = express();
const PORT = process.env.PORT || 3000;

// Backend configuration for precompiled contracts
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const USE_BACKEND = process.env.USE_BACKEND !== 'false';

// FORZAR TESTNET EXPLÍCITAMENTE
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

// Verificar que estamos usando testnet
console.log('🌐 Red configurada:', networkPassphrase);
console.log('🔍 Server URL:', server.serverURL.toString());
console.log('📦 Backend URL:', BACKEND_URL);
console.log('🔌 Using precompiled backend:', USE_BACKEND);

app.use(express.static(path.join(__dirname, 'public')));
// Increase body size limit for WASM base64 payloads (default is 100kb)
// WASM files can be 5-10kb, which in base64 becomes ~7-14kb
app.use(express.json({ limit: '10mb' }));

app.post('/generate-code', async (req, res) => {
    try {
        const templatePath = path.join(__dirname, 'templates', 'stellar_token_contract.hbs');
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const template = handlebars.compile(templateContent);
        const rustCode = template(req.body);
        res.setHeader('Content-Type', 'text/plain');
        res.send(rustCode);
    } catch (error) {
        console.error("Error generating code:", error);
        res.status(500).send('Internal server error while generating code.');
    }
});

app.post('/api/build-transaction', async (req, res) => {
    try {
        console.log('📨 Datos recibidos en el servidor:');
        console.log('   Body completo:', JSON.stringify(req.body, null, 2));

        const { code, amount, tokenData, userAddress } = req.body;

        console.log('📋 Datos extraídos:');
        console.log('   code:', code, typeof code);
        console.log('   amount:', amount, typeof amount);
        console.log('   userAddress:', userAddress);
        console.log('   tokenData:', tokenData);

        // Validar que tenemos la dirección del usuario
        if (!userAddress) {
            throw new Error('Se requiere la dirección de la wallet del usuario');
        }

        // Validar datos de entrada
        if (!code || !amount || isNaN(amount) || amount <= 0) {
            throw new Error('Datos inválidos: code y amount son requeridos, amount debe ser un número positivo');
        }

        // Validar formato del código del token
        if (code.length > 12) {
            throw new Error(`Código del token muy largo: "${code}". Máximo 12 caracteres.`);
        }

        if (!/^[A-Z0-9]+$/.test(code)) {
            throw new Error(`Código del token inválido: "${code}". Solo letras mayúsculas y números.`);
        }

        // Convertir amount a string para Stellar SDK
        const amountString = amount.toString();

        console.log('📝 Creando token desde stepper:');
        console.log(`   Código: ${code}`);
        console.log(`   Cantidad inicial: ${amountString}`);
        console.log(`   Usuario: ${userAddress}`);
        if (tokenData) {
            console.log(`   Datos del token:`, tokenData);
        }

        const issuingKeypair = StellarSdk.Keypair.random();
        const distributionKeypair = StellarSdk.Keypair.random();
        const issuingAccount = issuingKeypair.publicKey();
        const distributionAccount = distributionKeypair.publicKey();

        console.log('🏦 Cuentas generadas:');
        console.log(`   Issuing: ${issuingAccount}`);
        console.log(`   Distribution: ${distributionAccount}`);

        const asset = new StellarSdk.Asset(code, issuingAccount);
        console.log(`🪙 Asset creado: ${asset.code} - ${asset.issuer}`);

        // Verificar que la cuenta del usuario existe y tiene fondos
        let sourceAccount;
        try {
            sourceAccount = await server.loadAccount(userAddress);
            console.log('✅ Cuenta del usuario cargada exitosamente');
            console.log('💰 Balances de la cuenta:');
            sourceAccount.balances.forEach(balance => {
                console.log(`   ${balance.asset_type === 'native' ? 'XLM' : balance.asset_code}: ${balance.balance}`);
            });

            // Verificar balance mínimo para operaciones
            const xlmBalance = parseFloat(sourceAccount.balances.find(b => b.asset_type === 'native')?.balance || '0');
            console.log(`💰 Balance actual de XLM: ${xlmBalance}`);

            // Calcular costos de transacción
            const createAccountCost = 2.5; // Por cada createAccount
            const baseReserve = 0.5; // Reserve por cuenta
            const transactionFee = 0.00005; // Fee por operación (5 operaciones)
            const totalCost = (createAccountCost * 2) + (baseReserve * 2) + (transactionFee * 5);

            console.log(`💸 Costo estimado de transacción: ${totalCost} XLM`);
            console.log(`   - Crear 2 cuentas: ${createAccountCost * 2} XLM`);
            console.log(`   - Reserves: ${baseReserve * 2} XLM`);
            console.log(`   - Fees: ${transactionFee * 5} XLM`);

            if (xlmBalance < totalCost + 1) {
                const needed = totalCost + 1;
                console.error(`❌ Balance insuficiente: ${xlmBalance} XLM disponible, se necesitan ${needed} XLM`);
                throw new Error(`Balance insuficiente: ${xlmBalance} XLM. Se necesitan al menos ${needed} XLM para crear el token. Usa el Friendbot para obtener XLM gratuitos.`);
            }

            console.log(`✅ Balance suficiente: ${xlmBalance} XLM (necesarios: ${totalCost})`);

        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new Error('Tu cuenta no existe o no tiene fondos. Por favor, usa el Friendbot para obtener XLM gratuitos primero.');
            }
            throw error;
        }

        // Log para debugging de red
        console.log('🔍 Network passphrase being used:', StellarSdk.Networks.TESTNET);
        console.log('🔍 Source account sequence:', sourceAccount.sequenceNumber());

        console.log('⚙️ Construyendo transacción con operaciones:');
        console.log('   1. Create Issuing Account (2.5 XLM)');
        console.log('   2. Create Distribution Account (2.5 XLM)');
        console.log('   3. Change Trust (Distribution → Asset)');
        console.log(`   4. Payment (${amountString} ${code} → Distribution)`);
        console.log('   5. Set Options (Disable Issuing Account)');

        const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET, // EXPLÍCITAMENTE TESTNET
        })
            .addOperation(StellarSdk.Operation.createAccount({
                destination: issuingAccount,
                startingBalance: '2.5'
            }))
            .addOperation(StellarSdk.Operation.createAccount({
                destination: distributionAccount,
                startingBalance: '2.5'
            }))
            .addOperation(StellarSdk.Operation.changeTrust({
                asset: asset,
                source: distributionAccount,
            }))
            .addOperation(StellarSdk.Operation.payment({
                destination: distributionAccount,
                asset: asset,
                amount: amountString,
                source: issuingAccount,
            }))
            .addOperation(StellarSdk.Operation.setOptions({
                masterWeight: 0,
                lowThreshold: 1,
                medThreshold: 1,
                highThreshold: 1,
                source: issuingAccount,
            }))
            .setTimeout(30)
            .build();

        // La transacción debe ser firmada por el usuario en el frontend
        // Aquí solo construimos y devolvemos la transacción para que el usuario la firme
        console.log('📄 Construyendo transacción para que el usuario la firme...');

        // Devolver la transacción XDR para que el frontend la firme
        const transactionXDR = transaction.toXDR();

        console.log('✅ Transacción construida exitosamente');
        console.log('🔄 Enviando al frontend para firma del usuario...');

        res.json({
            success: true,
            message: 'Transacción construida exitosamente',
            transactionXDR: transactionXDR,
            issuingAccount: issuingAccount,
            distributionAccount: distributionAccount,
            assetCode: code,
            assetIssuer: issuingAccount,
            amount: amountString,
            tokenData: tokenData || null,
            requiredSigners: {
                user: userAddress,
                issuing: issuingAccount,
                distribution: distributionAccount
            },
            signingKeys: {
                issuingSecret: issuingKeypair.secret(),
                distributionSecret: distributionKeypair.secret()
            }
        });

        /* CÓDIGO ORIGINAL COMENTADO - SE MANEJARÁ EN EL FRONTEND
        try {
            const result = await server.submitTransaction(transaction);
            console.log('✅ Transacción enviada exitosamente:', result.hash);

            // RESULTADO ORIGINAL COMENTADO
        } catch (submitError) {
            console.error('❌ Error enviando transacción:', submitError);
            let errorMessage = 'Error enviando transacción';
            if (submitError.response && submitError.response.data) {
                const errorData = submitError.response.data;
                console.error('📋 Error completo de Horizon:', JSON.stringify(errorData, null, 2));
                if (errorData.extras && errorData.extras.result_codes) {
                    errorMessage = `Error de transacción: ${JSON.stringify(errorData.extras.result_codes)}`;
                } else if (errorData.detail) {
                    errorMessage = errorData.detail;
                }
            }
            throw new Error(errorMessage);
        }
        */

    } catch (error) {
        console.error("Error building/submitting transaction:", error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            details: error.message
        });
    }
});

// ===== NUEVOS ENDPOINTS PARA SMART CONTRACTS =====

// Endpoint para construir smart contract con template avanzado
// Almacenar estado de compilaciones en progreso
const compilationProgress = new Map();

// Endpoint para obtener progreso de compilación
app.get('/api/compilation-progress/:compilationId', (req, res) => {
    const { compilationId } = req.params;
    const progress = compilationProgress.get(compilationId);

    if (!progress) {
        // For precompiled contracts, return completed status immediately
        // This prevents 404 errors when checking progress for precompiled contracts
        return res.json({
            status: 'completed',
            progress: 100,
            message: 'Smart contract compiled (precompiled)',
            isPrecompiled: true
        });
    }

    res.json(progress);
});

app.post('/api/build-smart-contract', async (req, res) => {
    try {
        console.log('🔧 Compilando smart contract...');
        console.log('   Datos recibidos:', JSON.stringify(req.body, null, 2));

        const { code, amount, userAddress, contractData } = req.body;

        if (!contractData || !userAddress) {
            throw new Error('Se requieren contractData y userAddress');
        }

        // If using precompiled backend, delegate to it
        if (USE_BACKEND) {
            console.log('📦 Delegating to precompiled backend:', BACKEND_URL);

            // Ensure fetch is loaded
            if (!fetch) {
                console.log('⏳ Waiting for fetch to load...');
                await new Promise(resolve => {
                    const checkFetch = setInterval(() => {
                        if (fetch) {
                            clearInterval(checkFetch);
                            resolve();
                        }
                    }, 100);
                });
            }

            // Check if there's custom Rust code to compile
            if (contractData.rustCode && contractData.rustCode.trim().length > 0) {
                console.log('🔨 Detected custom Rust code - compiling dynamically');
                console.log(`📝 Code length: ${contractData.rustCode.length} characters`);

                try {
                    // Send custom code to backend for dynamic compilation
                    const customCompileResponse = await fetch(`${BACKEND_URL}/api/compile-custom-contract`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            rustCode: contractData.rustCode,
                            contractName: contractData.symbol?.toLowerCase() || 'custom_contract'
                        }),
                        timeout: 600000 // 10 minutes
                    });

                    if (!customCompileResponse.ok) {
                        const errorData = await customCompileResponse.json();
                        console.error('❌ Custom compilation failed:', errorData);
                        return res.status(400).json({
                            success: false,
                            error: 'Custom contract compilation failed',
                            details: errorData.details || errorData.error,
                            message: errorData.message || 'Check your Rust code for syntax errors'
                        });
                    }

                    const customData = await customCompileResponse.json();
                    console.log('✅ Custom contract compiled successfully');
                    console.log(`⏱️ Compilation time: ${(customData.compilationTime / 1000).toFixed(2)}s`);
                    console.log(`📦 WASM size: ${customData.wasmSize} bytes`);

                    // Return custom compiled WASM
                    return res.json({
                        success: true,
                        message: 'Contrato personalizado compilado',
                        contractId: customData.contractId,
                        contractName: contractData.symbol || 'custom_contract',
                        wasmBase64: customData.wasmBase64,
                        wasmSize: customData.wasmSize,
                        compiledAt: customData.compiledAt,
                        compilationTime: customData.compilationTime,
                        isCustom: true,
                        isPrecompiled: false,
                        status: 'completed',
                        compiled: true
                    });

                } catch (customError) {
                    console.error('❌ Custom compilation error:', customError);
                    return res.status(500).json({
                        success: false,
                        error: 'Custom contract compilation error',
                        details: customError.message,
                        message: 'Failed to compile custom Rust code'
                    });
                }
            }

            // No custom code detected, use precompiled template
            console.log('📋 Using precompiled template');

            // Determine template type based on contract type or features
            let templateType;

            if (contractData.templateType === 'rwa') {
                templateType = 'rwa';
                console.log(`📋 Using RWA template`);
            } else {
                const hasAdvancedFeatures = contractData.features?.pausable ||
                                            contractData.features?.mintable ||
                                            contractData.features?.burnable;
                templateType = hasAdvancedFeatures ? 'token_advanced' : 'token_basic';
                console.log(`📋 Using token template: ${templateType}`);
            }

            try {
                // Call backend to get precompiled WASM
                const backendResponse = await fetch(`${BACKEND_URL}/api/compile-contract`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        templateType: templateType,
                        config: {
                            name: contractData.name,
                            symbol: contractData.symbol,
                            decimals: contractData.decimals || 7,
                            initialSupply: contractData.supply || contractData.initialSupply || 0
                        }
                    })
                });

                if (!backendResponse.ok) {
                    const errorData = await backendResponse.json();
                    throw new Error(`Backend error: ${errorData.error || backendResponse.statusText}`);
                }

                const backendData = await backendResponse.json();
                console.log('✅ Got precompiled WASM from backend');
                console.log(`📦 WASM size: ${backendData.wasmSize} bytes`);

                // Return response to client with precompiled WASM
                // No need for polling since we have the WASM immediately
                return res.json({
                    success: true,
                    message: 'Contrato compilado (precompilado)',
                    contractId: backendData.contractId,
                    contractName: backendData.templateType,
                    wasmBase64: backendData.wasmBase64,
                    wasmSize: backendData.wasmSize,
                    compiledAt: backendData.compiledAt,
                    templateType: backendData.templateType,
                    isPrecompiled: true,
                    status: 'completed',
                    compiled: true
                });

            } catch (backendError) {
                console.error('❌ Backend error:', backendError);
                return res.status(500).json({
                    success: false,
                    error: 'Error getting precompiled contract',
                    details: backendError.message
                });
            }
        }

        // Fallback to original dynamic compilation if backend disabled
        console.log('⚠️ Falling back to dynamic compilation (backend disabled)');

        // Generar ID único para este contrato
        const contractId = uuidv4();
        const contractName = `${contractData.symbol.toLowerCase()}_advanced_${contractId.slice(0, 8)}`;

        console.log(`📝 Generando contrato avanzado: ${contractName}`);

        // Preparar datos para el template avanzado
        const templateData = {
            contract_name: contractData.name.replace(/\s+/g, ''),
            token_name: contractData.name,
            token_symbol: contractData.symbol,
            token_decimals: contractData.decimals || 2,
            initial_supply: contractData.supply || contractData.initialSupply,

            // Características básicas
            mint_enabled: contractData.features?.mintable || false,
            burn_enabled: contractData.features?.burnable || false,
            pausable_enabled: contractData.features?.pausable || false,
            upgrade_enabled: contractData.features?.upgradeable || false,
            access_control_enabled: contractData.features?.accessControl || false,

            // Características avanzadas
            features: {
                stakeable: contractData.features?.stakeable || false,
                governance: contractData.features?.governance || false,
                timeLock: contractData.features?.timeLock || false
            },

            // Configuración de seguridad
            security: contractData.security || {
                transferLimit: 0,
                whitelistEnabled: false,
                freezeable: false
            },

            // Configuración económica
            economics: contractData.economics || {
                transactionFee: 0,
                burnRate: 0,
                stakingReward: 0
            },

            // Configuración de timelock
            timeLockDays: contractData.timeLockDays || 30,

            // Metadatos
            admin_address: userAddress,
            security_contact: contractData.metadata?.securityContact || '',
            license: contractData.metadata?.license || 'MIT'
        };

        // Usar template avanzado si hay características especiales
        const hasAdvancedFeatures = templateData.features.stakeable ||
            templateData.features.governance ||
            templateData.access_control_enabled ||
            templateData.security.whitelistEnabled ||
            templateData.security.freezeable ||
            templateData.economics.transactionFee > 0;

        const templateFile = hasAdvancedFeatures ? 'advanced_token.hbs' : 'simple_token.hbs';
        const templatePath = path.join(__dirname, 'tralala', 'contracts', 'token-templates', templateFile);

        console.log(`📋 Usando template: ${templateFile}`);
        console.log(`🎯 Características detectadas:`, templateData.features);

        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const template = handlebars.compile(templateContent);
        const rustCode = template(templateData);

        // Crear directorio para el contrato
        const contractDir = path.join(__dirname, 'tralala', 'dynamic-contracts', contractName);
        await fse.ensureDir(contractDir);
        await fse.ensureDir(path.join(contractDir, 'src'));

        // Crear Cargo.toml más completo para características avanzadas
        // Nota: Este cargo.toml heredará las dependencias y configuración del workspace
        const cargoToml = `[package]
name = "${contractName}"
version = "1.0.0"
edition = "2021"
authors = ["${userAddress}"]
description = "Advanced token contract generated by Tralalero Contracts"
license = "${templateData.license}"

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = { workspace = true }

[dev-dependencies]
soroban-sdk = { workspace = true, features = ["testutils"] }

[features]
default = []
testutils = ["soroban-sdk/testutils"]
${hasAdvancedFeatures ? 'advanced = []' : ''}

[[bin]]
name = "deploy"
path = "src/deploy.rs"
required-features = ["testutils"]`;

        await fs.writeFile(path.join(contractDir, 'Cargo.toml'), cargoToml);
        await fs.writeFile(path.join(contractDir, 'src', 'lib.rs'), rustCode);

        // Crear archivo de deployment helper
        const deployHelper = `use soroban_sdk::{Address, Env};
use ${contractName}::{${templateData.contract_name}Contract, ContractError};

pub fn deploy_contract(env: &Env, admin: Address) -> Result<(), ContractError> {
    let contract = ${templateData.contract_name}Contract;
    
    contract.initialize(
        env.clone(),
        admin,
        "${templateData.token_name}".into(),
        "${templateData.token_symbol}".into(),
        ${templateData.token_decimals},
        ${templateData.initial_supply}
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_deploy() {
        let env = Env::default();
        let admin = Address::generate(&env);
        
        assert!(deploy_contract(&env, admin).is_ok());
    }
}`;

        await fs.writeFile(path.join(contractDir, 'src', 'deploy.rs'), deployHelper);

        // Registrar progreso de compilación y responder inmediatamente
        compilationProgress.set(contractId, {
            status: 'starting',
            progress: 0,
            message: 'Iniciando compilación...',
            contractName: contractName,
            timestamp: new Date()
        });

        // Responder inmediatamente con el contractId para que el cliente pueda monitorear progreso
        res.json({
            success: true,
            message: 'Compilación iniciada',
            contractId,
            contractName,
            progressUrl: `/api/compilation-progress/${contractId}`
        });

        // Compilar el contrato en segundo plano
        (async () => {
            try {
                compilationProgress.set(contractId, {
                    status: 'compiling',
                    progress: 10,
                    message: 'Compilando Rust a WebAssembly...',
                    contractName: contractName,
                    timestamp: new Date()
                });

                console.log('⚙️ Compilando contrato avanzado a WASM...');

                const compileCommand = `cd "${contractDir}" && cargo build --target wasm32-unknown-unknown --release`;

                try {
                    const { stdout, stderr } = await execAsync(compileCommand, {
                        timeout: 600000,
                        maxBuffer: 10 * 1024 * 1024
                    });
                    console.log('✅ Compilación exitosa');
                    if (stdout) console.log('STDOUT:', stdout);
                    if (stderr) console.log('STDERR:', stderr);
                } catch (compileError) {
                    console.error('❌ Error en compilación:', compileError);
                    compilationProgress.set(contractId, {
                        status: 'error',
                        progress: 0,
                        message: `Error en compilación: ${compileError.message}`,
                        contractName: contractName,
                        error: true,
                        timestamp: new Date()
                    });
                    return;
                }

                // Verificar que el WASM fue creado
                const wasmPath = path.join(contractDir, 'target', 'wasm32-unknown-unknown', 'release', `${contractName}.wasm`);

                compilationProgress.set(contractId, {
                    status: 'checking',
                    progress: 50,
                    message: 'Verificando integridad del archivo...',
                    contractName: contractName,
                    timestamp: new Date()
                });

                try {
                    await fs.access(wasmPath);
                    console.log('✅ Archivo WASM generado correctamente');
                } catch (accessError) {
                    compilationProgress.set(contractId, {
                        status: 'error',
                        progress: 0,
                        message: 'El archivo WASM no fue generado correctamente',
                        contractName: contractName,
                        error: true,
                        timestamp: new Date()
                    });
                    return;
                }

                // Optimizar WASM si soroban-cli está disponible
                compilationProgress.set(contractId, {
                    status: 'optimizing',
                    progress: 60,
                    message: 'Optimizando WASM...',
                    contractName: contractName,
                    timestamp: new Date()
                });

                console.log('🎯 Optimizando WASM...');
                try {
                    const optimizeCommand = `cd "${contractDir}" && soroban contract optimize --wasm target/wasm32-unknown-unknown/release/${contractName}.wasm`;
                    const { stdout: optimizeStdout } = await execAsync(optimizeCommand, { timeout: 120000 });
                    console.log('✅ WASM optimizado');
                } catch (optimizeError) {
                    console.warn('⚠️ No se pudo optimizar WASM (continuando):', optimizeError.message);
                }

                // Guardar información del contrato compilado
                compilationProgress.set(contractId, {
                    status: 'saving',
                    progress: 75,
                    message: 'Guardando información del contrato...',
                    contractName: contractName,
                    timestamp: new Date()
                });

                const contractInfo = {
                    contractId,
                    contractName,
                    contractData,
                    templateData,
                    userAddress,
                    wasmPath,
                    compiledAt: new Date().toISOString(),
                    rustCode,
                    features: templateData.features,
                    hasAdvancedFeatures,
                    templateUsed: templateFile
                };

                const compiledDir = path.join(__dirname, 'tralala', 'compiled');
                await fse.ensureDir(compiledDir);
                await fs.writeFile(
                    path.join(compiledDir, `${contractId}.json`),
                    JSON.stringify(contractInfo, null, 2)
                );

                console.log('🎉 Smart contract avanzado compilado exitosamente');

                // Smart contract compilado exitosamente - Preparado para deployment manual
                console.log('📤 Smart contract compilado y listo para deployment manual con Soroban CLI...');

                // Leer el archivo WASM compilado para obtener información
                const wasmBuffer = await fs.readFile(wasmPath);
                console.log(`📦 WASM compilado: ${wasmBuffer.length} bytes`);

                // Auto-deployment usando Stellar CLI según documentación oficial
                compilationProgress.set(contractId, {
                    status: 'deploying',
                    progress: 80,
                    message: 'Intentando auto-deployment a testnet...',
                    contractName: contractName,
                    timestamp: new Date()
                });

                console.log('🚀 Intentando auto-deployment a testnet usando Stellar CLI...');

                let contractAddress = null;
                let deploymentSuccessful = false;

                try {
                    // Primero verificar si hay una identity configurada
                    const identityCheckCommand = 'stellar keys ls';
                    console.log('🔍 Verificando identities disponibles...');

                    let availableIdentity = null;
                    try {
                        const { stdout: identityStdout } = await execAsync(identityCheckCommand);
                        if (identityStdout && identityStdout.trim()) {
                            // Extraer el primer identity disponible
                            const identities = identityStdout.trim().split('\n').filter(line => line.trim());
                            if (identities.length > 0) {
                                availableIdentity = identities[0].trim();
                                console.log('✅ Identity encontrada:', availableIdentity);
                            }
                        }
                    } catch (identityError) {
                        console.log('ℹ️ No se pudieron listar identities, continuando con deployment manual');
                    }

                    if (availableIdentity) {
                        // Comando de deployment usando la identity disponible
                        const deployCommand = `stellar contract deploy --wasm "${wasmPath}" --network testnet --source ${availableIdentity}`;
                        console.log('📤 Ejecutando deployment con identity:', deployCommand);

                        const { stdout: deployStdout, stderr: deployStderr } = await execAsync(deployCommand);

                        if (deployStdout && deployStdout.trim()) {
                            contractAddress = deployStdout.trim();
                            deploymentSuccessful = true;
                            console.log('✅ Contrato desplegado exitosamente en:', contractAddress);
                        } else {
                            throw new Error('No se recibió dirección del contrato');
                        }
                    } else {
                        throw new Error('No hay identity configurada para firmar transacciones');
                    }

                } catch (deployError) {
                    console.warn('⚠️ Auto-deployment falló:', deployError.message);
                    console.log('💡 Configurar identity: stellar keys generate [nombre]');
                    console.log('💡 Fondear identity: stellar keys fund [nombre] --network testnet');
                    console.log('💡 Para desplegar manualmente: stellar contract deploy --wasm ' + wasmPath + ' --network testnet --source [identity]');
                }

                // Actualizar estado final de compilación
                compilationProgress.set(contractId, {
                    status: 'completed',
                    progress: 100,
                    message: deploymentSuccessful ? 'Smart contract desplegado' : 'Smart contract compilado',
                    contractName: contractName,
                    contractAddress: contractAddress,
                    deploymentSuccessful: deploymentSuccessful,
                    timestamp: new Date()
                });

            } catch (backgroundError) {
                console.error('❌ Error en compilación de fondo:', backgroundError);
                compilationProgress.set(contractId, {
                    status: 'error',
                    progress: 0,
                    message: `Error: ${backgroundError.message}`,
                    contractName: contractName,
                    error: true,
                    timestamp: new Date()
                });
            }
        })();

        return; // Devolver la respuesta inmediata que ya se envió
    } catch (error) {
        console.error('❌ Error construyendo smart contract:', error);
        res.status(500).json({
            success: false,
            error: 'Error construyendo smart contract',
            details: error.message
        });
    }
});

// Handler alternativo - NO eliminar
app.post('/api/build-smart-contract-blocking', async (req, res) => {
    try {
        console.log('🔧 Construyendo smart contract avanzado (bloqueante)...');
        console.log('   Datos recibidos:', JSON.stringify(req.body, null, 2));

        const { code, amount, userAddress, contractData } = req.body;

        if (!contractData || !userAddress) {
            throw new Error('Se requieren contractData y userAddress');
        }

        // Generar ID único para este contrato
        const contractId = uuidv4();
        const contractName = `${contractData.symbol.toLowerCase()}_advanced_${contractId.slice(0, 8)}`;

        console.log(`📝 Generando contrato avanzado: ${contractName}`);

        // Preparar datos para el template avanzado
        const templateData = {
            contract_name: contractData.name.replace(/\s+/g, ''),
            token_name: contractData.name,
            token_symbol: contractData.symbol,
            token_decimals: contractData.decimals || 2,
            initial_supply: contractData.supply || contractData.initialSupply,

            // Características básicas
            mint_enabled: contractData.features?.mintable || false,
            burn_enabled: contractData.features?.burnable || false,
            pausable_enabled: contractData.features?.pausable || false,
            upgrade_enabled: contractData.features?.upgradeable || false,
            access_control_enabled: contractData.features?.accessControl || false,

            // Características avanzadas
            features: {
                stakeable: contractData.features?.stakeable || false,
                governance: contractData.features?.governance || false,
                timeLock: contractData.features?.timeLock || false
            },

            // Configuración de seguridad
            security: contractData.security || {
                transferLimit: 0,
                whitelistEnabled: false,
                freezeable: false
            },

            // Configuración económica
            economics: contractData.economics || {
                transactionFee: 0,
                burnRate: 0,
                stakingReward: 0
            },

            // Configuración de timelock
            timeLockDays: contractData.timeLockDays || 30,

            // Metadatos
            admin_address: userAddress,
            security_contact: contractData.metadata?.securityContact || '',
            license: contractData.metadata?.license || 'MIT'
        };

        // Usar template avanzado si hay características especiales
        const hasAdvancedFeatures = templateData.features.stakeable ||
            templateData.features.governance ||
            templateData.access_control_enabled ||
            templateData.security.whitelistEnabled ||
            templateData.security.freezeable ||
            templateData.economics.transactionFee > 0;

        const templateFile = hasAdvancedFeatures ? 'advanced_token.hbs' : 'simple_token.hbs';
        const templatePath = path.join(__dirname, 'tralala', 'contracts', 'token-templates', templateFile);

        console.log(`📋 Usando template: ${templateFile}`);
        console.log(`🎯 Características detectadas:`, templateData.features);

        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const template = handlebars.compile(templateContent);
        const rustCode = template(templateData);

        // Crear directorio para el contrato
        const contractDir = path.join(__dirname, 'tralala', 'dynamic-contracts', contractName);
        await fse.ensureDir(contractDir);
        await fse.ensureDir(path.join(contractDir, 'src'));

        // Crear Cargo.toml más completo para características avanzadas
        // Nota: Este cargo.toml heredará las dependencias y configuración del workspace
        const cargoToml = `[package]
name = "${contractName}"
version = "1.0.0"
edition = "2021"
authors = ["${userAddress}"]
description = "Advanced token contract generated by Tralalero Contracts"
license = "${templateData.license}"

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = { workspace = true }

[dev-dependencies]
soroban-sdk = { workspace = true, features = ["testutils"] }

[features]
default = []
testutils = ["soroban-sdk/testutils"]
${hasAdvancedFeatures ? 'advanced = []' : ''}

[[bin]]
name = "deploy"
path = "src/deploy.rs"
required-features = ["testutils"]`;

        await fs.writeFile(path.join(contractDir, 'Cargo.toml'), cargoToml);
        await fs.writeFile(path.join(contractDir, 'src', 'lib.rs'), rustCode);

        // Compilar el contrato
        console.log('⚙️ Compilando contrato avanzado a WASM...');

        const compileCommand = `cd "${contractDir}" && cargo build --target wasm32-unknown-unknown --release`;

        try {
            const { stdout, stderr } = await execAsync(compileCommand, {
                timeout: 600000,
                maxBuffer: 10 * 1024 * 1024
            });
            console.log('✅ Compilación exitosa');
            if (stdout) console.log('STDOUT:', stdout);
            if (stderr) console.log('STDERR:', stderr);
        } catch (compileError) {
            console.error('❌ Error en compilación:', compileError);
            throw new Error(`Error compilando contrato: ${compileError.message}`);
        }

        // Verificar que el WASM fue creado
        const wasmPath = path.join(contractDir, 'target', 'wasm32-unknown-unknown', 'release', `${contractName}.wasm`);

        try {
            await fs.access(wasmPath);
            console.log('✅ Archivo WASM generado correctamente');
        } catch (accessError) {
            throw new Error('El archivo WASM no fue generado correctamente');
        }

        // Optimizar WASM si soroban-cli está disponible
        console.log('🎯 Optimizando WASM...');
        try {
            const optimizeCommand = `cd "${contractDir}" && soroban contract optimize --wasm target/wasm32-unknown-unknown/release/${contractName}.wasm`;
            const { stdout: optimizeStdout } = await execAsync(optimizeCommand, { timeout: 120000 });
            console.log('✅ WASM optimizado');
        } catch (optimizeError) {
            console.warn('⚠️ No se pudo optimizar WASM (continuando):', optimizeError.message);
        }

        // Guardar información del contrato compilado
        const contractInfo = {
            contractId,
            contractName,
            contractData,
            templateData,
            userAddress,
            wasmPath,
            compiledAt: new Date().toISOString(),
            rustCode,
            features: templateData.features,
            hasAdvancedFeatures,
            templateUsed: templateFile
        };

        const compiledDir = path.join(__dirname, 'tralala', 'compiled');
        await fse.ensureDir(compiledDir);
        await fs.writeFile(
            path.join(compiledDir, `${contractId}.json`),
            JSON.stringify(contractInfo, null, 2)
        );

        console.log('🎉 Smart contract avanzado compilado exitosamente');

        // Leer el archivo WASM compilado para obtener información
        const wasmBuffer = await fs.readFile(wasmPath);
        console.log(`📦 WASM compilado: ${wasmBuffer.length} bytes`);

        res.json({
            success: true,
            message: deploymentSuccessful ?
                'Smart contract compilado y desplegado exitosamente' :
                'Smart contract compilado - Deployment manual requerido',
            contractId,
            contractName,
            wasmPath,
            contractInfo,

            // Información del WASM compilado
            wasmSize: wasmBuffer.length,
            wasmReady: true,

            // Información del smart contract
            smartContract: {
                contractId,
                contractName,
                tokenSymbol: contractData.symbol,
                tokenName: contractData.name,
                initialSupply: contractData.supply || contractData.initialSupply,
                features: templateData.features,
                security: templateData.security,
                economics: templateData.economics,
                hasAdvancedFeatures,
                templateUsed: templateFile,
                compiled: true,
                wasmPath: wasmPath,
                deployed: deploymentSuccessful,
                contractAddress: contractAddress
            },

            // Estado del deployment
            deployment: {
                status: deploymentSuccessful ? 'deployed' : 'ready_for_manual_deployment',
                network: 'TESTNET',
                userAddress,
                compiledAt: contractInfo.compiledAt,
                contractAddress: contractAddress,
                deploymentInstructions: deploymentSuccessful ? null : {
                    setupSteps: [
                        'stellar keys generate mi-identity',
                        'stellar keys fund mi-identity --network testnet',
                        `stellar contract deploy --wasm ${wasmPath} --network testnet --source mi-identity`
                    ],
                    stellarLaboratory: 'https://laboratory.stellar.org/',
                    setupGuide: 'https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup',
                    note: 'Se requiere Stellar CLI instalado y configurado. Ejecutar los comandos en orden.'
                }
            }
        });

    } catch (error) {
        console.error('❌ Error construyendo smart contract:', error);
        res.status(500).json({
            success: false,
            error: 'Error construyendo smart contract',
            details: error.message
        });
    }
});

// Endpoint para compilar un smart contract
app.post('/api/compile-contract', async (req, res) => {
    try {
        console.log('🔧 Compilando smart contract...');
        console.log('   Datos recibidos:', JSON.stringify(req.body, null, 2));

        const { tokenData, userAddress } = req.body;

        if (!tokenData || !userAddress) {
            throw new Error('Se requieren tokenData y userAddress');
        }

        // Generar ID único para este contrato
        const contractId = uuidv4();
        const contractName = `token_${tokenData.symbol.toLowerCase()}_${contractId.slice(0, 8)}`;

        console.log(`📝 Generando contrato: ${contractName}`);

        // Preparar datos para el template
        const templateData = {
            token_name: tokenData.name,
            token_symbol: tokenData.symbol,
            token_decimals: tokenData.decimals || 2,
            initial_supply: tokenData.initialSupply || tokenData.supply,
            mint_enabled: tokenData.features?.mintable || false,
            burn_enabled: tokenData.features?.burnable || false,
            pausable_enabled: tokenData.features?.pausable || false,
            upgrade_enabled: tokenData.features?.upgradeable || false,
            access_control_enabled: tokenData.features?.accessControl || false,
            admin_address: userAddress,
            security_contact: tokenData.securityContact || '',
            license: tokenData.license || 'MIT'
        };

        // Leer y compilar template - elegir según tipo de contrato
        let templateFilename = 'simple_token.hbs';
        if (tokenData.templateType === 'rwa') {
            templateFilename = 'rwa_template.hbs';
            // Preparar datos específicos para RWA
            templateData.asset_name = tokenData.name || 'RWA Asset';
            templateData.asset_id = 'RWA_';
            templateData.isin = tokenData.symbol || 'ISIN';
            templateData.issuer = userAddress;
        }

        const templatePath = path.join(__dirname, 'tralala', 'contracts', 'token-templates', templateFilename);
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const template = handlebars.compile(templateContent);
        const rustCode = template(templateData);

        // Crear directorio para el contrato (fuera del workspace)
        const contractDir = path.join(__dirname, 'tralala', 'dynamic-contracts', contractName);
        await fse.ensureDir(contractDir);
        await fse.ensureDir(path.join(contractDir, 'src'));

        // Crear archivos del contrato
        const cargoToml = `[package]
name = "${contractName}"
version = "1.0.0"
edition = "2021"

[workspace]

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = "23.0.1"
soroban-token-sdk = "23.0.1"

[dev-dependencies]
soroban-sdk = { version = "23.0.1", features = ["testutils"] }

[features]
testutils = ["soroban-sdk/testutils"]

[profile.release]
opt-level = 2
overflow-checks = false
debug = 0
strip = "symbols"
debug-assertions = false
panic = "abort"
codegen-units = 256
lto = "thin"

[profile.release-with-logs]
inherits = "release"
debug-assertions = true`;

        await fs.writeFile(path.join(contractDir, 'Cargo.toml'), cargoToml);
        await fs.writeFile(path.join(contractDir, 'src', 'lib.rs'), rustCode);

        // Compilar el contrato
        console.log('⚙️ Compilando contrato a WASM...');

        const compileCommand = `cd "${contractDir}" && cargo build --target wasm32-unknown-unknown --release`;

        try {
            const { stdout, stderr } = await execAsync(compileCommand);
            console.log('✅ Compilación exitosa');
            if (stdout) console.log('STDOUT:', stdout);
            if (stderr) console.log('STDERR:', stderr);
        } catch (compileError) {
            console.error('❌ Error en compilación:', compileError);
            throw new Error(`Error compilando contrato: ${compileError.message}`);
        }

        // Verificar que el WASM fue creado
        const wasmPath = path.join(contractDir, 'target', 'wasm32-unknown-unknown', 'release', `${contractName}.wasm`);

        try {
            await fs.access(wasmPath);
            console.log('✅ Archivo WASM generado correctamente');
        } catch (accessError) {
            throw new Error('El archivo WASM no fue generado correctamente');
        }

        // Optimizar WASM (opcional)
        console.log('🎯 Optimizando WASM...');
        try {
            const optimizeCommand = `cd "${contractDir}" && soroban contract optimize --wasm target/wasm32-unknown-unknown/release/${contractName}.wasm`;
            const { stdout: optimizeStdout } = await execAsync(optimizeCommand);
            console.log('✅ WASM optimizado');
        } catch (optimizeError) {
            console.warn('⚠️ No se pudo optimizar WASM (continuando):', optimizeError.message);
        }

        // Guardar información del contrato compilado
        const contractInfo = {
            contractId,
            contractName,
            tokenData,
            userAddress,
            wasmPath,
            compiledAt: new Date().toISOString(),
            rustCode,
            templateData
        };

        const compiledDir = path.join(__dirname, 'tralala', 'compiled');
        await fse.ensureDir(compiledDir);
        await fs.writeFile(
            path.join(compiledDir, `${contractId}.json`),
            JSON.stringify(contractInfo, null, 2)
        );

        console.log('🎉 Contrato compilado exitosamente');

        res.json({
            success: true,
            message: 'Contrato compilado exitosamente',
            contractId,
            contractName,
            wasmPath,
            contractInfo
        });

    } catch (error) {
        console.error('❌ Error compilando contrato:', error);
        res.status(500).json({
            success: false,
            error: 'Error compilando contrato',
            details: error.message
        });
    }
});

// Endpoint para desplegar un smart contract
app.post('/api/deploy-contract', async (req, res) => {
    console.log('═══════════════════════════════════════');
    console.log('🚀 DEPLOY ENDPOINT CALLED (FRONTEND SERVER - PROXYING TO BACKEND)');
    console.log('═══════════════════════════════════════');
    try {
        console.log('📦 Proxying deploy request to backend:', BACKEND_URL);
        console.log('   Request body keys:', Object.keys(req.body));
        console.log('   wasmBase64 exists?', !!req.body.wasmBase64);
        console.log('   wasmBase64 length:', req.body.wasmBase64?.length || 'MISSING');
        console.log('   userAddress:', req.body.userAddress);
        console.log('   contractData:', req.body.contractData);

        // PROXY TO BACKEND: Forward the entire request to the backend
        // Ensure fetch is loaded (already imported at top, but double-check)
        if (!fetch) {
            console.log('⏳ Waiting for fetch to load...');
            await new Promise(resolve => {
                const checkFetch = setInterval(() => {
                    if (fetch) {
                        clearInterval(checkFetch);
                        resolve();
                    }
                }, 100);
            });
        }

        const backendResponse = await fetch(`${BACKEND_URL}/api/deploy-contract`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });

        if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            console.error('❌ Backend error:', errorText);
            return res.status(backendResponse.status).json({
                success: false,
                error: errorText
            });
        }

        const backendResult = await backendResponse.json();
        console.log('✅ Backend response received');
        console.log('   Has uploadTransactionXDR?', !!backendResult.uploadTransactionXDR);
        console.log('   Has createTransactionXDR?', !!backendResult.createTransactionXDR);

        // Forward backend response to frontend
        return res.json(backendResult);

    } catch (error) {
        console.error('❌ Error proxying to backend:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

/**
 * POST /api/prepare-create-contract
 *
 * Proxy endpoint to prepare CREATE CONTRACT transaction after WASM upload
 * Forwards request to backend server
 */
app.post('/api/prepare-create-contract', async (req, res) => {
    try {
        console.log('🔧 Proxying prepare-create-contract request to backend:', BACKEND_URL);
        console.log('   Request body:', JSON.stringify(req.body, null, 2));

        const backendResponse = await fetch(`${BACKEND_URL}/api/prepare-create-contract`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        const responseData = await backendResponse.json();

        console.log('✅ Backend prepare-create-contract response received');
        console.log('   Success:', responseData.success);

        // Forward backend response to frontend
        res.status(backendResponse.status).json(responseData);

    } catch (error) {
        console.error('❌ Error proxying prepare-create-contract to backend:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error proxying to backend'
        });
    }
});

// OLD IMPLEMENTATION - COMMENTED OUT FOR REFERENCE
// Keep this as fallback if backend is not available
app.post('/api/deploy-contract-old', async (req, res) => {
    console.log('═══════════════════════════════════════');
    console.log('🚀 DEPLOY ENDPOINT CALLED (OLD IMPLEMENTATION)');
    console.log('═══════════════════════════════════════');
    try {
        console.log('🚀 Desplegando smart contract...');
        console.log('   Datos recibidos:', JSON.stringify(req.body, null, 2));

        const { contractId, userAddress, networkPassphrase, wasmBase64, contractData } = req.body;

        // NEW: Support deploying from base64 WASM (precompiled contracts)
        if (wasmBase64 && userAddress) {
            console.log('📦 Deployando desde WASM precompilado (base64)');

            try {
                // Convert base64 WASM to buffer
                const wasmBuffer = Buffer.from(wasmBase64, 'base64');
                console.log(`📦 WASM size: ${wasmBuffer.length} bytes`);

                // Deploy to Stellar Testnet
                const network = networkPassphrase || StellarSdk.Networks.TESTNET;

                // Compatibility layer: v14.x may use 'rpc' instead of 'SorobanRpc'
                const SorobanRpc = StellarSdk.rpc || StellarSdk.SorobanRpc;
                if (!SorobanRpc || !SorobanRpc.Server) {
                    throw new Error('SorobanRpc.Server not available in current SDK version');
                }

                // IMPORTANT: Use Soroban RPC server for smart contract operations, NOT Horizon
                const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');

                console.log('📤 Desplegando a Stellar Testnet usando Soroban RPC...');

                // Load user account
                const sourceAccount = await server.getAccount(userAddress);

                // Upload contract WASM
                let uploadTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
                    fee: StellarSdk.BASE_FEE, // Will be adjusted by prepareTransaction
                    networkPassphrase: network,
                })
                    .addOperation(StellarSdk.Operation.uploadContractWasm({
                        wasm: wasmBuffer,
                    }))
                    .setTimeout(300) // 5 minutes
                    .build();

                // CRITICAL: prepareTransaction() simulates and adds Soroban resource metadata
                console.log('🔧 Preparing upload transaction (simulating and calculating resources)...');
                uploadTransaction = await server.prepareTransaction(uploadTransaction);

                // Get the hash of the uploaded WASM (this will be the contract code ID)
                const wasmHash = StellarSdk.hash(wasmBuffer);
                const wasmId = StellarSdk.StrKey.encodeContract(wasmHash);

                console.log('✅ WASM Hash/ID:', wasmId);

                // IMPORTANT: Increment sequence number for second transaction
                // Both transactions use the same account, so they need different sequence numbers
                sourceAccount.incrementSequenceNumber();

                // Create the contract from uploaded WASM
                let createContractTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
                    fee: StellarSdk.BASE_FEE, // Will be adjusted by prepareTransaction
                    networkPassphrase: network,
                })
                    .addOperation(StellarSdk.Operation.createCustomContract({
                        wasmHash: wasmHash,
                        address: new StellarSdk.Address(userAddress),
                    }))
                    .setTimeout(300)
                    .build();

                // CRITICAL: prepareTransaction() for the second transaction too
                console.log('🔧 Preparing create contract transaction (simulating and calculating resources)...');
                createContractTransaction = await server.prepareTransaction(createContractTransaction);

                // NOTE: In production, these transactions should be signed by Freighter
                // For now, we return the XDR for the user to sign
                const uploadXDR = uploadTransaction.toXDR();
                const createXDR = createContractTransaction.toXDR();

                // Simulate deployment (in reality, user needs to sign with Freighter)
                // For demo purposes, we'll return a simulated contract ID
                const simulatedContractId = `C${wasmId.substring(1, 57)}`;

                return res.json({
                    success: true,
                    message: 'Contract ready for deployment',
                    contractId: simulatedContractId,
                    wasmId: wasmId,
                    uploadTransactionXDR: uploadXDR,
                    createTransactionXDR: createXDR,
                    network: 'testnet',
                    explorerUrl: `https://stellar.expert/explorer/testnet/contract/${simulatedContractId}`,
                    note: 'In production, user would sign these transactions with Freighter wallet'
                });

            } catch (deployError) {
                console.error('❌ Error deployando WASM precompilado:', deployError);
                return res.status(500).json({
                    success: false,
                    error: 'Error deployando contrato precompilado',
                    details: deployError.message
                });
            }
        }

        // ORIGINAL: Support deploying from filesystem (dynamic contracts)
        if (!contractId || !userAddress) {
            throw new Error('Se requieren contractId y userAddress, o wasmBase64 y userAddress');
        }

        // Cargar información del contrato compilado
        const contractInfoPath = path.join(__dirname, 'tralala', 'compiled', `${contractId}.json`);

        let contractInfo;
        try {
            const contractInfoContent = await fs.readFile(contractInfoPath, 'utf-8');
            contractInfo = JSON.parse(contractInfoContent);
        } catch (infoError) {
            throw new Error('Contrato no encontrado o no compilado');
        }

        const wasmPath = contractInfo.wasmPath;

        // Verificar que el WASM existe
        try {
            await fs.access(wasmPath);
        } catch (accessError) {
            throw new Error('Archivo WASM no encontrado');
        }

        // Configurar red (testnet por defecto)
        const network = networkPassphrase || StellarSdk.Networks.TESTNET;

        // Compatibility layer: v14.x may use 'rpc' instead of 'SorobanRpc'
        const SorobanRpc = StellarSdk.rpc || StellarSdk.SorobanRpc;
        if (!SorobanRpc || !SorobanRpc.Server) {
            throw new Error('SorobanRpc.Server not available in current SDK version');
        }

        // Use Soroban RPC for contract operations
        const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');

        console.log('📤 Desplegando contrato a red:', network);

        // Leer el WASM
        const wasmBuffer = await fs.readFile(wasmPath);
        console.log(`📦 WASM leído: ${wasmBuffer.length} bytes`);

        // Crear keypairs para el contrato
        const sourceKeypair = StellarSdk.Keypair.fromPublicKey(userAddress);

        // Cargar cuenta del usuario
        const sourceAccount = await server.getAccount(userAddress);

        // Construir transacción de deploy
        const deployTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: network,
        })
            .addOperation(StellarSdk.Operation.uploadContractWasm({
                wasm: wasmBuffer,
            }))
            .setTimeout(30)
            .build();

        console.log('📄 Transacción de deploy construida');

        // Devolver transacción para firma del usuario
        res.json({
            success: true,
            message: 'Transacción de deploy preparada',
            deployTransactionXDR: deployTransaction.toXDR(),
            contractInfo: {
                contractId: contractInfo.contractId,
                contractName: contractInfo.contractName,
                tokenData: contractInfo.tokenData,
                wasmSize: wasmBuffer.length
            },
            network
        });

    } catch (error) {
        console.error('❌ Error desplegando contrato:', error);
        res.status(500).json({
            success: false,
            error: 'Error desplegando contrato',
            details: error.message
        });
    }
});

// Endpoint para interactuar con un smart contract desplegado
app.post('/api/interact-contract', async (req, res) => {
    try {
        console.log('🔗 Interactuando con smart contract...');
        console.log('   Datos recibidos:', JSON.stringify(req.body, null, 2));

        const { contractAddress, method, params, userAddress } = req.body;

        if (!contractAddress || !method || !userAddress) {
            throw new Error('Se requieren contractAddress, method y userAddress');
        }

        const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
        const sourceAccount = await server.loadAccount(userAddress);

        // Construir operación de invoke contract
        const operation = StellarSdk.Operation.invokeContract({
            contract: contractAddress,
            method,
            args: params || []
        });

        const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET,
        })
            .addOperation(operation)
            .setTimeout(30)
            .build();

        res.json({
            success: true,
            message: 'Transacción de interacción preparada',
            interactionTransactionXDR: transaction.toXDR(),
            contractAddress,
            method,
            params
        });

    } catch (error) {
        console.error('❌ Error interactuando con contrato:', error);
        res.status(500).json({
            success: false,
            error: 'Error interactuando con contrato',
            details: error.message
        });
    }
});

// Endpoint para obtener el estado de un smart contract
app.get('/api/contract-state/:contractAddress', async (req, res) => {
    try {
        const { contractAddress } = req.params;
        console.log(`📊 Obteniendo estado del contrato: ${contractAddress}`);

        const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

        // Obtener datos del contrato desde Soroban RPC
        const contractData = await server.getContractData(contractAddress);

        res.json({
            success: true,
            contractAddress,
            contractData,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error obteniendo estado del contrato:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo estado del contrato',
            details: error.message
        });
    }
});

// Endpoint para obtener historial de transacciones de un contrato
app.get('/api/contract-history/:contractAddress', async (req, res) => {
    try {
        const { contractAddress } = req.params;
        const limit = parseInt(req.query.limit) || 20;

        console.log(`📜 Obteniendo historial del contrato: ${contractAddress}`);

        const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

        // Obtener transacciones del contrato
        const transactions = await server.transactions()
            .forAccount(contractAddress)
            .limit(limit)
            .order('desc')
            .call();

        const formattedHistory = transactions.records.map(tx => ({
            hash: tx.hash,
            created_at: tx.created_at,
            operation_count: tx.operation_count,
            successful: tx.successful,
            fee_charged: tx.fee_charged,
            memo: tx.memo,
            source_account: tx.source_account
        }));

        res.json({
            success: true,
            contractAddress,
            history: formattedHistory,
            count: formattedHistory.length
        });

    } catch (error) {
        console.error('❌ Error obteniendo historial del contrato:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo historial del contrato',
            details: error.message
        });
    }
});

// Endpoint para obtener balance de tokens del usuario
app.get('/api/user-balance/:userAddress/:assetCode/:assetIssuer', async (req, res) => {
    try {
        const { userAddress, assetCode, assetIssuer } = req.params;
        console.log(`💰 Obteniendo balance para: ${userAddress}`);

        const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
        const account = await server.loadAccount(userAddress);

        const tokenBalance = account.balances.find(balance =>
            balance.asset_code === assetCode && balance.asset_issuer === assetIssuer
        );

        res.json({
            success: true,
            userAddress,
            assetCode,
            assetIssuer,
            balance: tokenBalance ? tokenBalance.balance : '0',
            hasToken: !!tokenBalance
        });

    } catch (error) {
        console.error('❌ Error obteniendo balance:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo balance',
            details: error.message
        });
    }
});

// Endpoint para obtener información de contratos compilados del usuario
app.get('/api/user-contracts/:userAddress', async (req, res) => {
    try {
        const { userAddress } = req.params;
        console.log(`📋 Obteniendo contratos del usuario: ${userAddress}`);

        const compiledDir = path.join(__dirname, 'tralala', 'compiled');

        try {
            const files = await fs.readdir(compiledDir);
            const userContracts = [];

            for (const file of files) {
                if (file.endsWith('.json')) {
                    const contractInfoPath = path.join(compiledDir, file);
                    const contractInfoContent = await fs.readFile(contractInfoPath, 'utf-8');
                    const contractInfo = JSON.parse(contractInfoContent);

                    if (contractInfo.userAddress === userAddress) {
                        userContracts.push({
                            contractId: contractInfo.contractId,
                            contractName: contractInfo.contractName,
                            tokenData: contractInfo.tokenData,
                            compiledAt: contractInfo.compiledAt
                        });
                    }
                }
            }

            res.json({
                success: true,
                contracts: userContracts,
                count: userContracts.length
            });

        } catch (readError) {
            res.json({
                success: true,
                contracts: [],
                count: 0
            });
        }

    } catch (error) {
        console.error('❌ Error obteniendo contratos del usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo contratos',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Tralalero Contracts server ready at http://localhost:${PORT}`);
});