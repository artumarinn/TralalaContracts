/**
 * QUICK REFERENCE: Soroban Transaction Verification
 * Stellar SDK v11.3.0
 *
 * Copy-paste this code into your project to verify Soroban transactions correctly.
 */

const StellarSdk = require('@stellar/stellar-sdk');

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

// ✅ USE THIS for Soroban smart contract operations
const sorobanServer = new StellarSdk.SorobanRpc.Server('https://soroban-testnet.stellar.org');

// ✅ USE THIS only for account queries
const horizonServer = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

const networkPassphrase = StellarSdk.Networks.TESTNET;

// ============================================================================
// HELPER FUNCTION: Wait for Transaction Confirmation
// ============================================================================

/**
 * Polls Soroban RPC Server until transaction is confirmed
 *
 * @param {string} txHash - Transaction hash from sendTransaction()
 * @param {number} maxAttempts - Maximum polling attempts (default: 60 seconds)
 * @returns {Promise<object>} Transaction status object with returnValue
 */
async function waitForTransactionConfirmation(txHash, maxAttempts = 60) {
    let attempts = 0;

    while (attempts < maxAttempts) {
        attempts++;
        console.log(`[${attempts}/${maxAttempts}] Checking transaction ${txHash}...`);

        try {
            // ✅ CORRECT: Use Soroban RPC getTransaction()
            const txStatus = await sorobanServer.getTransaction(txHash);

            console.log(`Status: ${txStatus.status}`);

            if (txStatus.status === 'SUCCESS') {
                console.log('✅ Transaction confirmed successfully!');
                return txStatus;
            } else if (txStatus.status === 'FAILED') {
                console.error('❌ Transaction failed');
                console.error('Result XDR:', txStatus.resultXdr);
                throw new Error(`Transaction failed: ${txStatus.resultXdr}`);
            } else if (txStatus.status === 'NOT_FOUND') {
                // Transaction not yet indexed, keep polling
                console.log('⏳ Transaction not found yet, waiting...');
            }

        } catch (error) {
            console.warn('⚠️ Error polling transaction:', error.message);
        }

        // Wait 1 second before next check
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error(`Timeout waiting for transaction confirmation after ${maxAttempts} seconds`);
}

// ============================================================================
// EXAMPLE 1: Upload WASM and Wait for Confirmation
// ============================================================================

async function uploadWasmExample() {
    const userAddress = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    const wasmBuffer = Buffer.from('...'); // Your WASM binary

    // Load user account
    const userAccount = await horizonServer.loadAccount(userAddress);

    // Build UPLOAD transaction
    const uploadTx = new StellarSdk.TransactionBuilder(userAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: networkPassphrase,
    })
        .addOperation(
            StellarSdk.Operation.uploadContractWasm({
                wasm: wasmBuffer,
            })
        )
        .setTimeout(300)
        .build();

    // ✅ CRITICAL: Prepare transaction with Soroban RPC (calculates fees)
    const preparedTx = await sorobanServer.prepareTransaction(uploadTx);

    // Sign with user's private key (or use Freighter in frontend)
    const sourceKeypair = StellarSdk.Keypair.fromSecret('SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    preparedTx.sign(sourceKeypair);

    // ✅ CORRECT: Submit to Soroban RPC
    const result = await sorobanServer.sendTransaction(preparedTx);
    console.log('Transaction sent! Hash:', result.hash);

    // ✅ CORRECT: Wait for confirmation using Soroban RPC
    const confirmedTx = await waitForTransactionConfirmation(result.hash);

    console.log('WASM uploaded successfully!');
    return confirmedTx;
}

// ============================================================================
// EXAMPLE 2: Create Contract and Extract Contract ID
// ============================================================================

async function createContractExample() {
    const userAddress = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    const wasmHash = 'abc123...'; // Hash from upload step

    // Load user account
    const userAccount = await horizonServer.loadAccount(userAddress);

    // Build CREATE CONTRACT transaction
    const createTx = new StellarSdk.TransactionBuilder(userAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: networkPassphrase,
    })
        .addOperation(
            StellarSdk.Operation.createCustomContract({
                address: new StellarSdk.Address(userAddress),
                wasmHash: Buffer.from(wasmHash, 'hex'),
            })
        )
        .setTimeout(300)
        .build();

    // ✅ CRITICAL: Prepare transaction
    const preparedTx = await sorobanServer.prepareTransaction(createTx);

    // Sign transaction
    const sourceKeypair = StellarSdk.Keypair.fromSecret('SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    preparedTx.sign(sourceKeypair);

    // ✅ CORRECT: Submit to Soroban RPC
    const result = await sorobanServer.sendTransaction(preparedTx);
    console.log('Transaction sent! Hash:', result.hash);

    // ✅ CORRECT: Wait for confirmation
    const confirmedTx = await waitForTransactionConfirmation(result.hash);

    // ✅ Extract Contract ID from returnValue
    if (confirmedTx.returnValue) {
        const contractAddress = StellarSdk.Address.fromScVal(confirmedTx.returnValue);
        const contractId = contractAddress.toString();
        console.log('Contract ID:', contractId);
        return contractId;
    }

    throw new Error('Could not extract contract ID from transaction result');
}

// ============================================================================
// EXAMPLE 3: Frontend with Freighter Wallet
// ============================================================================

async function deployWithFreighterExample() {
    // This runs in the browser (frontend)
    const StellarSdk = window.StellarSdk;
    const sorobanServer = new StellarSdk.SorobanRpc.Server('https://soroban-testnet.stellar.org');
    const networkPassphrase = StellarSdk.Networks.TESTNET;

    // Get unsigned XDR from backend
    const response = await fetch('/api/deploy-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wasmBase64: '...' })
    });

    const { uploadTransactionXDR, createTransactionXDR } = await response.json();

    // === STEP 1: Sign and submit UPLOAD ===
    const uploadSignedXdr = await window.freighterApi.signTransaction(
        uploadTransactionXDR,
        { networkPassphrase }
    );

    const uploadTx = new StellarSdk.Transaction(uploadSignedXdr, networkPassphrase);
    const uploadResult = await sorobanServer.sendTransaction(uploadTx);

    console.log('Upload TX Hash:', uploadResult.hash);

    // === STEP 2: Wait for UPLOAD confirmation ===
    let uploadConfirmed = false;
    let attempts = 0;

    while (!uploadConfirmed && attempts < 60) {
        attempts++;
        await new Promise(r => setTimeout(r, 1000));

        const txStatus = await sorobanServer.getTransaction(uploadResult.hash);

        if (txStatus.status === 'SUCCESS') {
            uploadConfirmed = true;
            break;
        } else if (txStatus.status === 'FAILED') {
            throw new Error('Upload failed');
        }
    }

    if (!uploadConfirmed) {
        throw new Error('Upload timeout');
    }

    console.log('✅ Upload confirmed, proceeding to CREATE...');

    // === STEP 3: Sign and submit CREATE ===
    const createSignedXdr = await window.freighterApi.signTransaction(
        createTransactionXDR,
        { networkPassphrase }
    );

    const createTx = new StellarSdk.Transaction(createSignedXdr, networkPassphrase);
    const createResult = await sorobanServer.sendTransaction(createTx);

    console.log('Create TX Hash:', createResult.hash);

    // === STEP 4: Wait for CREATE confirmation ===
    let createConfirmed = false;
    attempts = 0;

    while (!createConfirmed && attempts < 60) {
        attempts++;
        await new Promise(r => setTimeout(r, 1000));

        const txStatus = await sorobanServer.getTransaction(createResult.hash);

        if (txStatus.status === 'SUCCESS') {
            // Extract contract ID
            if (txStatus.returnValue) {
                const contractAddress = StellarSdk.Address.fromScVal(txStatus.returnValue);
                const contractId = contractAddress.toString();

                console.log('🎉 Contract deployed!');
                console.log('Contract ID:', contractId);

                return {
                    success: true,
                    contractId: contractId,
                    explorerUrl: `https://stellar.expert/explorer/testnet/contract/${contractId}`
                };
            }

            createConfirmed = true;
            break;
        } else if (txStatus.status === 'FAILED') {
            throw new Error('Create failed');
        }
    }

    if (!createConfirmed) {
        throw new Error('Create timeout');
    }
}

