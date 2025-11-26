# Quick Start Guide - Flask Integration

## 🚀 Quick Setup (5 minutes)

### Step 1: Update Your Flask Backend

Add this endpoint to your existing Flask app:

```python
from flask_cors import CORS

# Enable CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    
    # Your existing Gemini analysis code here
    result = your_gemini_function(
        data.get('patient_name'),
        data.get('doctor_name'), 
        data.get('description')
    )
    
    # Return in this format:
    return jsonify({
        'diagnosis': result['diagnosis'],
        'supporting_organs': result['organs'],  # lowercase: ['lungs', 'throat', etc]
        'explanation': result['explanation'],
        'confidence': result['confidence'],  # 0-100
        'severity': 'medium',  # 'low', 'medium', or 'high'
        'recommendations': result['recommendations']  # array of strings
    })
```

### Step 2: Install Flask CORS

```bash
pip install flask-cors
```

### Step 3: Update Frontend Config

Edit `/config.ts`:

```typescript
export const API_CONFIG = {
  baseUrl: 'http://localhost:5000',  // Your Flask URL
  endpoints: {
    analyze: '/api/analyze'
  }
};
```

Or create a `.env` file (optional):

```env
VITE_API_URL=http://localhost:5000
```

### Step 4: Start Both Servers

**Terminal 1 - Flask Backend:**
```bash
python app.py
```

**Terminal 2 - React Frontend:**
```bash
npm install  # First time only
npm run dev
```

**Access the app at:** http://localhost:5173

---

## 📋 API Response Format

Your Flask `/api/analyze` endpoint must return:

```json
{
  "diagnosis": "Upper Respiratory Tract Infection",
  "supporting_organs": ["lungs", "throat", "sinuses"],
  "explanation": "Patient presents with...",
  "confidence": 85,
  "severity": "medium",
  "recommendations": [
    "Rest and hydration",
    "Monitor temperature"
  ]
}
```

### Valid Organ Names (lowercase):
- `brain`, `sinuses`, `throat`, `lungs`, `bronchi`
- `heart`, `liver`, `stomach`, `kidneys`
- `intestines`, `bladder`

---

## 🧪 Test Your API

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "John Doe",
    "doctor_name": "Dr. Smith",
    "description": "Persistent cough, fever, nasal congestion"
  }'
```

---

## 🚢 Production Deployment

### 1. Build React App
```bash
npm run build
```

### 2. Copy to Flask
```bash
# Create static folder in your Flask app
mkdir -p /path/to/flask-app/static/dist
cp -r dist/* /path/to/flask-app/static/dist/
```

### 3. Update Flask to Serve React
```python
from flask import send_from_directory

app = Flask(__name__, static_folder='static/dist')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')
```

### 4. Update Config for Production
```typescript
// config.ts
export const API_CONFIG = {
  baseUrl: '',  // Same origin - no URL needed
  endpoints: {
    analyze: '/api/analyze'
  }
};
```

### 5. Run Flask
```bash
python app.py
# Access at http://localhost:5000
```

---

## 🐛 Troubleshooting

### CORS Error
```
Access to fetch at 'http://localhost:5000/api/analyze' has been blocked by CORS
```
**Fix:** Install and configure flask-cors (see Step 2)

### API Not Found (404)
**Fix:** Check that Flask is running and the endpoint path is correct

### Data Not Showing
**Fix:** Check browser console, verify API response format matches expected structure

### Network Error
**Fix:** Ensure Flask is running on the correct port (5000 by default)

---

## 📚 Files Reference

- `config.ts` - API endpoint configuration
- `App.tsx` - Main app with API integration
- `FLASK_INTEGRATION.md` - Detailed integration guide
- `sample_flask_app.py` - Reference Flask implementation
- `requirements.txt` - Python dependencies

---

## ✅ Integration Checklist

- [ ] Flask CORS installed and configured
- [ ] `/api/analyze` endpoint created
- [ ] Endpoint returns correct JSON format
- [ ] Organ names are lowercase
- [ ] config.ts has correct Flask URL
- [ ] Both servers running
- [ ] Test form submission works
- [ ] Results display correctly
- [ ] Dark/Light mode works
- [ ] Save image works

---

## 🔗 Additional Resources

- Full integration details: See `FLASK_INTEGRATION.md`
- Sample Flask app: See `sample_flask_app.py`
- React components: See `/components` folder

---

Need help? Check the detailed guide in `FLASK_INTEGRATION.md` or review the sample Flask app.