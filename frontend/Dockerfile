FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set the base URL for the API
ENV VITE_API_URL=/api

# Build with base path
RUN npm run build

FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the built files to the correct location
COPY --from=builder /app/dist /usr/share/nginx/html/lib

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Verify the files
RUN echo "Contents of /usr/share/nginx/html/lib:" && \
    ls -la /usr/share/nginx/html/lib && \
    echo "Contents of /usr/share/nginx/html/lib/assets:" && \
    ls -la /usr/share/nginx/html/lib/assets

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 