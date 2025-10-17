from motor.motor_asyncio import AsyncIOMotorDatabase
from models import UserInDB, UserCreate, ActivityInDB, ActivityCreate, ActivityUpdate, WeatherAdviceInDB
from typing import Optional, List
from bson import ObjectId
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class UserDatabase:
    """Database operations for users."""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        self.db = database
        self.collection = database.users
    
    async def create_user(self, user_data: UserCreate, hashed_password: str) -> UserInDB:
        """Create a new user in the database."""
        user_dict = {
            "name": user_data.name,
            "email": user_data.email,
            "password": hashed_password,
        }
        
        # Create UserInDB instance to get the created_at timestamp
        user_in_db = UserInDB(**user_dict)
        
        # Insert into database
        result = await self.collection.insert_one(user_in_db.dict(by_alias=True, exclude={"id"}))
        
        # Return the created user with the generated ID
        user_in_db.id = result.inserted_id
        return user_in_db
    
    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Get a user by email address."""
        user_doc = await self.collection.find_one({"email": email})
        if user_doc:
            return UserInDB(**user_doc)
        return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Get a user by ID."""
        try:
            object_id = ObjectId(user_id)
            user_doc = await self.collection.find_one({"_id": object_id})
            if user_doc:
                return UserInDB(**user_doc)
        except Exception as e:
            logger.error(f"Error getting user by ID {user_id}: {e}")
        return None
    
    async def email_exists(self, email: str) -> bool:
        """Check if an email already exists in the database."""
        count = await self.collection.count_documents({"email": email})
        return count > 0
    
    async def create_indexes(self):
        """Create database indexes for optimal performance."""
        # Create unique index on email
        await self.collection.create_index("email", unique=True)
        logger.info("Created unique index on email field")


