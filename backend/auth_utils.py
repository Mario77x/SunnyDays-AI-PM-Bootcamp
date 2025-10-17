from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
from models import TokenData
import logging

logger = logging.getLogger(__name__)

# Password hashing context using Argon2
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_SECONDS = int(os.getenv("JWT_EXPIRES_IN", 3600))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Error verifying password: {e}")
        return False


def get_password_hash(password: str) -> str:
    """Hash a password using Argon2."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    if not SECRET_KEY:
        raise ValueError("JWT_SECRET environment variable is not set")
    
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(seconds=ACCESS_TOKEN_EXPIRE_SECONDS)
    
    to_encode.update({"exp": expire})
    
    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    except Exception as e:
        logger.error(f"Error creating access token: {e}")
        raise


def verify_token(token: str) -> Optional[TokenData]:
    """Verify and decode a JWT token."""
    if not SECRET_KEY:
        raise ValueError("JWT_SECRET environment variable is not set")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        
        if user_id is None:
            return None
            
        token_data = TokenData(user_id=user_id, email=email)
        return token_data
    except JWTError as e:
        logger.error(f"JWT verification error: {e}")
        return None
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        return None


def create_user_token(user_id: str, email: str) -> str:
    """Create a JWT token for a user."""
    token_data = {
        "sub": user_id,
        "email": email
    }
    return create_access_token(token_data)