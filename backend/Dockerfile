# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Add DNS settings to resolve network issues
RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf && \
    echo "nameserver 8.8.4.4" >> /etc/resolv.conf

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
RUN for i in 1 2 3; do \
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