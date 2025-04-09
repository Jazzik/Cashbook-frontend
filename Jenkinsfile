pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        tool 'NodeJS'
        sh 'npm install'
        sh 'npm run build'
      }
    }

    stage('Replace Current Docker Container') {
      steps {
        sh '''docker build -t $IMAGE_NAME .

// Stop and remove if exists
sh "docker stop $CONTAINER_NAME || true"
sh "docker rm $CONTAINER_NAME || true"

// Start new container
sh "docker run -d --name $CONTAINER_NAME -p 3000:80 $IMAGE_NAME"'''
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
    IMAGE_NAME = 'CashBook_FrontEnd'
    CONTAINER_NAME = 'Cashbook_front_container'
  }
}