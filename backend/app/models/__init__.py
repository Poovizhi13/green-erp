# backend/app/models/__init__.py
from backend.app import db
from werkzeug.security import generate_password_hash

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(
        db.Enum("admin", "procurement_manager", "sustainability_manager"),
        nullable=False,
    )
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)
