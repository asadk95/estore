# 🚀 E-Store Deployment Guide for shop.buyinn.pk

Your complete step-by-step guide to deploy E-Store.

---

## 📋 What You'll Deploy

| Component | Location on cPanel | Size |
|-----------|-------------------|------|
| Frontend (React) | `shop.buyinn.pk/` root | ~500KB |
| Backend (Node.js) | `shop.buyinn.pk/api/` | ~2MB |
| Database (MySQL) | phpMyAdmin | ~20KB |

---

## Step 1: Create Subdomain in cPanel

1. Login to your cPanel
2. Go to **Domains** → **Subdomains** (or **Domains** section)
3. Create subdomain: `shop`
4. Domain: `buyinn.pk`
5. Document Root: `/home/buyinn/public_html/shop` (or similar)
6. Click **Create**

---

## Step 2: Create MySQL Database

### 2.1 Create Database
1. Go to **MySQL Databases**
2. New Database Name: `estore` → Click **Create Database**
   - Full name will be: `buyinn_estore`

### 2.2 Create User
1. New Username: `estore` → Password: (create strong password)
2. Click **Create User**
   - Full name will be: `buyinn_estore`

### 2.3 Add User to Database
1. User: `buyinn_estore`
2. Database: `buyinn_estore`
3. Privileges: **ALL PRIVILEGES**
4. Click **Add**

### 2.4 Import Schema
1. Go to **phpMyAdmin**
2. Select database: `buyinn_estore`
3. Click **Import** tab
4. Choose file: `backend/database/schema.sql`
5. Click **Go**

✅ Database ready with products and admin user!

---

## Step 3: Upload Frontend

### Using File Manager:
1. Go to **File Manager**
2. Navigate to: `/home/buyinn/public_html/shop/` (your subdomain folder)
3. Upload all files from your local `dist/` folder:
   - `index.html`
   - `assets/` folder
   - `vite.svg`

### Or using FTP:
1. Connect to FTP
2. Navigate to subdomain folder
3. Upload contents of `dist/`

---

## Step 4: Upload Backend

1. In the subdomain folder, create folder: `api`
2. Upload these from your `backend/` folder:
   ```
   api/
   ├── server.js
   ├── package.json
   ├── package-lock.json
   ├── routes/
   ├── config/
   ├── middleware/
   ├── database/
   └── uploads/          (create empty folder if missing)
   ```

3. **Important:** Create `.env` file in `api/` folder with:
   ```env
   NODE_ENV=production
   PORT=5000
   
   FRONTEND_URL=https://shop.buyinn.pk
   
   JWT_SECRET=YOUR_RANDOM_SECRET_HERE
   
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=buyinn_estore
   DB_PASSWORD=YOUR_DATABASE_PASSWORD
   DB_NAME=buyinn_estore
   
   MAX_FILE_SIZE=5242880
   ```

> 💡 Generate JWT_SECRET: Use a random string generator or run:  
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## Step 5: Setup Node.js Application

1. In cPanel, find **Setup Node.js App**
2. Click **Create Application**
3. Fill in:

| Setting | Value |
|---------|-------|
| Node.js version | 18.x or 20.x |
| Application mode | Production |
| Application root | `/home/buyinn/public_html/shop/api` |
| Application URL | shop.buyinn.pk/api |
| Application startup file | `server.js` |

4. Click **Create**
5. Click **Run NPM Install** (wait for completion)
6. Click **Start App**

---

## Step 6: Create .htaccess File

In your subdomain root (`/home/buyinn/public_html/shop/`), create file `.htaccess`:

```apache
# E-Store .htaccess for shop.buyinn.pk

RewriteEngine On

# Handle API requests - Proxy to Node.js
RewriteCond %{REQUEST_URI} ^/api/(.*)$
RewriteRule ^api/(.*)$ http://127.0.0.1:5000/api/$1 [P,L]

# Handle React SPA routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^(.*)$ /index.html [L]
```

---

## Step 7: Enable SSL (HTTPS)

1. Go to **SSL/TLS Status** in cPanel
2. Find `shop.buyinn.pk`
3. Click **Install AutoSSL** or enable
4. Wait for certificate (can take up to 24 hours)

---

## Step 8: Test Your Deployment

### Test Frontend
Visit: `https://shop.buyinn.pk`
- Should see the E-Store homepage

### Test API
Visit: `https://shop.buyinn.pk/api/health`
- Should see: `{"status":"OK","message":"E-Store API is running"}`

### Test Admin
Visit: `https://shop.buyinn.pk/admin`
- Login with: `admin@estore.pk` / `admin123`

---

## 🔑 Default Credentials

| Type | Email | Password |
|------|-------|----------|
| Admin | admin@estore.pk | admin123 |

> ⚠️ **IMPORTANT:** Change the admin password after first login!

---

## 🔧 Troubleshooting

### "502 Bad Gateway" or API not working?
1. Check Node.js app is running in cPanel
2. Restart the Node.js application
3. Check the `.env` file has correct database credentials

### "Cannot connect to database"?
1. Verify database name includes cPanel prefix: `buyinn_estore`
2. Check username includes prefix: `buyinn_estore`
3. Verify password is correct

### Products/images not loading?
1. Check database was imported correctly
2. Verify API is running
3. Check browser console for errors (F12)

### React routes return 404?
1. Make sure `.htaccess` file exists
2. Check mod_rewrite is enabled (contact host)

---

## ✅ Final Checklist

- [ ] Subdomain `shop.buyinn.pk` created
- [ ] MySQL database `buyinn_estore` created
- [ ] Database schema imported via phpMyAdmin
- [ ] Frontend files uploaded to subdomain root
- [ ] Backend files uploaded to `api/` folder
- [ ] `.env` file created with correct credentials
- [ ] Node.js application running
- [ ] `.htaccess` file created
- [ ] SSL certificate active
- [ ] Homepage loads correctly
- [ ] API health check works
- [ ] Admin login works
- [ ] Admin password changed

---

## 🎉 You're Live!

Your E-Store is now running at: **https://shop.buyinn.pk**

Admin Panel: **https://shop.buyinn.pk/admin**

Congratulations! 🛒✨
