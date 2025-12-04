# 🚀 Quick Deployment Guide

## Frontend + Backend Deployment Summary

### Step 1: Deploy Backend (Choose One)

#### Option A: Railway (Recommended - Easiest)
1. Go to [railway.app](https://railway.app) → Sign up
2. New Project → Deploy from GitHub
3. Select your repo
4. Add environment variable: `GEMINI_API_KEY=your_key`
5. Done! Get your backend URL: `https://your-app.railway.app`

#### Option B: Render
1. Go to [render.com](https://render.com) → Sign up
2. New → Web Service → Connect GitHub
3. Build: `pip install -r src/requirements.txt`
4. Start: `python src/app.py`
5. Add `GEMINI_API_KEY` environment variable

---

### Step 2: Deploy Frontend to Netlify

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to Netlify**
   - Visit [app.netlify.com](https://app.netlify.com)
   - Sign up/Login with GitHub

3. **Import Project**
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub → Select your repository

4. **Build Settings** (Auto-detected, but verify):
   - Build command: `npm run build`
   - Publish directory: `dist`

5. **Environment Variables**
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL=https://your-backend.railway.app`
   - (Replace with your actual backend URL from Step 1)

6. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Your site is live! 🎉

---

### Step 3: Update Backend CORS

Update `src/app.py` CORS configuration to include your Netlify domain:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",  # Dev
            "http://localhost:3000",  # Dev
            "https://your-app.netlify.app",  # Production
        ],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})
```

Then redeploy your backend.

---

## ✅ Verification Checklist

- [ ] Backend is deployed and accessible
- [ ] Backend health check works: `https://your-backend.railway.app/api/health`
- [ ] Frontend is deployed to Netlify
- [ ] `VITE_API_URL` is set in Netlify environment variables
- [ ] Backend CORS includes Netlify domain
- [ ] Test the app on production URL
- [ ] API calls work correctly

---

## 🧪 Test Locally First

Before deploying, test your production build:

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Visit `http://localhost:4173` to test.

---

## 📝 Environment Variables Reference

### Backend (Railway/Render)
- `GEMINI_API_KEY` - Your Google Gemini API key
- `GEMINI_MODEL` - Optional, defaults to `gemini-2.5-flash`
- `PORT` - Auto-set by platform (don't set manually)

### Frontend (Netlify)
- `VITE_API_URL` - Your backend URL (e.g., `https://your-app.railway.app`)

---

## 🔗 Your URLs After Deployment

- **Frontend:** `https://your-app.netlify.app`
- **Backend:** `https://your-app.railway.app`
- **Backend Health:** `https://your-app.railway.app/api/health`
- **Backend API:** `https://your-app.railway.app/api/analyze`

---

## 🐛 Common Issues

### Frontend can't connect to backend
- ✅ Check `VITE_API_URL` is set correctly in Netlify
- ✅ Verify backend is running (check health endpoint)
- ✅ Update backend CORS to include Netlify domain
- ✅ Check browser console for errors

### Build fails on Netlify
- ✅ Check build logs in Netlify dashboard
- ✅ Verify `package.json` has all dependencies
- ✅ Ensure Node version is compatible (20+)

### CORS errors
- ✅ Update backend CORS origins
- ✅ Redeploy backend after CORS changes
- ✅ Check backend logs for CORS errors

---

## 📚 Detailed Guides

- **Backend Deployment:** See `DEPLOYMENT_GUIDE.md`
- **Frontend Deployment:** See `FRONTEND_DEPLOYMENT.md`

---

## 🎉 You're Done!

Your Medical AI Analyzer is now live on the internet!

- Frontend: Netlify (free, fast, automatic deployments)
- Backend: Railway/Render (free tier available)

Every time you push to GitHub, both will automatically redeploy! 🚀

