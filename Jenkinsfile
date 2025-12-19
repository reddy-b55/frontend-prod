pipeline {
    agent any

    environment {
        AWS_REGION = "us-east-1"
        ACCOUNT_ID = "424858915041"                 // <-- change
        ECR_REPO   = "aahaas-frontend"
        IMAGE_TAG  = "frontend-prod"

        PROD_USER  = "ubuntu"
        PROD_HOST  = "54.89.187.203"           // <-- change
        PROD_PORT  = "3000"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/your-org/your-repo.git'
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                docker build -t $ECR_REPO:$IMAGE_TAG .
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                aws ecr get-login-password --region $AWS_REGION \
                | docker login --username AWS --password-stdin \
                $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
                '''
            }
        }

        stage('Tag & Push Image to ECR') {
            steps {
                sh '''
                docker tag $ECR_REPO:$IMAGE_TAG \
                $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG

                docker push \
                $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG
                '''
            }
        }

        stage('Deploy to Production EC2') {
            steps {
                sshagent(['prod-ec2-key']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no $PROD_USER@$PROD_HOST << EOF
                      aws ecr get-login-password --region $AWS_REGION \
                      | docker login --username AWS --password-stdin \
                      $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

                      docker pull \
                      $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG

                      docker stop fresh-frontend || true
                      docker rm fresh-frontend || true

                      docker run -d \
                        --name fresh-frontend \
                        -p $PROD_PORT:3000 \
                        --restart unless-stopped \
                        $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG
                    EOF
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment Successful"
        }
        failure {
            echo "❌ Deployment Failed"
        }
    }
}

