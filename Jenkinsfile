pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'ghcr.io/yourusername'
        KUBE_NAMESPACE = 'library'
    }
    
    stages {
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Build') {
            steps {
                sh 'docker build -t $DOCKER_REGISTRY/lib-backend:latest ./backend'
                sh 'docker build -t $DOCKER_REGISTRY/lib-frontend:latest ./frontend'
            }
        }
        
        stage('Deploy') {
            steps {
                sh 'kubectl apply -f k8s/'
            }
        }
    }
} 