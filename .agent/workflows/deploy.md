---
description: How to deploy E-Store updates to cPanel (shop.buyinn.pk)
---

# 🚀 E-Store Deployment Workflow

## Prerequisites
- Access to cPanel at buyinn.pk
- Git installed locally
- FTP credentials (for Option B)

---

## Option A: Git-Based Deployment (Recommended)

### One-Time Setup

#### Step 1: Enable Git in cPanel
1. Login to cPanel
2. Go to **Git Version Control**
3. Click **Create** 
4. Settings:
   - **Clone URL**: Leave empty (create new)
   - **Repository Path**: `/home/buyinn/repositories/estore.git`
   - **Repository Name**: `estore`
5. Click **Create**
6. Note the **Clone URL** shown (e.g., `ssh://buyinn@buyinn.pk/home/buyinn/repositories/estore.git`)

#### Step 2: Configure Local Git
```powershell
# Navigate to project
cd "d:\Debug Nodes- Development Material\Projects\E-Store"

# Add cPanel as remote (replace with your clone URL)
git remote add cpanel ssh://buyinn@buyinn.pk/home/buyinn/repositories/estore.git
```

#### Step 3: Create Post-Receive Hook (on cPanel)
1. In cPanel **File Manager**, go to `/home/buyinn/repositories/estore.git/hooks/`
2. Create file `post-receive` with content:

```bash
#!/bin/bash
GIT_WORK_TREE=/home/buyinn/public_html/shop git checkout -f main

# Restart Node.js app
touch /home/buyinn/public_html/shop/api/tmp/restart.txt
```

3. Set permissions to `755`

---

### Deploy Updates (Every Time)

// turbo
#### Step 1: Build Frontend
```powershell
cd "d:\Debug Nodes- Development Material\Projects\E-Store"
npm run build
```

#### Step 2: Commit Changes
```powershell
git add .
git commit -m "Update: your description here"
```

#### Step 3: Push to cPanel
```powershell
git push cpanel main
```

✅ Done! Your site at shop.buyinn.pk is updated automatically.

---

## Option B: FTP Script Deployment

### One-Time Setup

#### Install WinSCP (if not installed)
Download from: https://winscp.net/

#### Create FTP Profile
1. Open WinSCP
2. New Site:
   - **Protocol**: SFTP or FTP
   - **Host**: buyinn.pk (or your server IP)
   - **Port**: 21 (FTP) or 22 (SFTP)
   - **Username**: Your cPanel username
   - **Password**: Your cPanel password
3. Save as `E-Store cPanel`

---

### Deploy Updates (Using PowerShell Script)

Create `deploy.ps1` in project root:

```powershell
# deploy.ps1 - E-Store Deployment Script

Write-Host "🔨 Building frontend..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Creating deployment packages..." -ForegroundColor Cyan

# Compress dist folder
Compress-Archive -Path "dist\*" -DestinationPath "dist.zip" -Force

# Compress backend folder (excluding node_modules)
$backendFiles = Get-ChildItem -Path "backend" -Exclude "node_modules"
Compress-Archive -Path $backendFiles.FullName -DestinationPath "backend.zip" -Force

Write-Host "✅ Packages ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📤 Upload these files via cPanel File Manager:" -ForegroundColor Yellow
Write-Host "   1. dist.zip → /public_html/shop/ (extract & overwrite)"
Write-Host "   2. backend.zip → /public_html/shop/api/ (extract & overwrite)"
Write-Host ""
Write-Host "🔄 After upload, restart Node.js app in cPanel" -ForegroundColor Yellow
```

// turbo
#### Run Deployment
```powershell
cd "d:\Debug Nodes- Development Material\Projects\E-Store"
.\deploy.ps1
```

---

## Option C: GitHub Actions (CI/CD)

### One-Time Setup

#### Step 1: Create GitHub Repository
Push your project to GitHub if not already done.

#### Step 2: Add Repository Secrets
In GitHub → Repository → Settings → Secrets → Actions:
- `FTP_SERVER`: Your cPanel server (e.g., `buyinn.pk`)
- `FTP_USERNAME`: cPanel username
- `FTP_PASSWORD`: cPanel password

#### Step 3: Create Workflow File
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to cPanel

on:
  push:
    branches: [main]
  workflow_dispatch:  # Manual trigger

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build frontend
        run: npm run build
      
      - name: Deploy Frontend to cPanel
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./dist/
          server-dir: /public_html/shop/
          dangerous-clean-slate: false
      
      - name: Deploy Backend to cPanel
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./backend/
          server-dir: /public_html/shop/api/
          exclude: |
            **/node_modules/**
            **/.env
          dangerous-clean-slate: false
```

---

### Deploy Updates
Simply push to main branch:
```powershell
git add .
git commit -m "Update: description"
git push origin main
```

GitHub Actions will automatically build and deploy! 🎉

---

## 🔧 Post-Deployment Steps

After any deployment method:

1. **Verify frontend**: Visit https://shop.buyinn.pk
2. **Verify API**: Visit https://shop.buyinn.pk/api/health
3. **If backend changed**: 
   - Go to cPanel → Setup Node.js App
   - Click **Restart** on your E-Store app
   - If dependencies changed, click **Run NPM Install** first

---

## 📋 Quick Reference

| What Changed | Action Required |
|--------------|-----------------|
| Frontend only | Deploy dist/ folder |
| Backend code | Deploy + Restart Node.js |
| New npm packages | Deploy + NPM Install + Restart |
| Database schema | Run SQL in phpMyAdmin first |
