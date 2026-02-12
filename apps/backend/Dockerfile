# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json ./
COPY apps/backend/package.json ./apps/backend/

# Install dependencies
RUN npm install --workspace=@corecanvas/backend

# Copy source
COPY apps/backend ./apps/backend

# Generate Prisma client
RUN cd apps/backend && npx prisma generate

# Build
RUN npm run build:backend

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built files
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/node_modules ./root_modules
COPY --from=builder /app/apps/backend/package.json ./package.json

# Merge node_modules
RUN cp -rn ./root_modules/* ./node_modules/ 2>/dev/null || true && rm -rf ./root_modules

# Add non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
USER nestjs

EXPOSE 3014

CMD ["node", "dist/main"]
