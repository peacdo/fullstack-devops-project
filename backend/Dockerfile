# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies with retry
RUN npm config set registry http://registry.npmjs.org/ && \
    for i in 1 2 3; do \
        npm ci && \
        npm install -g typescript && \
        break || sleep 5; \
    done

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate && \
    npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and prisma
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies with retry
RUN npm config set registry http://registry.npmjs.org/ && \
    for i in 1 2 3; do \
        npm ci --production && \
        break || sleep 5; \
    done

# Copy built files and Prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 