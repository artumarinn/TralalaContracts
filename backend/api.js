const express = require('express');
const fs = require('fs').promises;
const fse = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const StellarSdk = require('@stellar/stellar-sdk');

const app = express();
const PORT = process.env.PORT || 3001;

// Hardcoded Testnet configuration
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

console.log('🌐 Backend configured for Stellar Testnet');
console.log('🔍 Server URL:', server.serverURL.toString());

app.use(express.static(path.join(__dirname, 'public')));
// Increase body size limit for WASM base64 payloads (default is 100kb)
// WASM files can be 5-10kb, which in base64 becomes ~7-14kb
app.use(express.json({ limit: '10mb' }));

// Load metadata on startup
let contractMetadata = null;

async function loadMetadata() {
    try {
        const metadataPath = path.join(__dirname, 'compiled', 'metadata.json');
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        contractMetadata = JSON.parse(metadataContent);
        console.log('✅ Contract metadata loaded');
        console.log(`📋 Available templates: ${contractMetadata.templates.map(t => t.id).join(', ')}`);
    } catch (error) {
        console.error('❌ Error loading metadata:', error);
        process.exit(1);
    }
}

/**
 * POST /api/compile-contract
 *
 * Returns precompiled WASM for a template
 *
 * Request body:
 * {
 *   "templateType": "token_basic" | "token_advanced",
 *   "config": {
 *     "name": "Token Name",
 *     "symbol": "TKN",
 *     "decimals": 7,
 *     "initialSupply": 1000000
 *   }
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "contractId": "uuid-xxx",
 *   "templateType": "token_basic",
 *   "wasmBase64": "AGFzbS0x...",
 *   "compiledAt": "2025-11-12T11:07:00Z",
 *   "message": "Template compiled (precompiled)"
 * }
 */
