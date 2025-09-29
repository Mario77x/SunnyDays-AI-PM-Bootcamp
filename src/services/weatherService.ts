import { WeatherAssessment } from '@/types';

// Enhanced mock weather data for Amsterdam with more variety
const generateMockWeatherData = () => {
  const conditions = ['sunny', 'partly-cloudy', 'cloudy', 'rainy', 'stormy'];
  const data = [];
  
  for (let i = 0; i < 14; i++) { // 14 days of forecast data
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    // Create more realistic weather patterns
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const seasonalTemp = 15 + Math.sin((date.getMonth() - 3) * Math.PI / 6) * 10; // Seasonal variation
    const dailyVariation = Math.random() * 8 - 4; // ±4°C daily variation
    
    // Weather tends to be more stable on weekends (for better outdoor activities)
    const precipitationChance = isWeekend ? Math.random() * 40 : Math.random() * 70;
    const windSpeed = 8 + Math.random() * 20;
    
    let condition = 'sunny';
    if (precipitationChance > 60) condition = 'rainy';
    else if (precipitationChance > 40) condition = 'cloudy';
    else if (precipitationChance > 20) condition = 'partly-cloudy';
    
    data.push({
      date,
      temp: Math.round(seasonalTemp + dailyVariation),
      precipitation: Math.round(precipitationChance),
      wind: Math.round(windSpeed),
      condition,
      humidity: Math.round(60 + Math.random() * 30),
      uvIndex: Math.round(Math.random() * 10)
    });
  }
  
  return data;
};

const mockWeatherData = generateMockWeatherData();

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

export const getWeatherAssessment = async (date: Date): Promise<WeatherAssessment> => {
  // Simulate API call delay with some variation
  const delay = 1200 + Math.random() * 800; // 1.2-2.0 seconds
  await new Promise(resolve => setTimeout(resolve, delay));
  
  const today = new Date();
  const daysDifference = Math.ceil((date.getTime() - today.getTime()) / (1000 * 3600 * 24));
  
  let assessment: WeatherAssessment;
  
  if (daysDifference <= 13) {
    // Use forecast data (simulated) - extended to 14 days
    const forecastIndex = Math.max(0, Math.min(daysDifference, mockWeatherData.length - 1));
    const forecast = mockWeatherData[forecastIndex];
    
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
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 3600 * 24));
    
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