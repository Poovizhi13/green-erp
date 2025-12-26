# backend/app/items/routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app import db
from backend.app.models import User, Item

items_bp = Blueprint('items', __name__)

@items_bp.route('', methods=['GET'])
@jwt_required()
def get_items():
    """GET /api/items - List all items"""
    items = Item.query.all()
    return jsonify([item.to_dict() for item in items]), 200

@items_bp.route('', methods=['POST'])
@jwt_required()
def create_item():
    """POST /api/items - Create new item"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'procurement_manager']:
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.get_json()
    
    if not data.get('name') or not data.get('sku'):
        return jsonify({"error": "Name and SKU required"}), 400
    
    item = Item(
        name=data.get('name'),
        sku=data.get('sku'),
        category=data.get('category', ''),
        unit=data.get('unit', ''),
        stock=data.get('stock', 0),
        reorder_level=data.get('reorder_level', 10),
        co2_per_unit=data.get('co2_per_unit', 0.0),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(item)
    db.session.commit()
    
    return jsonify(item.to_dict()), 201

@items_bp.route('/<int:item_id>', methods=['GET'])
@jwt_required()
def get_item(item_id):
    """GET /api/items/<id> - Get single item"""
    item = Item.query.get_or_404(item_id)
    return jsonify(item.to_dict()), 200

@items_bp.route('/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_item(item_id):
    """PUT /api/items/<id> - Update item"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'procurement_manager']:
        return jsonify({"error": "Unauthorized"}), 403
    
    item = Item.query.get_or_404(item_id)
    data = request.get_json()
    
    item.name = data.get('name', item.name)
    item.category = data.get('category', item.category)
    item.unit = data.get('unit', item.unit)
    item.stock = data.get('stock', item.stock)
    item.reorder_level = data.get('reorder_level', item.reorder_level)
    item.co2_per_unit = data.get('co2_per_unit', item.co2_per_unit)
    item.is_active = data.get('is_active', item.is_active)
    
    db.session.commit()
    
    return jsonify(item.to_dict()), 200

@items_bp.route('/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_item(item_id):
    """DELETE /api/items/<id> - Delete item"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    item = Item.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({"message": "Item deleted"}), 200
