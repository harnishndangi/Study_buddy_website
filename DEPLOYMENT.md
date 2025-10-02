# Deployment Guide

## Vercel Deployment

### Prerequisites
1. GitHub repository with your code
2. Vercel account
3. MongoDB Atlas database
4. Cloudinary account (for file uploads)

### Environment Variables Required in Vercel

Add these in your Vercel project settings under "Environment Variables":

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/study-buddy
JWT_SECRET=your_secure_random_string_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PORT=5000
NODE_ENV=production
CLIENT_URL=https://yourdomain.vercel.app
```

### Deployment Steps

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import project in Vercel**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Root directory: `./`
   - Framework Preset: Other

3. **Configure Build Settings**
   - Build Command: (leave default, vercel.json handles this)
   - Output Directory: (leave default)
   - Install Command: `npm install --prefix Client && npm install --prefix Server`

4. **Add Environment Variables**
   - Add all variables from `.env.example`
   - Make sure to add them for Production, Preview, and Development

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Post-Deployment

1. **Update Client API URL**
   - In `Client/src` files, update API base URL to your Vercel backend URL
   - Redeploy if needed

2. **Test Functionality**
   - Test authentication
   - Test note creation
   - Test task management
   - Test Pomodoro timer
   - Test file uploads

### Troubleshooting

**Build fails with "vite: command not found"**
- Ensure `vercel.json` is at the root directory
- Check that vite is in Client's devDependencies

**Database connection fails**
- Verify MONGO_URI is correct
- Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Ensure IP whitelist includes Vercel's IPs

**CORS errors**
- Ensure CLIENT_URL environment variable matches your frontend URL
- Check CORS configuration in Server/index.js

**Socket.io not working**
- Vercel has limitations with WebSockets
- Consider using Vercel's Edge Functions or deploy backend to Railway/Render

### Alternative: Split Deployment

For better Socket.io support:
- Deploy Client to Vercel
- Deploy Server to Railway/Render/Heroku
- Update Client API URLs to point to separate backend