app.post('/api/compile-contract', async (req, res) => {
    try {
        console.log('🔧 Compile contract request received');
        const { templateType, config } = req.body;

        // Validate input
        if (!templateType) {
            return res.status(400).json({
                success: false,
                error: 'templateType is required (token_basic or token_advanced)'
            });
        }

        if (!config) {
            return res.status(400).json({
                success: false,
                error: 'config object is required'
            });
        }

        // Find template in metadata
        const template = contractMetadata.templates.find(t => t.id === templateType);
        if (!template) {
            return res.status(404).json({
                success: false,
                error: `Template '${templateType}' not found. Available: ${contractMetadata.templates.map(t => t.id).join(', ')}`
            });
        }

        console.log(`📋 Using template: ${template.name} (${template.id})`);
        console.log(`📝 Configuration:`, config);

        // Read precompiled WASM
        const wasmPath = path.join(__dirname, 'compiled', template.filename);
        const wasmBuffer = await fs.readFile(wasmPath);
        const wasmBase64 = wasmBuffer.toString('base64');

        // Generate contract ID
        const contractId = uuidv4();

        console.log(`✅ Template compiled (precompiled)`);
        console.log(`📦 WASM size: ${wasmBuffer.length} bytes`);
        console.log(`🆔 Contract ID: ${contractId}`);

        // Return response
        res.json({
            success: true,
            contractId: contractId,
            templateType: templateType,
            templateName: template.name,
            wasmBase64: wasmBase64,
            wasmSize: wasmBuffer.length,
            compiledAt: new Date().toISOString(),
            message: 'Template compiled (precompiled - instant deployment)',
            config: config
        });

    } catch (error) {
        console.error('❌ Error compiling contract:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

/**
 * GET /api/templates
 *
 * Returns available contract templates
 */
app.get('/api/templates', (req, res) => {
    res.json({
        success: true,
        templates: contractMetadata.templates.map(t => ({
            id: t.id,
            name: t.name,
            description: t.description,
            features: t.features
        }))
    });
});

/**
 * GET /api/templates/:templateId
 *
 * Returns details for a specific template
 */
app.get('/api/templates/:templateId', (req, res) => {
    const template = contractMetadata.templates.find(t => t.id === req.params.templateId);
    if (!template) {
        return res.status(404).json({
            success: false,
            error: `Template '${req.params.templateId}' not found`
        });
    }
    res.json({
        success: true,
        template: template
    });
});

/**
 * POST /api/deploy-contract
 *
 * Deploy contract to Stellar (requires user signature)
 * Generates UNSIGNED XDR transactions for:
 * 1. Upload WASM to Stellar
 * 2. Create contract instance from uploaded WASM
 *
 * Frontend will sign these with Freighter and submit to Stellar
 */
app.post('/api/deploy-contract', async (req, res) => {
    try {
        const { wasmBase64, userAddress, contractData } = req.body;

        console.log('═══════════════════════════════════════════════════');
        console.log('🚀 DEPLOY CONTRACT REQUEST (BACKEND)');
        console.log('═══════════════════════════════════════════════════');
        console.log('📦 WASM Base64 length:', wasmBase64?.length || 'MISSING');
        console.log('👤 User address:', userAddress);
        console.log('📋 Contract data:', contractData);

        if (!wasmBase64 || !userAddress) {
            return res.status(400).json({
                success: false,
                error: 'wasmBase64 and userAddress are required'
            });
        }

        console.log('🔍 Step 1: Verifying user account on Stellar Testnet...');

        // Compatibility layer: v14.x may use 'rpc' instead of 'SorobanRpc'
        const SorobanRpc = StellarSdk.rpc || StellarSdk.SorobanRpc;
        if (!SorobanRpc || !SorobanRpc.Server) {
            return res.status(500).json({
                success: false,
                error: 'SorobanRpc.Server not available in current SDK version'
            });
        }

        // Use Soroban RPC for contract operations (NOT Horizon!)
        const sorobanServer = new SorobanRpc.Server('https://soroban-testnet.stellar.org');

        // Verify user account exists
        let userAccount;
        try {
            userAccount = await server.loadAccount(userAddress);
            console.log(`✅ User account verified: ${userAddress}`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return res.status(400).json({
                    success: false,
                    error: 'User account not found on Stellar Testnet. Use Friendbot to create and fund account.'
                });
            }
            throw error;
        }

        console.log('🔍 Step 2: Converting WASM base64 to buffer...');
        const wasmBuffer = Buffer.from(wasmBase64, 'base64');
        console.log(`✅ WASM buffer created: ${wasmBuffer.length} bytes`);

        // ==========================================
        // TRANSACTION 1: Upload WASM to Stellar
        // ==========================================
        console.log('🔍 Step 3: Building UPLOAD WASM transaction...');

        // IMPORTANT: Use a higher initial fee for Soroban operations
        // BASE_FEE (100 stroops) is too low - Soroban needs at least 100,000 stroops
        // prepareTransaction() will adjust this to the actual required fee
        const uploadTransaction = new StellarSdk.TransactionBuilder(userAccount, {
            fee: '10000000', // 10 million stroops (1 XLM) - prepareTransaction will adjust down
            networkPassphrase: networkPassphrase,
        })
            .addOperation(
                StellarSdk.Operation.uploadContractWasm({
                    wasm: wasmBuffer,
                })
            )
            .setTimeout(300) // 5 minutes
            .build();

        console.log('✅ Upload transaction built (UNSIGNED)');
        console.log('   Initial fee:', uploadTransaction.fee, 'stroops');

        // Simulate the transaction to prepare it for real submission
        console.log('🔍 Step 4: Simulating UPLOAD transaction...');
        let preparedUploadTx;
        try {
            preparedUploadTx = await sorobanServer.prepareTransaction(uploadTransaction);
            console.log('✅ Upload transaction prepared (simulated)');
            console.log('   Adjusted fee:', preparedUploadTx.fee, 'stroops');
            console.log('   Fee in XLM:', (parseInt(preparedUploadTx.fee) / 10000000).toFixed(7));
        } catch (prepError) {
            console.error('❌ Error preparing upload transaction:', prepError);
            return res.status(500).json({
                success: false,
                error: 'Error preparing upload transaction',
                details: prepError.message
            });
        }

        const uploadXDR = preparedUploadTx.toXDR();
        console.log('📤 Upload XDR ready (length:', uploadXDR.length, ')');

        // Calculate WASM hash (this will be the wasmId after upload)
        const crypto = require('crypto');
        const wasmHash = crypto.createHash('sha256').update(wasmBuffer).digest('hex');
        console.log('🔑 WASM Hash (wasmId):', wasmHash);

        console.log('🔍 Step 5: Contract ID calculation...');
        // NOTE: Contract ID will be extracted from CREATE transaction response
        // The frontend will parse the transaction meta XDR to get the real contract address
        // This ensures correct StrKey format (C + base32 encoding)
        const expectedContractId = 'PENDING_EXTRACTION_FROM_BLOCKCHAIN';

        console.log('🆔 Contract ID: Will be extracted from CREATE transaction response');
        console.log('   Frontend will parse transaction meta XDR for accurate StrKey address');

        console.log('═══════════════════════════════════════════════════');
        console.log('✅ BACKEND READY - Returning UPLOAD XDR to frontend');
        console.log('═══════════════════════════════════════════════════');
        console.log('⚠️  CREATE transaction must be prepared AFTER upload completes');
        console.log('   Frontend should call /api/prepare-create-contract after UPLOAD succeeds');

        // Return ONLY the prepared UPLOAD transaction
        // CREATE must be prepared separately after WASM exists on blockchain
        res.json({
            success: true,
            wasmId: wasmHash,
            contractId: expectedContractId,
            uploadTransactionXDR: uploadXDR,
            network: 'testnet',
            explorerUrl: `https://stellar.expert/explorer/testnet/contract/${expectedContractId}`,
            message: 'UPLOAD transaction prepared. Call /api/prepare-create-contract after UPLOAD completes.',
            fees: {
                upload: `Calculated by prepareTransaction() - shown in logs`,
                create: 'Will be calculated when you call /api/prepare-create-contract'
            }
        });

    } catch (error) {
        console.error('═══════════════════════════════════════════════════');
        console.error('❌ ERROR IN DEPLOY CONTRACT ENDPOINT');
        console.error('═══════════════════════════════════════════════════');
        console.error('❌ Error:', error);
        console.error('❌ Stack:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

/**
 * POST /api/prepare-create-contract
 *
 * Prepares the CREATE CONTRACT transaction AFTER WASM upload completes
 * This MUST be called after the UPLOAD transaction is confirmed because
 * prepareTransaction() needs the WASM to exist on the blockchain
 *
 * Request body:
 * {
 *   "userAddress": "G...",
 *   "wasmHash": "abc123...",
 *   "contractId": "C..." (for verification)
 * }
 */
app.post('/api/prepare-create-contract', async (req, res) => {
    try {
        const { userAddress, wasmHash, contractId } = req.body;

        console.log('═══════════════════════════════════════════════════');
        console.log('🔧 PREPARE CREATE CONTRACT REQUEST');
        console.log('═══════════════════════════════════════════════════');
        console.log('👤 User address:', userAddress);
        console.log('🔑 WASM Hash:', wasmHash);
        console.log('🆔 Expected Contract ID:', contractId);

        if (!userAddress || !wasmHash) {
            return res.status(400).json({
                success: false,
                error: 'userAddress and wasmHash are required'
            });
        }

        // Compatibility layer: v14.x may use 'rpc' instead of 'SorobanRpc'
        const SorobanRpc = StellarSdk.rpc || StellarSdk.SorobanRpc;
        if (!SorobanRpc || !SorobanRpc.Server) {
            return res.status(500).json({
                success: false,
                error: 'SorobanRpc.Server not available in current SDK version'
            });
        }

        // Use Soroban RPC
        const sorobanServer = new SorobanRpc.Server('https://soroban-testnet.stellar.org');

        // Load user account (fresh sequence number)
        console.log('🔍 Loading user account from blockchain...');
        let userAccount;
        try {
            userAccount = await server.loadAccount(userAddress);
            console.log(`✅ User account loaded, sequence: ${userAccount.sequence}`);
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'User account not found on Stellar Testnet'
            });
        }

        // Build CREATE CONTRACT transaction
        console.log('🔍 Building CREATE CONTRACT transaction...');
        const createTransaction = new StellarSdk.TransactionBuilder(userAccount, {
            fee: '10000000', // High initial fee - prepareTransaction will adjust
            networkPassphrase: networkPassphrase,
        })
            .addOperation(
                StellarSdk.Operation.createCustomContract({
                    address: new StellarSdk.Address(userAddress),
                    wasmHash: Buffer.from(wasmHash, 'hex'),
                })
            )
            .setTimeout(300) // 5 minutes
            .build();

        console.log('✅ CREATE transaction built (UNSIGNED)');

        // NOW we can prepare it because WASM exists on blockchain!
        console.log('🔍 Preparing CREATE transaction (simulating + adding footprint)...');
        let preparedCreateTx;
        try {
            preparedCreateTx = await sorobanServer.prepareTransaction(createTransaction);
            console.log('✅ CREATE transaction prepared successfully!');
            console.log('   Adjusted fee:', preparedCreateTx.fee, 'stroops');
            console.log('   Fee in XLM:', (parseInt(preparedCreateTx.fee) / 10000000).toFixed(7));
        } catch (prepError) {
            console.error('❌ Error preparing CREATE transaction:', prepError);
            return res.status(500).json({
                success: false,
                error: 'Error preparing CREATE transaction. WASM might not be uploaded yet.',
                details: prepError.message
            });
        }

        const createXDR = preparedCreateTx.toXDR();
        console.log('📤 Prepared CREATE XDR ready (length:', createXDR.length, ')');

        console.log('═══════════════════════════════════════════════════');
        console.log('✅ CREATE TRANSACTION READY');
        console.log('═══════════════════════════════════════════════════');

        res.json({
            success: true,
            createTransactionXDR: createXDR,
            contractId: contractId,
            wasmHash: wasmHash,
            fee: preparedCreateTx.fee,
            message: 'CREATE transaction prepared and ready for signing'
        });

    } catch (error) {
        console.error('═══════════════════════════════════════════════════');
        console.error('❌ ERROR IN PREPARE CREATE CONTRACT ENDPOINT');
        console.error('═══════════════════════════════════════════════════');
        console.error('❌ Error:', error);
        console.error('❌ Stack:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'Backend is running',
        environment: 'Stellar Testnet',
        templates_available: contractMetadata.templates.length
    });
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Tralalero Contracts Backend',
        version: '1.0.0',
        documentation: {
            endpoints: [
                'POST /api/compile-contract - Compile a contract template',
                'GET /api/templates - List available templates',
                'GET /api/templates/:templateId - Get template details',
                'POST /api/deploy-contract - Prepare UPLOAD WASM transaction',
                'POST /api/prepare-create-contract - Prepare CREATE CONTRACT transaction (after upload)',
                'GET /api/health - Health check'
            ],
            docs_url: '/api/docs'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
(async () => {
    try {
        await loadMetadata();
        app.listen(PORT, () => {
            console.log(`\n🚀 Tralalero Contracts Backend running on port ${PORT}`);
            console.log(`📍 http://localhost:${PORT}`);
            console.log(`🔍 Health check: http://localhost:${PORT}/api/health\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
})();

module.exports = app;
