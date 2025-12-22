pipeline {
    agent any

    environment {
        AWS_REGION = "us-east-1"
        ACCOUNT_ID = "424858915041"
        ECR_REPO   = "aahaas-frontend"
        IMAGE_TAG  = "${BUILD_NUMBER}"
        CONTAINER  = "aahaas-frontend"
        SONAR_SERVER_URL = 'http://34.203.30.140:9000/'
        SONAR_LOGIN = 'sqp_60b7546d57818620bb77d7a9695180f7256ab44c'
    }

    stages {

        stage('SCM') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/reddy-b55/frontend-prod.git'
            }
        }

        

          stage('Code Analysis') {
            environment {
                scannerHome = tool 'sonarqube'
            }
            steps {
                script {
                    dir("${WORKSPACE}/${RESTAPI}") {
                        sh "${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=aahaas-frontend \
                            -Dsonar.projectName=aahaas-frontend \
                            -Dsonar.sources=. \
                            -Dsonar.java.binaries=target/classes \
                            -Dsonar.host.url=${SONAR_SERVER_URL} \
                            -Dsonar.login=${SONAR_LOGIN}"
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                sh """
                docker build -t ${ECR_REPO}:${IMAGE_TAG} .
                """
            }
        }

        stage('Login to ECR') {
            steps {
                withCredentials([
                    [$class: 'AmazonWebServicesCredentialsBinding',
                     credentialsId: 'aws-ecr-creds']
                ]) {
                    sh """
                    aws ecr get-login-password --region ${AWS_REGION} | \
                    docker login --username AWS --password-stdin \
                    ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    """
                }
            }
        }

        stage('Push Image to ECR') {
            steps {
                sh """
                docker tag ${ECR_REPO}:${IMAGE_TAG} \
                ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}

                docker push \
                ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
                """
            }
        }

        stage('Deploy on Same EC2') {
            steps {
                sh """
                docker stop ${CONTAINER} || true
                docker rm ${CONTAINER} || true

                docker pull \
                ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}

                docker run -d \
                  --name ${CONTAINER} \
                  -p 3000:3000 \
                  --restart always \
                  ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
                """
            }
        }
    }

    post {
        success {
            echo "✅ SonarQube + Build + Deploy completed successfully"
        }
        failure {
            echo "❌ Pipeline failed"
        }
    }
}
