# Deployment Guideline

This guide explains how to deploy the **Ahhchip Next.js** project to your VPS using GitHub and Docker Compose.

## Prerequisites

1.  **VPS**: Ubuntu/Debian recommended.
2.  **Docker & Docker Compose**: Installed on the VPS.
3.  **GitHub Repository**: Your code should be pushed to a repository.

---

## Step 1: Push to GitHub (Developer Machine)

1.  Ensure all your changes are committed:
    ```bash
    git add .
    git commit -m "Setup Docker for deployment"
    ```
2.  Push to your repository:
    ```bash
    git push origin main
    ```

---

## Step 2: Initial Setup on VPS

1.  **SSH into your VPS**:
    ```bash
    ssh username@152.42.177.31
    ```
2.  **Clone the Repository**:
    ```bash
    git clone <your-github-repo-url>
    cd <repo-folder-name>
    ```
3.  **Create Environment Files**:
    Create a `.env` file in the root and in the `backend/` directory if they are ignored by git.
    ```bash
    cp backend/.env.example backend/.env
    # Edit the files with your production secrets
    nano backend/.env
    ```

---

## Step 3: Deployment (VPS)

1.  **Pull latest changes** (for subsequent updates):
    ```bash
    git pull origin main
    ```
2.  **Build and Start Containers**:
    ```bash
    docker-compose up -d --build
    ```
3.  **Verify Services**:
    Check if the containers are running:
    ```bash
    docker ps
    ```

---

## Step 4: Accessing the App

The application will be available at:
- **Frontend**: `http://152.42.177.31`
- **Backend API**: `http://152.42.177.31/api`

---

## Maintenance

### View Logs
```bash
docker-compose logs -f
```

### Stop Services
```bash
docker-compose down
```

### Update Deployment
Whenever you push new code to GitHub, run these on the VPS:
```bash
git pull origin main
docker-compose up -d --build
```

---

> [!TIP]
> **SSL Setup**: It is recommended to use **Certbot** with Nginx to enable HTTPS for production.
