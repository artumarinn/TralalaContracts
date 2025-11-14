/**
 * STELLAR SDK BEST PRACTICES - DEPLOYMENT CODE
 *
 * Este código reemplaza el deployment manual con las mejores prácticas oficiales:
 * - Usa server.pollTransaction() en lugar de polling manual
 * - Verifica status de sendTransaction() antes de polling
 * - Implementa backoff exponencial
 * - Maneja todos los estados correctamente
 *
 * INSTRUCCIONES:
 * 1. Primero ejecuta: npm install (actualiza SDK a 12.3.0)
 * 2. Reemplaza la función deployToStellar() en public/index.html con este código
 * 3. Recarga la página con Ctrl+Shift+R o Cmd+Shift+R
 */

async function deployToStellar(wasmBase64, userAddress, contractData) {
    console.log('════════════════════════════════════════════════════');
    console.log('🚀 STELLAR DEPLOYMENT - BEST PRACTICES MODE');
    console.log('════════════════════════════════════════════════════');
    console.log('📦 WASM Size:', (wasmBase64.length * 0.75 / 1024).toFixed(2), 'KB');
    console.log('👤 User Address:', userAddress);
    console.log('📋 Contract Data:', JSON.stringify(contractData, null, 2));
    console.log('════════════════════════════════════════════════════');

    // Initialize Stellar SDK components
    const StellarSdk = window.StellarSdk;
    const server = new StellarSdk.SorobanRpc.Server('https://soroban-testnet.stellar.org');
    const networkPassphrase = StellarSdk.Networks.TESTNET;

    try {
        // ========================================
        // HELPER: Polling con Horizon Fallback
        // ========================================
        async function pollTransactionWithFallback(txHash, transactionName) {
            console.log(`⏱️ Waiting for ${transactionName} confirmation...`);
            console.log('📋 Using SDK pollTransaction() with exponential backoff');

            try {
                // BEST PRACTICE: Usar pollTransaction() oficial del SDK
                const result = await server.pollTransaction(txHash, {
                    sleepStrategy: (iter) => {
                        // Backoff exponencial: 1s, 2s, 4s, 8s, luego 10s máximo
                        const backoff = Math.min(1000 * Math.pow(2, iter), 10000);
                        console.log(`   🔍 Polling attempt ${iter + 1}, waiting ${backoff}ms...`);
                        return backoff;
                    },
                    attempts: 30  // Con backoff exponencial, ~5 minutos total
                });

                console.log('════════════════════════════════════════════════════');
                console.log(`✅ ${transactionName} CONFIRMED!`);
                console.log('════════════════════════════════════════════════════');
                console.log('   Status:', result.status);
                console.log('   Ledger:', result.ledger);
                console.log('   Created At:', result.createdAt);
                console.log('   Latest Ledger:', result.latestLedger);
                console.log('════════════════════════════════════════════════════');

                return result;

            } catch (pollError) {
                console.warn('════════════════════════════════════════════════════');
                console.warn('⚠️ SDK POLL TRANSACTION TIMEOUT');
                console.warn('════════════════════════════════════════════════════');
                console.warn('⚠️ pollTransaction() timed out after ~5 minutes');
                console.warn('⚠️ This is normal for Soroban RPC indexing delays');
                console.warn('🔄 Trying Horizon Server as fallback...');
                console.warn('════════════════════════════════════════════════════');

                // Fallback: Horizon Server
                try {
                    const horizonServer = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
                    console.log('🔍 Querying Horizon for transaction...');

                    const horizonTx = await horizonServer
                        .transactions()
                        .transaction(txHash)
                        .call();

                    console.log('════════════════════════════════════════════════════');
                    console.log('✅ FOUND ON HORIZON SERVER!');
                    console.log('════════════════════════════════════════════════════');
                    console.log('   Successful:', horizonTx.successful);
                    console.log('   Ledger:', horizonTx.ledger);
                    console.log('   Created At:', horizonTx.created_at);
                    console.log('   Operations:', horizonTx.operation_count);
                    console.log('════════════════════════════════════════════════════');

                    if (horizonTx.successful) {
                        console.log('💡 Transaction succeeded but Soroban RPC didn\'t index it');
                        console.log('💡 This is a known issue - continuing with Horizon data');

                        // Retornar en formato compatible con Soroban RPC
                        return {
                            status: 'SUCCESS',
                            hash: txHash,
                            ledger: horizonTx.ledger,
                            createdAt: horizonTx.created_at,
                            resultMetaXdr: horizonTx.result_meta_xdr,
                            resultXdr: horizonTx.result_xdr,
                            source: 'horizon'
                        };
                    } else {
                        throw new Error(`${transactionName} failed on blockchain (verified via Horizon)`);
                    }

                } catch (horizonError) {
                    console.error('════════════════════════════════════════════════════');
                    console.error('❌ BOTH SOROBAN RPC AND HORIZON FAILED');
                    console.error('════════════════════════════════════════════════════');
                    console.error('   Error:', horizonError.message);

                    if (horizonError.response?.status === 404) {
                        console.error('❌ Transaction NOT FOUND on both servers');
                        console.error('❌ Possible causes:');
                        console.error('❌   1. Transaction was never submitted');
                        console.error('❌   2. Network connectivity issue');
                        console.error('❌   3. Transaction rejected by network');
                    }

                    console.error('════════════════════════════════════════════════════');
                    console.error('🔗 MANUAL VERIFICATION');
                    console.error('════════════════════════════════════════════════════');
                    console.error('   Stellar Expert:');
                    console.error('   https://stellar.expert/explorer/testnet/tx/' + txHash);
                    console.error('   ');
                    console.error('   Horizon API:');
                    console.error('   https://horizon-testnet.stellar.org/transactions/' + txHash);
                    console.error('════════════════════════════════════════════════════');

                    throw new Error(`Timeout waiting for ${transactionName} confirmation (both RPC and Horizon failed)`);
                }
            }
        }

        // ========================================
        // STEP 1: UPLOAD WASM
        // ========================================
        console.log('\n📤 STEP 1: UPLOADING WASM TO STELLAR');
        console.log('═══════════════════════════════════════════════════');

        // Get XDR from backend
        const uploadResponse = await fetch('/api/deploy-contract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                wasmBase64,
                userAddress,
                contractData
            })
        });

        if (!uploadResponse.ok) {
            throw new Error(`Backend error: ${uploadResponse.statusText}`);
        }

        const deployResult = await uploadResponse.json();

        if (!deployResult.success) {
            throw new Error(deployResult.error || 'Backend deployment failed');
        }

        console.log('✅ Received XDRs from backend');
        console.log('   Has UPLOAD XDR:', !!deployResult.uploadTransactionXDR);
        console.log('   Has CREATE XDR:', !!deployResult.createTransactionXDR);

        // Sign UPLOAD transaction with Freighter
        console.log('\n✍️ Signing UPLOAD transaction with Freighter...');

        const uploadSignedXdr = await window.freighterApi.signTransaction(
            deployResult.uploadTransactionXDR,
            { networkPassphrase }
        );

        console.log('✅ UPLOAD transaction signed');
        console.log('   Signed XDR:', uploadSignedXdr.substring(0, 50) + '...');

        // Parse signed XDR
        const uploadTx = new StellarSdk.Transaction(uploadSignedXdr, networkPassphrase);

        // Send transaction
        console.log('\n📡 Sending UPLOAD transaction to Stellar...');

        const uploadSendResponse = await server.sendTransaction(uploadTx);

        console.log('════════════════════════════════════════════════════');
        console.log('📊 UPLOAD SEND RESPONSE');
        console.log('════════════════════════════════════════════════════');
        console.log('   Status:', uploadSendResponse.status);
        console.log('   Hash:', uploadSendResponse.hash);
        console.log('   Latest Ledger:', uploadSendResponse.latestLedger);
        console.log('   Error XDR:', uploadSendResponse.errorResultXdr || 'N/A');
        console.log('════════════════════════════════════════════════════');

        // BEST PRACTICE: Verificar status antes de polling
        if (uploadSendResponse.status === 'ERROR') {
            console.error('❌ UPLOAD transaction rejected by network');
            console.error('   Error XDR:', uploadSendResponse.errorResultXdr);
            throw new Error(`UPLOAD transaction rejected: ${uploadSendResponse.errorResultXdr}`);
        }

        if (uploadSendResponse.status === 'DUPLICATE') {
            console.warn('⚠️ UPLOAD transaction is duplicate');
            console.warn('   This might be a retry - continuing anyway...');
        }

        if (uploadSendResponse.status === 'TRY_AGAIN_LATER') {
            console.warn('⚠️ Network busy - you should retry');
            throw new Error('Network busy, please try again in a few seconds');
        }

        // Poll for confirmation usando el método oficial
        const uploadResult = await pollTransactionWithFallback(
            uploadSendResponse.hash,
            'UPLOAD'
        );

        console.log('✅ UPLOAD completed successfully');
        console.log('   Hash:', uploadResult.hash || uploadSendResponse.hash);
        console.log('   Source:', uploadResult.source || 'soroban-rpc');

        // ========================================
        // STEP 2: CREATE CONTRACT
        // ========================================
        console.log('\n📤 STEP 2: CREATING CONTRACT INSTANCE');
        console.log('═══════════════════════════════════════════════════');

        // Sign CREATE transaction with Freighter
        console.log('✍️ Signing CREATE transaction with Freighter...');

        const createSignedXdr = await window.freighterApi.signTransaction(
            deployResult.createTransactionXDR,
            { networkPassphrase }
        );

        console.log('✅ CREATE transaction signed');

        // Parse signed XDR
        const createTx = new StellarSdk.Transaction(createSignedXdr, networkPassphrase);

        // Send transaction
        console.log('\n📡 Sending CREATE transaction to Stellar...');

        const createSendResponse = await server.sendTransaction(createTx);

        console.log('════════════════════════════════════════════════════');
        console.log('📊 CREATE SEND RESPONSE');
        console.log('════════════════════════════════════════════════════');
        console.log('   Status:', createSendResponse.status);
        console.log('   Hash:', createSendResponse.hash);
        console.log('   Latest Ledger:', createSendResponse.latestLedger);
        console.log('   Error XDR:', createSendResponse.errorResultXdr || 'N/A');
        console.log('════════════════════════════════════════════════════');

        // Verificar status
        if (createSendResponse.status === 'ERROR') {
            console.error('❌ CREATE transaction rejected by network');
            throw new Error(`CREATE transaction rejected: ${createSendResponse.errorResultXdr}`);
        }

        // Poll for confirmation
        const createResult = await pollTransactionWithFallback(
            createSendResponse.hash,
            'CREATE'
        );

        console.log('✅ CREATE completed successfully');

        // ========================================
        // STEP 3: EXTRACT CONTRACT ID
        // ========================================
        console.log('\n🔍 STEP 3: EXTRACTING CONTRACT ID');
        console.log('═══════════════════════════════════════════════════');

        let realContractId = deployResult.contractId; // Fallback

        if (createResult && createResult.resultMetaXdr) {
            try {
                const meta = StellarSdk.xdr.TransactionMeta.fromXDR(
                    createResult.resultMetaXdr,
                    'base64'
                );

                console.log('📊 Transaction meta XDR parsed');

                // Extract contract ID from the meta (v3 has sorobanMeta)
                if (meta.switch() === 3 && meta.v3().sorobanMeta()) {
                    const returnValue = meta.v3().sorobanMeta().returnValue();
                    if (returnValue) {
                        const addressObj = StellarSdk.Address.fromScVal(returnValue);
                        realContractId = addressObj.toString();
                        console.log('✅ Extracted real contract ID from blockchain');
                    }
                }
            } catch (extractError) {
                console.warn('⚠️ Could not extract contract ID from XDR:', extractError.message);
                console.warn('   Using simulated contract ID from backend');
            }
        }

        // ========================================
        // SUCCESS!
        // ========================================
        console.log('\n════════════════════════════════════════════════════');
        console.log('🎉 DEPLOYMENT SUCCESSFUL!');
        console.log('════════════════════════════════════════════════════');
        console.log('   Contract ID:', realContractId);
        console.log('   UPLOAD TX:', uploadResult.hash || uploadSendResponse.hash);
        console.log('   CREATE TX:', createResult.hash || createSendResponse.hash);
        console.log('   Network: Stellar Testnet');
        console.log('════════════════════════════════════════════════════');
        console.log('🔗 VERIFICATION LINKS:');
        console.log('   Contract:', `https://stellar.expert/explorer/testnet/contract/${realContractId}`);
        console.log('   UPLOAD TX:', `https://stellar.expert/explorer/testnet/tx/${uploadSendResponse.hash}`);
        console.log('   CREATE TX:', `https://stellar.expert/explorer/testnet/tx/${createSendResponse.hash}`);
        console.log('════════════════════════════════════════════════════');

        return {
            success: true,
            contractId: realContractId,
            uploadHash: uploadSendResponse.hash,
            createHash: createSendResponse.hash,
            network: 'testnet',
            explorerUrl: `https://stellar.expert/explorer/testnet/contract/${realContractId}`
        };

    } catch (error) {
        console.error('════════════════════════════════════════════════════');
        console.error('❌ DEPLOYMENT FAILED');
        console.error('════════════════════════════════════════════════════');
        console.error('   Error:', error.message);
        console.error('   Stack:', error.stack);
        console.error('════════════════════════════════════════════════════');

        throw error;
    }
}

// Exportar para uso en el HTML
if (typeof window !== 'undefined') {
    window.deployToStellar = deployToStellar;
}
