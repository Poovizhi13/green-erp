# backend/app/suppliers/routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app import db
from backend.app.models import User, Supplier

suppliers_bp = Blueprint('suppliers', __name__)

@suppliers_bp.route('', methods=['GET'])
@jwt_required()
def get_suppliers():
    """GET /api/suppliers"""
    suppliers = Supplier.query.all()
    return jsonify([s.to_dict() for s in suppliers]), 200

@suppliers_bp.route('', methods=['POST'])
@jwt_required()
def create_supplier():
    """POST /api/suppliers"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'procurement_manager']:
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({"error": "Name required"}), 400
    
    supplier = Supplier(
        name=data.get('name'),
        contact_email=data.get('contact_email'),
        phone=data.get('phone'),
        address=data.get('address'),
        sustainability_score=data.get('sustainability_score', 0.0),
        certifications=data.get('certifications')
    )
    
    db.session.add(supplier)
    db.session.commit()
    
    return jsonify(supplier.to_dict()), 201

@suppliers_bp.route('/<int:supplier_id>', methods=['GET'])
@jwt_required()
def get_supplier(supplier_id):
    """GET /api/suppliers/<id>"""
    supplier = Supplier.query.get_or_404(supplier_id)
    return jsonify(supplier.to_dict()), 200

@suppliers_bp.route('/<int:supplier_id>', methods=['PUT'])
@jwt_required()
def update_supplier(supplier_id):
    """PUT /api/suppliers/<id>"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'procurement_manager']:
        return jsonify({"error": "Unauthorized"}), 403
    
    supplier = Supplier.query.get_or_404(supplier_id)
    data = request.get_json()
    
    supplier.name = data.get('name', supplier.name)
    supplier.contact_email = data.get('contact_email', supplier.contact_email)
    supplier.phone = data.get('phone', supplier.phone)
    supplier.address = data.get('address', supplier.address)
    supplier.sustainability_score = data.get('sustainability_score', supplier.sustainability_score)
    supplier.certifications = data.get('certifications', supplier.certifications)
    
    db.session.commit()
    
    return jsonify(supplier.to_dict()), 200

@suppliers_bp.route('/<int:supplier_id>', methods=['DELETE'])
@jwt_required()
def delete_supplier(supplier_id):
    """DELETE /api/suppliers/<id>"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    supplier = Supplier.query.get_or_404(supplier_id)
    db.session.delete(supplier)
    db.session.commit()
    
    return jsonify({"message": "Supplier deleted"}), 200
