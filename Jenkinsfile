// Helper function to wait for container readiness
def waitForContainer(containerName, maxWaitSeconds = 30) {
  def startTime = System.currentTimeMillis()
  def maxWaitMs = maxWaitSeconds * 1000

  while (System.currentTimeMillis() - startTime < maxWaitMs) {
    try {
      // Check if container is running
      def containerStatus = bat(
        script: "docker ps -f name=${containerName} --format \"{{.Status}}\"",
        returnStdout: true
      ).trim()

      if (containerStatus && !containerStatus.contains('Exit')) {
        echo "Container ${containerName} is ready: ${containerStatus}"
        return true
      }

      // Wait 2 seconds before next check
      bat 'timeout /t 2 /nobreak > nul'
    } catch (Exception e) {
      echo "Waiting for container ${containerName} to be ready..."
      bat 'timeout /t 2 /nobreak > nul'
    }
  }

  error "Container ${containerName} failed to become ready within ${maxWaitSeconds} seconds"
}

pipeline {
  agent none

  tools {
    nodejs 'NodeJS'
  }

  environment {
    IMAGE_NAME = 'cashbook_frontend'
    DOCKER_REGISTRY = credentials('DOCKER_REGISTRY')
    DOCKER_PASSWORD = credentials('DOCKER_PASSWORD')
    DOCKER_IMAGE_TAG = 'latest'
  }

  stages {
    stage('Checkout') {
      agent { label 'build-node' }
      steps {
        checkout scm
        stash name: 'source-code', includes: '**/*'
      }
    }

    stage('Configure') {
      agent { label 'build-node' }
      steps {
        script {
          try {
            env.COMMIT_HASH = env.GIT_COMMIT
            echo "Building for commit: ${env.COMMIT_HASH}"

            // Set shop list and ports based on branch
            if (env.BRANCH_NAME == 'test') {
              env.SHOPS = 'testing'
              env.TESTING_PORT = '2999'
              env.TESTING_BACKEND_PORT = '3999'
              echo "Configured for test environment: ${env.SHOPS}"
            } else if (env.BRANCH_NAME == 'main') {
              env.SHOPS = 'makarov,yuz1'
              env.MAKAROV_PORT = '3000'
              env.MAKAROV_BACKEND_PORT = '5000'
              env.YUZ1_PORT = '3001'
              env.YUZ1_BACKEND_PORT = '5001'
              echo "Configured for production environments: ${env.SHOPS}"
            } else {
              echo "Branch ${env.BRANCH_NAME} not configured for deployment"
              env.SHOPS = ''
              error "Branch ${env.BRANCH_NAME} not configured for deployment"
            }

            // Write environment variables to file for later stages
            def envVars = """
              SHOPS='${env.SHOPS}'
              COMMIT_HASH='${env.COMMIT_HASH}'
            """

            if (env.BRANCH_NAME == 'test') {
              envVars += """
                TESTING_PORT='${env.TESTING_PORT}'
                TESTING_BACKEND_PORT='${env.TESTING_BACKEND_PORT}'
              """
            } else if (env.BRANCH_NAME == 'main') {
              envVars += """
                MAKAROV_PORT='${env.MAKAROV_PORT}'
                MAKAROV_BACKEND_PORT='${env.MAKAROV_BACKEND_PORT}'
                YUZ1_PORT='${env.YUZ1_PORT}'
                YUZ1_BACKEND_PORT='${env.YUZ1_BACKEND_PORT}'
              """
            }

            writeFile file: 'jenkins_env.groovy', text: envVars
            stash name: 'jenkins-env', includes: 'jenkins_env.groovy'
          } catch (Exception e) {
            echo "Error in Configure stage: ${e.getMessage()}"
            currentBuild.result = 'FAILURE'
            throw e
          }
        }
      }
    }

    stage('Build and Test') {
      agent { label 'build-node' }
      when {
        branch 'test'
      }
      steps {
        script {
          try {
            // Build Docker image
            echo 'Building Docker image'
            bat '''
              docker build -t %DOCKER_REGISTRY%/%IMAGE_NAME%:%COMMIT_HASH% -t %DOCKER_REGISTRY%/%IMAGE_NAME%:%DOCKER_IMAGE_TAG% .
            '''
            bat 'docker images | findstr %IMAGE_NAME%'
            echo 'Docker image built successfully'

            // Test in test environment
            unstash 'jenkins-env'

            // Create a dummy backend container for testing
            bat '''
              REM Create dummy backend container for testing
              docker rm -f testing_backend_container || exit /b 0
              docker run --name testing_backend_container --network cashbook-network -d nginx:alpine
            '''

            def shopsList = env.SHOPS.split(',')

            shopsList.each { shop ->
              echo "Deploying ${shop} for testing"

              bat '''
                REM Ensure Docker network exists
                docker network inspect cashbook-network || docker network create cashbook-network
              '''
              bat """
                REM Stop and remove if container exists
                docker rm -f ${shop}_frontend_container || exit /b 0
              """
              bat """
                REM Run container with shop-specific parameters
                docker run --name ${shop}_frontend_container ^
                  --network cashbook-network ^
                  -d -p 127.0.0.1:${env.TESTING_PORT}:80 ^
                  -e BACKEND_URL=http://${shop}_backend_container:${env.TESTING_BACKEND_PORT} ^
                  %DOCKER_REGISTRY%/%IMAGE_NAME%:%DOCKER_IMAGE_TAG%
              """
            }

            // Wait for containers to initialize
            echo 'Waiting for containers to initialize...'
            shopsList.each { shop ->
              waitForContainer("${shop}_frontend_container", 30)
            }

            // Health check with retry logic
            shopsList.each { shop ->
              echo "Checking health for ${shop} on port ${env.TESTING_PORT}"

              def healthCheckPassed = false
              def maxRetries = 3
              def retryCount = 0

              while (!healthCheckPassed && retryCount < maxRetries) {
                try {
                  bat """
                    REM Check if container is running
                    docker ps -f name=${shop}_frontend_container --format "{{.Status}}"

                    REM Test if nginx is responding
                    docker exec ${shop}_frontend_container curl -f http://localhost/ || (
                      echo "Frontend Health Check Failed: Nginx not responding for ${shop}" && exit 1
                    )
                  """
                  healthCheckPassed = true
                  echo "Health check passed for ${shop}"
                } catch (Exception e) {
                  retryCount++
                  echo "Health check failed for ${shop}, attempt ${retryCount}/${maxRetries}: ${e.getMessage()}"
                  if (retryCount < maxRetries) {
                    bat 'timeout /t 5 /nobreak > nul'
                  } else {
                    throw new Exception("Health check failed for ${shop} after ${maxRetries} attempts")
                  }
                }
              }

              // Cleanup test container
              bat """
                REM Stop and remove test container
                docker rm -f ${shop}_frontend_container || exit /b 0
              """
            }

            // Cleanup dummy backend container
            bat '''
              REM Clean up the dummy backend container
              docker rm -f testing_backend_container || exit /b 0
            '''
          } catch (Exception e) {
            echo "Error in Build and Test stage: ${e.getMessage()}"
            currentBuild.result = 'FAILURE'
            throw e
          }
        }
      }
    }

    stage('Push to Registry') {
      when {
        branch 'test'
      }
      agent { label 'build-node' }
      steps {
        script {
          try {
            echo 'Pushing Docker image to Docker Hub'
            bat '''
              docker login -u %DOCKER_REGISTRY% -p %DOCKER_PASSWORD%
              docker push %DOCKER_REGISTRY%/%IMAGE_NAME%:%COMMIT_HASH%
              docker push %DOCKER_REGISTRY%/%IMAGE_NAME%:%DOCKER_IMAGE_TAG%
            '''
            echo 'Docker images pushed successfully'
          } catch (Exception e) {
            echo "Error pushing Docker images: ${e.getMessage()}"
            currentBuild.result = 'FAILURE'
            throw e
          }
        }
      }
    }

    stage('Deploy to Production') {
      when {
        branch 'test'
      }
      agent { label 'build-node' }
      steps {
        input message: 'Deploy Frontend to Production?', ok: 'Deploy', parameters: [
          choice(name: 'DEPLOY_ACTION', choices: ['Deploy', 'Skip'], description: 'Choose deployment action')
        ]
        script {
          if (params.DEPLOY_ACTION == 'Skip') {
            echo 'Frontend production deployment skipped by user'
            return
          }

          try {
            echo 'Deploying tested frontend version to production'

            // Pull the tested image
            bat '''
              REM Pull the image using the latest tag
              docker pull %DOCKER_REGISTRY%/%IMAGE_NAME%:%DOCKER_IMAGE_TAG%
            '''

            // Set production environment variables
            env.SHOPS = 'makarov,yuz1'
            env.MAKAROV_PORT = '3000'
            env.MAKAROV_BACKEND_PORT = '5000'
            env.YUZ1_PORT = '3001'
            env.YUZ1_BACKEND_PORT = '5001'

            // Deploy to production
            def shopsList = env.SHOPS.split(',')
            shopsList.each { shop ->
              def shopPort = env."${shop.toUpperCase()}_PORT"
              def backendPort = env."${shop.toUpperCase()}_BACKEND_PORT"
              echo "Deploying ${shop} to production on port ${shopPort}"

              bat '''
                REM Ensure Docker network exists
                docker network inspect cashbook-network || docker network create cashbook-network
              '''
              bat """
                REM Stop and remove if container exists
                docker rm -f ${shop}_frontend_container || exit /b 0
              """
              bat """
                docker run --name ${shop}_frontend_container ^
                  --network cashbook-network ^
                  -d -p 127.0.0.1:${shopPort}:80 ^
                  -e BACKEND_URL=http://${shop}_backend_container:${backendPort} ^
                  %DOCKER_REGISTRY%/%IMAGE_NAME%:%DOCKER_IMAGE_TAG%
              """
            }

            echo 'Frontend production deployment completed successfully'
          } catch (Exception e) {
            echo "Error in frontend production deployment: ${e.getMessage()}"
            currentBuild.result = 'FAILURE'
            throw e
          }
        }
      }
    }

    stage('Deploy and Verify') {
      agent { label 'build-node' }
      when {
        branch 'main'
      }
      steps {
        unstash 'source-code'
        unstash 'jenkins-env'
        script {
          try {
            // Pull the image using the latest tag
            bat '''
              REM Pull the image using the latest tag
              docker pull %DOCKER_REGISTRY%/%IMAGE_NAME%:%DOCKER_IMAGE_TAG%
            '''

            // Deploy containers
            def shopsList = env.SHOPS.split(',')
            shopsList.each { shop ->
              def shopPort = env."${shop.toUpperCase()}_PORT"
              def backendPort = env."${shop.toUpperCase()}_BACKEND_PORT"
              echo "Deploying ${shop} on port ${shopPort}"

              bat '''
                REM Ensure Docker network exists
                docker network inspect cashbook-network || docker network create cashbook-network
              '''
              bat """
                REM Stop and remove if container exists
                docker rm -f ${shop}_frontend_container || exit /b 0
              """
              bat """
                docker run --name ${shop}_frontend_container ^
                  --network cashbook-network ^
                  -d -p 127.0.0.1:${shopPort}:80 ^
                  -e BACKEND_URL=http://${shop}_backend_container:${backendPort} ^
                  %DOCKER_REGISTRY%/%IMAGE_NAME%:%DOCKER_IMAGE_TAG%
              """
            }

            // Wait for containers to initialize and verify
            echo 'Waiting for containers to initialize...'
            shopsList.each { shop ->
              waitForContainer("${shop}_frontend_container", 30)
            }

            // Health check with retry logic
            shopsList.each { shop ->
              def shopPort = env."${shop.toUpperCase()}_PORT"
              echo "Testing frontend container for ${shop} on port ${shopPort}"

              def healthCheckPassed = false
              def maxRetries = 3
              def retryCount = 0

              while (!healthCheckPassed && retryCount < maxRetries) {
                try {
                  // Execute curl from inside the frontend container to test the internal nginx routing
                  bat """
                    docker exec ${shop}_frontend_container curl -f http://localhost/ || (
                      echo "Frontend Health Check Failed: Nginx not responding for ${shop}" && exit 1
                    )
                  """
                  healthCheckPassed = true
                  echo "Frontend Health Check Successful for ${shop}: Nginx is responding correctly"
                } catch (Exception e) {
                  retryCount++
                  echo "Health check failed for ${shop}, attempt ${retryCount}/${maxRetries}: ${e.getMessage()}"
                  if (retryCount < maxRetries) {
                    bat 'timeout /t 5 /nobreak > nul'
                  } else {
                    throw new Exception("Health check failed for ${shop} after ${maxRetries} attempts")
                  }
                }
              }
            }

            echo 'Production containers deployed and verified successfully'
          } catch (Exception e) {
            echo "Error in Deploy and Verify stage: ${e.getMessage()}"
            currentBuild.result = 'FAILURE'
            throw e
          }
        }
      }
    }
  }

  post {
    always {
      node('build-node') {
        script {
          // Cleanup any remaining test containers
          try {
            bat '''
              REM Cleanup test containers
              docker rm -f testing_frontend_container || exit /b 0
              docker rm -f testing_backend_container || exit /b 0
            '''
            echo 'Cleanup completed'
          } catch (Exception e) {
            echo "Error during cleanup: ${e.getMessage()}"
          }
        }
      }
    }
    failure {
      echo 'Pipeline failed!'
    }
    success {
      echo 'Pipeline succeeded!'
    }
  }
}
