# backend/app/models/__init__.py
"""
Database models - represents tables in the database
"""

from backend.app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    """User table - stores login credentials"""
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='sustainability_manager')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def set_password(self, password):
        """Hash password before storing"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert to dictionary for JSON responses"""
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }


class Item(db.Model):
    """Item table - inventory products"""
    
    __tablename__ = 'items'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    sku = db.Column(db.String(50), unique=True, nullable=False)
    category = db.Column(db.String(80), nullable=False)
    unit = db.Column(db.String(20), nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)
    reorder_level = db.Column(db.Integer, nullable=False, default=10)
    co2_per_unit = db.Column(db.Float, nullable=False, default=0.0)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'sku': self.sku,
            'category': self.category,
            'unit': self.unit,
            'stock': self.stock,
            'reorder_level': self.reorder_level,
            'co2_per_unit': self.co2_per_unit,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }


class Supplier(db.Model):
    """Supplier table - vendors"""
    
    __tablename__ = 'suppliers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    contact_email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    address = db.Column(db.String(255))
    sustainability_score = db.Column(db.Float, default=0.0)
    certifications = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'contact_email': self.contact_email,
            'phone': self.phone,
            'address': self.address,
            'sustainability_score': self.sustainability_score,
            'certifications': self.certifications,
            'created_at': self.created_at.isoformat()
        }


class PurchaseOrder(db.Model):
    """Purchase Order table - orders to suppliers"""
    
    __tablename__ = 'purchase_orders'
    
    id = db.Column(db.Integer, primary_key=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=False)
    created_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='draft')
    order_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    total_amount = db.Column(db.Float, nullable=False, default=0.0)
    total_co2 = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    supplier = db.relationship('Supplier', backref='purchase_orders')
    created_by_user = db.relationship('User', backref='purchase_orders')
    items = db.relationship('PurchaseOrderItem', backref='purchase_order', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'supplier_id': self.supplier_id,
            'supplier_name': self.supplier.name if self.supplier else None,
            'created_by_user_id': self.created_by_user_id,
            'status': self.status,
            'order_date': self.order_date.isoformat(),
            'total_amount': self.total_amount,
            'total_co2': self.total_co2,
            'items': [item.to_dict() for item in self.items],
            'created_at': self.created_at.isoformat()
        }


class PurchaseOrderItem(db.Model):
    """Purchase Order Item table - line items in orders"""
    
    __tablename__ = 'purchase_order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    purchase_order_id = db.Column(db.Integer, db.ForeignKey('purchase_orders.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    line_co2 = db.Column(db.Float, nullable=False, default=0.0)
    
    item = db.relationship('Item', backref='purchase_order_items')
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'purchase_order_id': self.purchase_order_id,
            'item_id': self.item_id,
            'item_name': self.item.name if self.item else None,
            'quantity': self.quantity,
            'unit_price': self.unit_price,
            'line_co2': self.line_co2,
            'line_total': self.quantity * self.unit_price
        }
