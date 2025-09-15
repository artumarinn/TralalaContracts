// require('dotenv').config(); // Ya no necesitamos .env - cada usuario usa su wallet
const express = require('express');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
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

app.listen(PORT, () => {
    console.log(`🚀 Tralalero Contracts server ready at http://localhost:${PORT}`);
});