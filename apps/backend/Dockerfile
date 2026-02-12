# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/

# Install dependencies for workspace
RUN npm install --workspace=@corecanvas/backend --include-workspace-root

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy dependencies from deps
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./

# Copy backend source (including Prisma)
COPY apps/backend ./apps/backend

# Set Prisma environment
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x
ENV PRISMA_SCHEMA_PATH=/app/apps/backend/prisma/schema.prisma

# Generate Prisma client
RUN node_modules/.bin/prisma generate --schema=./apps/backend/prisma/schema.prisma

# Build backend
WORKDIR /app/apps/backend
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs
USER nestjs

ENV NODE_ENV=production

# Copy built files and Prisma
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/package.json ./package.json

# Copy node_modules from builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

EXPOSE 3014

CMD ["node", "dist/main"]
