# Quick Fix for 500 Error

## Problem
The Flask server is using an outdated Gemini model name that's no longer available.

## Solution

**Restart your Flask server** to load the updated `.env` file:

1. **Stop the current Flask server** (press `Ctrl+C` in the terminal where it's running)

2. **Restart Flask:**
   ```bash
   python src/app.py
   ```

3. **Verify it's using the correct model:**
   You should see in the startup logs:
   ```
   ✓ Gemini API configured (Model: gemini-2.0-flash)
   ```

4. **Test the API:**
   ```bash
   python test_api.py
   ```

## What Changed

- Updated model from `gemini-1.5-pro` → `gemini-2.0-flash`
- `.env` file updated
- `app.py` updated with correct default model

The new model (`gemini-2.0-flash`) is:
- ✅ Available in the Gemini API
- ✅ Fast and efficient
- ✅ Supports generateContent method
- ✅ Good for medical analysis tasks

## After Restart

Once Flask restarts, try submitting a form in the React app. The 500 error should be resolved and you should see:
- ✅ Successful analysis
- ✅ Organs highlighted on the body visualization
- ✅ Diagnosis and recommendations displayed

