# backend/app/reports/routes.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db 
from backend.app.models import User, Item, PurchaseOrder, PurchaseOrderItem, Supplier
from sqlalchemy import func

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/emissions-by-item', methods=['GET'])
@jwt_required()
def emissions_by_item():
    """GET /api/reports/emissions-by-item"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'sustainability_manager']:
        return jsonify({"error": "Unauthorized"}), 403
    
    items = Item.query.all()
    
    data = []
    for item in items:
        po_items = PurchaseOrderItem.query.filter_by(item_id=item.id).all()
        total_co2 = sum(poi.line_co2 for poi in po_items)
        
        data.append({
            'item_id': item.id,
            'item_name': item.name,
            'sku': item.sku,
            'co2_per_unit': item.co2_per_unit,
            'total_co2_from_orders': total_co2
        })
    
    return jsonify(data), 200

@reports_bp.route('/emissions-by-supplier', methods=['GET'])
@jwt_required()
def emissions_by_supplier():
    """GET /api/reports/emissions-by-supplier"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'sustainability_manager']:
        return jsonify({"error": "Unauthorized"}), 403
    
    orders = PurchaseOrder.query.all()
    
    supplier_emissions = {}
    for order in orders:
        supplier_id = order.supplier_id
        if supplier_id not in supplier_emissions:
            supplier_emissions[supplier_id] = {
                'supplier_name': order.supplier.name,
                'total_co2': 0,
                'order_count': 0
            }
        supplier_emissions[supplier_id]['total_co2'] += order.total_co2
        supplier_emissions[supplier_id]['order_count'] += 1
    
    data = [
        {'supplier_id': k, **v}
        for k, v in supplier_emissions.items()
    ]
    
    return jsonify(data), 200

@reports_bp.route('/ai-recommendations', methods=['GET'])
@jwt_required()
def ai_recommendations():
    """🤖 AI Module - FIXED VERSION"""
    
    # ✅ SIMPLIFIED: Get ANY orders with emissions
    orders_with_emissions = db.session.query(PurchaseOrder).filter(
        PurchaseOrder.total_co2 > 0
    ).order_by(PurchaseOrder.total_co2.desc()).limit(3).all()
    
    recommendations = []
    for order in orders_with_emissions:
        reco = {
            'high_emission_item': f"Order #{order.id} ({order.supplier.name})",
            'total_co2': float(order.total_co2 or 0),
            'suggestions': [
                "✅ Switch to low-CO2 suppliers",
                "✅ Review high-emission purchase orders", 
                f"✅ Target 20% reduction ({order.total_co2*0.2:.1f} kg CO2e)"
            ],
            'potential_savings': float(order.total_co2 * 0.3)
        }
        recommendations.append(reco)
    
    # ✅ If no orders, show generic advice
    if not recommendations:
        recommendations = [{
            'high_emission_item': 'No Data Yet',
            'total_co2': 0,
            'suggestions': [
                "📈 Create purchase orders to unlock AI insights",
                "✅ Add items with CO2 factors first",
                "💡 AI analyzes your real procurement data"
            ],
            'potential_savings': 0
        }]
    
    return jsonify({
        'recommendations': recommendations,
        'ai_score': len(orders_with_emissions) * 20  # Dynamic score
    }), 200
