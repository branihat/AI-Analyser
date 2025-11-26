# Backend Setup Guide

## Quick Start

1. **Install Python dependencies:**
   ```bash
   pip install -r src/requirements.txt
   ```

2. **Verify .env file exists:**
   The `.env` file should already be created with your Gemini API key.

3. **Start the Flask backend:**
   ```bash
   python src/app.py
   ```

   You should see:
   ```
   ============================================================
   Medical Analyzer Flask Backend
   ============================================================
   API endpoint: http://localhost:5000/api/analyze
   Health check: http://localhost:5000/api/health
   Frontend (after build): http://localhost:5000
   
   ✓ Gemini API configured (Model: gemini-1.5-pro)
   ============================================================
   ```

4. **Test the health endpoint:**
   ```bash
   curl http://localhost:5000/api/health
   ```

## Workflow

1. **User Input:** User enters clinical description in the React frontend
2. **API Call:** Frontend sends POST request to `/api/analyze` with:
   - `patient_name`
   - `doctor_name`
   - `description` (clinical notes)
3. **Gemini Analysis:** Backend sends description to Gemini API
4. **Response:** Gemini returns:
   - Diagnosis
   - Affected organs (mapped to visualization)
   - Explanation
   - Severity level
   - Recommendations
5. **Visualization:** Frontend highlights organs on the body SVG

## Troubleshooting

### 500 Internal Server Error

1. **Check Flask console logs** - Look for error messages
2. **Verify API key:** Check that `.env` file has `GEMINI_API_KEY` set
3. **Check dependencies:** Run `pip install -r src/requirements.txt`
4. **Test Gemini API directly:** Check if your API key is valid

### Organs Not Highlighting

- Check that organ names match: `brain`, `heart`, `lungs`, `liver`, `stomach`, `kidney`, `intestine`, `pancreas`, `sinuses`, `throat`, `bronchi`, `bladder`
- Check browser console for errors
- Verify the response includes `supporting_organs` array

## API Response Format

```json
{
  "diagnosis": "Condition Name",
  "supporting_organs": ["organ1", "organ2"],
  "explanation": "Brief explanation",
  "severity": "low|medium|high",
  "confidence": 85,
  "recommendations": ["Rec 1", "Rec 2", "Rec 3"]
}
```

