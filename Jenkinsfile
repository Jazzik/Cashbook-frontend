// Helper function to get all nodes with a given label
def getNodesByLabel(label) {
  return Jenkins.instance.nodes.findAll { node ->
    node.labelString.tokenize(' ').contains(label) && node.toComputer()?.isOnline()
  }.collect { it.name }
  }

// Creates a deploy closure with properly scoped variables to avoid Jenkins CPS closure capture bug.
def makeDeployTask(String nodeName, List shops, String imageTag) {
  def allShops = ['makarov', 'makarov2', 'yuz1']
  def stray = allShops - shops
  return {
    node(nodeName) {
      stray.each { s -> sh "docker rm -f ${s}_frontend_container || true" }
      deployShops(shops, imageTag)
    }
  }
}

// Helper function to deploy and verify shops on the current node
def deployShops(shopsList, imageTag) {
  sh """
    # Ensure Docker network exists
    docker network inspect cashbook-network || docker network create cashbook-network
    # Pull the image
    docker pull \$DOCKER_REGISTRY/\$IMAGE_NAME:${imageTag}
  """

  shopsList.each { shop ->
    def shopPort = env."${shop.toUpperCase()}_PORT"
    def backendPort = env."${shop.toUpperCase()}_BACKEND_PORT"
    echo "Deploying ${shop} on port ${shopPort}"

    sh """
      docker rm -f ${shop}_frontend_container || true
      docker run --name ${shop}_frontend_container \\
        --network cashbook-network \\
        --restart unless-stopped \\
        -d -p 0.0.0.0:${shopPort}:80 \\
        -e BACKEND_URL=http://${shop}_backend_container:${backendPort} \\
        \$DOCKER_REGISTRY/\$IMAGE_NAME:${imageTag}
    """
  }

  // Wait and health check
  shopsList.each { shop ->
    waitForContainer("${shop}_frontend_container", 30)
  }

  shopsList.each { shop ->
    def shopPort = env."${shop.toUpperCase()}_PORT"
    echo "Health check for ${shop} on port ${shopPort}"

    def healthCheckPassed = false
    def maxRetries = 3
    def retryCount = 0

    while (!healthCheckPassed && retryCount < maxRetries) {
      try {
        sh """
          docker exec ${shop}_frontend_container curl -f http://localhost/ || (
            echo "Frontend Health Check Failed: Nginx not responding for ${shop}" && exit 1
          )
        """
        healthCheckPassed = true
        echo "Health check passed for ${shop}"
      } catch (Exception e) {
        retryCount++
        echo "Health check failed for ${shop}, attempt ${retryCount}/${maxRetries}: ${e.getMessage()}"
        if (retryCount < maxRetries) {
          sh 'sleep 5'
        } else {
          throw new Exception("Health check failed for ${shop} after ${maxRetries} attempts")
        }
      }
    }
  }
}

// Helper function to wait for container readiness
def waitForContainer(containerName, maxWaitSeconds = 30) {
  def startTime = System.currentTimeMillis()
  def maxWaitMs = maxWaitSeconds * 1000

  while (System.currentTimeMillis() - startTime < maxWaitMs) {
    try {
      // Check if container is running
      def containerStatus = sh(
        script: "docker ps -f name=${containerName} --format '{{.Status}}'",
        returnStdout: true
      ).trim()

      if (containerStatus && !containerStatus.contains('Exit')) {
        echo "Container ${containerName} is ready: ${containerStatus}"
        return true
      }

      // Wait 2 seconds before next check
      sh 'sleep 2'
    } catch (Exception e) {
      echo "Waiting for container ${containerName} to be ready..."
      sh 'sleep 2'
    }
  }

  error "Container ${containerName} failed to become ready within ${maxWaitSeconds} seconds"
}

