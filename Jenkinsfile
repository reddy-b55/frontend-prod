pipeline {
    agent any

    environment {
        AWS_REGION = "us-east-1"
        ACCOUNT_ID = "424858915041"

        // Change only these for new projects
        ECR_REPO  = "aahaas-frontend-v2"
        IMAGE_TAG = "${BUILD_NUMBER}"
        CONTAINER = "aahaas-frontend-v2"

        APP_PORT = "3000"
    }

    stages {

        stage('Checkout SCM') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/reddy-b55/frontend-prod.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t ${ECR_REPO}:${IMAGE_TAG} .
                '''
            }
        }

        stage('Create ECR Repository') {
            steps {
                withCredentials([
                    [
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-ecr-creds'
                    ]
                ]) {
                    sh '''
                    set -e

                    aws ecr describe-repositories \
                      --region ${AWS_REGION} \
                      --repository-names ${ECR_REPO} \
                    || aws ecr create-repository \
                      --region ${AWS_REGION} \
                      --repository-name ${ECR_REPO}
                    '''
                }
            }
        }

        stage('Login to ECR') {
            steps {
                withCredentials([
                    [
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-ecr-creds'
                    ]
                ]) {
                    sh '''
                    aws ecr get-login-password --region ${AWS_REGION} | \
                    docker login --username AWS --password-stdin \
                    ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    '''
                }
            }
        }

        stage('Tag & Push Image to ECR') {
            steps {
                sh '''
                docker tag ${ECR_REPO}:${IMAGE_TAG} \
                ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}

                docker push \
                ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
                '''
            }
        }

        stage('Deploy on Same EC2') {
            steps {
                sh '''
                docker stop ${CONTAINER} || true
                docker rm ${CONTAINER} || true

                docker pull \
                ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}

                docker run -d \
                  --name ${CONTAINER} \
                  -p ${APP_PORT}:${APP_PORT} \
                  --restart always \
                  ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful: ${ECR_REPO}:${IMAGE_TAG}"
        }
        failure {
            echo "❌ Pipeline failed"
        }
    }
}
