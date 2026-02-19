# 🚀 Production-Ready Node.js Deployment using Jenkins, PM2, Nginx & Docker

## 📌 Project Overview

This project demonstrates a complete CI/CD pipeline for deploying a Node.js application in a production-ready environment using:

- Jenkins (CI/CD Automation)
- GitHub (Source Code Management)
- Node.js & Express
- PM2 (Process Manager)
- Nginx (Reverse Proxy)
- SSL (HTTPS via Let's Encrypt)
- Docker (Optional Container Deployment)
- AWS EC2 (Ubuntu Server)

---

# 🏗️ Architecture Diagram

```
Developer → GitHub → Jenkins → EC2 Server
                                   ↓
                              Node.js App (PM2)
                                   ↓
                                Nginx
                                   ↓
                                Internet
```

---

# 🛠️ Technologies Used

- Node.js
- Express.js
- Jenkins
- Git
- PM2
- Nginx
- Docker
- AWS EC2
- Let's Encrypt SSL

---

# 📂 Project Structure

```
nodeapp/
│── index.js
│── package.json
│── package-lock.json
│── public/
│── node_modules/
```

---

# ⚙️ Server Setup (Ubuntu)

## 1️⃣ Install Git

```bash
sudo apt update
sudo apt install git -y
```

## 2️⃣ Install Node.js (LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
```

## 3️⃣ Install PM2

```bash
sudo npm install -g pm2
```

## 4️⃣ Install Nginx

```bash
sudo apt install nginx -y
```

## 5️⃣ Create App Directory

```bash
sudo mkdir -p /var/www/nodeapp
sudo chown -R jenkins:jenkins /var/www/nodeapp
```

---

# 🔄 Jenkins CI/CD Pipeline

## Jenkinsfile

```groovy
pipeline {
    agent any

    environment {
        APP_DIR = "/var/www/nodeapp"
        REPO_URL = "https://github.com/Arunjadhav0101/node_js_application.git"
        BRANCH = "main"
        APP_NAME = "nodeapp"
        PM2_PATH = "/usr/bin/pm2"
    }

    stages {

        stage('Clone or Pull Code') {
            steps {
                sh '''
                if [ ! -d "$APP_DIR/.git" ]; then
                    git clone -b $BRANCH $REPO_URL $APP_DIR
                else
                    cd $APP_DIR
                    git reset --hard
                    git pull origin $BRANCH
                fi
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                cd $APP_DIR
                npm install
                '''
            }
        }

        stage('Restart Application') {
            steps {
                sh '''
                cd $APP_DIR
                $PM2_PATH delete $APP_NAME || true
                $PM2_PATH start npm --name $APP_NAME -- start
                $PM2_PATH save
                '''
            }
        }

        stage('Check Status') {
            steps {
                sh '''
                $PM2_PATH list
                '''
            }
        }
    }
}
```

---

# 🚀 Running Application Manually

```bash
pm2 start index.js --name nodeapp
pm2 list
pm2 logs
```

Enable on boot:

```bash
pm2 startup
pm2 save
```

---

# 🌐 Nginx Reverse Proxy Setup

Edit config:

```bash
sudo nano /etc/nginx/sites-available/nodeapp
```

Add:

```
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable config:

```bash
sudo ln -s /etc/nginx/sites-available/nodeapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Now access:

```
http://YOUR_PUBLIC_IP
```

---

# 🔐 Enable HTTPS (SSL)

Install Certbot:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Generate SSL:

```bash
sudo certbot --nginx -d yourdomain.com
```

Auto-renew test:

```bash
sudo certbot renew --dry-run
```

---

# 🔔 GitHub Webhook Auto Deployment

1. Go to GitHub Repo → Settings → Webhooks  
2. Add webhook  
3. Payload URL:

```
http://YOUR_PUBLIC_IP:8080/github-webhook/
```

4. Content type: `application/json`

Now every push → Jenkins auto deploy 🚀

---

# 🐳 Docker Deployment (Optional)

## Dockerfile

```Dockerfile
FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

## Build Image

```bash
docker build -t nodeapp .
```

## Run Container

```bash
docker run -d -p 3000:3000 nodeapp
```

---

# 🔥 AWS Security Group Rules

Allow:

- Port 22 (SSH)
- Port 8080 (Jenkins)
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 3000 (If testing without Nginx)

---

# 📊 Monitoring

Check PM2:

```bash
pm2 list
pm2 monit
```

Check logs:

```bash
pm2 logs nodeapp
```

---

# 🎯 Production Best Practices

- Use environment variables (.env)
- Use Nginx instead of exposing port 3000
- Enable HTTPS
- Enable PM2 startup
- Restrict Jenkins access
- Use Docker for portability

---

# 👨‍💻 Author

Arun Jadhav  
DevOps & Cloud Enthusiast

---

# 📌 Future Improvements

- Kubernetes Deployment
- CI/CD using GitHub Actions
- Auto Scaling on AWS
- Monitoring with Prometheus & Grafana
- Blue-Green Deployment
