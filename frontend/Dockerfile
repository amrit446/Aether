# Stage 1: Compiling React app via Vite
FROM node:20-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Set Vite build environment variables (can be overridden during build)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine

# Copy built static assets from compilation stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Overwrite Nginx default configuration for React Router compatibility
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
