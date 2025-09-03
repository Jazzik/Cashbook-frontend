pipeline {
  agent none
  tools {
    nodejs 'NodeJS'
  }
  environment {
    IMAGE_NAME = 'cashbook_frontend'
    DOCKER_REGISTRY = credentials('DOCKER_REGISTRY') //jenkins credentials
    DOCKER_PASSWORD = credentials('DOCKER_PASSWORD') //jenkins credentials
    DOCKER_IMAGE_TAG = 'latest'   // Also push as 'latest'
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
      agent { label 'deploy-node' }
      steps {
        script {
          env.COMMIT_HASH = env.GIT_COMMIT
          // Set shop list based on branch
          if (env.BRANCH_NAME == 'test') {
            env.SHOPS = 'testing'
            // PORT env variables follow naming convention: SHOPNAME_PORT (uppercase)
            env.TESTING_PORT = '2999'  // Port for testing shop
            env.TESTING_BACKEND_PORT = '3999'
            echo "Configured for test environment: ${env.SHOPS}"
            envVars = """
            SHOPS='${env.SHOPS}'
            TESTING_PORT='${env.TESTING_PORT}'
            TESTING_BACKEND_PORT='${env.TESTING_BACKEND_PORT}'
            """
          } else if (env.BRANCH_NAME == 'main') {
            env.SHOPS = 'makarov,yuz1'
            // Each shop needs its corresponding PORT env var in uppercase
            // These variables are dynamically looked up later using: env."${shop.toUpperCase()}_PORT"
            env.MAKAROV_PORT = '3000'  // Port for makarov shop
            env.MAKAROV_BACKEND_PORT = '5000'
            env.YUZ1_PORT = '3001'     // Port for yuz1 shop
            env.YUZ1_BACKEND_PORT = '5001'
            echo "Configured for production environments: ${env.SHOPS}"
            envVars = """
            SHOPS='${env.SHOPS}'
            MAKAROV_PORT='${env.MAKAROV_PORT}'
            MAKAROV_BACKEND_PORT='${env.MAKAROV_BACKEND_PORT}'
            YUZ1_PORT='${env.YUZ1_PORT}'
            YUZ1_BACKEND_PORT='${env.YUZ1_BACKEND_PORT}'
            """
          } else {
            echo "Branch ${env.BRANCH_NAME} not configured for deployment"
            env.SHOPS = ''
            //make pipeline fail
            error 'Branch not configured for deployment'
          }
          // Write dynamic env vars to file and stash for later stages
          writeFile file: 'jenkins_env.groovy', text: envVars
          stash name: 'jenkins-env', includes: 'jenkins_env.groovy'
        }
      }
    }
    stage('Build Docker Container') {
      agent { label 'build-node' }
      when {
        branch 'test'
      }
      steps {
        echo 'Building Docker image'
        bat """
          docker build -t $DOCKER_REGISTRY/$IMAGE_NAME:$COMMIT_HASH -t $DOCKER_REGISTRY/$IMAGE_NAME:$DOCKER_IMAGE_TAG .
        """
      }
    }

    stage('Test container in test environment') {
      agent { label 'build-node' }
      when {
        branch 'test'
      }
      steps {
        script {
          // Use environment variables directly

          // Create a dummy backend container for testing
          bat '''
            REM Create dummy backend container for testing
            docker rm -f testing_backend_container || exit /b 0
            docker run --name testing_backend_container --network cashbook-network -d nginx:alpine
          '''

          // The SHOPS variable is set in the Configure stage
          def shopsList = env.SHOPS.split(',')

          shopsList.each { shop ->
            def shopUpperCase = shop.toUpperCase()
            // These variables are set in the Configure stage
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
        }
        script {
          echo 'Waiting for containers to initialize...'
          bat 'ping 127.0.0.1 -n 11 > nul'

          // Use environment variables directly
          def shopsList = env.SHOPS.split(',')
          shopsList.each { shop ->
            def shopUpperCase = shop.toUpperCase()

            echo "Checking health for ${shop} on port ${env.TESTING_PORT}"
            bat """
              REM Check if container is running
              docker ps -f name=${shop}_frontend_container --format "{{.Status}}"

              REM Test if nginx is responding
              docker exec ${shop}_frontend_container curl -f http://localhost/ || (
                echo "Frontend Health Check Failed: Nginx not responding for ${shop}" && exit 1
              )
            """
            bat """
              REM Stop and remove if container exists
              docker rm -f ${shop}_frontend_container || exit /b 0
            """
          }

          bat '''
            REM Clean up the dummy backend container
            docker rm -f testing_backend_container || exit /b 0
          '''
        }
      }
    }
    stage('Push to Docker Hub') {
      when {
        branch 'test'
      }
      agent { label 'build-node' }
      steps {
        echo 'Pushing Docker image to Docker Hub'
        bat '''
          docker login -u %DOCKER_REGISTRY% -p %DOCKER_PASSWORD%
          docker push %DOCKER_REGISTRY%/%IMAGE_NAME%:%COMMIT_HASH%
          docker push %DOCKER_REGISTRY%/%IMAGE_NAME%:%DOCKER_IMAGE_TAG%
        '''
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

    stage('Test Production Deployment') {
      when {
        branch 'test'
      }
      agent { label 'build-node' }
      steps {
        script {
          try {
            echo 'Testing production deployment'
            bat 'ping 127.0.0.1 -n 11 > nul' // Give containers time to start

            // Test production deployment
            def shopsList = env.SHOPS.split(',')
            shopsList.each { shop ->
              def shopPort = env."${shop.toUpperCase()}_PORT"
              echo "Testing production deployment for ${shop} on port ${shopPort}"

              bat """
                REM Test frontend container health
                docker exec ${shop}_frontend_container curl -f http://localhost/ || (
                  echo "Production Health Check Failed for ${shop}" && exit 1
                )
              """
              echo "Production Health Check Successful for ${shop}"
            }

            echo 'Production deployment test completed successfully'
          } catch (Exception e) {
            echo "Error in production deployment test: ${e.getMessage()}"
            currentBuild.result = 'FAILURE'
            throw e
          }
        }
      }
    }

    stage('Deploy Containers') {
      agent { label 'build-node' }
      when {
        branch 'main'
      }
      steps {
        script {
          // Set production environment variables
          env.SHOPS = 'makarov,yuz1'
          env.MAKAROV_PORT = '3000'
          env.MAKAROV_BACKEND_PORT = '5000'
          env.YUZ1_PORT = '3001'
          env.YUZ1_BACKEND_PORT = '5001'

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
        }
      }
    }

    stage('Test deployment containers') {
      agent { label 'build-node' }
      steps {
        bat 'ping 127.0.0.1 -n 11 > nul' // Give container a moment to start up
        script {
          // Use environment variables directly
          def shopList = env.SHOPS.split(',')
          shopList.each { shop ->
            // Execute curl from inside the frontend container to test the internal nginx routing
            bat """
              docker exec ${shop}_frontend_container curl -f http://localhost/ || (
                echo "Frontend Health Check Failed: Nginx not responding for ${shop}" && exit 1
              )
            """
            echo "Frontend Health Check Successful for ${shop}: " ^
              'Nginx is responding correctly'
          }
        }
        echo 'Each tester has confirmed that update is OK'
      }
    }
  }

  post {
    always {
      node('build-node') {
        script {
          // Cleanup any remaining containers
          try {
            // Cleanup test containers
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
    // Add notification here if needed
    }
    success {
      echo 'Pipeline succeeded!'
    // Add notification here if needed
    }
  }
}
