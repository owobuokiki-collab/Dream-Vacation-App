#!/bin/bash
set -eux

apt-get update -y

# Install Docker
apt-get install -y docker.io

# Start and enable Docker
systemctl enable docker
systemctl start docker

# Allow the ubuntu user to run Docker
usermod -aG docker ubuntu

# Install Docker Compose plugin
mkdir -p /usr/local/lib/docker/cli-plugins

curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
-o /usr/local/lib/docker/cli-plugins/docker-compose

chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
