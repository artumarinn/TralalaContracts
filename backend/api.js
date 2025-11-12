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
app.use(express.json());

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
 * This delegates to the frontend's Freighter wallet integration
 */
app.post('/api/deploy-contract', async (req, res) => {
    try {
        const { contractId, wasmBase64, userAddress, contractData } = req.body;

        if (!contractId || !wasmBase64 || !userAddress) {
            return res.status(400).json({
                success: false,
                error: 'contractId, wasmBase64, and userAddress are required'
            });
        }

        console.log(`🚀 Deploy contract request: ${contractId}`);
        console.log(`👤 User address: ${userAddress}`);

        // Verify user account exists
        try {
            const account = await server.loadAccount(userAddress);
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

        // Return deployment instructions
        // Actual deployment is handled by frontend Freighter wallet
        res.json({
            success: true,
            contractId: contractId,
            message: 'Ready for deployment. User must sign transaction with Freighter wallet.',
            nextStep: 'present-deployment-review'
        });

    } catch (error) {
        console.error('❌ Error preparing deployment:', error);
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
                'POST /api/deploy-contract - Deploy contract to Stellar',
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
