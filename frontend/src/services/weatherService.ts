import { WeatherAssessment } from '@/types';
import { api, API_ENDPOINTS } from '@/lib/api';

// Backend API types
interface WeatherAdviceRequest {
  date: string; // ISO string
  activity: string;
}

interface WeatherAdviceResponse {
  advice: 'yes' | 'no';
  explanation: string;
  source: 'cache' | 'live';
}

// Convert backend response to frontend WeatherAssessment type
const convertToWeatherAssessment = (response: WeatherAdviceResponse): WeatherAssessment => {
  return {
    recommendation: response.advice === 'yes' ? 'good' : 'bad',
    confidence: response.source === 'live' ? 85 : 75, // Higher confidence for live data
    reasoning: response.explanation,
    dataSource: response.source === 'live' ? 'forecast' : 'historic',
    // Note: Backend doesn't provide temperature, precipitation, windSpeed yet
    // These could be added in a future version
  };
};

export const getWeatherAssessment = async (date: Date, activityTitle?: string): Promise<WeatherAssessment> => {
  try {
    const requestData: WeatherAdviceRequest = {
      date: date.toISOString(),
      activity: activityTitle || 'outdoor activity',
    };

    const response = await api.post<WeatherAdviceResponse>(
      API_ENDPOINTS.WEATHER.ADVICE,
      requestData
    );

    return convertToWeatherAssessment(response);
  } catch (error) {
    console.error('Error fetching weather assessment from API:', error);
    
    // Fallback to mock data with enhanced logic
    return getMockWeatherAssessment(date);
  }
};

// Enhanced mock weather assessment (fallback when API is unavailable)
const getMockWeatherAssessment = async (date: Date): Promise<WeatherAssessment> => {
  // Simulate API call delay with some variation
  const delay = 1200 + Math.random() * 800; // 1.2-2.0 seconds
  await new Promise(resolve => setTimeout(resolve, delay));
  
  const today = new Date();
  const daysDifference = Math.ceil((date.getTime() - today.getTime()) / (1000 * 3600 * 24));
  
  let assessment: WeatherAssessment;
  
  if (daysDifference <= 13) {
    // Use forecast data (simulated) - extended to 14 days
    const forecast = generateMockForecast(daysDifference);
    
    // More nuanced weather assessment
    let recommendation: 'good' | 'bad';
    let confidence: number;
    let reasoningKey: string;
    
    if (forecast.precipitation < 20 && forecast.wind < 15 && forecast.temp > 12) {
      recommendation = 'good';
      confidence = 85 + Math.random() * 15; // 85-100%
      reasoningKey = 'weather.assessment.forecastGood';
    } else if (forecast.precipitation > 60 || forecast.wind > 25 || forecast.temp < 5) {
      recommendation = 'bad';
      confidence = 70 + Math.random() * 20; // 70-90%
      reasoningKey = 'weather.assessment.forecastBad';
    } else {
      // Mild/uncertain conditions
      recommendation = forecast.precipitation < 40 ? 'good' : 'bad';
      confidence = 60 + Math.random() * 25; // 60-85%
      reasoningKey = 'weather.assessment.forecastMild';
    }
    
    assessment = {
      recommendation,
      confidence: Math.round(confidence),
      reasoning: getTranslation(reasoningKey, { 
        temp: forecast.temp.toString(),
        precipitation: forecast.precipitation.toString(),
        wind: forecast.wind.toString()
      }),
      dataSource: 'forecast',
      temperature: forecast.temp,
      precipitation: forecast.precipitation,
      windSpeed: forecast.wind
    };
  } else {
    // Use historic data (simulated) for dates beyond forecast range
    const month = date.getMonth();
    
    // Create seasonal patterns for historical data
    const isSpring = month >= 2 && month <= 4;
    const isSummer = month >= 5 && month <= 7;
    const isAutumn = month >= 8 && month <= 10;
    const isWinter = month >= 11 || month <= 1;
    
    let baseGoodDaysPercentage = 50;
    if (isSummer) baseGoodDaysPercentage = 70;
    else if (isSpring || isAutumn) baseGoodDaysPercentage = 55;
    else if (isWinter) baseGoodDaysPercentage = 35;
    
    // Add some randomness and day-of-week effects
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const weekendBonus = isWeekend ? 10 : 0;
    const randomVariation = (Math.random() - 0.5) * 30;
    
    const historicGoodDays = Math.max(20, Math.min(85, 
      baseGoodDaysPercentage + weekendBonus + randomVariation
    ));
    
    const isHistoricallyGood = historicGoodDays > 50;
    const percentage = Math.round(historicGoodDays);
    
    // Generate realistic temperature for the season
    let seasonalTemp = 15;
    if (isSummer) seasonalTemp = 22;
    else if (isSpring || isAutumn) seasonalTemp = 16;
    else if (isWinter) seasonalTemp = 8;
    
    const tempVariation = (Math.random() - 0.5) * 8;
    const finalTemp = Math.round(seasonalTemp + tempVariation);
    
    const reasoningKey = isHistoricallyGood 
      ? (historicGoodDays > 65 ? 'weather.assessment.historicGood' : 'weather.assessment.historicMild')
      : 'weather.assessment.historicBad';
    
    assessment = {
      recommendation: isHistoricallyGood ? 'good' : 'bad',
      confidence: Math.round(55 + Math.random() * 25), // 55-80% (lower confidence for historic)
      reasoning: getTranslation(reasoningKey, { percentage: percentage.toString() }),
      dataSource: 'historic',
      temperature: finalTemp,
      precipitation: Math.round(Math.random() * 60),
      windSpeed: Math.round(Math.random() * 15 + 10)
    };
  }
  
  return assessment;
};