class ActivityDatabase:
    """Database operations for activities."""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        self.db = database
        self.collection = database.activities
    
    async def create_activity(self, activity_data: ActivityCreate, user_id: str) -> ActivityInDB:
        """Create a new activity in the database."""
        # Determine activity status based on date
        today = datetime.utcnow().date()
        activity_date = activity_data.date.date()
        
        if activity_date < today:
            status = "past"
        elif activity_date == today:
            status = "future"  # Could be refined based on time
        else:
            status = "future"
        
        activity_dict = {
            "title": activity_data.title,
            "date": activity_data.date,
            "userId": ObjectId(user_id),
            "status": status,
        }
        
        # Create ActivityInDB instance to get timestamps
        activity_in_db = ActivityInDB(**activity_dict)
        
        # Insert into database
        result = await self.collection.insert_one(activity_in_db.dict(by_alias=True, exclude={"id"}))
        
        # Return the created activity with the generated ID
        activity_in_db.id = result.inserted_id
        return activity_in_db
    
    async def get_activities_by_user(self, user_id: str) -> List[ActivityInDB]:
        """Get all activities for a specific user."""
        try:
            object_id = ObjectId(user_id)
            cursor = self.collection.find({"userId": object_id}).sort("date", -1)
            activities = []
            async for activity_doc in cursor:
                activities.append(ActivityInDB(**activity_doc))
            return activities
        except Exception as e:
            logger.error(f"Error getting activities for user {user_id}: {e}")
            return []
    
    async def get_activity_by_id(self, activity_id: str, user_id: str) -> Optional[ActivityInDB]:
        """Get a specific activity by ID, ensuring it belongs to the user."""
        try:
            activity_object_id = ObjectId(activity_id)
            user_object_id = ObjectId(user_id)
            activity_doc = await self.collection.find_one({
                "_id": activity_object_id,
                "userId": user_object_id
            })
            if activity_doc:
                return ActivityInDB(**activity_doc)
        except Exception as e:
            logger.error(f"Error getting activity {activity_id} for user {user_id}: {e}")
        return None
    
    async def update_activity(self, activity_id: str, activity_data: ActivityUpdate, user_id: str) -> Optional[ActivityInDB]:
        """Update an existing activity."""
        try:
            activity_object_id = ObjectId(activity_id)
            user_object_id = ObjectId(user_id)
            
            # Determine activity status based on date
            today = datetime.utcnow().date()
            activity_date = activity_data.date.date()
            
            if activity_date < today:
                status = "past"
            elif activity_date == today:
                status = "future"  # Could be refined based on time
            else:
                status = "future"
            
            update_data = {
                "title": activity_data.title,
                "date": activity_data.date,
                "status": status,
                "updatedAt": datetime.utcnow()
            }
            
            result = await self.collection.update_one(
                {"_id": activity_object_id, "userId": user_object_id},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                # Return the updated activity
                return await self.get_activity_by_id(activity_id, user_id)
                
        except Exception as e:
            logger.error(f"Error updating activity {activity_id} for user {user_id}: {e}")
        return None
    
    async def delete_activity(self, activity_id: str, user_id: str) -> bool:
        """Delete an activity."""
        try:
            activity_object_id = ObjectId(activity_id)
            user_object_id = ObjectId(user_id)
            
            result = await self.collection.delete_one({
                "_id": activity_object_id,
                "userId": user_object_id
            })
            
            return result.deleted_count > 0
            
        except Exception as e:
            logger.error(f"Error deleting activity {activity_id} for user {user_id}: {e}")
            return False
    
    async def create_indexes(self):
        """Create database indexes for optimal performance."""
        # Create index on userId for efficient user-specific queries
        await self.collection.create_index("userId")
        # Create compound index on userId and date for sorting
        await self.collection.create_index([("userId", 1), ("date", -1)])
        logger.info("Created indexes for activities collection")


class WeatherAdviceDatabase:
    """Database operations for weather advice."""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        self.db = database
        self.collection = database.weather_advice
    
    async def get_cached_advice(self, request_date: datetime, activity: str) -> Optional[WeatherAdviceInDB]:
        """Get cached weather advice for a specific date and activity."""
        try:
            # Look for advice created within the last 6 hours for the same date and activity
            six_hours_ago = datetime.utcnow() - timedelta(hours=6)
            
            advice_doc = await self.collection.find_one({
                "request_date": request_date,
                "activity": activity,
                "createdAt": {"$gte": six_hours_ago}
            })
            
            if advice_doc:
                return WeatherAdviceInDB(**advice_doc)
        except Exception as e:
            logger.error(f"Error getting cached advice for {activity} on {request_date}: {e}")
        return None
    
    async def save_advice(self, request_date: datetime, activity: str,
                         weather_data_summary: dict, llm_advice: str,
                         llm_explanation: str) -> WeatherAdviceInDB:
        """Save weather advice to the database."""
        advice_dict = {
            "request_date": request_date,
            "activity": activity,
            "weather_data_summary": weather_data_summary,
            "llm_advice": llm_advice,
            "llm_explanation": llm_explanation,
        }
        
        # Create WeatherAdviceInDB instance to get timestamps
        advice_in_db = WeatherAdviceInDB(**advice_dict)
        
        # Insert into database
        result = await self.collection.insert_one(advice_in_db.dict(by_alias=True, exclude={"id"}))
        
        # Return the created advice with the generated ID
        advice_in_db.id = result.inserted_id
        return advice_in_db
    
    async def create_indexes(self):
        """Create database indexes for optimal performance."""
        # Create compound index on request_date and activity for efficient cache lookups
        await self.collection.create_index([("request_date", 1), ("activity", 1)])
        # Create index on createdAt for TTL-like queries
        await self.collection.create_index("createdAt")
        logger.info("Created indexes for weather_advice collection")


# Global database instances (will be initialized in main.py)
user_db: Optional[UserDatabase] = None
activity_db: Optional[ActivityDatabase] = None
weather_advice_db: Optional[WeatherAdviceDatabase] = None


def get_user_database() -> UserDatabase:
    """Get the user database instance."""
    if user_db is None:
        raise RuntimeError("User database not initialized")
    return user_db


def get_activity_database() -> ActivityDatabase:
    """Get the activity database instance."""
    if activity_db is None:
        raise RuntimeError("Activity database not initialized")
    return activity_db


def get_weather_advice_database() -> WeatherAdviceDatabase:
    """Get the weather advice database instance."""
    if weather_advice_db is None:
        raise RuntimeError("Weather advice database not initialized")
    return weather_advice_db


def init_user_database(database: AsyncIOMotorDatabase) -> UserDatabase:
    """Initialize the user database."""
    global user_db
    user_db = UserDatabase(database)
    return user_db


def init_activity_database(database: AsyncIOMotorDatabase) -> ActivityDatabase:
    """Initialize the activity database."""
    global activity_db
    activity_db = ActivityDatabase(database)
    return activity_db


def init_weather_advice_database(database: AsyncIOMotorDatabase) -> WeatherAdviceDatabase:
    """Initialize the weather advice database."""
    global weather_advice_db
    weather_advice_db = WeatherAdviceDatabase(database)
    return weather_advice_db