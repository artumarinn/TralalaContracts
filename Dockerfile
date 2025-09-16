# Dockerfile para deployment en servicios que lo soporten
FROM node:18-alpine

# Instalar dependencias del sistema necesarias para Rust y compilación
RUN apk add --no-cache \
    curl \
    build-base \
    gcc \
    musl-dev \
    openssl-dev \
    pkgconfig \
    git \
    dbus-dev \
    eudev-dev \
    linux-headers \
    && rm -rf /var/cache/apk/*

# Instalar Rust con configuración optimizada
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable --profile minimal \
    && source ~/.cargo/env \
    && rustup target add wasm32-unknown-unknown

# Configurar PATH para Rust
ENV PATH="/root/.cargo/bin:${PATH}"

# Instalar soroban-cli con configuraciones optimizadas para Alpine
RUN source ~/.cargo/env \
    && export RUSTFLAGS="-C target-feature=-crt-static" \
    && export PKG_CONFIG_ALLOW_CROSS=1 \
    && export PKG_CONFIG_ALL_STATIC=1 \
    && cargo install soroban-cli --version 21.5.0 --locked --no-default-features \
    || cargo install soroban-cli --version 20.3.4 --locked --no-default-features \
    || (echo "Fallback: installing without version lock and features" && cargo install soroban-cli --no-default-features)

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
