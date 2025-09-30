import httpx
import os
from typing import Dict, Any, Tuple
import logging
import json

logger = logging.getLogger(__name__)


class LLMService:
    """Service for getting weather-based activity recommendations from an LLM."""
    
    def __init__(self):
        self.api_key = os.getenv("LLM_API_KEY")
        # For this implementation, we'll use OpenAI's API as an example
        # You can easily adapt this to use other LLM providers
        self.base_url = "https://api.openai.com/v1"
        
    async def get_activity_recommendation(self, weather_data: Dict[str, Any], activity: str) -> Tuple[str, str]:
        """
        Get a recommendation for whether an activity is suitable given the weather conditions.
        Returns a tuple of (advice: "yes"|"no", explanation: str)
        """
        if not self.api_key:
            logger.warning("LLM API key not configured, using rule-based recommendations")
            return self._get_rule_based_recommendation(weather_data, activity)
        
        try:
            # Prepare the prompt for the LLM
            prompt = self._create_prompt(weather_data, activity)
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-3.5-turbo",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a weather advisor. Respond with a JSON object containing 'advice' (either 'yes' or 'no') and 'explanation' (a brief reason for your recommendation)."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "max_tokens": 150,
                        "temperature": 0.3
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"]
                    
                    # Parse the JSON response
                    try:
                        parsed = json.loads(content)
                        advice = parsed.get("advice", "no").lower()
                        explanation = parsed.get("explanation", "Unable to determine recommendation")
                        
                        # Ensure advice is either "yes" or "no"
                        if advice not in ["yes", "no"]:
                            advice = "no"
                            
                        return advice, explanation
                    except json.JSONDecodeError:
                        logger.error(f"Failed to parse LLM response: {content}")
                        return self._get_rule_based_recommendation(weather_data, activity)
                else:
                    logger.error(f"LLM API request failed with status {response.status_code}")
                    return self._get_rule_based_recommendation(weather_data, activity)
                    
        except Exception as e:
            logger.error(f"Error getting LLM recommendation: {e}")
            return self._get_rule_based_recommendation(weather_data, activity)
    
    def _create_prompt(self, weather_data: Dict[str, Any], activity: str) -> str:
        """Create a prompt for the LLM based on weather data and activity."""
        return f"""
Given the following weather conditions, should I do this activity: "{activity}"?

Weather conditions:
- Temperature: {weather_data.get('temperature', 'unknown')}°C
- Precipitation: {weather_data.get('precipitation_mm', 'unknown')}mm
- Wind speed: {weather_data.get('wind_speed_kmh', 'unknown')} km/h
- Condition: {weather_data.get('condition', 'unknown')}
- Humidity: {weather_data.get('humidity', 'unknown')}%
- Visibility: {weather_data.get('visibility_km', 'unknown')} km

Please provide your recommendation as a JSON object with:
- "advice": either "yes" or "no"
- "explanation": a brief explanation of your reasoning (max 100 words)

Consider safety, comfort, and enjoyment when making your recommendation.
        """.strip()
    
    def _get_rule_based_recommendation(self, weather_data: Dict[str, Any], activity: str) -> Tuple[str, str]:
        """
        Fallback rule-based recommendation system when LLM is not available.
        This provides basic weather-based activity recommendations.
        """
        temperature = weather_data.get('temperature', 15)
        precipitation = weather_data.get('precipitation_mm', 0)
        wind_speed = weather_data.get('wind_speed_kmh', 10)
        condition = weather_data.get('condition', 'unknown')
        
        activity_lower = activity.lower()
        
        # Define activity categories and their weather requirements
        outdoor_activities = ['hiking', 'cycling', 'running', 'walking', 'picnic', 'camping', 'gardening', 'sports']
        water_activities = ['swimming', 'sailing', 'surfing', 'fishing', 'kayaking']
        winter_activities = ['skiing', 'snowboarding', 'ice skating', 'sledding']
        indoor_activities = ['shopping', 'museum', 'cinema', 'reading', 'cooking', 'studying']
        
        # Check if activity matches any category
        is_outdoor = any(keyword in activity_lower for keyword in outdoor_activities)
        is_water = any(keyword in activity_lower for keyword in water_activities)
        is_winter = any(keyword in activity_lower for keyword in winter_activities)
        is_indoor = any(keyword in activity_lower for keyword in indoor_activities)
        
        # Rule-based logic
        if is_indoor:
            return "yes", "Indoor activities are generally not affected by weather conditions."
        
        if is_winter:
            if temperature < 5 and condition in ['snow', 'cloudy']:
                return "yes", "Good conditions for winter activities with cold temperatures."
            else:
                return "no", "Winter activities require colder temperatures and preferably snow."
        
        if is_water:
            if temperature < 15:
                return "no", "Water activities are not recommended in cold temperatures."
            elif precipitation > 20:
                return "no", "Heavy precipitation makes water activities unsafe."
            elif wind_speed > 25:
                return "no", "Strong winds make water activities dangerous."
            else:
                return "yes", "Good conditions for water activities."
        
        if is_outdoor:
            if precipitation > 30:
                return "no", "Heavy rain makes outdoor activities unpleasant and potentially unsafe."
            elif wind_speed > 30:
                return "no", "Very strong winds make outdoor activities difficult and unsafe."
            elif temperature < -5:
                return "no", "Extremely cold temperatures make outdoor activities uncomfortable."
            elif temperature > 35:
                return "no", "Very high temperatures can be dangerous for outdoor activities."
            elif precipitation > 10:
                return "no", "Light to moderate rain makes outdoor activities less enjoyable."
            else:
                return "yes", f"Good weather conditions for outdoor activities. Temperature: {temperature}°C, minimal precipitation."
        
        # Default recommendation for unclassified activities
        if precipitation > 20 or wind_speed > 25:
            return "no", "Weather conditions may not be suitable for this activity."
        else:
            return "yes", "Weather conditions appear suitable for this activity."


# Global service instance
llm_service = LLMService()


def get_llm_service() -> LLMService:
    """Get the LLM service instance."""
    return llm_service