# syntax=docker/dockerfile:1

# ---------- deps: node_modules del backend ----------
FROM node:22-bookworm-slim AS deps
WORKDIR /app
# sqlite3@6 hace `prebuild-install || node-gyp rebuild`. Los prebuilds publicados
# se enlazan contra un glibc más nuevo que el de bookworm, así que compilamos el
# binario nativo desde el código (necesita python3/make/g++) para que corra en la
# imagen final.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --build-from-source=sqlite3

# ---------- frontend: build del SPA (Vite -> frontend/dist) ----------
FROM node:22-bookworm-slim AS frontend
WORKDIR /fe
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---------- runtime: imagen final mínima ----------
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    DB_PATH=/app/data/council.db
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY --from=frontend /fe/dist ./frontend/dist

# La base SQLite vive en un volumen montado en /app/data
RUN mkdir -p /app/data && chown -R node:node /app
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "src/index.js"]
