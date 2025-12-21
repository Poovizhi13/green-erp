# backend/run.py
"""
Entry point - starts Flask development server
Run this file to start the backend

Command: python run.py
"""

import os
import sys

# Add parent directory to Python path so we can import backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app

app = create_app(config_name=os.environ.get('FLASK_ENV', 'development'))

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
