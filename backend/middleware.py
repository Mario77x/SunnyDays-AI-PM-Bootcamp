from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from models import UserInDB
from auth_utils import verify_token
from database import get_user_database
import logging

logger = logging.getLogger(__name__)

# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserInDB:
    """
    Dependency to get the current authenticated user.
    This will be used to protect routes that require authentication.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Extract token from credentials
        token = credentials.credentials
        
        # Verify and decode the token
        token_data = verify_token(token)
        if token_data is None or token_data.user_id is None:
            raise credentials_exception
            
    except Exception as e:
        logger.error(f"Token validation error: {e}")
        raise credentials_exception
    
    # Get user from database
    user_db = get_user_database()
    user = await user_db.get_user_by_id(token_data.user_id)
    
    if user is None:
        raise credentials_exception
        
    return user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[UserInDB]:
    """
    Optional dependency to get the current authenticated user.
    Returns None if no valid token is provided, instead of raising an exception.
    """
    if credentials is None:
        return None
    
    try:
        # Extract token from credentials
        token = credentials.credentials
        
        # Verify and decode the token
        token_data = verify_token(token)
        if token_data is None or token_data.user_id is None:
            return None
            
        # Get user from database
        user_db = get_user_database()
        user = await user_db.get_user_by_id(token_data.user_id)
        
        return user
        
    except Exception as e:
        logger.error(f"Optional token validation error: {e}")
        return None


def require_auth(user: UserInDB = Depends(get_current_user)) -> UserInDB:
    """
    Dependency that requires authentication.
    Use this as a dependency in routes that need authentication.
    """
    return user