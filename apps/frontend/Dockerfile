############################
# Build stage
############################
FROM node:18-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=/api

# Copy root + frontend package manifests
COPY package.json ./
COPY apps/frontend/package.json ./apps/frontend/

# Install only frontend workspace deps
RUN npm install --workspace=@corecanvas/frontend --legacy-peer-deps

# Fix React duplication between root and workspace
RUN rm -rf node_modules/react node_modules/react-dom && \
    ln -s /app/apps/frontend/node_modules/react /app/node_modules/react && \
    ln -s /app/apps/frontend/node_modules/react-dom /app/node_modules/react-dom

# Copy frontend source
COPY apps/frontend ./apps/frontend

# Ensure public folder exists (Next may omit it)
RUN mkdir -p apps/frontend/public

# Build env
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js (standalone)
RUN npm run build:frontend


############################
# Production stage
############################
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

USER nextjs

EXPOSE 3000

# Next.js standalone entry
CMD ["node", "server.js"]
