# backend/app/__init__.py - Main Flask application factory
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from backend.config import Config  # Import config

# Global database and JWT objects
db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    """Create and configure Flask app"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    
    # Register API modules (will add more later)
    from app.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # Create database tables (only in development)
    with app.app_context():
        db.create_all()
    
    return app
