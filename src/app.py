"""
Sample Flask Backend for Medical Analyzer
This is a reference implementation showing how to integrate with the React frontend.
Copy the relevant parts to your existing Flask app.
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import logging
import re
from typing import Dict, Any, List
from pathlib import Path

import requests
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

app = Flask(__name__, static_folder='static/dist')
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
# Using free tier model: gemini-2.5-flash (or gemini-2.0-flash, gemini-flash-latest)
# All "flash" models are FREE tier with generous rate limits
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')
GEMINI_ENDPOINT = f'https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent'

# Log configuration on startup
if GEMINI_API_KEY:
    logger.info(f"Gemini API configured with model: {GEMINI_MODEL}")
else:
    logger.warning("GEMINI_API_KEY not found in environment variables")

ALLOWED_ORGANS = {
    'brain', 'sinuses', 'throat', 'lungs', 'bronchi',
    'heart', 'liver', 'stomach', 'kidney', 'kidneys',
    'intestine', 'intestines', 'pancreas', 'bladder'
}

# CORS Configuration
# For development: Allow requests from React dev server
# For production: Restrict to your domain
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:5173", "http://localhost:5000"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})


@app.route('/api/analyze', methods=['POST'])
def analyze():
    """
    Analyze patient symptoms using AI
    
    Request Body:
        {
            "patient_name": "John Doe",
            "doctor_name": "Dr. Smith",
            "description": "Patient symptoms and medical history..."
        }
    
    Response:
        {
            "diagnosis": "Disease name",
            "supporting_organs": ["organ1", "organ2"],
            "explanation": "Detailed explanation",
            "confidence": 85,
            "severity": "medium",
            "recommendations": ["rec1", "rec2"]
        }
    """
    try:
        # Parse request data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        patient_name = data.get('patient_name', '').strip()
        doctor_name = data.get('doctor_name', '').strip()
        description = data.get('description', '').strip()
        
        # Validate required fields
        if not all([patient_name, doctor_name, description]):
            return jsonify({
                'error': 'Missing required fields: patient_name, doctor_name, description'
            }), 400
        
        if not GEMINI_API_KEY:
            raise RuntimeError('GEMINI_API_KEY environment variable is not set')

        result = analyze_symptoms(patient_name, doctor_name, description)
        return jsonify(result), 200
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return jsonify({'error': f'Invalid data: {str(e)}'}), 400
    except RuntimeError as e:
        logger.error(f"Configuration error: {str(e)}")
        return jsonify({'error': str(e)}), 500
    except requests.exceptions.RequestException as e:
        logger.error(f"API request error: {str(e)}")
        return jsonify({'error': f'Failed to connect to analysis service: {str(e)}'}), 500
    except Exception as e:
        logger.exception(f"Unexpected error in analyze endpoint: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


def analyze_symptoms(patient_name: str, doctor_name: str, description: str) -> Dict[str, Any]:
    """
    Analyze clinical description and identify affected organs with issues.
    Focus on accurate organ detection for body visualization.
    """
    prompt = f"""You are a medical AI assistant. Analyze this clinical description and identify affected organs.

Clinical Description:
{description}

CRITICAL: You must respond with ONLY valid JSON, no other text.

Return this exact JSON structure:
{{
  "diagnosis": "Brief diagnosis name (2-5 words)",
  "supporting_organs": ["organ1", "organ2"],
  "organ_details": {{
    "organ1": "Short specific issue affecting this organ (5-10 words max)",
    "organ2": "Short specific issue affecting this organ (5-10 words max)"
  }},
  "explanation": "Short explanation of the condition and affected organs (2-3 sentences)",
  "severity": "low",
  "confidence": 85,
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}}

ORGAN RULES:
- supporting_organs must ONLY include organs from this exact list: brain, sinuses, throat, lungs, bronchi, heart, liver, stomach, kidney, intestine, pancreas, bladder
- Use singular forms: "kidney" not "kidneys", "intestine" not "intestines"
- Only include organs that are clearly mentioned or implied in the clinical description
- Be specific: if lungs are mentioned, include "lungs" and possibly "bronchi"

SEVERITY RULES:
- "low": mild symptoms, routine care
- "medium": moderate symptoms, requires monitoring
- "high": severe symptoms, urgent care needed

ORGAN DETAILS RULES:
- For EACH organ in supporting_organs, provide a short, specific issue description
- Keep it brief: 5-10 words maximum per organ
- Be specific: "Inflammation and congestion" not just "Affected"
- Focus on the actual problem: "Reduced oxygen exchange", "Increased heart rate", "Inflammation"

