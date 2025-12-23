pipeline {
    agent any

    environment {
        AWS_REGION = "us-east-1"
        ACCOUNT_ID = "424858915041"
        ECR_REPO   = "aahaas-frontend"
        IMAGE_TAG  = "${BUILD_NUMBER}"
        CONTAINER  = "aahaas-frontend"
        APP_PORT   = "3000"
    }
    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    script {
                        def scannerHome = tool 'SonarScanner'
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                          -Dsonar.projectKey=aahaas-frontend \
                          -Dsonar.projectName=aahaas-frontend \
                          -Dsonar.sources=. \
                          -Dsonar.exclusions=**/node_modules/**,**/.next/**
                        """
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
                sh """
                aws ecr get-login-password --region ${AWS_REGION} | \
                docker login --username AWS --password-stdin \
                ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                """
            }
        }

        stage('Push Image') {
            steps {
                sh """
                docker tag ${ECR_REPO}:${IMAGE_TAG} \
                ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}

                docker push \
                ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
                """
            }
        }

        /* ✅ NEW STAGE 1 */
        stage('Pull Image from ECR') {
            steps {
                sh """
                docker pull \
                ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
                """
            }
        }

        /* ✅ NEW STAGE 2 */
        stage('Deploy on EC2') {
            steps {
                sh """
                docker stop ${CONTAINER} || true
                docker rm ${CONTAINER} || true

                docker run -d \
                  --name ${CONTAINER} \
                  -p ${APP_PORT}:${APP_PORT} \
                  --restart always \
                  ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
                """
            }
        }
    }

    post {
        success {
            echo "✅ SonarQube + Build + Push + Deploy completed successfully"
        }
        failure {
            echo "❌ Pipeline FAILED"
        }
    }
}
