# Use Nginx to serve the pre-built application
FROM nginx:alpine

# Copy the existing built application to nginx
COPY build/ /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"] 