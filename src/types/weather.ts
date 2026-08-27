export interface GeoLocation {
  id: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  elevation?: number;
  isDefault?: boolean;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts?: number;
  visibility: number;
  uvIndex: number;
  isDay: boolean;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  cloudCover: number;
  weatherCode: number;
  condition: string;
  conditionDesc: string;
  timestamp: string;
  dewPoint?: number;
}

export interface HourlyForecastItem {
  time: string;
  timestamp: number;
  temperature: number;
  feelsLike: number;
  humidity: number;
  precipitationProbability: number;
  precipitation: number;
  rain: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  visibility: number;
  weatherCode: number;
  condition: string;
  isDay: boolean;
  airQualityIndex?: number;
}

export interface DailyForecastItem {
  date: string;
  timestamp: number;
  temperatureMax: number;
  temperatureMin: number;
  apparentTemperatureMax: number;
  apparentTemperatureMin: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  windGustsMax: number;
  uvIndexMax: number;
  weatherCode: number;
  condition: string;
  sunrise: string;
  sunset: string;
  summary?: string;
}

export interface AirQualityData {
  aqi: number; // European or US AQI standard (0-500)
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pm25: number;
  pm10: number;
  nitrogenDioxide: number;
  sulphurDioxide: number;
  ozone: number;
  carbonMonoxide: number;
  healthAdvice: string;
}

export interface WeatherAlert {
  id: string;
  type: 'Rain' | 'Thunderstorm' | 'Extreme Heat' | 'Cold Wave' | 'High Wind' | 'Poor AQI' | 'Fog' | 'Flood Risk';
  severity: 'low' | 'moderate' | 'severe' | 'extreme';
  headline: string;
  description: string;
  startTime: string;
  endTime: string;
  affectedTimeWindow?: string;
  recommendedAction: string;
  source: string;
}

export type ActivityType = 
  | 'bike_commute'
  | 'running'
  | 'cycling'
  | 'walking'
  | 'outdoor_sports'
  | 'photography'
  | 'picnic'
  | 'farming_outdoor_work'
  | 'laundry'
  | 'kids_outdoor';

export type ViabilityRating = 'GOOD' | 'MODERATE' | 'NOT RECOMMENDED';

export interface ActivityAssessment {
  id: ActivityType;
  title: string;
  iconName: string;
  rating: ViabilityRating;
  summary: string;
  bestTimeWindow: string;
  riskFactors: {
    factor: 'Temperature' | 'Rain' | 'Wind' | 'AQI' | 'UV' | 'Humidity' | 'Visibility';
    level: 'LOW' | 'MODERATE' | 'HIGH';
    detail: string;
  }[];
  tips: string[];
}

export interface TravelWeatherSegment {
  segment: 'Departure' | 'Journey / Transit' | 'Destination';
  locationName: string;
  weatherCondition: string;
  temperature: number;
  rainProbability: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  notes: string;
}

export interface TravelRiskReport {
  origin: string;
  destination: string;
  travelDate: string;
  departureTime?: string;
  overallRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  recommendation: string;
  departureAdvice: string;
  packingList: string[];
  routeSegments: TravelWeatherSegment[];
  aiAnalysis?: string;
}

export interface HistoricalYearSummary {
  year: number;
  avgTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  totalRainfall: number;
  rainyDays: number;
  extremeHeatDays: number;
}

export interface HistoricalAnalysisResult {
  locationName: string;
  timeframe: string;
  yearlySummaries: HistoricalYearSummary[];
  tempTrendDescription: string;
  rainfallTrendDescription: string;
  aiClimateInsight: string;
  keyTakeaway: string;
}

export interface WeatherComparisonData {
  location1: {
    location: GeoLocation;
    current: CurrentWeather;
    airQuality: AirQualityData;
  };
  location2: {
    location: GeoLocation;
    current: CurrentWeather;
    airQuality: AirQualityData;
  };
  highlights: {
    metric: string;
    winner: string;
    difference: string;
    analysis: string;
  }[];
  aiSummary: string;
}

export interface GroundedWeatherContext {
  location: GeoLocation;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  airQuality: AirQualityData;
  alerts: WeatherAlert[];
  retrievedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  language?: string;
  groundedContext?: {
    locationName: string;
    temperature: number;
    rainProbability: number;
    condition: string;
    aqi: number;
  };
  riskEngineOutput?: {
    activity?: string;
    rating?: ViabilityRating;
    overallRisk?: string;
    primaryFactor?: string;
    safeWindow?: string;
  };
  suggestedFollowUps?: string[];
}

export type SupportedLanguage = 
  | 'en' // English
  | 'hi' // Hindi (हिन्दी)
  | 'hinglish' // Hinglish (Hindi written in Roman script / mixed)
  | 'bn' // Bengali (বাংলা)
  | 'mr' // Marathi (मराठी)
  | 'te' // Telugu (తెలుగు)
  | 'ta' // Tamil (தமிழ்)
  | 'gu' // Gujarati (ગુજરાતી)
  | 'kn' // Kannada (ಕನ್ನಡ)
  | 'ml' // Malayalam (മലയാളം)
  | 'pa' // Punjabi (ਪੰਜਾਬੀ)
  | 'or'; // Odia (ଓଡ଼ିଆ)

export interface UserPreferences {
  language: SupportedLanguage;
  temperatureUnit: 'celsius' | 'fahrenheit';
  windSpeedUnit: 'kmh' | 'mph' | 'ms';
  commuteStartTime: string; // e.g. "08:30"
  commuteEndTime: string;   // e.g. "18:00"
  commuteType: 'bike' | 'public_transit' | 'car' | 'walk';
  voiceEnabled?: boolean;
  voiceAutoPlay: boolean;
  savedLocations?: GeoLocation[];
  theme?: 'dark' | 'light';
}
