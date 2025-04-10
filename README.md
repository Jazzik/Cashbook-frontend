# CashBook Frontend Application

![CashBook Logo](https://img.shields.io/badge/CashBook-Frontend-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?style=flat-square&logo=typescript)
![Material UI](https://img.shields.io/badge/MUI-5.17.1-007FFF?style=flat-square&logo=mui)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat-square&logo=docker)

A modern, responsive frontend application for the CashBook system built with React, TypeScript, and Material UI.

## 📋 Table of Contents

- [Features](#-features)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Development](#-development)
- [Building for Production](#-building-for-production)
- [Deployment](#-deployment)
  - [Docker Deployment](#docker-deployment)
  - [Nginx Configuration](#nginx-configuration)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Troubleshooting](#-troubleshooting)

## ✨ Features

- Modern UI built with Material UI components
- Type-safe development with TypeScript
- Responsive design for desktop and mobile devices
- Docker support for easy deployment
- CI/CD integration with Jenkins

## 🔧 Requirements

- Node.js 16.x or higher
- npm 8.x or higher
- For deployment: Docker and Docker Compose (optional)

## 🚀 Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd CashBook-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## ⚙️ Configuration

The application can be configured using environment variables. Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://your-api-server-url
```

**Note:** Environment variables need to be set before building the application, as they are embedded at build time.

## 💻 Development

Start the development server:

```bash
npm start
```

This will launch the application in development mode on [http://localhost:3000](http://localhost:3000).

Run tests:

```bash
npm test
```

## 🏗️ Building for Production

Build the application for production:

```bash
npm run build
```

This creates optimized files in the `build/` directory.

## 📦 Deployment

### Docker Deployment

The project includes Docker support for easy deployment.

1. Build the application:

   ```bash
   npm run build
   ```

2. Build the Docker image:

   ```bash
   docker build -t cashbook-frontend .
   ```

3. Run the container:
   ```bash
   docker run -p 3000:80 --name cashbook-frontend-container cashbook-frontend
   ```

Alternatively, use Docker Compose:

```bash
docker-compose up -d
```

### Nginx Configuration

The application uses Nginx as the web server in the Docker container. The default configuration is in `nginx.conf`.

⚠️ **Important IP Configuration** ⚠️

You MUST update the Nginx configuration to allow access from your specific IP address:

1. Open `nginx.conf`
2. Locate the following section:

   ```
   location / {
       allow 82.215.74.213;   # Example IP
       # allow 192.168.1.10;   # Additional IP example
       deny all;

       try_files $uri $uri/ /index.html;
       expires -1;
   }
   ```

3. Add your machine's IP address using the `allow` directive
4. If deploying to a production environment, make sure to add all necessary IP addresses

This access control is critical for the security of your application. Without the proper IP configuration, users will not be able to access the application.

## 🔄 CI/CD Pipeline

This project includes a Jenkins pipeline configuration in the `Jenkinsfile`. The pipeline:

1. Installs dependencies
2. Builds the application
3. Builds and deploys a Docker container
4. Runs tests
5. Simulates production deployment

To use this pipeline, configure your Jenkins environment with:

- NodeJS plugin
- Docker installed on the Jenkins agent
- Required environment variables: `IMAGE_NAME` and `CONTAINER_NAME`

## 🔍 Troubleshooting

### Common Issues

1. **Application not accessible:**

   - Check that Nginx is configured to allow your IP address
   - Verify Docker container is running: `docker ps`
   - Check container logs: `docker logs cashbook-frontend-container`

2. **Build errors:**

   - Ensure Node.js and npm versions meet requirements
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules` and reinstall dependencies

3. **API connection issues:**
   - Verify REACT_APP_API_URL is correctly set before building
   - Check network connectivity to the API server

### Support

If you encounter any issues, please contact the development team or create an issue in the project repository.

---

© 2024 CashBook. All Rights Reserved.
