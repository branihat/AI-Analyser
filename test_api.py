#!/usr/bin/env python3
"""
Quick test script to verify the API is working
"""
import requests
import json

def test_health():
    """Test the health endpoint"""
    try:
        response = requests.get('http://localhost:5000/api/health', timeout=5)
        print(f"✓ Health check: {response.status_code}")
        print(f"  Response: {response.json()}")
        return True
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to Flask server")
        print("  Make sure Flask is running: python src/app.py")
        return False
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return False

def test_analyze():
    """Test the analyze endpoint"""
    test_data = {
        "patient_name": "Test Patient",
        "doctor_name": "Dr. Test",
        "description": "Patient reports chest pain and difficulty breathing. Heart rate elevated."
    }
    
    try:
        print("\nTesting analyze endpoint...")
        response = requests.post(
            'http://localhost:5000/api/analyze',
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=60
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✓ Analysis successful!")
            print(f"  Diagnosis: {result.get('diagnosis')}")
            print(f"  Organs: {result.get('supporting_organs')}")
            print(f"  Severity: {result.get('severity')}")
            return True
        else:
            print(f"✗ Analysis failed")
            try:
                error = response.json()
                print(f"  Error: {error.get('error', 'Unknown error')}")
            except:
                print(f"  Response: {response.text[:200]}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to Flask server")
        return False
    except Exception as e:
        print(f"✗ Test failed: {e}")
        return False

if __name__ == '__main__':
    print("=" * 60)
    print("Medical Analyzer API Test")
    print("=" * 60)
    
    if test_health():
        test_analyze()
    else:
        print("\nPlease start the Flask server first:")
        print("  python src/app.py")

