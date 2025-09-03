# Development Guide

## Environment Variables

### For Development (setupProxy.js)

When running the frontend in development mode (`npm start`), you can configure the backend connection using these environment variables:

- `REACT_APP_BACKEND_PORT` - Backend port (default: 5000)
- `REACT_APP_BACKEND_HOST` - Backend host (default: localhost)
- `BACKEND_PORT` - Alternative backend port variable
- `BACKEND_HOST` - Alternative backend host variable

### Examples

```bash
# For makarov shop (port 5000)
REACT_APP_BACKEND_PORT=5000 npm start

# For yuz1 shop (port 5001)
REACT_APP_BACKEND_PORT=5001 npm start

# For testing shop (port 3999)
REACT_APP_BACKEND_PORT=3999 npm start

# With custom host
REACT_APP_BACKEND_HOST=192.168.1.100 REACT_APP_BACKEND_PORT=5000 npm start
```

### For Production (Docker)

In production, the `BACKEND_URL` environment variable is set by Jenkins during deployment:

- `makarov`: `BACKEND_URL=http://makarov_backend_container:5000/api`
- `yuz1`: `BACKEND_URL=http://yuz1_backend_container:5001/api`
- `testing`: `BACKEND_URL=http://testing_backend_container:3999/api`

## Architecture

- **Development**: Uses `setupProxy.js` with dynamic port configuration
- **Production**: Uses nginx with `BACKEND_URL` environment variable
- **Docker**: nginx proxies `/internal-api/*` requests to the backend container

## Troubleshooting

If you're having connection issues:

1. Check that the backend is running on the expected port
2. Verify environment variables are set correctly
3. Check browser console for proxy setup messages
4. Ensure backend container is accessible from frontend container in Docker



