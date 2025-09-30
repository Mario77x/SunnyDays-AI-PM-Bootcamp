from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from models import ActivityCreate, ActivityUpdate, ActivityResponse, ErrorResponse
from database import get_activity_database
from middleware import require_auth
from typing import List
import logging

logger = logging.getLogger(__name__)

# Create the activities router
router = APIRouter(prefix="/api/v1/activities", tags=["activities"])


@router.get("", response_model=List[ActivityResponse], responses={401: {"model": ErrorResponse}})
async def get_activities(current_user=Depends(require_auth)):
    """
    Get all activities for the current user.
    
    Returns a list of activities sorted by date (newest first).
    """
    try:
        activity_db = get_activity_database()
        activities = await activity_db.get_activities_by_user(str(current_user.id))
        
        # Convert to response format
        activity_responses = []
        for activity in activities:
            activity_responses.append(ActivityResponse(
                id=str(activity.id),
                title=activity.title,
                date=activity.date,
                status=activity.status
            ))
        
        logger.info(f"Retrieved {len(activity_responses)} activities for user {current_user.email}")
        return activity_responses
        
    except Exception as e:
        logger.error(f"Error getting activities for user {current_user.email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving activities"
        )


@router.post("", response_model=ActivityResponse, responses={400: {"model": ErrorResponse}, 401: {"model": ErrorResponse}})
async def create_activity(activity_data: ActivityCreate, current_user=Depends(require_auth)):
    """
    Create a new activity for the current user.
    
    - **title**: Activity title (1-200 characters)
    - **date**: Activity date in ISO format
    
    Returns the created activity with generated ID and status.
    """
    try:
        activity_db = get_activity_database()
        
        # Create the activity
        created_activity = await activity_db.create_activity(activity_data, str(current_user.id))
        
        # Convert to response format
        activity_response = ActivityResponse(
            id=str(created_activity.id),
            title=created_activity.title,
            date=created_activity.date,
            status=created_activity.status
        )
        
        logger.info(f"Created activity '{created_activity.title}' for user {current_user.email}")
        return activity_response
        
    except Exception as e:
        logger.error(f"Error creating activity for user {current_user.email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating activity"
        )


@router.put("/{activity_id}", response_model=ActivityResponse, responses={400: {"model": ErrorResponse}, 401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}})
async def update_activity(activity_id: str, activity_data: ActivityUpdate, current_user=Depends(require_auth)):
    """
    Update an existing activity.
    
    - **activity_id**: The ID of the activity to update
    - **title**: Updated activity title (1-200 characters)
    - **date**: Updated activity date in ISO format
    
    Returns the updated activity.
    """
    try:
        activity_db = get_activity_database()
        
        # Check if activity exists and belongs to user
        existing_activity = await activity_db.get_activity_by_id(activity_id, str(current_user.id))
        if not existing_activity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Activity not found"
            )
        
        # Update the activity
        updated_activity = await activity_db.update_activity(activity_id, activity_data, str(current_user.id))
        
        if not updated_activity:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update activity"
            )
        
        # Convert to response format
        activity_response = ActivityResponse(
            id=str(updated_activity.id),
            title=updated_activity.title,
            date=updated_activity.date,
            status=updated_activity.status
        )
        
        logger.info(f"Updated activity '{updated_activity.title}' for user {current_user.email}")
        return activity_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating activity {activity_id} for user {current_user.email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating activity"
        )


@router.delete("/{activity_id}", responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}})
async def delete_activity(activity_id: str, current_user=Depends(require_auth)):
    """
    Delete an activity.
    
    - **activity_id**: The ID of the activity to delete
    
    Returns a confirmation message.
    """
    try:
        activity_db = get_activity_database()
        
        # Check if activity exists and belongs to user
        existing_activity = await activity_db.get_activity_by_id(activity_id, str(current_user.id))
        if not existing_activity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Activity not found"
            )
        
        # Delete the activity
        deleted = await activity_db.delete_activity(activity_id, str(current_user.id))
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete activity"
            )
        
        logger.info(f"Deleted activity {activity_id} for user {current_user.email}")
        return {"message": "Activity deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting activity {activity_id} for user {current_user.email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting activity"
        )