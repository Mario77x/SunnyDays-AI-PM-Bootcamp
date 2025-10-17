from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from models import UserCreate, UserLogin, UserResponse, Token, LogoutResponse, ErrorResponse
from database import get_user_database
from auth_utils import verify_password, get_password_hash, create_user_token
from middleware import require_auth
import logging

logger = logging.getLogger(__name__)

# Create the authentication router
router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


@router.post("/signup", response_model=Token, responses={400: {"model": ErrorResponse}})
async def signup(user_data: UserCreate):
    """
    Register a new user.
    
    - **name**: User's full name
    - **email**: User's email address (must be unique)
    - **password**: User's password (minimum 6 characters)
    
    Returns a JWT token for immediate authentication.
    """
    try:
        user_db = get_user_database()
        
        # Check if email already exists
        if await user_db.email_exists(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash the password
        hashed_password = get_password_hash(user_data.password)
        
        # Create the user
        created_user = await user_db.create_user(user_data, hashed_password)
        
        # Generate JWT token
        token = create_user_token(str(created_user.id), created_user.email)
        
        logger.info(f"New user registered: {created_user.email}")
        return Token(token=token)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during signup"
        )


@router.post("/login", response_model=Token, responses={401: {"model": ErrorResponse}})
async def login(user_credentials: UserLogin):
    """
    Authenticate a user and return a JWT token.
    
    - **email**: User's email address
    - **password**: User's password
    
    Returns a JWT token for authentication.
    """
    try:
        user_db = get_user_database()
        
        # Get user by email
        user = await user_db.get_user_by_email(user_credentials.email)
        
        # Check if user exists and password is correct
        if not user or not verify_password(user_credentials.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Generate JWT token
        token = create_user_token(str(user.id), user.email)
        
        logger.info(f"User logged in: {user.email}")
        return Token(token=token)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )


@router.post("/logout", response_model=LogoutResponse)
async def logout(current_user=Depends(require_auth)):
    """
    Log out the current user.
    
    Note: Since we're using stateless JWT tokens, this endpoint primarily serves
    as a confirmation. The client should discard the token on their end.
    In a production environment, you might want to implement token blacklisting.
    """
    logger.info(f"User logged out: {current_user.email}")
    return LogoutResponse(message="Logged out")


@router.get("/me", response_model=UserResponse, responses={401: {"model": ErrorResponse}})
async def get_current_user_info(current_user=Depends(require_auth)):
    """
    Get the current authenticated user's information.
    
    Returns the user's profile information (without password).
    """
    try:
        return UserResponse(
            id=str(current_user.id),
            name=current_user.name,
            email=current_user.email
        )
    except Exception as e:
        logger.error(f"Error getting user info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving user information"
        )