EXAMPLES:
Input: "Patient has chest pain and difficulty breathing"
Output: {{
  "diagnosis": "Respiratory Distress",
  "supporting_organs": ["lungs", "heart"],
  "organ_details": {{
    "lungs": "Reduced oxygen exchange and breathing difficulty",
    "heart": "Elevated heart rate and potential cardiac stress"
  }},
  "explanation": "Chest pain and breathing difficulty suggest potential cardiac or respiratory involvement.",
  "severity": "high",
  "confidence": 80,
  "recommendations": ["Immediate cardiac evaluation", "Chest X-ray", "ECG monitoring"]
}}

Input: "Patient reports headache and sinus pressure"
Output: {{
  "diagnosis": "Sinusitis",
  "supporting_organs": ["sinuses", "brain"],
  "organ_details": {{
    "sinuses": "Inflammation and congestion causing pressure",
    "brain": "Referred pain from sinus inflammation"
  }},
  "explanation": "Headache and sinus pressure indicate sinus inflammation affecting the sinuses and potentially causing referred head pain.",
  "severity": "low",
  "confidence": 85,
  "recommendations": ["Nasal decongestants", "Pain relief medication", "Steam inhalation"]
}}

Now analyze this clinical description:
{description}
"""

    logger.info(f"Analyzing clinical description for patient: {patient_name}")
    model_response = call_gemini_api(prompt)
    sanitized = sanitize_model_response(model_response, description)
    logger.info(f"Analysis complete. Organs detected: {sanitized['supporting_organs']}")
    return sanitized


def call_gemini_api(prompt: str) -> Dict[str, Any]:
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "topP": 0.8,
            "topK": 40
        }
    }

    try:
        response = requests.post(
            GEMINI_ENDPOINT,
            params={"key": GEMINI_API_KEY},
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.HTTPError as e:
        error_detail = "Unknown error"
        try:
            error_data = response.json()
            error_detail = error_data.get('error', {}).get('message', str(e))
        except:
            error_detail = f"HTTP {response.status_code}: {str(e)}"
        logger.error(f"Gemini API HTTP error: {error_detail}")
        raise RuntimeError(f"Analysis service error: {error_detail}") from e
    except requests.exceptions.Timeout:
        logger.error("Gemini API request timed out")
        raise RuntimeError("Analysis service timeout. Please try again.") from None
    except requests.exceptions.ConnectionError as e:
        logger.error(f"Gemini API connection error: {str(e)}")
        raise RuntimeError("Failed to connect to analysis service. Please check your internet connection.") from e

    try:
        raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError) as exc:
        logger.error("Unexpected Gemini response structure: %s", json.dumps(data, indent=2))
        raise RuntimeError("Invalid response from analysis model") from exc

    # Clean the response text
    cleaned_text = raw_text.strip()
    
    # Remove markdown code blocks if present
    if cleaned_text.startswith("```"):
        parts = cleaned_text.split("```")
        if len(parts) >= 2:
            cleaned_text = parts[1]
            # Remove "json" prefix if present
            if cleaned_text.startswith("json"):
                cleaned_text = cleaned_text[4:]
    cleaned_text = cleaned_text.strip()
    
    # Try to find JSON object in the text if it's embedded in other text
    json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', cleaned_text, re.DOTALL)
    if json_match:
        cleaned_text = json_match.group(0)

    try:
        parsed = json.loads(cleaned_text)
        logger.info("Successfully parsed Gemini response")
        return parsed
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse Gemini JSON. Raw text: %s", cleaned_text[:500])
        # Try to extract basic info as fallback
        raise RuntimeError(f"Model returned invalid JSON. Please try again. Error: {str(exc)}") from exc


def sanitize_model_response(model_data: Dict[str, Any], description: str) -> Dict[str, Any]:
    diagnosis = model_data.get('diagnosis') or 'Diagnosis unavailable'
    organs = sanitize_organs(model_data.get('supporting_organs', []))
    explanation = model_data.get('explanation') or 'No detailed explanation provided.'
    severity = (model_data.get('severity') or determine_severity(description)).lower()
    if severity not in {'low', 'medium', 'high'}:
        severity = determine_severity(description)

    confidence = model_data.get('confidence')
    try:
        confidence = int(confidence)
    except (TypeError, ValueError):
        confidence = None
    if confidence is not None:
        confidence = max(0, min(100, confidence))

    recommendations = model_data.get('recommendations') or []
    if not isinstance(recommendations, list):
        recommendations = [str(recommendations)]
    recommendations = [str(rec).strip() for rec in recommendations if str(rec).strip()]

    # Sanitize organ_details - map to normalized organ names
    organ_details_raw = model_data.get('organ_details', {})
    organ_details = {}
    if isinstance(organ_details_raw, dict):
        # Map organ details to normalized organ names
        for raw_organ, detail in organ_details_raw.items():
            if isinstance(detail, str) and detail.strip():
                # Normalize the organ name and map the detail
                normalized_organs = sanitize_organs([raw_organ])
                if normalized_organs:
                    normalized_organ = normalized_organs[0]
                    # Keep the shortest detail if multiple organs map to same normalized name
                    if normalized_organ not in organ_details or len(detail) < len(organ_details[normalized_organ]):
                        organ_details[normalized_organ] = detail.strip()[:100]  # Limit to 100 chars

    return {
        'diagnosis': diagnosis,
        'supporting_organs': organs,
        'organ_details': organ_details,
        'explanation': explanation,
        'confidence': confidence,
        'severity': severity,
        'recommendations': recommendations[:5],
    }


def determine_severity(description):
    """
    Determine severity based on symptoms description
    
    Args:
        description: Patient symptoms description
        
    Returns:
        str: 'low', 'medium', or 'high'
    """
    # TODO: Implement your severity determination logic
    # This is a simple example - replace with your actual logic
    
    description_lower = description.lower()
    
    high_severity_keywords = [
        'severe', 'acute', 'emergency', 'critical', 'intense pain',
        'difficulty breathing', 'chest pain', 'unconscious'
    ]
    
    medium_severity_keywords = [
        'moderate', 'persistent', 'recurring', 'chronic', 'fever'
    ]
    
    # Check for high severity
    if any(keyword in description_lower for keyword in high_severity_keywords):
        return 'high'
    
    # Check for medium severity
    if any(keyword in description_lower for keyword in medium_severity_keywords):
        return 'medium'
    
    # Default to low
    return 'low'


def sanitize_organs(organs: List[str]) -> List[str]:
    """
    Normalize organ names coming from the model so they match the frontend visualization.
    Maps to the exact organ names used in OrganSvg.tsx
    """
    if not isinstance(organs, list):
        return []

    # Map to frontend organ keys (must match ORGAN_CLIP_IDS in OrganSvg.tsx)
    alias_map = {
        # Brain
        'brain': 'brain',
        # Respiratory
        'lungs': 'lungs',
        'lung': 'lungs',
        'bronchi': 'bronchi',
        'bronchus': 'bronchi',
        'sinuses': 'sinuses',
        'sinus': 'sinuses',
        'throat': 'throat',
        # Cardiovascular
        'heart': 'heart',
        # Digestive
        'liver': 'liver',
        'stomach': 'stomach',
        'kidney': 'kidney',
        'kidneys': 'kidney',
        'intestine': 'intestine',
        'intestines': 'intestine',
        'pancreas': 'pancreas',
        # Urinary
        'bladder': 'bladder',
    }

    normalized = []
    for organ in organs:
        if not isinstance(organ, str):
            continue
        key = organ.strip().lower()
        mapped = alias_map.get(key)
        if mapped:
            normalized.append(mapped)
        else:
            logger.warning(f"Unknown organ name from model: {organ}")

    # Keep ordering but de-dupe
    seen = set()
    deduped = []
    for organ in normalized:
        if organ not in seen:
            deduped.append(organ)
            seen.add(organ)
    
    logger.info(f"Sanitized organs: {deduped}")
    return deduped


# Serve React App (for production)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    """
    Serve the React build files
    This allows the Flask app to serve both API and frontend
    """
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'medical-analyzer-api',
        'version': '1.0.0'
    }), 200


if __name__ == '__main__':
    # Development server
    print("=" * 60)
    print("Medical Analyzer Flask Backend")
    print("=" * 60)
    print(f"API endpoint: http://localhost:5000/api/analyze")
    print(f"Health check: http://localhost:5000/api/health")
    print(f"Frontend (after build): http://localhost:5000")
    print("")
    if GEMINI_API_KEY:
        print(f"✓ Gemini API configured (Model: {GEMINI_MODEL})")
    else:
        print("✗ WARNING: GEMINI_API_KEY not found!")
        print("  Please set it in .env file or environment variables")
    print("=" * 60)
    print("")
    
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )
