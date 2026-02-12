# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=/api

# Copy package files
COPY package.json ./
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies - use legacy-peer-deps to avoid React version conflicts
RUN npm install --workspace=@corecanvas/frontend --legacy-peer-deps

# Remove duplicate React from root node_modules to prevent two-copy issue
RUN rm -rf node_modules/react node_modules/react-dom 2>/dev/null || true

# Copy source
COPY apps/frontend ./apps/frontend

# Set env for build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

# Build
RUN npm run build:frontend

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Add non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public 2>/dev/null || true

USER nextjs

EXPOSE 3000

CMD ["node", "apps/frontend/server.js"]
