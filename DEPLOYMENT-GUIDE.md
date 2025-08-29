# BusinessFlow Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
- The code is already committed and pushed to GitHub: https://github.com/diogoalves25/businessflow-saas
- You'll need a Vercel account (free at https://vercel.com)

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/new
   - Sign in with your GitHub account

2. **Import Git Repository**
   - Click "Import Git Repository"
   - Select `businessflow-saas` from your repositories
   - Or paste: `https://github.com/diogoalves25/businessflow-saas`

3. **Configure Project**
   - Project Name: `businessflow-saas`
   - Framework Preset: Next.js (should auto-detect)
   - Root Directory: `./`
   - Build Command: `prisma generate && next build` (already configured in vercel.json)
   - Output Directory: `.next` (default)

4. **Environment Variables**
   - Add `DATABASE_URL` with value: `file:./businessflow.db`
   - This is already configured in vercel.json but you can override if needed

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 1-2 minutes)

### Option 2: Deploy via CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   When prompted:
   - Set up and deploy: Y
   - Which scope: Select your account
   - Link to existing project? N
   - What's your project's name? businessflow-saas
   - In which directory is your code located? ./
   - Want to modify settings? N

### Option 3: Deploy with this button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdiogoalves25%2Fbusinessflow-saas&project-name=businessflow-saas&repository-name=businessflow-saas&env=DATABASE_URL&envDescription=Database%20connection%20string&envLink=https%3A%2F%2Fgithub.com%2Fdiogoalves25%2Fbusinessflow-saas)

## 🔗 Expected URLs

After deployment, you'll get:
- Production URL: `https://businessflow-saas.vercel.app`
- Or a custom URL like: `https://businessflow-saas-[username].vercel.app`

## 🎯 Post-Deployment Steps

1. **Test the Application**
   - Visit your deployment URL
   - Click "Get Started" to access the business type selection
   - Select a business type and name
   - Explore the admin dashboard
   - Test the booking form

2. **Custom Domain (Optional)**
   - In Vercel dashboard, go to Settings → Domains
   - Add your custom domain

3. **Environment Variables (if needed)**
   - Go to Settings → Environment Variables
   - Add any additional configuration

## 📝 What's Included

- ✅ Multi-business support (10 business types)
- ✅ Dynamic service offerings
- ✅ Business-specific branding
- ✅ Admin dashboard
- ✅ Customer booking form
- ✅ SQLite database (file-based)
- ✅ Responsive design

## 🔄 Updates

To deploy updates:
```bash
git add .
git commit -m "Your update message"
git push origin master
```

Vercel will automatically rebuild and deploy!