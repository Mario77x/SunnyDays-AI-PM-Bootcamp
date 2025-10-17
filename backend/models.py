from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic models."""
    
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        from pydantic_core import core_schema
        return core_schema.no_info_plain_validator_function(cls.validate)

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str) and ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema, handler):
        field_schema.update(type="string")
        return field_schema


# User Models
class UserBase(BaseModel):
    """Base user model with common fields."""
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr


class UserCreate(UserBase):
    """User creation model."""
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    """User login model."""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """User response model (without password)."""
    id: str = Field(alias="_id")
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class UserInDB(UserBase):
    """User model as stored in database."""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Authentication Models
class Token(BaseModel):
    """JWT token response model."""
    token: str


class TokenData(BaseModel):
    """Token payload data."""
    user_id: Optional[str] = None
    email: Optional[str] = None


class LogoutResponse(BaseModel):
    """Logout response model."""
    message: str = "Logged out"


# Activity Models
class ActivityBase(BaseModel):
    """Base activity model with common fields."""
    title: str = Field(..., min_length=1, max_length=200)
    date: datetime


class ActivityCreate(ActivityBase):
    """Activity creation model."""
    pass


class ActivityUpdate(ActivityBase):
    """Activity update model."""
    pass


class ActivityResponse(ActivityBase):
    """Activity response model."""
    id: str = Field(alias="_id")
    status: str
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class ActivityInDB(ActivityBase):
    """Activity model as stored in database."""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(alias="userId")
    status: str = Field(default="draft")
    created_at: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")
    updated_at: datetime = Field(default_factory=datetime.utcnow, alias="updatedAt")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Weather Advice Models
class WeatherAdviceRequest(BaseModel):
    """Weather advice request model."""
    date: datetime
    activity: str = Field(..., min_length=1, max_length=200)


class WeatherAdviceResponse(BaseModel):
    """Weather advice response model."""
    advice: str = Field(..., pattern="^(yes|no)$")
    explanation: str
    source: str = Field(..., pattern="^(cache|live)$")


class WeatherAdviceInDB(BaseModel):
    """Weather advice model as stored in database."""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    request_date: datetime
    activity: str
    weather_data_summary: dict
    llm_advice: str = Field(..., pattern="^(yes|no)$")
    llm_explanation: str
    created_at: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Error Models
class ErrorResponse(BaseModel):
    """Standard error response model."""
    error: str