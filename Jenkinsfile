pipeline {
  agent any

  environment {
    IMAGE_NAME = "resource-catalogue-ui"
    REGISTRY = "docker.madgik.di.uoa.gr"
    REGISTRY_CRED = 'docker-registry'
    DOCKER_IMAGE = ''
    DOCKER_TAG = ''
    BUILD_CONFIGURATION = 'prod'
  }
  stages {
    stage('Validate Version & Determine Docker Tag') {
      steps {
        script {
          def PROJECT_VERSION = sh(script: 'cat package.json | grep version | head -1 | sed -e \'s/[ "]*version":[ ]*//g\' | cut -c 2-6', returnStdout: true).trim()
          if (env.BRANCH_NAME == 'develop') {
            VERSION = PROJECT_VERSION
            DOCKER_TAG = 'dev'
            BUILD_CONFIGURATION = 'beta'
            echo "Detected develop branch version: ${VERSION}"
          } else if (env.BRANCH_NAME == 'master') {
            VERSION = PROJECT_VERSION
            DOCKER_TAG = "${VERSION}"
            echo "Detected master branch version: ${VERSION}"
          } else {
            VERSION = PROJECT_VERSION
            def branch = env.BRANCH_NAME.replace('/', '-')
            DOCKER_TAG = "${VERSION}-${branch}"
            BUILD_CONFIGURATION = 'beta'
          }
          if ( PROJECT_VERSION != VERSION ) {
            error("Version mismatch. \n\tProject's version:\t${PROJECT_VERSION} \n\tBranch|Tag version:\t${VERSION}")
          }

          currentBuild.displayName = "${currentBuild.displayName}-${DOCKER_TAG}"
        }
      }
    }
    stage('Build Image') {
      steps{
        script {
          DOCKER_IMAGE = docker.build("${REGISTRY}/${IMAGE_NAME}:${DOCKER_TAG}", "--build-arg configuration=${BUILD_CONFIGURATION} .")
        }
      }
    }
    stage('Upload Image') {
      when { // upload images only from 'develop', 'release' or 'master' branches
        expression {
          return env.TAG_NAME != null || env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'master' || env.BRANCH_NAME.startsWith('release/')
        }
      }
      steps{
        script {
          withCredentials([usernamePassword(credentialsId: "${REGISTRY_CRED}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
              sh """
                  echo "Pushing image: ${DOCKER_IMAGE.id}"
                  echo "$DOCKER_PASS" | docker login ${REGISTRY} -u "$DOCKER_USER" --password-stdin
              """
              DOCKER_IMAGE.push()
          }
        }
      }
    }
    stage('Remove Image') {
      steps{
        script {
          sh "docker rmi ${DOCKER_IMAGE.id}"
        }
      }
    }

    stage('Prepare Release PR') {
      when {
        allOf {
          branch 'master'
          not { changeRequest() }  // skip PR builds
        }
      }
      steps {
        withCredentials([string(credentialsId: 'jenkins-github-pat', variable: 'GITHUB_TOKEN')]) {
          sh '''
            . /etc/profile.d/load_nvm.sh > /dev/null
            nvm use 20
            npx release-please release-pr --repo-url ${GIT_URL} --token ${GITHUB_TOKEN}
          '''
        }
      }
    }

    stage('Publish Release') {
      when {
        allOf {
          branch 'master'
          not { changeRequest() }  // skip PR builds
        }
      }
      steps {
        withCredentials([string(credentialsId: 'jenkins-github-pat', variable: 'GITHUB_TOKEN')]) {
          sh '''
            . /etc/profile.d/load_nvm.sh > /dev/null
            nvm use 20
            npx release-please github-release --repo-url ${GIT_URL} --token ${GITHUB_TOKEN}
          '''
        }
      }
    }
  }
  // post-build actions
  post {
    success {
      echo 'Build Successful'
    }
    failure {
      echo 'Build Failed'
    }
  }
}
