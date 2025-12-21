# backend/app/auth/routes.py
"""
Authentication endpoints
- POST /api/auth/init-users - Create demo users
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from backend.app import db
from backend.app.models import User

# Create blueprint FIRST
auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/init-users', methods=['POST'])
def init_users():
    """
    Initialize demo users (run ONCE)
    
    POST /api/auth/init-users
    """
    
    # Check if users already exist
    if User.query.first():
        return jsonify({"error": "Users already initialized"}), 400
    
    # Demo users
    demo_users = [
        {'username': 'admin', 'password': 'admin123', 'role': 'admin'},
        {'username': 'proc_mgr', 'password': 'proc123', 'role': 'procurement_manager'},
        {'username': 'sust_mgr', 'password': 'sust123', 'role': 'sustainability_manager'},
    ]
    
    # Create users
    for user_data in demo_users:
        user = User(
            username=user_data['username'],
            role=user_data['role']
        )
        user.set_password(user_data['password'])
        db.session.add(user)
    
    db.session.commit()
    
    return jsonify({"message": "users created"}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User login
    
    POST /api/auth/login
    Body: {"username": "admin", "password": "admin123"}
    """
    
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"error": "Missing username or password"}), 400
    
    user = User.query.filter_by(username=data.get('username')).first()
    
    if user and user.check_password(data.get('password')):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            "access_token": access_token,
            "role": user.role
        }), 200
    
    return jsonify({"error": "Invalid credentials"}), 401


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get current user info
    
    GET /api/auth/me
    Header: Authorization: Bearer <token>
    """
    
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401
