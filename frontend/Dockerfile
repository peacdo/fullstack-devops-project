FROM node:20-alpine as builder

WORKDIR /app

# Add DNS settings to resolve network issues
RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf && \
    echo "nameserver 8.8.4.4" >> /etc/resolv.conf

# Copy package files
COPY package*.json ./

# Install dependencies with retry
RUN npm config set registry http://registry.npmjs.org/ && \
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