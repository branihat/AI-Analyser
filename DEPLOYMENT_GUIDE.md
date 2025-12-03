# Backend Deployment Guide

## ⚠️ Important: Netlify Limitation

**Netlify does NOT support Python/Flask backends.** Netlify is designed for:
- Static sites (React, Vue, etc.)
- Serverless functions (Node.js, Go only)

For your Flask backend, use one of these platforms instead:

---

## 🚀 Recommended Deployment Options

### 1. **Railway** (Easiest - Recommended) ⭐

**Why:** Simple setup, good free tier, automatic deployments

**Steps:**
1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Python and install dependencies
5. Add environment variables:
   - `GEMINI_API_KEY=your_key_here`
   - `GEMINI_MODEL=gemini-2.5-flash` (optional)
6. Railway will provide a URL like: `https://your-app.railway.app`

**Create `railway.json` (optional):**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python src/app.py",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Create `Procfile` (alternative):**
```
web: python src/app.py
```

**Update CORS in `app.py`:**
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],  # Or your frontend domain
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})
```

---

### 2. **Render** (Free Tier Available)

**Why:** Free tier, easy setup, good for Python

**Steps:**
1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** `medical-analyzer-backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r src/requirements.txt`
   - **Start Command:** `python src/app.py`
5. Add environment variables:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (optional)
6. Render provides: `https://your-app.onrender.com`

**Note:** Free tier spins down after 15 min inactivity (cold start ~30s)

---

### 3. **Fly.io** (Fast & Global)

**Why:** Fast deployments, global edge network, good free tier

**Steps:**
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Initialize: `fly launch` (in your project root)
4. Create `fly.toml`:
```toml
app = "your-app-name"
primary_region = "iad"

[build]

[env]
  GEMINI_API_KEY = "your-key"
  GEMINI_MODEL = "gemini-2.5-flash"

[http_service]
  internal_port = 5000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[services]]
  protocol = "tcp"
  internal_port = 5000
  processes = ["app"]
```

5. Deploy: `fly deploy`

---

### 4. **Heroku** (Paid, but Reliable)

**Why:** Most established, reliable, but requires paid plan

**Steps:**
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set GEMINI_API_KEY=your_key
   heroku config:set GEMINI_MODEL=gemini-2.5-flash
   ```
5. Create `Procfile`:
   ```
   web: python src/app.py
   ```
6. Deploy: `git push heroku main`

---

## 🔧 Required Code Changes for Production

### 1. Update CORS Configuration

In `src/app.py`, update CORS to allow your frontend domain:

```python
# Replace the CORS config with:
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",  # Dev
            "http://localhost:3000",   # Dev
            "https://your-frontend.netlify.app",  # Production
            "https://your-custom-domain.com"       # Custom domain
        ],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})
```

### 2. Update Flask Production Settings

Add to `src/app.py`:

```python
if __name__ == '__main__':
    # Production: Use environment variable for port
    port = int(os.environ.get('PORT', 5000))
    app.run(
        host='0.0.0.0',  # Important: bind to all interfaces
        port=port,
        debug=False  # Always False in production
    )
```

### 3. Create `runtime.txt` (for Python version)

```
python-3.11.0
```

### 4. Create `.gitignore` (if not exists)

```
.env
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
venv/
env/
.venv
```

---

## 🌐 Frontend Configuration

After deploying backend, update `src/config.ts`:

```typescript
export const API_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend.railway.app'  // Your deployed backend URL
    : 'http://localhost:5000',             // Local development
  endpoints: {
    analyze: '/api/analyze',
    health: '/api/health'
  }
};
```

Or use environment variables in Netlify:
- Go to Netlify → Site settings → Environment variables
- Add: `VITE_API_BASE_URL=https://your-backend.railway.app`

Then in `config.ts`:
```typescript
baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
```

---

## 📋 Quick Comparison

| Platform | Free Tier | Setup Difficulty | Cold Start | Best For |
|----------|-----------|------------------|------------|----------|
| **Railway** | ✅ Yes | ⭐ Easy | Fast | Quick deployment |
| **Render** | ✅ Yes | ⭐ Easy | ~30s | Free tier projects |
| **Fly.io** | ✅ Yes | ⭐⭐ Medium | Fast | Global distribution |
| **Heroku** | ❌ Paid | ⭐ Easy | Fast | Production apps |

---

## 🎯 Recommended Setup

**For Quick Start:** Use **Railway** - it's the easiest and works great for Flask apps.

**For Production:** Use **Render** or **Fly.io** for better reliability and global distribution.

---

## 🐛 Troubleshooting

### Backend not starting
- Check logs in your platform's dashboard
- Verify `PORT` environment variable is set (most platforms set this automatically)
- Ensure `host='0.0.0.0'` in Flask app

### CORS errors
- Update CORS origins to include your frontend URL
- Check browser console for specific CORS error messages

### Environment variables not working
- Verify variables are set in platform dashboard
- Restart the service after adding variables
- Check variable names match exactly (case-sensitive)

---

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Fly.io Docs](https://fly.io/docs)
- [Flask Production Deployment](https://flask.palletsprojects.com/en/latest/deploying/)