// Generate mock forecast data
const generateMockForecast = (dayOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  
  // Create more realistic weather patterns
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const seasonalTemp = 15 + Math.sin((date.getMonth() - 3) * Math.PI / 6) * 10; // Seasonal variation
  const dailyVariation = Math.random() * 8 - 4; // ±4°C daily variation
  
  // Weather tends to be more stable on weekends (for better outdoor activities)
  const precipitationChance = isWeekend ? Math.random() * 40 : Math.random() * 70;
  const windSpeed = 8 + Math.random() * 20;
  
  return {
    temp: Math.round(seasonalTemp + dailyVariation),
    precipitation: Math.round(precipitationChance),
    wind: Math.round(windSpeed),
  };
};

// Helper function to get translations - we'll use a global approach since this is a service
const getTranslation = (key: string, params?: Record<string, string>): string => {
  const language = localStorage.getItem('sunnydays_language') as 'nl' | 'en' || 'nl';
  
  const translations: Record<string, Record<'nl' | 'en', string>> = {
    'weather.assessment.forecastGood': { 
      nl: 'Uitstekende weersomstandigheden verwacht! Temperatuur rond {temp}°C met {precipitation}% kans op regen.', 
      en: 'Excellent weather conditions expected! Temperature around {temp}°C with {precipitation}% chance of rain.' 
    },
    'weather.assessment.forecastBad': { 
      nl: 'Niet ideaal weer verwacht. {precipitation}% kans op regen en wind tot {wind} km/u.', 
      en: 'Not ideal weather expected. {precipitation}% chance of rain and wind up to {wind} km/h.' 
    },
    'weather.assessment.historicGood': { 
      nl: 'Historisch gezien is dit meestal een goede dag voor buitenactiviteiten. {percentage}% van vergelijkbare dagen waren geschikt.', 
      en: 'Historically, this is usually a good day for outdoor activities. {percentage}% of similar days were suitable.' 
    },
    'weather.assessment.historicBad': { 
      nl: 'Historische data toont wisselvallig weer op deze datum. Slechts {percentage}% van vergelijkbare dagen waren geschikt.', 
      en: 'Historical data shows changing weather on this date. Only {percentage}% of similar days were suitable.' 
    },
    'weather.assessment.forecastMild': {
      nl: 'Redelijk weer verwacht met {temp}°C. {precipitation}% kans op lichte neerslag.',
      en: 'Fair weather expected with {temp}°C. {precipitation}% chance of light precipitation.'
    },
    'weather.assessment.historicMild': {
      nl: 'Gemiddelde weersomstandigheden voor deze tijd van het jaar. {percentage}% van vergelijkbare dagen waren geschikt.',
      en: 'Average weather conditions for this time of year. {percentage}% of similar days were suitable.'
    }
  };
  
  let translation = translations[key]?.[language] || key;
  
  // Replace parameters in translation
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(`{${param}}`, value);
    });
  }
  
  return translation;
};

export const sendInvitations = async (emails: string[], activityTitle: string): Promise<boolean> => {
  // Simulate email sending with realistic delay
  const delay = 800 + Math.random() * 400; // 0.8-1.2 seconds
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // In a real app, this would send actual emails
  // Using a generic message that works in both languages since this is just console logging
  console.log(`📧 Invitations sent to: ${emails.join(', ')} for activity: ${activityTitle}`);
  
  // Simulate occasional email sending failures (5% chance)
  if (Math.random() < 0.05) {
    throw new Error('Failed to send invitations');
  }
  
  return true;
};