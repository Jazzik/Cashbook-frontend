const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // Get backend port from environment variable, default to 5000
  const backendPort = process.env.REACT_APP_BACKEND_PORT || process.env.BACKEND_PORT || 5000;
  const backendHost = process.env.REACT_APP_BACKEND_HOST || process.env.BACKEND_HOST || "localhost";
  
  console.log(`Setting up proxy to backend at ${backendHost}:${backendPort}`);
  
  app.use(
    "/internal-api",
    createProxyMiddleware({
      target: `http://${backendHost}:${backendPort}`,
      changeOrigin: true,
      pathRewrite: {
        "^/internal-api": "/api",
      },
    })
  );
};
