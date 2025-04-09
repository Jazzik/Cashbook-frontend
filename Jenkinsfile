pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        echo 'Build imitation'
        echo 'Build imitation complete'
        tool 'NodeJS'
      }
    }

    stage('Testing') {
      steps {
        echo 'Testing imitation'
        echo 'Testing imitation'
        sh 'npm -v'
        echo 'Big sexy biba'
        sh 'npm list react'
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