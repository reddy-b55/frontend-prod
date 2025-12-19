pipeline {
  agent any

  environment {
    AWS_REGION = "us-east-1"
    ECR_REPO = "<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/fresh-frontend"
    IMAGE_TAG = "${BUILD_NUMBER}"
    PROD_EC2 = "ubuntu@<PROD_PRIVATE_IP>"
  }

  stages {

    stage('Checkout') {
      steps {
        git branch: 'main',
            url: 'https://github.com/your-org/fresh-project.git'
      }
    }

    stage('Build Image') {
      steps {
        sh 'docker build -t fresh-frontend:$IMAGE_TAG .'
      }
    }

    stage('Login ECR') {
      steps {
        sh '''
          aws ecr get-login-password --region $AWS_REGION |
          docker login --username AWS --password-stdin $ECR_REPO
        '''
      }
    }

    stage('Push Image') {
      steps {
        sh '''
          docker tag fresh-frontend:$IMAGE_TAG $ECR_REPO:$IMAGE_TAG
          docker push $ECR_REPO:$IMAGE_TAG
        '''
      }
    }

    stage('Deploy') {
      steps {
        sh '''
          ssh -o StrictHostKeyChecking=no $PROD_EC2 << EOF
            docker pull $ECR_REPO:$IMAGE_TAG
            docker stop fresh-frontend || true
            docker rm fresh-frontend || true
            docker run -d \
              --name fresh-frontend \
              -p 3000:3000 \
              --restart unless-stopped \
              $ECR_REPO:$IMAGE_TAG
          EOF
        '''
      }
    }
  }
}

