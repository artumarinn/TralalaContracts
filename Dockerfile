# Dockerfile para deployment en servicios que lo soporten
FROM node:18-alpine

# Instalar Rust y Cargo para compilación de smart contracts
RUN apk add --no-cache \
    curl \
    build-base \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && source ~/.cargo/env \
    && rustup target add wasm32-unknown-unknown \
    && cargo install soroban-cli

# Configurar PATH para Rust
ENV PATH="/root/.cargo/bin:${PATH}"

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias de Node.js
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p tralala/dynamic-contracts tralala/compiled

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
