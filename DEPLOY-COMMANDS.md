# 🚀 Comandos para Deploy - Tralalero Contracts

## ⚡ Deploy Inmediato (Copy-Paste)

```bash
# 1. Verificar que todo esté listo
npm run pre-deploy

# 2. Commit optimizado para deployment
git add .
git commit -m "Optimized for Render deployment - ready for production"
git push origin main

# 3. Ir a render.com y crear Web Service con tu repo
# Render detectará automáticamente render.yaml
```

## 🎯 Resultado Esperado

- ✅ **Repositorio:** ~10MB (sin archivos de compilación)
- ✅ **Build time:** 10-15 minutos (instala Rust automáticamente)
- ✅ **Funcionalidad:** Completa (tokens + smart contracts)
- ✅ **URL:** `https://tu-app.onrender.com`

## 🛠️ Scripts Disponibles

| Comando               | Descripción                            |
| --------------------- | -------------------------------------- |
| `npm run pre-deploy`  | ✅ Verificación final antes de deploy  |
| `npm run clean`       | 🧹 Limpiar archivos grandes (5GB→10MB) |
| `npm run check`       | 🔍 Verificar setup local completo      |
| `npm run deploy-prep` | 🎯 Limpieza + verificación completa    |
| `npm start`           | 🚀 Ejecutar servidor localmente        |
| `npm run dev`         | 👨‍💻 Desarrollo con auto-reload          |

## 📋 Checklist Final

- [x] ✅ `.gitignore` optimizado (excluye 5GB de archivos)
- [x] ✅ `render.yaml` configurado (instala Rust automáticamente)
- [x] ✅ Puerto dinámico (`process.env.PORT`)
- [x] ✅ Templates de smart contracts incluidos
- [x] ✅ Scripts de verificación creados
- [x] ✅ Documentación completa

## 🎉 ¡Todo Listo!

Tu aplicación **Tralalero Contracts** está 100% preparada para deployment en Render con funcionalidad completa de smart contracts.

**Próximo paso:** Ejecutar los comandos de arriba y crear el Web Service en render.com
