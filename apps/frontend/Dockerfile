############################
# Stage 1: Dependencies
############################
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copia package root e frontend
COPY package.json package-lock.json* ./
COPY apps/frontend/package.json ./apps/frontend/

# Configura npm per connessioni lente / instabili
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 600000 && \
    npm config set registry https://registry.npmjs.org/ && \
    npm config set maxsockets 3

# Installa le dipendenze della workspace frontend
RUN npm ci --workspace=@corecanvas/frontend --prefer-offline --no-audit --loglevel=verbose || \
    (npm cache clean --force && npm ci --loglevel=verbose)

############################
# Stage 2: Build
############################
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copia le dipendenze dalla stage precedente
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./

# Copia sorgente frontend
COPY apps/frontend ./apps/frontend

WORKDIR /app/apps/frontend

# Disabilita la telemetry di Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Passa le variabili NEXT_PUBLIC_* a build-time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Costruisci l'app Next.js (standalone)
RUN npm run build

############################
# Stage 3: Runner
############################
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crea utente non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia output build e cartelle necessarie
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./ 
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public

# Espone porta
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Usa utente non-root
USER nextjs

# Entrypoint corretto: server.js dentro apps/frontend
CMD ["node", "apps/frontend/server.js"]
