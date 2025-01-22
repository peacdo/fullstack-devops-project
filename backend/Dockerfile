# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies
RUN npm ci

# Install TypeScript globally
RUN npm install -g typescript

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and prisma
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies
RUN npm ci --production

# Copy built files and Prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 