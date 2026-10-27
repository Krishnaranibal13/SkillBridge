
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        COMPOSE_PROJECT_NAME = 'skillbridge'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh '''
                    echo "Checking out SkillBridge source..."
                    test -f docker-compose.yml
                    test -f backend/Dockerfile
                    test -f frontend/Dockerfile
                    test -f frontend/nginx.conf
                '''
            }
        }

        stage('Configure Environment') {
            steps {
                withCredentials([
                    file(
                        credentialsId: 'skillbridge-env',
                        variable: 'ENV_FILE'
                    )
                ]) {
                    sh '''
                        set -eu
                        cp "$ENV_FILE" .env
                        chmod 600 .env
                        echo "Environment file configured."
                    '''
                }
            }
        }

        stage('Validate Docker Compose') {
            steps {
                sh '''
                    set -eu
                    docker compose -p "$COMPOSE_PROJECT_NAME" config -q
                    echo "Docker Compose configuration is valid."
                '''
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                    set -eu
                    docker compose -p "$COMPOSE_PROJECT_NAME" build
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    set -eu
                    docker compose -p "$COMPOSE_PROJECT_NAME" up -d --remove-orphans
                    echo "SkillBridge containers deployed."
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    set -eu

                    echo "Checking container status..."
                    docker compose -p "$COMPOSE_PROJECT_NAME" ps

                    echo "Waiting for the API through Nginx..."
                    attempt=0

                    until curl -fsS http://localhost/api/; do
                        attempt=$((attempt + 1))

                        if [ "$attempt" -ge 24 ]; then
                            echo "API health check failed after 120 seconds."
                            docker compose -p "$COMPOSE_PROJECT_NAME" ps
                            docker compose -p "$COMPOSE_PROJECT_NAME" logs --tail=100 backend frontend
                            exit 1
                        fi

                        sleep 5
                    done

                    echo
                    echo "Checking database connectivity..."
                    curl -fsS http://localhost/api/db-test
                    echo

                    echo "SkillBridge deployment verification passed."
                '''
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: SkillBridge has been deployed.'
        }

        failure {
            echo 'FAILED: Check the Jenkins console output and container logs.'
            sh '''
                docker compose -p skillbridge ps || true
                docker compose -p skillbridge logs --tail=60 || true
            '''
        }

        always {
            echo 'SkillBridge pipeline finished.'
        }
    }
}
