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

---

# AWS ClickOps + CI/CD Deployment (Assessment)

This section documents the manual AWS infrastructure setup and the CI/CD deploy
stage added to automatically ship this app to an EC2 instance.

## Part 1 — Networking Setup (ClickOps)

| Resource | Name | Details |
|---|---|---|
| VPC | `dream-vpc` | CIDR `10.0.0.0/16` |
| Subnet | `dream-subnet` | CIDR `10.0.2.0/24`, AZ `us-east-1b` |
| Internet Gateway | `dream-igw` | Attached to `dream-vpc` |
| Route Table | `dream-rt` | Route `0.0.0.0/0 → dream-igw`, associated with `dream-subnet` |

**Note:** the subnet ended up in `us-east-1b` instead of `us-east-1a` due to an
AWS t2.micro capacity shortage in `us-east-1a` at launch time. A second subnet
was created in `us-east-1b` and `dream-rt` was associated with it instead.

![VPC and Subnet](screenshots/vpc-subnet.png)

## Part 2 — EC2 Instance Setup

- **AMI:** Ubuntu (latest LTS)
- **Instance type:** t2.micro
- **Key pair:** `dream-key.pem`
- **Networking:** launched into `dream-vpc` / `dream-subnet`, with an Elastic IP
  (`100.55.171.79`) attached for a stable public address
- **Security group (`dream-sg`) inbound rules:**
  - SSH (22) — `0.0.0.0/0`
  - Custom TCP 3000 (frontend) — `0.0.0.0/0`
  - Custom TCP 3001 (backend API) — `0.0.0.0/0`
- **Docker & Docker Compose:** installed via EC2 User Data script on launch, and
  confirmed manually after (see Troubleshooting)

![EC2 Instance Running](screenshots/ec2-running.png)

## Part 3 — CI/CD Deployment

A new workflow, `deploy.yml`, was added on top of the existing `backend.yml` /
`frontend.yml` pipelines:

- Triggers automatically once `Backend CI/CD` and `Frontend CI/CD` both complete
  successfully on `main`
- Copies `docker-compose.prod.yml`, `backend/.env`, and `db/init.sql` to the EC2
  instance via `appleboy/scp-action`
- SSHs into the instance via `appleboy/ssh-action` and runs:
```bash
  docker compose -f docker-compose.prod.yml pull
  docker compose -f docker-compose.prod.yml up -d
```

`docker-compose.prod.yml` references the built Docker Hub images (`image:`)
instead of building from source (`build:`), since the EC2 box only needs to
*run* containers.

**Additional GitHub Secrets used:** `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`

![CI/CD Pipeline Success](screenshots/pipeline-success.png)

## App Running

The app is live at: `http://100.55.171.79:3000`

![App in Browser](screenshots/app-browser.png)

## Troubleshooting Log

1. **t2.micro capacity error in `us-east-1a`** — retried the launch in
   `us-east-1b` instead; created a second subnet there and re-associated the
   route table.
2. **No public IP on the instance** — auto-assign public IP wasn't enabled at
   launch; fixed by allocating and associating an Elastic IP instead of
   relaunching.
3. **SSH timing out** — the instance had launched into a different subnet than
   the original `dream-subnet` (due to the AZ capacity issue), and that subnet
   wasn't associated with `dream-rt`. Associating the route table with the
   correct subnet fixed connectivity.
4. **`docker: command not found`** — the EC2 User Data script didn't
   install Docker as expected; installed Docker Engine and the Compose plugin
   manually over SSH instead.
5. **CI/CD deploy step timing out on port 22** — the security group only
   allowed SSH from the developer's own IP; GitHub Actions runners use
   different, rotating IPs. Opened port 22 to `0.0.0.0/0` to allow the
   pipeline through.
6. **`cd: too many arguments` in the deploy job** — the SSH script's
   multi-line commands were being flattened into one line. Fixed by passing
   `DOCKER_USERNAME` via the action's `env:`/`envs:` inputs instead of an
   inline `export`, and keeping each remote command on its own line.
7. **"Failed to add destination" in the app** — the frontend was calling
   `http://127.0.0.1:3001`, not the EC2 public IP. Root cause: the API URL
   was hardcoded directly in `frontend/src/App.js` rather than read from the
   `.env` file, so editing `.env` alone had no effect. Fixed by updating the
   hardcoded `API_URL` constant in the source code to
   `http://100.55.171.79:3001`, which triggered a rebuild and redeploy
   through the pipeline.

## Deliverables Checklist

- [x] Screenshot of VPC and subnet in AWS Console
- [x] Screenshot of EC2 instance running
- [x] Screenshot of the app in the browser
- [x] CI/CD pipeline logs showing successful deployment