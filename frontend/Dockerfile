FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with retry and custom DNS
RUN npm config set registry http://registry.npmjs.org/ && \
    npm config set dns_nameservers 8.8.8.8 8.8.4.4 && \
    for i in 1 2 3; do \
        npm ci && \
        npm install -g typescript && \
        break || sleep 5; \
    done

# Copy source code
COPY . .

# Build
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html/lib
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 