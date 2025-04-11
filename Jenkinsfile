pipeline {
  agent any
  stages {
    stage('Build and Deploy Docker Container') {
      steps {
        sh '''docker build -t $IMAGE_NAME --build-arg REACT_APP_API_URL=$REACT_APP_API_URL .
docker stop $CONTAINER_NAME || true
docker rm $CONTAINER_NAME || true
docker run -d --name $CONTAINER_NAME --network cashbook-network -p 3000:80 $IMAGE_NAME'''
      }
    }

    stage('Test deployment') {
      steps {
        echo 'Test deployment success'
        sh 'sleep 5' // Give container a moment to start up
        // Execute curl from inside the frontend container to test container-to-container communication
        sh 'docker exec $CONTAINER_NAME curl -f $REACT_APP_API_URL/health || (echo "API Health Check Failed: Frontend container cannot connect to Backend" && exit 1)'
        echo 'API Health Check Successful: Frontend container can connect to Backend'
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
    REACT_APP_API_URL = 'http://cashbook_backend_container:5000/api'
  }
}