// ============================================================================
// WHAT NOT TO DO (Common Mistakes)
// ============================================================================

async function commonMistakes() {
    // ❌ WRONG: Using Horizon Server for Soroban transactions
    const horizonServer = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

    try {
        // This will give "Bad union switch: 4" error
        const tx = await horizonServer.transactions().transaction('abc123').call();
    } catch (error) {
        console.error('Error:', error.message); // "Bad union switch: 4"
    }

    // ❌ WRONG: Submitting CREATE before UPLOAD is confirmed
    const uploadResult = await sorobanServer.sendTransaction(uploadTx);
    const createResult = await sorobanServer.sendTransaction(createTx); // TOO SOON!
    // This will give "Wasm does not exist" error

    // ❌ WRONG: Not using prepareTransaction()
    const tx = new StellarSdk.TransactionBuilder(account, { fee: StellarSdk.BASE_FEE })
        .addOperation(StellarSdk.Operation.uploadContractWasm({ wasm: buffer }))
        .build();

    // Don't submit directly - fees will be too low!
    // await sorobanServer.sendTransaction(tx); // WRONG

    // ✅ CORRECT: Always prepare first
    const preparedTx = await sorobanServer.prepareTransaction(tx);
    await sorobanServer.sendTransaction(preparedTx);
}

// ============================================================================
// EXPORTS (if using in Node.js module)
// ============================================================================

module.exports = {
    sorobanServer,
    horizonServer,
    networkPassphrase,
    waitForTransactionConfirmation,
    uploadWasmExample,
    createContractExample,
    deployWithFreighterExample
};

// ============================================================================
// DOCUMENTATION LINKS
// ============================================================================

/**
 * Official Stellar Documentation:
 *
 * - Soroban RPC Server: https://developers.stellar.org/docs/reference/stellar-sdk/soroban-rpc
 * - prepareTransaction: https://developers.stellar.org/docs/reference/stellar-sdk/soroban-rpc#preparetransaction
 * - sendTransaction: https://developers.stellar.org/docs/reference/stellar-sdk/soroban-rpc#sendtransaction
 * - getTransaction: https://developers.stellar.org/docs/reference/stellar-sdk/soroban-rpc#gettransaction
 * - Deploying Contracts: https://developers.stellar.org/docs/learn/soroban/deploying-contracts
 * - Stellar SDK JS: https://github.com/stellar/js-stellar-sdk
 * - Freighter API: https://developers.stellar.org/docs/tools/freighter
 * - Stellar Explorer: https://stellar.expert/explorer/testnet
 */
