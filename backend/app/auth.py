# backend/app/auth.py
from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from backend.app.models import User
from backend.app import db

bp = Blueprint("auth", __name__)

@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        token = create_access_token(identity=user.id)
        return jsonify({"access_token": token, "role": user.role}), 200

    return jsonify({"error": "Invalid credentials"}), 401

@bp.route("/init-users", methods=["POST"])
def init_users():
    """One-time route to create demo users."""
    from backend.app.models import User
    from werkzeug.security import generate_password_hash

    # clear old users
    User.query.delete()
    db. session.commit()

    users_data = [
        ("admin", "admin123", "admin"),
        ("proc_mgr", "proc123", "procurement_manager"),
        ("sust_mgr", "sust123", "sustainability_manager"),
    ]

    for username, password, role in users_data:
        user = User(
            username=username,
            password_hash=generate_password_hash(password),
            role=role,
        )
        db.session.add(user)

    db.session.commit()
    return jsonify({"message": "users created"}), 201
