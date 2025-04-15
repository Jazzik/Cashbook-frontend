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
      agent { label 'build-node' }
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
            SHOPS=${env.SHOPS}
            TESTING_PORT=${env.TESTING_PORT}
            TESTING_BACKEND_PORT=${env.TESTING_BACKEND_PORT}
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
            SHOPS=${env.SHOPS}
            MAKAROV_PORT=${env.MAKAROV_PORT}
            MAKAROV_BACKEND_PORT=${env.MAKAROV_BACKEND_PORT}
            YUZ1_PORT=${env.YUZ1_PORT}
            YUZ1_BACKEND_PORT=${env.YUZ1_BACKEND_PORT}
            """
          } else {
            echo "Branch ${env.BRANCH_NAME} not configured for deployment"
            env.SHOPS = ''
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
      when {
        branch 'test'
      }
      agent { label 'build-node' }
      steps {
        unstash 'jenkins-env'
        script {
          def envVars = readFile('jenkins_env.groovy')
          evaluate(envVars)
          def shopsList = SHOPS.split(',')
          shopsList.each { shop ->
            def port = env."${shop.toUpperCase()}_PORT"
            def backendPort = env."${shop.toUpperCase()}_BACKEND_PORT"
            bat '''
                REM Ensure Docker network exists
                docker network inspect cashbook-network || docker network create cashbook-network
              '''
            bat """
              REM Stop and remove if container exists
              docker rm -f ${shop}_frontend_container || exit /b 0
            """
            bat """
              # Run container with shop-specific parameters
              docker run --name ${shop}_frontend_container \
                --network cashbook-network \
                -d -p 127.0.0.1:${port}:80 \
                -e BACKEND_URL=http://${shop}_backend_container:${backendPort}/api \
                $DOCKER_REGISTRY/$IMAGE_NAME:$DOCKER_IMAGE_TAG
              """
          }
        }
        script {
          echo 'Waiting for containers to initialize...'
          sleep 10
          def envVars = readFile('jenkins_env.groovy')
          evaluate(envVars)
          def shopsList = SHOPS.split(',')
          shopsList.each { shop ->
            def shopPort = env."${shop.toUpperCase()}_PORT"
            echo "Checking health for ${shop} on port ${shopPort}"
            bat """
              docker exec ${shop}_frontend_container curl -f http://localhost/internal-api/health || (
                echo "API Health Check Failed: Nginx routing to backend failed for ${shop}" && exit 1
              )
            """
            bat """
              REM Stop and remove if container exists
              docker rm -f ${shop}_frontend_container || exit /b 0
            """
          }
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
        bat """
          docker login -u $DOCKER_REGISTRY -p $DOCKER_PASSWORD
          docker push $DOCKER_REGISTRY/$IMAGE_NAME:$COMMIT_HASH
          docker push $DOCKER_REGISTRY/$IMAGE_NAME:$DOCKER_IMAGE_TAG
        """
      }
    }
    stage('Deploy Containers') {
      agent { label 'deploy-node' }
      when {
        branch 'main'
      }
      steps {
        unstash 'source-code'
        unstash 'jenkins-env'
        script {
          // Load dynamic env vars
          def envVars = readFile('jenkins_env.groovy')
          evaluate(envVars)

          // Pull the image using the latest tag
          sh """
            # Pull the image using the latest tag
            docker pull $DOCKER_REGISTRY/$IMAGE_NAME:$DOCKER_IMAGE_TAG
            """
          // Deploy containers
          def shopsList = SHOPS.split(',')
          shopsList.each { shop ->
            def shopPort = env."${shop.toUpperCase()}_PORT"
            def backendPort = env."${shop.toUpperCase()}_BACKEND_PORT"
            echo "Deploying ${shop} on port ${shopPort}"

            sh '''
            # Ensure Docker network exists
            docker network inspect cashbook-network || docker network create cashbook-network
            '''
            sh """
            # Stop and remove if container exists
            docker rm -f ${shop}_frontend_container || exit /b 0
            """

            sh """
              docker run --name ${shop}_frontend_container \
                --network cashbook-network \
                -d -p 127.0.0.1:${shopPort}:80 \
                -e BACKEND_URL=http://${shop}_backend_container:${backendPort}/api \
                $DOCKER_REGISTRY/$IMAGE_NAME:$DOCKER_IMAGE_TAG
            """
          }
        }
      }
    }

    stage('Test deployment containers') {
      steps {
        sh 'sleep 10' // Give container a moment to start up
        unstash 'source-code'
        unstash 'jenkins-env'
        script {
          // Load dynamic env vars
          def envVars = readFile('jenkins_env.groovy')
          evaluate(envVars)
          def shopList = SHOPS.split(',')
          shopList.each { shop ->
            // Execute curl from inside the frontend container to test the internal nginx routing
            sh """
              docker exec ${shop}_frontend_container curl -f http://localhost/internal-api/health || (
                echo "API Health Check Failed: Nginx routing to backend failed for ${shop}" && exit 1
              )
            """
            echo "API Health Check Successful for ${shop}: Frontend container can connect to Backend through Nginx routing"
          }
        }
        echo 'Each tester has confirmed that update is OK'
      }
    }
  }
}
