# Flask Integration Guide

## Overview
This guide helps you integrate the React Medical Analyzer frontend with your Flask backend.

## Backend Requirements

### 1. Flask App Structure
```
your-flask-app/
├── app.py                 # Main Flask application
├── static/
│   └── dist/             # Build output from React app (after running build)
│       ├── index.html
│       ├── assets/
│       └── ...
├── requirements.txt
└── ...
```

### 2. Flask Backend Setup

#### Install Required Packages
```bash
pip install flask flask-cors
```

#### app.py Example
```python
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='static/dist')

# Enable CORS for development (adjust origins for production)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:5173"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """
    Expected request body:
    {
        "patient_name": "John Doe",
        "doctor_name": "Dr. Smith",
        "description": "Patient symptoms description..."
    }
    
    Expected response:
    {
        "diagnosis": "Upper Respiratory Tract Infection",
        "supporting_organs": ["lungs", "throat", "sinuses"],
        "explanation": "Detailed medical explanation...",
        "confidence": 85,
        "severity": "medium",
        "recommendations": ["Rest", "Hydration", "Monitor temperature"]
    }
    """
    try:
        data = request.get_json()
        
        # Extract data
        patient_name = data.get('patient_name')
        doctor_name = data.get('doctor_name')
        description = data.get('description')
        
        if not all([patient_name, doctor_name, description]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # TODO: Your Gemini API integration here
        # Call your existing analyze function
        result = your_analyze_function(patient_name, doctor_name, description)
        
        # Map to expected format
        response = {
            'diagnosis': result.get('diagnosis', 'Unknown'),
            'supporting_organs': result.get('organs', []),
            'explanation': result.get('explanation', ''),
            'confidence': result.get('confidence', 0),
            'severity': determine_severity(result),  # 'low', 'medium', or 'high'
            'recommendations': result.get('recommendations', [])
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"Error in analyze endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500


def determine_severity(result):
    """
    Determine severity based on confidence and diagnosis
    Returns: 'low', 'medium', or 'high'
    """
    confidence = result.get('confidence', 0)
    
    # Your logic here
    if confidence >= 80:
        return 'high'
    elif confidence >= 50:
        return 'medium'
    else:
        return 'low'


# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
```

### 3. Development Setup

#### Option A: Separate Dev Servers (Recommended for Development)

1. **Start Flask Backend**:
```bash
python app.py
# Runs on http://localhost:5000
```

2. **Start React Dev Server** (in this directory):
```bash
npm run dev
# Runs on http://localhost:5173
```

3. **Update config.ts**:
```typescript
export const API_CONFIG = {
  baseUrl: 'http://localhost:5000',  // Flask backend URL
  endpoints: {
    analyze: '/api/analyze'
  }
};
```

#### Option B: Production Build

1. **Build React App**:
```bash
npm run build
```

2. **Copy build to Flask**:
```bash
cp -r dist/* /path/to/your-flask-app/static/dist/
```

3. **Run Flask**:
```bash
python app.py
# Access at http://localhost:5000
```

4. **Update config.ts for production**:
```typescript
export const API_CONFIG = {
  baseUrl: '',  // Same origin, no need for full URL
  endpoints: {
    analyze: '/api/analyze'
  }
};
```

### 4. API Response Format

Your Flask endpoint should return JSON in this format:

```json
{
  "diagnosis": "Upper Respiratory Tract Infection (URTI)",
  "supporting_organs": ["lungs", "throat", "sinuses", "bronchi"],
  "explanation": "Patient presents with classic symptoms...",
  "confidence": 87,
  "severity": "medium",
  "recommendations": [
    "Supportive care with adequate hydration",
    "Monitor temperature and breathing patterns",
    "Watch for signs of bacterial superinfection",
    "Follow-up if symptoms worsen after 5 days"
  ]
}
```

#### Field Descriptions:
- **diagnosis** (string, required): Primary diagnosis text
- **supporting_organs** (array, required): List of affected organs/systems (lowercase)
  - Valid values: "brain", "sinuses", "throat", "lungs", "bronchi", "heart", "liver", "stomach", "kidneys", "intestines", "bladder"
- **explanation** (string, required): Detailed clinical explanation
- **confidence** (number, optional): 0-100 confidence score
- **severity** (string, required): "low", "medium", or "high"
- **recommendations** (array, required): List of clinical recommendations

### 5. CORS Configuration

For production, update CORS settings:

```python
# Development
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Production
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://yourdomain.com"],
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})
```

### 6. Environment Variables

Create a `.env` file in the React project:

```env
# Development
VITE_API_URL=http://localhost:5000

# Production
# VITE_API_URL=https://your-production-domain.com
```

**Note:** In Vite, environment variables must be prefixed with `VITE_` to be exposed to the client.

### 7. Testing the Integration

Use curl to test your API:

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "John Doe",
    "doctor_name": "Dr. Smith",
    "description": "Patient has persistent cough, fever of 101°F, and nasal congestion for 3 days."
  }'
```

### 8. Error Handling

The frontend handles these error cases:
- Network errors (Flask not running)
- HTTP errors (4xx, 5xx status codes)
- API errors (error field in response)
- Missing/invalid data

Make sure your Flask app returns proper error responses:

```python
# Example error response
return jsonify({
    'error': 'Invalid patient data provided'
}), 400
```

### 9. Deployment Checklist

- [ ] Update `config.ts` with production URL
- [ ] Build React app: `npm run build`
- [ ] Copy build files to Flask static folder
- [ ] Configure CORS for production domain
- [ ] Set up proper error logging
- [ ] Test all API endpoints
- [ ] Enable HTTPS
- [ ] Set up environment variables
- [ ] Configure rate limiting (if needed)
- [ ] Set up monitoring/analytics

### 10. Troubleshooting

**CORS Errors**:
- Ensure Flask-CORS is installed and configured
- Check that origin URL matches exactly (including protocol and port)

**API Not Found**:
- Verify Flask is running on the correct port
- Check API_CONFIG.baseUrl in config.ts
- Ensure /api/analyze route exists in Flask

**Data Not Displaying**:
- Check browser console for errors
- Verify API response format matches expected structure
- Check organ names match the visualization (lowercase)

**Build Issues**:
- Clear build cache: `rm -rf dist && npm run build`
- Ensure static folder path is correct in Flask

## Need Help?

Check the browser console and Flask logs for detailed error messages.