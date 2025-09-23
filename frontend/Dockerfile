# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: run
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user for safety
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy package files for production dependencies
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R nextjs:nextjs /app

USER nextjs
EXPOSE 3000
CMD ["npm", "run", "start"]