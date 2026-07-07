# Dream Vacation Destinations

This application allows users to create a list of countries they'd like to visit, providing basic information about each country. The project is structured to mimic a real-life production environment, employing best practices in software development, deployment, and continuous integration/continuous delivery (CI/CD).
![GitHub](https://img.shields.io/badge/GitHub-Actions-blue?logo=githubactions)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql)

## Overview

## 🏗️ Architecture

```text
                User
                  │
                  ▼
        React Frontend (Nginx)
                  │
                  ▼
         Node.js Express API
                  │
                  ▼
          PostgreSQL Database

      GitHub Actions CI/CD
                  │
                  ▼
             Docker Hub
```

## Setup

### Backend
1. Navigate to the `backend` directory.
2. Run `npm install` to install dependencies.
3. Set up your PostgreSQL database and update the `.env` file with your database URL.
4. Run `npm start` to start the server.

### Frontend
1. Navigate to the `frontend` directory.
2. Run `npm install` to install dependencies.
3. Update the `.env` file with your API URL (e.g., `REACT_APP_API_URL=http://localhost:3001`).
4. Run `npm start` to start the React development server.

## Features
- **Add Countries**: Users can add countries to their dream vacation list.
- **View Country Details**: Displays capital, population, and region information for each country.
- **Remove Countries**: Users can remove countries from their list.
- **Production-Ready Setup**: The project is designed to be scalable and maintainable, following industry-standard practices for deployment and CI/CD.

## Roadmap
- **CI/CD Implementation**: Automate the build, test, and deployment process using industry-standard CI/CD tools.
- **Infrastructure as Code (IaC)**: Implement IaC for automated environment setup and management.
- **Scalability**: Enhance the application to support multiple environments (staging, production) with proper domain names and configurations.
- **Security**: Utilize Kubernetes Secrets and environment variables for secure data management.
- **Microservices**: Modularize the application into microservices to improve maintainability and scalability.

## Technologies Used
- **Frontend**: React
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **External API**: REST Countries API
- **CI/CD**: GitHub Actions
- **Infrastructure as Code**: Planned for future implementation using Terraform.

## Best Practices
- **Version Control**: All changes are tracked in Git for collaboration and history management.
- **Environment Management**: Separate configurations for different environments (development, staging, production) using environment variables.
- **Security**: Sensitive information is managed using environment variables and Kubernetes Secrets.
- **Documentation**: The project is well-documented to facilitate onboarding and maintenance.

## CI/CD Pipeline

This project uses GitHub Actions to automate the build and deployment process.

### Backend Workflow
- Triggers on every push and pull request to the `main` and `dev` branches.
- Builds the backend Docker image.
- Logs in to Docker Hub using GitHub Secrets.
- Pushes the Docker image tagged with:
  - `latest`
  - Git commit SHA

### Frontend Workflow
- Triggers on every push and pull request to the `main` and `dev` branches.
- Builds the frontend Docker image.
- Logs in to Docker Hub using GitHub Secrets.
- Pushes the Docker image tagged with:
  - `latest`
  - Git commit SHA

### GitHub Secrets

The following repository secrets are required:

- `DOCKER_USERNAME`
- `DOCKER_TOKEN`

### Docker Compose

The application can be started locally with:

```bash
docker compose up --build
```

This starts:
- Frontend
- Backend
- PostgreSQL
