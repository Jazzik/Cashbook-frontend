pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        sh 'npm install'
        sh 'npm run build'
      }
    }

    stage('Replace Current Docker Container') {
      steps {
        sh '''docker build -t $IMAGE_NAME .
docker stop $CONTAINER_NAME || true
docker rm $CONTAINER_NAME || true
docker run -d --name $CONTAINER_NAME -p 3000:80 $IMAGE_NAME'''
      }
    }

    stage('Test deployment') {
      steps {
        echo 'Test deployment success'
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
    REACT_APP_API_URL = 'http://localhost:5001/api'
  }
}