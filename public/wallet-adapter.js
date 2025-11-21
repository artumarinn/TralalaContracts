// Minimal Wallet Adapter for Stellar wallets
// Exposes a small, safe API on window.WalletAdapter to detect and use injected wallets
(function () {
    const StellarSdk = window.StellarSdk;

    function detect() {
        const wallets = [];

        if (window.freighterApi) {
            wallets.push({ id: 'freighter', name: 'Freighter', available: true });
        }

        // xBull commonly exposes window.xBull (or xbull)
        if (window.xBullApi || window.xbull) {
            wallets.push({ id: 'xbull', name: 'xBull', available: true });
        }

        // Albedo SDK exposes window.albedo
        if (window.albedo) {
            wallets.push({ id: 'albedo', name: 'Albedo', available: true });
        }

        // Rabet
        if (window.rabetApi) {
            wallets.push({ id: 'rabet', name: 'Rabet', available: true });
        }

        return wallets;
    }

    // Simple wrapper that remembers the connected wallet
    const state = {
        wallet: null // { id, name, api }
    };

    async function connect(id) {
        const wallets = detect();
        // If id provided but not present, fallback to first available
        let target = wallets.find(w => w.id === id);
        if (!target) target = wallets[0];

        if (!target) {
            throw new Error('No wallet detected in the browser. Instala Freighter, Albedo u otra wallet compatible.');
        }

        let api = null;
        try {
            if (target.id === 'freighter') {
                api = window.freighterApi;
                const pk = await api.getPublicKey();
                state.wallet = { id: 'freighter', name: 'Freighter', api, publicKey: pk };
                return state.wallet;
            }

            if (target.id === 'albedo') {
                api = window.albedo;
                // Albedo provides publicKey via intent
                const res = await api.publicKey({ intent: 'public_key' }).catch(e => { throw e; });
                const pk = res.pubkey || res.publicKey || null;
                if (!pk) throw new Error('No se pudo obtener la clave pública de Albedo');
                state.wallet = { id: 'albedo', name: 'Albedo', api, publicKey: pk };
                return state.wallet;
            }

            if (target.id === 'xbull') {
                api = window.xBullApi || window.xbull;
                // xBull API surface varies; try getPublicKey or getAccount
                let pk = null;
                if (api && typeof api.getPublicKey === 'function') {
                    pk = await api.getPublicKey();
                } else if (api && typeof api.request === 'function') {
                    try {
                        const resp = await api.request({ method: 'getPublicKey' });
                        pk = resp?.pubkey || resp?.publicKey || resp?.result;
                    } catch (e) {
                        // ignore
                    }
                }
                if (!pk) throw new Error('No se pudo obtener la clave pública de xBull');
                state.wallet = { id: 'xbull', name: 'xBull', api, publicKey: pk };
                return state.wallet;
            }

            if (target.id === 'rabet') {
                api = window.rabetApi;
                const pk = await api.getPublicKey();
                state.wallet = { id: 'rabet', name: 'Rabet', api, publicKey: pk };
                return state.wallet;
            }

            throw new Error('Wallet no soportada');
        } catch (error) {
            throw error;
        }
    }

    async function getPublicKey() {
        if (!state.wallet) throw new Error('No wallet connected');
        if (state.wallet.publicKey) return state.wallet.publicKey;

        const api = state.wallet.api;
        if (state.wallet.id === 'freighter') {
            const pk = await api.getPublicKey();
            state.wallet.publicKey = pk;
            return pk;
        }

        if (state.wallet.id === 'albedo') {
            const res = await api.publicKey({ intent: 'public_key' });
            const pk = res.pubkey || res.publicKey;
            state.wallet.publicKey = pk;
            return pk;
        }

        if (state.wallet.id === 'xbull') {
            const apiRef = state.wallet.api;
            if (apiRef && typeof apiRef.getPublicKey === 'function') {
                const pk = await apiRef.getPublicKey();
                state.wallet.publicKey = pk;
                return pk;
            }
        }

        throw new Error('getPublicKey no disponible para esta wallet');
    }

    // Sign a transaction XDR using the connected wallet. Returns signed XDR string.
    async function signTransaction(xdr, opts = {}) {
        if (!state.wallet) throw new Error('No wallet connected');
        const api = state.wallet.api;

        if (state.wallet.id === 'freighter') {
            if (typeof api.signTransaction !== 'function') throw new Error('Freighter API no expone signTransaction');
            return await api.signTransaction(xdr, opts);
        }

        if (state.wallet.id === 'albedo') {
            // Albedo expects a tx XDR and network_passphrase
            if (typeof api.signTransaction === 'function') {
                return await api.signTransaction(xdr, { network_passphrase: opts.networkPassphrase });
            }
            if (typeof api.sign === 'function') {
                return await api.sign(xdr);
            }
            throw new Error('Albedo no expone un método conocido para firmar transacciones');
        }

        if (state.wallet.id === 'xbull') {
            const apiRef = api;
            if (apiRef && typeof apiRef.signTransaction === 'function') {
                return await apiRef.signTransaction(xdr, opts);
            }
            if (apiRef && typeof apiRef.request === 'function') {
                const resp = await apiRef.request({ method: 'signTransaction', params: { xdr, opts } });
                return resp?.signedXDR || resp?.result || resp;
            }
            throw new Error('xBull no expone método para firmar transacciones en este entorno');
        }

        throw new Error('signTransaction no implementado para esta wallet');
    }

    async function getBalance(address) {
        if (!StellarSdk || !StellarSdk.Horizon) {
            throw new Error('Stellar SDK no disponible en la página');
        }
        const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
        try {
            const account = await server.loadAccount(address);
            const native = account.balances.find(b => b.asset_type === 'native');
            return parseFloat(native?.balance || '0');
        } catch (e) {
            return 0;
        }
    }

    // Expose global API
    window.WalletAdapter = {
        detect,
        connect,
        getPublicKey,
        signTransaction,
        getBalance,
        _state: state
    };

    // Debug
    try {
        console.log('✅ WalletAdapter loaded; detected wallets:', detect().map(w => w.name));
    } catch (e) { }

})();
