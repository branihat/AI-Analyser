# Frontend Deployment Guide

## 🚀 Deploy to Netlify (Recommended)

Netlify is perfect for React/Vite frontends and offers free hosting with automatic deployments.

---

## 📋 Prerequisites

1. **Backend deployed** (Railway, Render, or Fly.io)
2. **GitHub repository** with your code
3. **Netlify account** (free at [netlify.com](https://netlify.com))

---

## 🎯 Step-by-Step: Netlify Deployment

### Method 1: Deploy via Netlify Dashboard (Easiest)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to Netlify**
   - Visit [app.netlify.com](https://app.netlify.com)
   - Sign up/Login (can use GitHub account)

3. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select your repository

4. **Configure Build Settings**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** `20` (or latest LTS)

5. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add:
     ```
     VITE_API_URL=https://your-backend.railway.app
     ```
     (Replace with your actual backend URL)

6. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy automatically
   - Your site will be live at: `https://random-name.netlify.app`

7. **Custom Domain (Optional)**
   - Go to Domain settings
   - Add your custom domain
   - Follow DNS configuration instructions

---

### Method 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   ```

3. **Initialize Netlify**
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Select your team
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Set Environment Variables**
   ```bash
   netlify env:set VITE_API_URL https://your-backend.railway.app
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

---

## ⚙️ Configuration Files

### 1. `netlify.toml` (Already Created)

This file configures Netlify build settings:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Why:** The redirect rule ensures React Router works correctly (all routes serve `index.html`).

### 2. Environment Variables

Create `.env.production` for local testing:

```env
VITE_API_URL=https://your-backend.railway.app
```

**Important:** 
- Never commit `.env.production` to Git (it's in `.gitignore`)
- Set variables in Netlify dashboard for production

### 3. Update `vite.config.ts`

The config is already set up correctly:
- Build output: `dist` folder
- React plugin configured
- Path aliases set

---

## 🔧 Alternative Platforms

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts
4. Set environment variable: `VITE_API_URL`

### GitHub Pages

1. Install: `npm install --save-dev gh-pages`
2. Add to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Run: `npm run deploy`

### Cloudflare Pages

1. Connect GitHub repo to Cloudflare Pages
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variable: `VITE_API_URL`

---

## ✅ Pre-Deployment Checklist

- [ ] Backend is deployed and accessible
- [ ] `VITE_API_URL` environment variable is set
- [ ] Build command works locally: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] CORS is configured on backend for your frontend domain
- [ ] All environment variables are set in Netlify dashboard
- [ ] `.env` files are in `.gitignore`

---

## 🧪 Testing Production Build Locally

Before deploying, test your production build:

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Visit `http://localhost:4173` to test.

---

## 🔍 Troubleshooting

### Build Fails

**Error: Module not found**
- Run: `npm install` to ensure all dependencies are installed
- Check `package.json` for missing dependencies

**Error: Environment variable not found**
- Verify `VITE_API_URL` is set in Netlify dashboard
- Restart build after adding variables

### API Calls Fail After Deployment

**CORS Error:**
- Update backend CORS to include your Netlify domain:
  ```python
  origins = [
      "https://your-app.netlify.app",
      "https://your-custom-domain.com"
  ]
  ```

**404 on API calls:**
- Verify `VITE_API_URL` is correct (no trailing slash)
- Check backend is running and accessible
- Test backend URL directly: `https://your-backend.railway.app/api/health`

### Routing Issues (404 on refresh)

- Ensure `netlify.toml` has the redirect rule (already included)
- Verify `publish` directory is `dist`

### Images/Assets Not Loading

- Check paths use relative URLs (not absolute)
- Verify assets are in `public/` folder
- Clear Netlify cache: Site settings → Build & deploy → Clear cache

---

## 🔄 Continuous Deployment

Netlify automatically deploys when you push to GitHub:

1. **Automatic Deploys:**
   - Push to `main` branch → Production deploy
   - Push to other branches → Preview deploy

2. **Deploy Contexts:**
   - Production: `main` branch
   - Branch deploys: Other branches
   - Deploy previews: Pull requests

3. **Build Hooks:**
   - Go to Site settings → Build & deploy → Build hooks
   - Create a webhook URL for manual triggers

---

## 📊 Monitoring

### Netlify Analytics (Optional)

1. Go to Site settings → Analytics
2. Enable Netlify Analytics (paid feature)
3. Or use free alternatives:
   - Google Analytics
   - Plausible Analytics
   - Umami

### Error Tracking

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Or Netlify's built-in error logs

---

## 🎨 Performance Optimization

### Already Configured:
- ✅ Vite for fast builds
- ✅ Code splitting
- ✅ Tree shaking

### Additional Optimizations:

1. **Image Optimization:**
   - Use WebP format
   - Lazy load images
   - Use `vite-plugin-imagemin` for compression

2. **Bundle Analysis:**
   ```bash
   npm install --save-dev vite-bundle-visualizer
   ```
   Add to `vite.config.ts`:
   ```typescript
   import { visualizer } from 'vite-bundle-visualizer';
   
   plugins: [
     react(),
     visualizer({ open: true })
   ]
   ```

---

## 📝 Quick Reference

### Netlify Commands

```bash
# Deploy to production
netlify deploy --prod

# Deploy preview
netlify deploy

# View logs
netlify logs

# Open site
netlify open
```

### Environment Variables

```bash
# Set variable
netlify env:set VITE_API_URL https://your-backend.railway.app

# List variables
netlify env:list

# Get variable
netlify env:get VITE_API_URL
```

---

## 🎯 Next Steps After Deployment

1. ✅ Test all features on production URL
2. ✅ Verify API calls work
3. ✅ Check mobile responsiveness
4. ✅ Set up custom domain (optional)
5. ✅ Enable HTTPS (automatic on Netlify)
6. ✅ Configure redirects if needed
7. ✅ Set up monitoring/analytics

---

## 📚 Additional Resources

- [Netlify Docs](https://docs.netlify.com)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router Deployment](https://reactrouter.com/en/main/start/deploying)

---

## 🆘 Need Help?

Common issues:
- Check Netlify build logs
- Verify environment variables
- Test backend URL directly
- Check browser console for errors
- Review CORS configuration

