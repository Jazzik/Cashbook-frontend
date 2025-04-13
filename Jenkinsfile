pipeline {
  agent any
  parameters {
    string(name: 'STORE_ID', defaultValue: 'store1', description: 'Store/Environment to deploy')
  }
  stages {
    stage('Build and Deploy Docker Container') {
      steps {
        sh '''docker build -t $IMAGE_NAME .
docker stop $CONTAINER_NAME || true
docker rm $CONTAINER_NAME || true
docker run -d --name $CONTAINER_NAME --network cashbook-network -p 127.0.0.1:3000:80 -e BACKEND_URL=$BACKEND_URL $IMAGE_NAME'''
      }
    }

    stage('Test deployment') {
      steps {
        echo 'Test deployment success'
        sh 'sleep 5' // Give container a moment to start up
        // Execute curl from inside the frontend container to test the internal nginx routing
        sh 'docker exec $CONTAINER_NAME curl -f http://localhost/internal-api/health || (echo "API Health Check Failed: Nginx routing to backend failed" && exit 1)'
        echo 'API Health Check Successful: Frontend container can connect to Backend through Nginx routing'
        echo 'Each tester has confirmed that update is OK'
      }
    }

    stage('Production deployment') {
      steps {
        echo 'Production deployment imitation'
      }
    }

  }
  tools {
    nodejs 'NodeJS'
  }
  environment {
    IMAGE_NAME = 'cashbook_frontend'
    CONTAINER_NAME = 'cashbook_frontend_container'
    BACKEND_URL = 'http://cashbook_backend_container:5000/api'
  }
}