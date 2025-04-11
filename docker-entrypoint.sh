#!/bin/sh

# Default backend URL if not provided
BACKEND_URL=${BACKEND_URL:-http://cashbook_backend_container:5000/api}

# Replace the environment variable placeholder in the Nginx config
envsubst '$BACKEND_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start Nginx in foreground
nginx -g 'daemon off;' 