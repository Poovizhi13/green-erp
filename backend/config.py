# backend/config.py
import os
from datetime import timedelta

# Get the absolute path to the instance folder
BASEDIR = os.path.abspath(os.path.dirname(__file__))
INSTANCE_PATH = os.path.join(BASEDIR, 'instance')

# Create instance folder if it doesn't exist
os.makedirs(INSTANCE_PATH, exist_ok=True)

class Config:
    """Base configuration for Flask app."""
    
    # Database: Use absolute path to instance folder
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(INSTANCE_PATH, "green_erp.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'dev-secret-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # App settings
    JSON_SORT_KEYS = False

class DevelopmentConfig(Config):
    """Development environment."""
    DEBUG = True
    TESTING = False

class TestingConfig(Config):
    """Testing environment."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

class ProductionConfig(Config):
    """Production environment."""
    DEBUG = False
    TESTING = False

# Default config
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
