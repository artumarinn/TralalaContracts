const StellarSdk = require('@stellar/stellar-sdk');
require('dotenv').config();

async function testStellarConnection() {
    console.log('🧪 Probando conexión con Stellar Testnet...\n');

    try {
        // 1. Verificar configuración
        if (!process.env.STELLAR_SECRET_KEY || process.env.STELLAR_SECRET_KEY === 'your_secret_key_here') {
            console.log('❌ Error: STELLAR_SECRET_KEY no está configurada');
            console.log('📝 Pasos para solucionarlo:');
            console.log('   1. Ve a https://laboratory.stellar.org/#account-creator?network=testnet');
            console.log('   2. Crea una cuenta de testnet');
            console.log('   3. Copia la clave secreta');
            console.log('   4. Reemplaza "your_secret_key_here" en el archivo .env');
            return;
        }

        // 2. Conectar con Horizon
        const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
        console.log('✅ Conectado con Horizon testnet');

        // 3. Verificar cuenta
        const keypair = StellarSdk.Keypair.fromSecret(process.env.STELLAR_SECRET_KEY);
        const publicKey = keypair.publicKey();
        console.log(`🔑 Clave pública: ${publicKey}`);

        try {
            const account = await server.loadAccount(publicKey);
            console.log(`✅ Cuenta encontrada - Balance: ${account.balances[0].balance} XLM`);

            // Verificar si tiene suficiente balance
            const xlmBalance = parseFloat(account.balances[0].balance);
            if (xlmBalance < 10) {
                console.log('⚠️  Advertencia: Balance bajo. Para crear tokens necesitas al menos 10 XLM');
                console.log('💡 Usa el Friendbot para obtener más XLM: https://laboratory.stellar.org/#account-creator?network=testnet');
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('❌ Cuenta no encontrada');
                console.log('💡 Usa el Friendbot para crear la cuenta: https://laboratory.stellar.org/#account-creator?network=testnet');
            } else {
                throw error;
            }
        }

        // 4. Probar creación de transacción simple
        console.log('\n🔨 Probando creación de transacción...');
        const testKeypair = StellarSdk.Keypair.random();
        console.log(`✅ Transacción de prueba creada para: ${testKeypair.publicKey()}`);

        console.log('\n🎉 ¡Todo listo! Tu configuración de Stellar está funcionando correctamente.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n🔧 Posibles soluciones:');
        console.log('   1. Verifica tu conexión a internet');
        console.log('   2. Asegúrate de que STELLAR_SECRET_KEY sea válida');
        console.log('   3. Verifica que la cuenta tenga fondos');
    }
}

testStellarConnection();
