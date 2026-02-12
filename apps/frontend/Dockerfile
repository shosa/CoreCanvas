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

# Ensure public folder exists
RUN mkdir -p apps/frontend/public

# Build env
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js (standalone output)
WORKDIR /app/apps/frontend
RUN npm run build


############################
# Production stage
############################
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install openssl for Node (needed by Next)
RUN apk add --no-cache openssl

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
USER nextjs

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./static
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public ./public

EXPOSE 3000

# Next.js standalone entry (server.js si trova nella root del standalone)
CMD ["node", "server.js"]
