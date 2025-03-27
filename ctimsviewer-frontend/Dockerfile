# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package.json and yarn.lock to the container
COPY package.json ./

# Install dependencies
RUN npm install


COPY . .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

ARG REACT_APP_API_URL_DB
ENV REACT_APP_API_URL_DB=$REACT_APP_API_URL_DB

ARG REACT_APP_KEYCLOAK_URL
ENV REACT_APP_KEYCLOAK_URL=$REACT_APP_KEYCLOAK_URL

ARG REACT_APP_KEYCLOAK_CLIENT
ENV REACT_APP_KEYCLOAK_CLIENT=$REACT_APP_KEYCLOAK_CLIENT

ARG REACT_APP_KEYCLOAK_REALM
ENV REACT_APP_KEYCLOAK_REALM=$REACT_APP_KEYCLOAK_REALM

ARG REACT_APP_KEYCLOAK_INTEGRATION
ENV REACT_APP_KEYCLOAK_INTEGRATION=$REACT_APP_KEYCLOAK_INTEGRATION


RUN npx update-browserslist-db@latest

# Build the app
RUN npm run build

# Install the serve package to serve the built app
RUN npm install -g serve

# Set the command to serve the built app at port 3030
CMD serve -s build -l 3030

# Expose port 3030 to allow external access to the application
EXPOSE 3030
