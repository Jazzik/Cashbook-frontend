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

    stage('Testing') {
      steps {
        echo 'Testing imitation'
        echo 'Testing imitation'
        sh 'npm -v'
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
}