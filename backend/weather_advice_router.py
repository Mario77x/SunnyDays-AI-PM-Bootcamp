from fastapi import APIRouter, HTTPException, Depends
from models import WeatherAdviceRequest, WeatherAdviceResponse, ErrorResponse
from database import get_weather_advice_database, WeatherAdviceDatabase
from knmi_service import get_knmi_service, KNMIService
from llm_service import get_llm_service, LLMService
from middleware import get_current_user
from typing import Dict, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["weather-advice"])


@router.post("/weather-advice", response_model=WeatherAdviceResponse)
async def get_weather_advice(
    request: WeatherAdviceRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    weather_db: WeatherAdviceDatabase = Depends(get_weather_advice_database),
    knmi_service: KNMIService = Depends(get_knmi_service),
    llm_service: LLMService = Depends(get_llm_service)
) -> WeatherAdviceResponse:
    """
    Get weather advice for an activity on a specific date.
    First checks cache, then fetches live data if needed.
    """
    try:
        # Check if we have cached advice for this date and activity
        cached_advice = await weather_db.get_cached_advice(request.date, request.activity)
        
        if cached_advice:
            logger.info(f"Returning cached advice for {request.activity} on {request.date}")
            return WeatherAdviceResponse(
                advice=cached_advice.llm_advice,
                explanation=cached_advice.llm_explanation,
                source="cache"
            )
        
        # No cached data, fetch live weather data
        logger.info(f"Fetching live weather data for {request.activity} on {request.date}")
        
        # Get weather forecast from KNMI
        weather_data = await knmi_service.get_weather_forecast(request.date)
        if not weather_data:
            raise HTTPException(
                status_code=503,
                detail="Unable to fetch weather data at this time"
            )
        
        # Get LLM recommendation
        advice, explanation = await llm_service.get_activity_recommendation(
            weather_data, request.activity
        )
        
        # Save the advice to cache
        await weather_db.save_advice(
            request_date=request.date,
            activity=request.activity,
            weather_data_summary=weather_data,
            llm_advice=advice,
            llm_explanation=explanation
        )
        
        logger.info(f"Generated and cached new advice for {request.activity} on {request.date}")
        
        return WeatherAdviceResponse(
            advice=advice,
            explanation=explanation,
            source="live"
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error getting weather advice: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error while processing weather advice request"
        )


@router.get("/weather-advice/health")
async def weather_advice_health() -> Dict[str, str]:
    """Health check endpoint for weather advice service."""
    return {
        "status": "healthy",
        "service": "weather-advice",
        "message": "Weather advice service is operational"
    }