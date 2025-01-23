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

# Debug: List the contents of the dist directory
RUN ls -la dist && echo "Contents of dist:" && ls -la dist/*

FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the built files to the correct location
COPY --from=builder /app/dist /usr/share/nginx/html/lib
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Debug: List the contents after copying
RUN ls -la /usr/share/nginx/html/lib && echo "Contents of html/lib:" && ls -la /usr/share/nginx/html/lib/*

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 