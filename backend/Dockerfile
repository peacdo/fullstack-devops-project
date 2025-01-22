# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies with retry for network issues
RUN --mount=type=cache,target=/root/.npm \
    npm config set registry http://registry.npmjs.org/ && \
    npm ci

# Copy source code
COPY . .

# Generate Prisma client with retry
RUN --mount=type=cache,target=/root/.npm \
    for i in 1 2 3; do \
        npm install prisma && \
        npx prisma generate && \
        break || sleep 5; \
    done

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and prisma
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm ci --production

# Copy built files and Prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 