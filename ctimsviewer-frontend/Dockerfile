# Stage 1: Build the React application
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies. This is a separate layer to cache dependencies and avoid
# re-installing them on every code change. Using --legacy-peer-deps can help
# resolve potential version conflicts with dependencies like primereact.
RUN npm install --legacy-peer-deps

# Update browserslist database to prevent build errors
# This is part of the dependency setup and should be cached with them.
RUN npx update-browserslist-db@latest

# Copy the rest of the application source code. Changes to source files will
# use the cached dependency layer from above.
COPY . .

# Build the application for production. This creates an optimized 'build' folder.
RUN GENERATE_SOURCEMAP=false NODE_OPTIONS=--max-old-space-size=4096 npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy the static files from the 'builder' stage to Nginx's web root directory
COPY --from=builder /app/build /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3030 to allow external access to the application
EXPOSE 3030

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
