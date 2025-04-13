pipeline {
  agent any
  tools {
    nodejs 'NodeJS'
  }
  environment {
    IMAGE_NAME = 'cashbook_frontend'
  }
  stages {
    stage('Configure') {
      steps {
        script {
          // Set shop list based on branch
          if (env.BRANCH_NAME == 'test') {
            env.SHOPS = 'testing'
            // PORT env variables follow naming convention: SHOPNAME_PORT (uppercase)
            env.TESTING_PORT = '2999'  // Port for testing shop
            env.TESTING_BACKEND_PORT = '3999'
            echo "Configured for test environment: ${env.SHOPS}"
          } else if (env.BRANCH_NAME == 'main') {
            env.SHOPS = 'makarov,yuz1'
            // Each shop needs its corresponding PORT env var in uppercase
            // These variables are dynamically looked up later using: env."${shop.toUpperCase()}_PORT"
            env.MAKAROV_PORT = '3000'  // Port for makarov shop
            env.MAKAROV_BACKEND_PORT = '5000'
            env.YUZ1_PORT = '3001'     // Port for yuz1 shop
            env.YUZ1_BACKEND_PORT = '5001'
            echo "Configured for production environments: ${env.SHOPS}"
          } else {
            echo "Branch ${env.BRANCH_NAME} not configured for deployment"
            env.SHOPS = ''
          }
        }
      }
    }
    stage('Build Docker Container') {
      steps {
        sh '''docker build -t $IMAGE_NAME . '''
      }
    }
    stage('Deploy containers') {
      when {
        expression { return env.SHOPS != '' }
      }
      steps {
        script {
          def shopList = env.SHOPS.split(',')
          shopList.each { shop ->
            def port = env."${shop.toUpperCase()}_PORT"
            def backendPort = env."${shop.toUpperCase()}_BACKEND_PORT"
            sh """
              # Stop and remove if container exists
              if [ \$(docker ps -a -q -f name=${shop}_frontend_container) ]; then
                docker stop ${shop}_frontend_container || true
                docker rm ${shop}_frontend_container || true
              fi

              # Run container with shop-specific parameters
              docker run --name ${shop}_frontend_container \
                --network cashbook-network \
                -d -p 127.0.0.1:${port}:80 \
                -e BACKEND_URL=http://${shop}_backend_container:${backendPort}/api \
                $IMAGE_NAME
              """
          }
        }
      }
    }
    stage('Test') {
      steps {
        sh 'sleep 10' // Give container a moment to start up
        script {
          def shopList = env.SHOPS.split(',')
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
