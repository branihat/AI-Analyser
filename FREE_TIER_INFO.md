# Gemini API Free Tier Information

## ✅ Current Configuration: FREE

Your app is configured to use **FREE tier Gemini models**:

### Free Models Available:
- ✅ **`gemini-2.5-flash`** (Current - Recommended)
  - Latest free flash model
  - Fast and efficient
  - Good for medical analysis
  
- ✅ **`gemini-2.0-flash`** (Alternative)
  - Stable free model
  - Also fast and reliable
  
- ✅ **`gemini-flash-latest`** (Auto-updates)
  - Always uses the latest free flash model
  - Good for staying current

### Free Tier Limits:
- **Rate Limits**: 15 requests per minute (RPM)
- **Daily Quota**: 1,500 requests per day
- **No Credit Card Required**: Completely free
- **No Expiration**: Free tier is permanent

### What's NOT Free:
- ❌ `gemini-2.5-pro` - Paid model ($1.25-$10 per million tokens)
- ❌ `gemini-3-pro` - Paid model
- ❌ Any "pro" models (except older gemini-pro which may have limited free tier)

## Current Setup

Your `.env` file is configured with:
```
GEMINI_MODEL=gemini-2.5-flash  # ✅ FREE
```

## Rate Limit Handling

If you exceed the free tier limits, you'll get a 429 (Too Many Requests) error. The app will handle this gracefully.

## To Use a Different Free Model

Edit `.env`:
```bash
# Option 1: Latest free model (auto-updates)
GEMINI_MODEL=gemini-flash-latest

# Option 2: Stable free model
GEMINI_MODEL=gemini-2.0-flash

# Option 3: Newest free model (current)
GEMINI_MODEL=gemini-2.5-flash
```

Then restart Flask to apply changes.

## Summary

✅ **You're using a FREE model**  
✅ **No payment required**  
✅ **Suitable for development and moderate usage**  
✅ **1,500 requests/day is plenty for testing**

