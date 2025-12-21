# backend/app/procurement/routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app import db
from backend.app.models import User, PurchaseOrder, PurchaseOrderItem, Item

procurement_bp = Blueprint('procurement', __name__)

@procurement_bp.route('', methods=['GET'])
@jwt_required()
def get_purchase_orders():
    """GET /api/purchase-orders"""
    orders = PurchaseOrder.query.all()
    return jsonify([o.to_dict() for o in orders]), 200

@procurement_bp.route('', methods=['POST'])
@jwt_required()
def create_purchase_order():
    """POST /api/purchase-orders"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'procurement_manager']:
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.get_json()
    
    if not data.get('supplier_id') or not data.get('items'):
        return jsonify({"error": "Supplier ID and items required"}), 400
    
    order = PurchaseOrder(
        supplier_id=data.get('supplier_id'),
        created_by_user_id=user_id,
        status=data.get('status', 'draft')
    )
    
    total_amount = 0
    total_co2 = 0
    
    for item_data in data.get('items', []):
        item = Item.query.get(item_data['item_id'])
        
        if not item:
            continue
        
        quantity = item_data.get('quantity', 1)
        unit_price = item_data.get('unit_price', 0)
        line_co2 = quantity * item.co2_per_unit
        
        po_item = PurchaseOrderItem(
            item_id=item.id,
            quantity=quantity,
            unit_price=unit_price,
            line_co2=line_co2
        )
        
        order.items.append(po_item)
        total_amount += quantity * unit_price
        total_co2 += line_co2
    
    order.total_amount = total_amount
    order.total_co2 = total_co2
    
    db.session.add(order)
    db.session.commit()
    
    return jsonify(order.to_dict()), 201

@procurement_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_purchase_order(order_id):
    """GET /api/purchase-orders/<id>"""
    order = PurchaseOrder.query.get_or_404(order_id)
    return jsonify(order.to_dict()), 200

@procurement_bp.route('/<int:order_id>', methods=['PUT'])
@jwt_required()
def update_purchase_order(order_id):
    """PUT /api/purchase-orders/<id>"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'procurement_manager']:
        return jsonify({"error": "Unauthorized"}), 403
    
    order = PurchaseOrder.query.get_or_404(order_id)
    data = request.get_json()
    
    new_status = data.get('status', order.status)
    
    # If status changes to 'received', update item stock
    if new_status == 'received' and order.status != 'received':
        for po_item in order.items:
            item = Item.query.get(po_item.item_id)
            if item:
                item.stock += po_item.quantity
    
    order.status = new_status
    db.session.commit()
    
    return jsonify(order.to_dict()), 200
