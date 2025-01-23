FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set the base URL for the API
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Build with base path
RUN npm run build

FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the built files to the correct location
COPY --from=builder /app/dist /usr/share/nginx/html/lib

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set proper permissions and MIME types
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    find /usr/share/nginx/html -type f -name "*.js" -exec sh -c 'chmod 644 "$1" && echo "application/javascript" > /etc/nginx/mime.types.d/$(basename "$1").types' sh {} \; && \
    find /usr/share/nginx/html -type f -name "*.css" -exec sh -c 'chmod 644 "$1" && echo "text/css" > /etc/nginx/mime.types.d/$(basename "$1").types' sh {} \;

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 