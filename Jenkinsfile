pipeline {  
    agent any

    environment {
            timestamp = "${System.currentTimeMillis() / 1000L}"
        }

    stages {

        stage('Prepare') {
            steps {
                script {
                    // Get the ID of the sbb:latest image
                    def oldImageId = sh(script: "docker images fe_ksis:latest -q", returnStdout: true).trim()
                    env.oldImageId = oldImageId
                }

                git branch: 'master',
                    url: 'https://github.com/KangHyeonJu/ksis-front'
            }

            post {
                success {
                    sh 'echo "Successfully Cloned Repository"'
                }
                failure {
                    sh 'echo "Fail Cloned Repository"'
                }
            }
        }

        stage('Build') {  
            steps {
                dir('.') {
                    sh """
                    cp /.env .env
                    """
                }
            }
            post {
                success {
                    sh 'echo "Successfully Build Test"'
                }
                 failure {
                    sh 'echo "Fail Build Test"'
                }
            }
        }  
        stage('Docker Build') {  
            steps {  
                sh 'docker build -t fe_ksis:${timestamp} .'
            }  
        }

        stage('Run Docker Container') {
            steps {
                script {
                    // Check if the container is already running
                    def isRunning = sh(script: "docker ps -q -f name=fe_ksis", returnStdout: true).trim()

                    if (isRunning) {
                        sh "docker rm -f fe_ksis"
                    }

                    // Run the new container
                    try {
                        sh """
                        docker run \
                          --name=fe_ksis \
                          -p 80:80 \
                          -p 443:443 \
                          -v /docker_projects/fe_ksis/volumes/gen:/gen \
                          --restart unless-stopped \
                          --network app \
                          -e TZ=Asia/Seoul \
                          -d \
                          fe_ksis:${timestamp}
                        """
                    } catch (Exception e) {
                        // If the container failed to run, remove it and the image
                        isRunning = sh(script: "docker ps -q -f name=fe_ksis", returnStdout: true).trim()

                        if (isRunning) {
                            sh "docker rm -f fe_ksis"
                        }

                        def imageExists = sh(script: "docker images -q fe_ksis:${timestamp}", returnStdout: true).trim()

                        if (imageExists) {
                            sh "docker rmi fe_ksis:${timestamp}"
                        }

                        error("Failed to run the Docker container.")
                    }

                    // If there's an existing 'latest' image, remove it
                    def latestExists = sh(script: "docker images -q fe_ksis:latest", returnStdout: true).trim()

                    if (latestExists) {
                        sh "docker rmi fe_ksis:latest"

                        if(!oldImageId.isEmpty()) {
                            sh "docker rmi ${oldImageId}"
                        }
                    }

                    // Tag the new image as 'latest'
                    sh "docker tag fe_ksis:${env.timestamp} fe_ksis:latest"
                }
            }
        }
    }  
}