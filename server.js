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

const app = express();
const PORT = 3000;

// FORZAR TESTNET EXPLÍCITAMENTE
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

// Verificar que estamos usando testnet
console.log('🌐 Red configurada:', networkPassphrase);
console.log('🔍 Server URL:', server.serverURL.toString());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

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

        // Leer y compilar template
        const templatePath = path.join(__dirname, 'tralala', 'contracts', 'token-templates', 'simple_token.hbs');
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
opt-level = "z"
overflow-checks = true
debug = 0
strip = "symbols"
debug-assertions = false
panic = "abort"
codegen-units = 1
lto = true

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
    try {
        console.log('🚀 Desplegando smart contract...');
        console.log('   Datos recibidos:', JSON.stringify(req.body, null, 2));

        const { contractId, userAddress, networkPassphrase } = req.body;

        if (!contractId || !userAddress) {
            throw new Error('Se requieren contractId y userAddress');
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
        const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

        console.log('📤 Desplegando contrato a red:', network);

        // Leer el WASM
        const wasmBuffer = await fs.readFile(wasmPath);
        console.log(`📦 WASM leído: ${wasmBuffer.length} bytes`);

        // Crear keypairs para el contrato
        const sourceKeypair = StellarSdk.Keypair.fromPublicKey(userAddress);

        // Cargar cuenta del usuario
        const sourceAccount = await server.loadAccount(userAddress);

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