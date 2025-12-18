# backend/config.py - App configuration settings
import os
from dotenv import load_dotenv

load_dotenv()  # Load secrets from .env file

class Config:
    """Main configuration class"""
    # Database connection string
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Performance optimization
    
    # Security keys for JWT tokens and sessions
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