pipeline {
  agent none

  tools {
    nodejs 'NodeJS'
  }

  environment {
    IMAGE_NAME = 'cashbook_frontend'
    DOCKER_REGISTRY = credentials('DOCKER_REGISTRY')
    DOCKER_PASSWORD = credentials('DOCKER_PASSWORD')
    DOCKER_IMAGE_TAG = 'latest'
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
          try {
            env.COMMIT_HASH = env.GIT_COMMIT
            echo "Building for commit: ${env.COMMIT_HASH}"

            // Set shop list and ports based on branch
            if (env.BRANCH_NAME == 'test') {
              env.SHOPS = 'testing'
              env.TESTING_PORT = '2999'
              env.TESTING_BACKEND_PORT = '3999'
              echo "Configured for test environment: ${env.SHOPS}"
            } else if (env.BRANCH_NAME == 'main') {
              env.YUZ1_LINUX_SHOPS = 'yuz1'
              env.MKV1_LINUX_SHOPS = 'makarov,makarov2'
              env.MAKAROV_PORT = '3000'
              env.MAKAROV_BACKEND_PORT = '5000'
              env.MAKAROV2_PORT = '3001'
              env.MAKAROV2_BACKEND_PORT = '5001'
              env.YUZ1_PORT = '3002'
              env.YUZ1_BACKEND_PORT = '5002'
              echo "Configured for production environments: ${env.SHOPS}"
            } else {
              echo "Branch ${env.BRANCH_NAME} not configured for deployment"
              env.SHOPS = ''
              error "Branch ${env.BRANCH_NAME} not configured for deployment"
            }

            // Write environment variables to file for later stages
            def envVars = """
              SHOPS='${env.SHOPS}'
              COMMIT_HASH='${env.COMMIT_HASH}'
            """

            if (env.BRANCH_NAME == 'test') {
              envVars += """
                TESTING_PORT='${env.TESTING_PORT}'
                TESTING_BACKEND_PORT='${env.TESTING_BACKEND_PORT}'
              """
            } else if (env.BRANCH_NAME == 'main') {
              envVars += """
                MAKAROV_PORT='${env.MAKAROV_PORT}'
                MAKAROV_BACKEND_PORT='${env.MAKAROV_BACKEND_PORT}'
                MAKAROV2_PORT='${env.MAKAROV2_PORT}'
                MAKAROV2_BACKEND_PORT='${env.MAKAROV2_BACKEND_PORT}'
                YUZ1_PORT='${env.YUZ1_PORT}'
                YUZ1_BACKEND_PORT='${env.YUZ1_BACKEND_PORT}'
              """
            }

            writeFile file: 'jenkins_env.groovy', text: envVars
            stash name: 'jenkins-env', includes: 'jenkins_env.groovy'
          } catch (Exception e) {
            echo "Error in Configure stage: ${e.getMessage()}"
            currentBuild.result = 'FAILURE'
            throw e
          }
        }
      }
    }

    stage('Build, Test and Push') {
      // Single agent for all steps — image must be built and pushed on the same node
      agent { label 'build-node' }
      when {
        branch 'test'
      }
      steps {
        script {
          try {
            // Build Docker image
            echo 'Building Docker image'
            sh '''
              docker build -t $DOCKER_REGISTRY/$IMAGE_NAME:$COMMIT_HASH -t $DOCKER_REGISTRY/$IMAGE_NAME:$DOCKER_IMAGE_TAG .
            '''
            sh 'docker images | grep $IMAGE_NAME'
            echo 'Docker image built successfully'

            // Test in test environment
            unstash 'jenkins-env'

            // Create a dummy backend container for testing
            sh '''
              # Ensure Docker network exists before starting any containers
              docker network inspect cashbook-network || docker network create cashbook-network

              # Create dummy backend container for testing
              docker rm -f testing_backend_container || true
              docker run --name testing_backend_container --network cashbook-network -d nginx:alpine
            '''

            def shopsList = env.SHOPS.split(',')

            shopsList.each { shop ->
              echo "Deploying ${shop} for testing"

              sh """
                # Stop and remove if container exists
                docker rm -f ${shop}_frontend_container || true
              """
              sh """
                # Run container with shop-specific parameters
                docker run --name ${shop}_frontend_container \\
                  --network cashbook-network \\
                  -d -p 0.0.0.0:${env.TESTING_PORT}:80 \\
                  -e BACKEND_URL=http://${shop}_backend_container:${env.TESTING_BACKEND_PORT} \\
                  \$DOCKER_REGISTRY/\$IMAGE_NAME:\$DOCKER_IMAGE_TAG
              """
            }

            // Wait for containers to initialize
            echo 'Waiting for containers to initialize...'
            shopsList.each { shop ->
              waitForContainer("${shop}_frontend_container", 30)
            }

            // Health check with retry logic
            shopsList.each { shop ->
              echo "Checking health for ${shop} on port ${env.TESTING_PORT}"

              def healthCheckPassed = false
              def maxRetries = 3
              def retryCount = 0

              while (!healthCheckPassed && retryCount < maxRetries) {
                try {
                  sh """
                    # Check if container is running
                    docker ps -f name=${shop}_frontend_container --format '{{.Status}}'

                    # Test if nginx is responding
                    docker exec ${shop}_frontend_container curl -f http://localhost/ || (
                      echo "Frontend Health Check Failed: Nginx not responding for ${shop}" && exit 1
                    )
                  """
                  healthCheckPassed = true
                  echo "Health check passed for ${shop}"
                } catch (Exception e) {
                  retryCount++
                  echo "Health check failed for ${shop}, attempt ${retryCount}/${maxRetries}: ${e.getMessage()}"
                  if (retryCount < maxRetries) {
                    sh 'sleep 5'
                  } else {
                    throw new Exception("Health check failed for ${shop} after ${maxRetries} attempts")
                  }
                }
              }

              // Cleanup test container
              sh """
                docker rm -f ${shop}_frontend_container || true
              """
            }

            // Cleanup dummy backend container
            sh '''
              docker rm -f testing_backend_container || true
            '''

            // Push to registry on the same node where image was built
            echo 'Pushing Docker image to Docker Hub'
            sh '''
              docker login -u $DOCKER_REGISTRY -p $DOCKER_PASSWORD
              docker push $DOCKER_REGISTRY/$IMAGE_NAME:$COMMIT_HASH
              docker push $DOCKER_REGISTRY/$IMAGE_NAME:$DOCKER_IMAGE_TAG
            '''
            echo 'Docker images pushed successfully'
          } catch (Exception e) {
            echo "Error in Build, Test and Push stage: ${e.getMessage()}"
            currentBuild.result = 'FAILURE'
            throw e
          }
        }
      }
    }

    stage('Deploy to Production') {
      when {
        branch 'test'
      }
      agent none
      steps {
        // input message: 'Deploy Frontend to Production?', ok: 'Deploy', parameters: [
        //   choice(name: 'DEPLOY_ACTION', choices: ['Deploy', 'Skip'], description: 'Choose deployment action')
        // ]
        script {
          // if (params.DEPLOY_ACTION == 'Skip') {
          //   echo 'Frontend production deployment skipped by user'
          //   return
          // }

          try {
            echo 'Deploying tested frontend version to production on all build nodes'

            // Set production environment variables
            env.YUZ1_LINUX_SHOPS = 'yuz1'
            env.MKV1_LINUX_SHOPS = 'makarov,makarov2'
            env.MAKAROV_PORT = '3000'
            env.MAKAROV_BACKEND_PORT = '5000'
            env.MAKAROV2_PORT = '3001'
            env.MAKAROV2_BACKEND_PORT = '5001'
            env.YUZ1_PORT = '3002'
            env.YUZ1_BACKEND_PORT = '5002'

            def nodeShopsMap = [
              'yuz1-linux': env.YUZ1_LINUX_SHOPS.tokenize(','),
              'mkv1-linux': env.MKV1_LINUX_SHOPS.tokenize(',')
            ]
            def deployTasks = [:]
            nodeShopsMap.each { nodeName, shops ->
              deployTasks["Deploy on ${nodeName}"] = makeDeployTask(nodeName, shops, env.DOCKER_IMAGE_TAG)
            }
            parallel deployTasks

            echo 'Frontend production deployment completed successfully on all nodes'
          } catch (Exception e) {
            echo "Error in frontend production deployment: ${e.getMessage()}"
            currentBuild.result = 'FAILURE'
            throw e
          }
        }
      }
    }

    stage('Deploy and Verify') {
      agent none
      when {
        branch 'main'
      }
      steps {
        script {
          try {
            def nodeShopsMap = [
              'yuz1-linux': env.YUZ1_LINUX_SHOPS.tokenize(','),
              'mkv1-linux': env.MKV1_LINUX_SHOPS.tokenize(',')
            ]
            def deployTasks = [:]
            nodeShopsMap.each { nodeName, shops ->
              deployTasks["Deploy on ${nodeName}"] = makeDeployTask(nodeName, shops, env.DOCKER_IMAGE_TAG)
            }
            parallel deployTasks

            echo 'Production containers deployed and verified successfully on all nodes'
          } catch (Exception e) {
            echo "Error in Deploy and Verify stage: ${e.getMessage()}"
            currentBuild.result = 'FAILURE'
            throw e
          }
        }
      }
    }
  }

  post {
    always {
      script {
        def buildNodes = getNodesByLabel('linux')
        def cleanupTasks = buildNodes.collectEntries { nodeName ->
          ["Cleanup on ${nodeName}": {
            node(nodeName) {
              try {
                sh '''
                  # Cleanup test containers
                  docker rm -f testing_frontend_container || true
                  docker rm -f testing_backend_container || true
                '''
                echo "Cleanup completed on ${nodeName}"
              } catch (Exception e) {
                echo "Error during cleanup on ${nodeName}: ${e.getMessage()}"
              }
            }
          }]
        }
        parallel cleanupTasks
      }
    }
    failure {
      echo 'Pipeline failed!'
    }
    success {
      echo 'Pipeline succeeded!'
    }
  }
}
