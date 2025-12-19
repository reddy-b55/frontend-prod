pipeline {
    agent any

    environment {
        AWS_REGION = "us-east-1"
        ACCOUNT_ID = "424858915041"
        ECR_REPO   = "aahaas-frontend"
        IMAGE_TAG  = "frontend-prod"

        PROD_USER = "ubuntu"
        PROD_HOST = "54.89.187.203"
        CONTAINER = "aahaas-frontend"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/reddy-b55/frontend-prod.git'
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                docker build -t ${ECR_REPO}:${IMAGE_TAG} .
                '''
            }
        }

        stage('Login to ECR (Jenkins)') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-ecr-creds'
                ]]) {
                    sh '''
                    aws ecr get-login-password --region ${AWS_REGION} \
                    | docker login --username AWS --password-stdin \
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

        stage('Deploy to Production EC2') {
            steps {
                sshagent(['prod-ec2-key']) {
                    withCredentials([[
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-ecr-creds'
                    ]]) {
                        sh '''
                        ssh -o StrictHostKeyChecking=no ${PROD_USER}@${PROD_HOST} << EOF
                        export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                        export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
                        export AWS_REGION=${AWS_REGION}

                        aws ecr get-login-password --region ${AWS_REGION} \
                        | docker login --username AWS --password-stdin \
