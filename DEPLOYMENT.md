# Deployment Guide for Study Buddy

A comprehensive guide for deploying the Study Buddy application. The application consists of a React frontend and a Node.js Express backend with MongoDB database.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment Testing](#post-deployment-testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- **GitHub** account with the repository pushed
- **Render** account ([render.com](https://render.com)) for backend hosting
- **Vercel** account ([vercel.com](https://vercel.com)) for frontend hosting (optional, alternative to Render)
- **MongoDB Atlas** account ([mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)) for the database
- **Cloudinary** account for image/video uploads (optional, if using media features)
- **Google OAuth credentials** for calendar integration (optional)
- Node.js v18+ installed locally for testing

---

## Database Setup

### MongoDB Atlas Configuration

1. **Create MongoDB Atlas Cluster**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up or log in
   - Create a new project (e.g., "study-buddy")
   - Create a new cluster (Free tier is sufficient for development)

2. **Create Database User**:
   - Navigate to **Database Access**
   - Click **Add New Database User**
   - Create username and password (save these securely)
   - Set permissions to **Read and write to any database**

3. **Configure Network Access**:
   - Navigate to **Network Access**
   - Click **Add IP Address**
   - For development: Add your local IP
   - For production: Add `0.0.0.0/0` (allows all IPs, as Render uses dynamic IPs)

4. **Get Connection String**:
   - Click **Clusters** → **Connect**
   - Choose **Drivers**
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`)
   - Replace `<username>`, `<password>`, and `dbname`
   - Save this for environment variables

### Optional: Cloudinary Setup

If using image/video uploads:

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Get your `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`
3. Add these to your backend environment variables

### Optional: Google OAuth Setup

For Google Calendar integration:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000/callback` (local testing)
   - `https://your-backend-url.onrender.com/callback` (production)
6. Save the client ID and secret

---

## Backend Deployment

### Step 1: Prepare Repository

Ensure your code is committed and pushed to GitHub:

```bash
git add .
git commit -m "Prepare backend for production"
git push origin main
```

### Step 2: Deploy on Render

1. **Create Web Service**:
   - Log in to [Render Dashboard](https://dashboard.render.com/)
   - Click **New +** → **Web Service**
   - Connect your GitHub repository
   - Select the `study-buddy` repository

2. **Configure Service**:
   - **Name**: `study-buddy-server` (or your preference)
   - **Branch**: `main`
   - **Root Directory**: `Server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for production)

3. **Add Environment Variables**:

   Click **Advanced** and add the following variables:

   | Variable | Value |
   | :--- | :--- |
   | `MONGODB_URI` | Your MongoDB connection string |
   | `JWT_SECRET` | A secure random string (e.g., `openssl rand -base64 32`) |
   | `CORS_ORIGIN` | Your frontend URL (update after frontend is deployed) |
   | `PORT` | `3000` |
   | `NODE_ENV` | `production` |
   | `NODE_VERSION` | `20.9.0` |
   | `CLOUDINARY_NAME` | (optional) Your Cloudinary name |
   | `CLOUDINARY_API_KEY` | (optional) Your Cloudinary API key |
   | `CLOUDINARY_API_SECRET` | (optional) Your Cloudinary API secret |
   | `GOOGLE_CLIENT_ID` | (optional) Google OAuth client ID |
   | `GOOGLE_CLIENT_SECRET` | (optional) Google OAuth client secret |

4. **Deploy**:
   - Click **Create Web Service**
   - Render will automatically build and deploy
   - Wait for the build to complete (usually 2-5 minutes)
   - Copy your backend URL (e.g., `https://study-buddy-server.onrender.com`)

### Step 3: Verify Backend

```bash
# Test the backend is running
curl https://your-backend-url.onrender.com/

# Check logs in Render Dashboard for errors
```

---

## Frontend Deployment

### Option A: Deploy on Vercel

1. **Connect Repository**:
   - Go to [Vercel](https://vercel.com)
   - Click **Add New** → **Project**
   - Import your GitHub repository

2. **Configure Project**:
   - **Project Name**: `study-buddy-client`
   - **Root Directory**: `Client`
   - **Framework**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Add Environment Variables**:

   | Variable | Value |
   | :--- | :--- |
   | `VITE_API_URL` | Your backend URL (e.g., `https://study-buddy-server.onrender.com`) |

4. **Deploy**:
   - Click **Deploy**
   - Vercel will automatically build and deploy
   - Copy your frontend URL (e.g., `https://study-buddy-client.vercel.app`)

### Option B: Deploy on Render (Static Site)

1. **Create Static Site**:
   - Log in to [Render Dashboard](https://dashboard.render.com/)
   - Click **New +** → **Static Site**
   - Connect your GitHub repository
   - Select the `study-buddy` repository

2. **Configure Site**:
   - **Name**: `study-buddy-client`
   - **Branch**: `main`
   - **Root Directory**: `Client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Add Environment Variables**:

   | Variable | Value |
   | :--- | :--- |
   | `VITE_API_URL` | Your backend URL |

4. **Deploy**:
   - Click **Create Static Site**
   - Wait for the build to complete
   - Copy your frontend URL (e.g., `https://study-buddy-client.onrender.com`)

---

## Environment Configuration

### Frontend (.env.local or .env.production)

Create a `.env.local` file in the `Client` directory for local development:

```env
VITE_API_URL=http://localhost:3000
```

For production, set via platform environment variables (Vercel or Render).

### Backend (.env)

Create a `.env` file in the `Server` directory (do NOT commit this to git):

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=https://your-frontend-url.vercel.app
PORT=3000
NODE_ENV=production
NODE_VERSION=20.9.0

# Optional
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Security Note**: Never commit `.env` files to GitHub. Use platform environment variables instead.

---

## Post-Deployment Steps

### 1. Update Backend CORS Configuration

Once your frontend is deployed:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your backend service (`study-buddy-server`)
3. Go to **Settings** → **Environment**
4. Update `CORS_ORIGIN` with your frontend URL
5. Click **Save Changes**
6. The service will automatically redeploy

### 2. Test the Application

1. Open your frontend URL in a browser
2. Test **Sign Up**: Create a new account
3. Test **Login**: Log in with your credentials
4. Test **Notes**: Create, edit, and delete a note
5. Test **Tasks**: Create and complete tasks
6. Test **Pomodoro**: Start a Pomodoro session
7. Test **Calendar**: Add and view calendar events
8. Test **Group Chat**: Create a group and send messages
9. Check **Analytics**: Verify data is being tracked

### 3. Monitor Logs

**Backend Logs** (Render):
- Dashboard → Service → **Logs**
- Look for connection errors, authentication issues, or missing environment variables

**Frontend Logs** (Vercel/Render):
- Vercel: **Deployments** → **Runtime Logs**
- Render: **Static Site** → **Logs**

---

## Troubleshooting

### Backend Issues

#### 1. CORS Errors

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
- Verify `CORS_ORIGIN` environment variable matches your frontend URL
- Check if frontend URL includes trailing slash (remove it)
- Restart the backend service after updating

#### 2. Database Connection Error

**Error**: `MongoNetworkError` or `connection refused`

**Solution**:
- Verify `MONGODB_URI` is correct in environment variables
- Check MongoDB Atlas network access allows `0.0.0.0/0`
- Ensure database user has read/write permissions
- Test locally: `node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.log(e))"`

#### 3. JWT Authentication Fails

**Error**: `JsonWebTokenError` or `Cannot read property of undefined`

**Solution**:
- Verify `JWT_SECRET` is set in environment variables
- Ensure `JWT_SECRET` is the same on all instances
- Check token expiration: `JWT_EXPIRES_IN` in code

#### 4. File Uploads Not Working

**Error**: `413 Payload Too Large` or upload fails

**Solution**:
- Check Cloudinary credentials are set
- Verify file size limits in `Server/middleware/upload.js`
- Check Cloudinary account storage quota

### Frontend Issues

#### 1. Blank Page or 404

**Error**: `Cannot GET /`

**Solution**:
- Check build directory is `dist` (in Vercel/Render settings)
- Verify build command: `npm run build`
- Check `vercel.json` rewrites configuration

#### 2. API Calls Return 404

**Error**: `Cannot POST /api/auth/login`

**Solution**:
- Verify `VITE_API_URL` environment variable is set
- Check URL doesn't have trailing slash
- Test with `curl` from browser console: `fetch('${VITE_API_URL}/api/auth/login')`

#### 3. Socket.IO Connection Failed

**Error**: WebSocket connection fails

**Solution**:
- Verify backend is running and accessible
- Check if Render free tier allows WebSocket (upgrade if needed)
- Test local connection first

### General

#### Build Fails on Render/Vercel

**Solution**:
- Check **Build Logs** for specific errors
- Verify all dependencies are in `package.json`
- Run locally: `npm install && npm run build`
- Check for typos in build commands

#### Service Keeps Restarting (Backend)

**Solution**:
- Check service logs for errors
- Verify all environment variables are set
- Check MongoDB connection string
- Increase dyno/instance size (Render free tier may be insufficient)

---

## Production Checklist

- [ ] MongoDB Atlas configured with production database
- [ ] Cloudinary account set up (if using media uploads)
- [ ] Google OAuth credentials configured (if using calendar)
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel/Render
- [ ] Environment variables set on both services
- [ ] CORS_ORIGIN updated with correct frontend URL
- [ ] API URL in frontend points to production backend
- [ ] SSL certificate configured (automatic on Render/Vercel)
- [ ] All features tested in production
- [ ] Error logs monitored
- [ ] Database backups configured in MongoDB Atlas
- [ ] Rate limiting enabled (already in code)
- [ ] Security headers enabled (Helmet already in code)

---

## Useful Commands

### Local Testing Before Deployment

```bash
# Backend
cd Server
npm install
npm start  # Runs on http://localhost:3000

# Frontend (new terminal)
cd Client
npm install
npm run dev  # Runs on http://localhost:5173
```

### Reset Environment

```bash
# Clear node_modules
rm -rf node_modules
npm install

# Rebuild
npm run build
```

### View Logs Remotely

```bash
# Backend logs from Render (requires Render CLI)
render logs study-buddy-server

# Frontend logs from Vercel (requires Vercel CLI)
vercel logs
```

---

## Support

For issues:
1. Check the [Render Documentation](https://render.com/docs)
2. Check the [Vercel Documentation](https://vercel.com/docs)
3. Check [MongoDB Atlas Support](https://docs.atlas.mongodb.com)
4. Review application logs for error messages
5. Test locally to isolate issues

---

**Last Updated**: December 2025
