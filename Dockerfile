# Stage 1: Build the React application
FROM node:16-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Build the application
# No need for API URL env vars since we're using a fixed internal path now
RUN npm run build

# Stage 2: Serve the built application using Nginx
FROM nginx:alpine

# Install curl for health checks and envsubst for template processing
RUN apk add --no-cache curl gettext

# Copy the build output from the previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config as a template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Expose port 80
EXPOSE 80

# Set default environment variable (will be overridden by Jenkins)
ENV BACKEND_URL=http://localhost:5000

# Create final configuration from template and start Nginx
CMD ["sh", "-c", "envsubst '$BACKEND_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"] 
