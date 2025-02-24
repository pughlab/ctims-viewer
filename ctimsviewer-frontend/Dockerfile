# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package.json and yarn.lock to the container
COPY package.json ./

# Install dependencies
RUN npm install


COPY . .

RUN npx update-browserslist-db@latest

# Build the app
RUN npm run build

# Install the serve package to serve the built app
RUN npm install -g serve

# Set the command to serve the built app at port 3030
CMD serve -s build -l 3030

# Expose port 3030 to allow external access to the application
EXPOSE 3030
