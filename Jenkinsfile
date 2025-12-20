pipeline {
    agent any

    environment {
        AWS_REGION = "us-east-1"
        ACCOUNT_ID = "424858915041"
        ECR_REPO   = "aahaas-frontend-v2"
        IMAGE_TAG  = "frontend-prod"

        PROD_USER  = "ubuntu"
        PROD_HOST  = "172.31.28.146"
        PROD_PORT  = "3000"
        CONTAINER  = "aahaas-frontend"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/reddy-b55/frontend-prod.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${ECR_REPO}:${IMAGE_TAG} ."
            }
        }

        stage('Login to Amazon ECR') {
            steps {
                sh """
                aws ecr get-login-password --region ${AWS_REGION} \
                | docker login --username AWS --password-stdin \
                ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                """
            }
        }

        stage('Tag & Push Image to ECR') {
            steps {
                sh """
                docker tag ${ECR_REPO}:${IMAGE_TAG} \
                ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}

                docker push \
                ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
                """
            }
        }

        stage('Deploy to Production EC2') {
            steps {
                sshagent(['ec2-prod-key']) {
                    sh """
                    ssh -o StrictHostKeyChecking=no ${PROD_USER}@${PROD_HOST} << 'EOF'
                      aws ecr get-login-password --region ${AWS_REGION} \
                      | docker login --username AWS --password-stdin \
                      ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

                      docker pull \
                      ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}

                      docker stop ${CONTAINER} || true
                      docker rm ${CONTAINER} || true

                      docker run -d \
                        --name ${CONTAINER} \
                        -p ${PROD_PORT}:3000 \
                        --restart unless-stopped \
                        ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
                    EOF
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Frontend deployed successfully"
        }
        failure {
            echo "❌ Deployment failed"
        }
    }
}
