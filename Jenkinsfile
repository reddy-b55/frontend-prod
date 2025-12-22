pipeline {
    agent any

    environment {
        AWS_REGION = "us-east-1"
        ACCOUNT_ID = "424858915041"
        ECR_REPO   = "aahaas-frontend"
        IMAGE_TAG  = "${BUILD_NUMBER}"
        CONTAINER  = "aahaas-frontend"
    }

    stages {

        stage('Checkout SCM') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/reddy-b55/frontend-prod.git'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                    export PATH=/usr/bin:$PATH
                    node -v || true

                    sonar-scanner \
                      -Dsonar.projectKey=aahaas-frontend \
                      -Dsonar.projectName=aahaas-frontend \
                      -Dsonar.sources=. \
                      -Dsonar.language=js \
                      -Dsonar.exclusions=**/node_modules/**,**/.next/**,**/dist/**,**/build/**
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build \
                  --memory=4g \
                  --memory-swap=6g \
                  -t ${ECR_REPO}:${IMAGE_TAG} .
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                withCredentials([
                    [$class: 'AmazonWebServicesCredentialsBinding',
                     credentialsId: 'aws-ecr-creds']
                ]) {
                    sh '''
                    aws ecr get-login-password --region ${AWS_REGION} | \
                    docker login --username AWS --password-stdin \
                    ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    '''
                }
            }
        }

        stage('Push Image to ECR') {
            steps {
                sh '''
                docker tag ${ECR_REPO}:${IMAGE_TAG} \
                ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}

                docker push \
                ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
                '''
            }
        }

        stage('Deploy on EC2') {
            steps {
                sh '''
                docker stop ${CONTAINER} || true
                docker rm ${CONTAINER} || true

                docker pull \
                ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}

                docker run -d \
                  --name ${CONTAINER} \
                  -p 3000:3000 \
                  --restart always \
                  ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
                '''
            }
        }
    }

    post {
        success {
            echo "✅ SonarQube + Docker + ECR + EC2 Deployment SUCCESS"
        }
        failure {
            echo "❌ Pipeline FAILED – check logs"
        }
    }
}
