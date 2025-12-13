# Deployment Guide for Study Buddy

This project is configured for easy deployment on [Render](https://render.com) using a Blueprint (Infrastructure as Code).

## Prerequisites
- A GitHub account.
- A [Render](https://render.com) account.
- A MongoDB database (e.g., MongoDB Atlas).

## 1. Preparation
Ensure your latest changes are pushed to GitHub:
```bash
git add .
git commit -m "ready for deployment"
git push
```

## 2. Deploy to Render
1.  Log in to the [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** and select **Blueprint**.
3.  Connect your `study-buddy` repository.
4.  **Service Name**: Give your blueprint a service name (e.g., `study-buddy-app`).
5.  **Environment Variables**: Render will detect `render.yaml` and ask for the following variables:

    | Variable | Description | Example |
    | :--- | :--- | :--- |
    | `MONGODB_URI` | Your production MongoDB connection string. | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
    | `JWT_SECRET` | A secure random string for signing tokens. | `some-very-secret-key-123` |
    | `CORS_ORIGIN` | The URL of your **Frontend**. * | `https://study-buddy-client.onrender.com` |

    > * **Note on CORS_ORIGIN**: Since the Frontend URL is generated *after* the service is created, you may not know it yet. You can initially set this to `*` (allow all) or leave it blank and update it later in the Render Dashboard (Dashboard > Server Service > Environment).

6.  Click **Apply**. Render will start building both your Backend and Frontend services.

## 3. Post-Deployment
Once the services are live:
1.  **Get Frontend URL**: Copy the URL of your new Static Site (Frontend).
2.  **Update Backend Config**: If you didn't set `CORS_ORIGIN` correctly during setup, go to your **Backend Service** > **Environment** and update `CORS_ORIGIN` with your Frontend URL.
3.  **Verify**: Open your Frontend URL and test the login/register flow.

## Project Structure on Render
- **Backend (Web Service)**:
    - Root Directory: `Server`
    - Build Command: `npm install`
    - Start Command: `node index.js`
- **Frontend (Static Site)**:
    - Root Directory: `Client`
    - Build Command: `npm install && npm run build`
    - Publish Directory: `dist`
