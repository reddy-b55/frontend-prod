pipeline {
    agent any

    environment {
        AWS_REGION = "us-east-1"
        ACCOUNT_ID = "424858915041"
        ECR_REPO   = "aahaas-frontend"
        IMAGE_TAG  = "latest"
        CONTAINER  = "aahaas-frontend"
    }

    stages {

        stage("Checkout Code") {
            steps {
                git branch: 'main',
                    url: 'https://github.com/reddy-b55/frontend-prod.git'
            }
        }

        stage("Build Docker Image") {
            steps {
                sh """
                docker build -t $ECR_REPO:$IMAGE_TAG .
                """
            }
        }

    }
}
