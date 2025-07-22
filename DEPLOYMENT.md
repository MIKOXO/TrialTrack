# 🚀 Deployment Guide

## Overview
- **Frontend**: React app deployed on Netlify
- **Backend**: Node.js/Express API deployed on Vercel  
- **Database**: MongoDB Atlas (Cloud)

## 📋 Prerequisites

1. **GitHub Repository** - Push your code to GitHub
2. **MongoDB Atlas Account** - Create at [mongodb.com/atlas](https://mongodb.com/atlas)
3. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
4. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)

## 🗄️ Step 1: Setup MongoDB Atlas

1. **Create Cluster**:
   - Go to MongoDB Atlas
   - Create a new cluster (free tier is fine)
   - Choose a cloud provider and region

2. **Create Database User**:
   - Go to Database Access
   - Add a new database user
   - Choose password authentication
   - Save username and password

3. **Configure Network Access**:
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allow from anywhere)
   - Or add specific IPs for better security

4. **Get Connection String**:
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## 🖥️ Step 2: Deploy Backend (Vercel)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set **Root Directory** to `server`
   - Configure environment variables:

3. **Environment Variables** (Add in Vercel dashboard):
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/court-management
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   NODE_ENV=production
   CORS_ORIGIN=https://your-app.netlify.app
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your Vercel app URL (e.g., `https://your-backend.vercel.app`)

## 📱 Step 3: Deploy Frontend (Netlify)

1. **Update Environment**:
   - Create `client/.env.production`:
   ```
   REACT_APP_API_URL=https://your-backend.vercel.app/api
   ```

2. **Deploy on Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose your GitHub repository
   - Configure build settings:
     - **Base directory**: `client`
     - **Build command**: `npm run build`
     - **Publish directory**: `client/build`

3. **Environment Variables** (Add in Netlify dashboard):
   ```
   REACT_APP_API_URL=https://your-backend.vercel.app/api
   ```

4. **Deploy**:
   - Click "Deploy site"
   - Wait for deployment to complete
   - Copy your Netlify app URL

## 🔄 Step 4: Update CORS

1. **Update Backend Environment**:
   - Go to Vercel dashboard
   - Update `CORS_ORIGIN` environment variable:
   ```
   CORS_ORIGIN=https://your-app.netlify.app,http://localhost:3000
   ```

2. **Redeploy Backend**:
   - Trigger a new deployment in Vercel

## ✅ Step 5: Test Deployment

1. **Visit your Netlify URL**
2. **Test all functionality**:
   - User registration/login
   - Case creation
   - Document upload
   - Hearing scheduling
   - All user roles (Admin, Judge, Client)

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Check CORS_ORIGIN environment variable
   - Ensure frontend URL is correct

2. **Database Connection**:
   - Verify MongoDB Atlas connection string
   - Check network access settings

3. **Environment Variables**:
   - Ensure all required variables are set
   - Check for typos in variable names

4. **Build Errors**:
   - Check build logs in Netlify/Vercel
   - Ensure all dependencies are in package.json

## 📝 Post-Deployment

1. **Custom Domain** (Optional):
   - Add custom domain in Netlify
   - Update CORS_ORIGIN accordingly

2. **SSL Certificate**:
   - Both Netlify and Vercel provide free SSL
   - Ensure HTTPS is working

3. **Monitoring**:
   - Monitor application performance
   - Check error logs regularly

## 🎉 You're Live!

Your court management system is now deployed and accessible worldwide!

- **Frontend**: https://your-app.netlify.app
- **Backend**: https://your-backend.vercel.app
- **Database**: MongoDB Atlas Cloud
