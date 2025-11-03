# ⚡ Quick Start - Tralalero Contracts

La guía más rápida para empezar a construir smart contracts.

---

## 🚀 En 5 Minutos

### 1️⃣ Instalar y Ejecutar
```bash
cd /Users/matiasboldrini/Documents/hackathon/tralalerocontracts-app
npm install
npm run dev
```

**Resultado esperado:**
```
✅ Servidor escuchando en puerto 3001
✅ Abre http://localhost:3001 en tu navegador
```

---

### 2️⃣ Conectar Wallet
1. Haz clic en **"Conectar Freighter"**
2. Autoriza en tu extensión
3. ✅ Ya estás listo

---

### 3️⃣ Crear Tu Primer Token
1. Haz clic **"Siguiente"** → Step 2
2. Arrastra estos bloques:
   ```
   🔮 Mi Smart Contract
   ├── 📝 Nombre: "MiToken"
   ├── 🔢 Versión: "1.0.0"
   ├── 🔑 Admin: Tu wallet
   ├── 📦 Variable: balance (MAP)
   └── ⚙️ Función: transfer()
   ```

3. Ves el código Rust en **Vista Previa**
4. Haz clic **"Validar"** → ✅ Verde = Éxito

---

### 4️⃣ Guardar y Desplegar
- **Guardar**: Ctrl+S o menú de proyectos
- **Desplegar**: Paso 4 (cuando esté disponible)

---

## 📚 Guías Completas

| Documento | Propósito |
|-----------|-----------|
| [GUIA_USUARIO.md](GUIA_USUARIO.md) | Guía completa con todas las funciones |
| [EJEMPLOS_CONTRATOS.md](EJEMPLOS_CONTRATOS.md) | 6 ejemplos funcionales paso a paso |
| [TESTING_GUIDE.md](TESTING_GUIDE.md) | Cómo probar tu sistema |
| [ARQUITECTURA.md](ARQUITECTURA.md) | Documentación técnica completa |

---

## 🎯 Casos de Uso Comunes

### ✨ Quiero crear...

**Un token ERC20 simple**
→ Ver [Ejemplo 1: Token ERC20 Simple](EJEMPLOS_CONTRATOS.md#ejemplo-1-token-erc20-simple)

**Un token con acuñación y quemado**
→ Ver [Ejemplo 2: Token con Mint/Burn](EJEMPLOS_CONTRATOS.md#ejemplo-2-token-con-mintburn)

**Un sistema de votación**
→ Ver [Ejemplo 3: Sistema de Votación](EJEMPLOS_CONTRATOS.md#ejemplo-3-sistema-de-votación)

**Un sistema de crowdfunding**
→ Ver [Ejemplo 4: Crowdfunding](EJEMPLOS_CONTRATOS.md#ejemplo-4-crowdfunding)

**Un activo del mundo real (RWA)**
→ Ver [Ejemplo 5: RWA - Certificado](EJEMPLOS_CONTRATOS.md#ejemplo-5-rwa---certificado-de-propiedad)

**Un sistema de staking**
→ Ver [Ejemplo 6: Sistema de Staking](EJEMPLOS_CONTRATOS.md#ejemplo-6-sistema-de-staking)

---

## 🧩 Bloques Disponibles (46+)

### Por Categoría

```
🚀 Empezar (2)
- Inicializar contrato
- Metadatos

🎨 Propiedades (5)
- Nombre, versión, owner, admin, descripción

📦 Estado (4)
- Variables, mapeos, eventos, parámetros

⚙️ Funciones (3)
- Declaración, parámetros, retorno

🧠 Lógica (5)
- If/else, comparaciones, loops

🔢 Operaciones (6)
- Aritmética, asignación, literales

⭐ Stellar (5)
- Transferencias, pagos, trustlines, auth

💰 Token (6)
- Inicializar, mint, burn, transfer, balance

🏢 RWA (5)
- Asset, custody, settlement, compliance

🔐 Seguridad (5)
- require_auth, access control, guards
```

---

## 💡 Tips Rápidos

### 1. Código se actualiza automáticamente
✅ Conforme cambias bloques, el preview se actualiza (300ms debounce)

### 2. Valida frecuentemente
✅ Haz clic "Validar" para detectar problemas temprano

### 3. Guarda tu trabajo
✅ Usa Ctrl+S para guardar en localStorage (máx 10 proyectos)

### 4. Revisa el código Rust
✅ Aprende viendo el código generado

### 5. Exporta para compartir
✅ Descarga JSON de tu proyecto para guardar o compartir

---

## ⚠️ Requisitos Mínimos

```
✅ Node.js 16+
✅ npm o yarn
✅ Navegador moderno (Chrome/Firefox)
✅ Freighter Wallet instalado
✅ Cuenta Stellar Testnet
✅ XLM para testnet (gratis en friendbot.stellar.org)
```

---

## 🆘 Problemas Comunes

### "Puerto 3001 en uso"
```bash
# Usa otro puerto
PORT=3002 npm start
```

### "Blockly no carga"
```bash
# Espera 5 segundos, recarga F5
# Verifica console (F12) para errores
```

### "Wallet no conecta"
```
1. Instala Freighter: https://freighter.app/
2. Asegúrate de estar en Testnet
3. Recarga la página
```

### "Storage lleno"
```javascript
// En consola: elimina proyectos antiguos
projectManager.deleteProject('nombre_antiguo');
```

---

## 🔗 Enlaces Útiles

- **Soroban Docs**: https://soroban.stellar.org/
- **Stellar SDK**: https://developers.stellar.org/
- **Stellar Lab**: https://laboratory.stellar.org/
- **Friendbot (XLM gratis)**: https://friendbot.stellar.org/
- **Freighter**: https://freighter.app/

---

## 📞 Próximos Pasos

1. ✅ **Corre el servidor** (`npm run dev`)
2. ✅ **Conecta wallet** (Step 1)
3. ✅ **Crea tu primer contrato** (Step 2)
4. ✅ **Valida** (verifica que sea verde)
5. ✅ **Guarda** (Ctrl+S)
6. 📖 **Lee EJEMPLOS_CONTRATOS.md** para inspiración
7. 🧪 **Sigue TESTING_GUIDE.md** para probar

---

**¡Comenzar ahora!** 🚀

```
http://localhost:3001
```
