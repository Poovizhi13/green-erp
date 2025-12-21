# backend/app/__init__.py
"""
Flask app factory - creates and configures the Flask application.
All blueprints (auth, items, suppliers, etc.) are registered here.
"""

import sys
import os

# Add parent directories to path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(backend_dir))

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from backend.config import config

# Create database and JWT objects
db = SQLAlchemy()
jwt = JWTManager()


def create_app(config_name='development'):
    """
    Application factory function.
    Creates Flask app, registers database, JWT, and blueprints.
    
    Args:
        config_name (str): 'development', 'testing', or 'production'
    
    Returns:
        Flask app instance
    """
    
    # Create Flask app
    app = Flask(__name__)
    
    # Load configuration from config.py
    app.config.from_object(config[config_name])
    
    # Enable CORS (allow frontend to communicate)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize SQLAlchemy with this app
    db.init_app(app)
    
    # Initialize JWT with this app
    jwt.init_app(app)
    
    # JWT error handlers
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {
            'code': 'invalid_token',
            'msg': 'The token is invalid'
        }, 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {
            'code': 'authorization_required',
            'msg': 'Request does not contain an access token'
        }, 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {
            'code': 'token_expired',
            'msg': 'The token has expired'
        }, 401
    
    # Create all database tables in app context
    with app.app_context():
        # Import models here (AFTER db is initialized)
        from backend.app.models import User, Item, Supplier, PurchaseOrder, PurchaseOrderItem
        
        # Create all tables if they don't exist
        db.create_all()
    
    # Register blueprints (route groups)
    # Format: app.register_blueprint(blueprint, url_prefix='/api/endpoint')
    from backend.app.auth.routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    from backend.app.items.routes import items_bp
    app.register_blueprint(items_bp, url_prefix='/api/items')
    
    from backend.app.suppliers.routes import suppliers_bp
    app.register_blueprint(suppliers_bp, url_prefix='/api/suppliers')
    
    from backend.app.procurement.routes import procurement_bp
    app.register_blueprint(procurement_bp, url_prefix='/api/purchase-orders')
    
    from backend.app.reports.routes import reports_bp
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    
    # Health check endpoint (no authentication needed)
    @app.route('/ping', methods=['GET'])
    def ping():
        """Simple health check."""
        return {"message": "pong"}, 200
    
    return app
