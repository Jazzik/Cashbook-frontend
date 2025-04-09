pipeline {
  agent any
  tools {
    nodejs 'NodeJS' 
  }

  stages {
    stage('Build') {
      steps {
        echo 'Build imitation'
        echo 'Build imitation complete'
      }
    }

    stage('Testing') {
      steps {
        echo 'Testing imitation'
        echo 'Testing imitation'
	sh 'npm -v'
	
        echo 'Big sexy biba'
	
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
}