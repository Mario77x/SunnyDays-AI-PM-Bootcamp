from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
from contextlib import asynccontextmanager
from typing import Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global database client
db_client: AsyncIOMotorClient = None
database = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    # Startup
    global db_client, database
    
    # Get MongoDB URI from environment
    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        logger.error("MONGODB_URI environment variable is not set")
        raise ValueError("MONGODB_URI environment variable is required")
    
    # Connect to MongoDB
    try:
        db_client = AsyncIOMotorClient(mongodb_uri)
        database = db_client.sunnydays
        
        # Test the connection
        await db_client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise
    
    yield
    
    # Shutdown
    if db_client:
        db_client.close()
        logger.info("MongoDB connection closed")


# Create FastAPI app with lifespan
app = FastAPI(
    title="SunnyDays API",
    description="Weather recommendation engine backend",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint that verifies database connectivity."""
    try:
        # Test database connection
        await db_client.admin.command('ping')
        return {
            "status": "healthy",
            "database": "connected",
            "message": "Service is running and database is accessible"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "message": f"Database connection failed: {str(e)}"
        }


@app.get("/api/v1")
async def api_root() -> Dict[str, str]:
    """API root endpoint."""
    return {
        "message": "SunnyDays API v1",
        "status": "running"
    }


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True if os.getenv("APP_ENV") == "development" else False
    )