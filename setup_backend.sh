#!/bin/bash
# Setup script for Flask backend

echo "Setting up Medical Analyzer Backend..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r src/requirements.txt

echo ""
echo "Setup complete!"
echo ""
echo "To start the backend server:"
echo "  1. Activate virtual environment: source venv/bin/activate"
echo "  2. Run: python src/app.py"
echo ""
echo "The .env file has been created with your Gemini API key."
echo "Make sure to keep it secure and never commit it to version control."

