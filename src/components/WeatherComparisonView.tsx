import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  Thermometer, 
  CloudRain, 
  Wind, 
  Droplets, 
  Sun, 
  Eye, 
  ShieldCheck 
} from 'lucide-react';
import { GeoLocation, GroundedWeatherContext, UserPreferences } from '../types/weather';
import { PRESET_INDIAN_LOCATIONS, fetchLiveWeather, generateFallbackWeather } from '../services/weatherApi';

interface WeatherComparisonViewProps {
  currentContext: GroundedWeatherContext;
  preferences: UserPreferences;
  onAskGptAboutComparison: (prompt: string) => void;
}

export const WeatherComparisonView: React.FC<WeatherComparisonViewProps> = ({
  currentContext,
  preferences,
  onAskGptAboutComparison,
}) => {
  const [city1, setCity1] = useState<GeoLocation>(currentContext.location);
  const [city2, setCity2] = useState<GeoLocation>(
    PRESET_INDIAN_LOCATIONS.find(l => l.name.toLowerCase() !== currentContext.location.name.toLowerCase()) || PRESET_INDIAN_LOCATIONS[1]
  );

  const [context1, setContext1] = useState<GroundedWeatherContext>(currentContext);
  const [context2, setContext2] = useState<GroundedWeatherContext>(() => generateFallbackWeather(PRESET_INDIAN_LOCATIONS[1]));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    updateComparison();
  }, [city1.id, city2.id]);

  const updateComparison = async () => {
    setIsLoading(true);
    try {
      const [c1, c2] = await Promise.all([
        city1.id === currentContext.location.id ? currentContext : fetchLiveWeather(city1),
        fetchLiveWeather(city2)
      ]);
      setContext1(c1);
      setContext2(c2);
    } catch {
      setContext1(city1.id === currentContext.location.id ? currentContext : generateFallbackWeather(city1));
      setContext2(generateFallbackWeather(city2));
    } finally {
      setIsLoading(false);
    }
  };

  const c1Rain = Math.max(...context1.hourly.slice(0, 12).map(h => h.precipitationProbability), context1.current.precipitation > 0 ? 75 : 0);
  const c2Rain = Math.max(...context2.hourly.slice(0, 12).map(h => h.precipitationProbability), context2.current.precipitation > 0 ? 75 : 0);

  const metrics = [
    {
      label: 'Temperature',
      icon: Thermometer,
      val1: `${context1.current.temperature}°C`,
      val2: `${context2.current.temperature}°C`,
      sub1: `Feels like ${context1.current.feelsLike}°C`,
      sub2: `Feels like ${context2.current.feelsLike}°C`,
      better: context1.current.temperature <= context2.current.temperature ? 1 : 2,
    },
    {
      label: 'Air Quality (AQI)',
      icon: ShieldCheck,
      val1: `${context1.airQuality.aqi}`,
      val2: `${context2.airQuality.aqi}`,
      sub1: context1.airQuality.category,
      sub2: context2.airQuality.category,
      better: context1.airQuality.aqi <= context2.airQuality.aqi ? 1 : 2,
    },
    {
      label: 'Peak Rain Probability',
      icon: CloudRain,
      val1: `${c1Rain}%`,
      val2: `${c2Rain}%`,
      sub1: context1.current.condition,
      sub2: context2.current.condition,
      better: c1Rain <= c2Rain ? 1 : 2,
    },
    {
      label: 'Wind Speed',
      icon: Wind,
      val1: `${context1.current.windSpeed} km/h`,
      val2: `${context2.current.windSpeed} km/h`,
      sub1: `${context1.current.windDirection}°`,
      sub2: `${context2.current.windDirection}°`,
      better: context1.current.windSpeed <= context2.current.windSpeed ? 1 : 2,
    },
    {
      label: 'Relative Humidity',
      icon: Droplets,
      val1: `${context1.current.humidity}%`,
      val2: `${context2.current.humidity}%`,
      sub1: `Dew pt: ${context1.current.dewPoint || 20}°C`,
      sub2: `Dew pt: ${context2.current.dewPoint || 21}°C`,
      better: Math.abs(context1.current.humidity - 50) <= Math.abs(context2.current.humidity - 50) ? 1 : 2,
    },
    {
      label: 'Solar UV Index',
      icon: Sun,
      val1: `${context1.current.uvIndex} / 11`,
      val2: `${context2.current.uvIndex} / 11`,
      sub1: context1.current.uvIndex > 6 ? 'High UV' : 'Moderate UV',
      sub2: context2.current.uvIndex > 6 ? 'High UV' : 'Moderate UV',
      better: context1.current.uvIndex <= context2.current.uvIndex ? 1 : 2,
    },
    {
      label: 'Road Visibility',
      icon: Eye,
      val1: `${context1.current.visibility} km`,
      val2: `${context2.current.visibility} km`,
      sub1: 'Atmospheric clearance',
      sub2: 'Atmospheric clearance',
      better: context1.current.visibility >= context2.current.visibility ? 1 : 2,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & City Selectors */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Direct Meteorological Comparison Matrix</h2>
            <p className="text-xs text-gray-500 font-medium">Side-by-side weather and atmospheric decision intelligence</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          
          {/* City 1 */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="text-xs font-semibold text-gray-700 block mb-1">City 1</label>
            <select
              value={city1.id}
              onChange={(e) => {
                const loc = PRESET_INDIAN_LOCATIONS.find(l => l.id === e.target.value) || PRESET_INDIAN_LOCATIONS[0];
                setCity1(loc);
              }}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 font-bold focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              {PRESET_INDIAN_LOCATIONS.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.state || l.country})</option>
              ))}
            </select>
          </div>

          {/* City 2 */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="text-xs font-semibold text-gray-700 block mb-1">City 2</label>
            <select
              value={city2.id}
              onChange={(e) => {
                const loc = PRESET_INDIAN_LOCATIONS.find(l => l.id === e.target.value) || PRESET_INDIAN_LOCATIONS[1];
                setCity2(loc);
              }}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 font-bold focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              {PRESET_INDIAN_LOCATIONS.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.state || l.country})</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* COMPARISON METRICS TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        
        <div className="grid grid-cols-3 gap-2 pb-3 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500">
          <div>Meteorological Metric</div>
          <div className="text-center text-blue-600 font-bold">{city1.name}</div>
          <div className="text-center text-amber-600 font-bold">{city2.name}</div>
        </div>

        <div className="divide-y divide-gray-100">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={idx} className="grid grid-cols-3 gap-2 py-3.5 items-center hover:bg-gray-50/50 transition-colors">
                
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gray-100 text-gray-700">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">{m.label}</span>
                  </div>
                </div>

                {/* City 1 Value */}
                <div className={`p-2.5 rounded-xl text-center border ${
                  m.better === 1 
                    ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-2xs' 
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}>
                  <span className="text-sm font-bold block">{m.val1}</span>
                  <span className="text-[10px] text-gray-500 font-medium">{m.sub1}</span>
                  {m.better === 1 && (
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700">
                      FAVORABLE
                    </span>
                  )}
                </div>

                {/* City 2 Value */}
                <div className={`p-2.5 rounded-xl text-center border ${
                  m.better === 2 
                    ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-2xs' 
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}>
                  <span className="text-sm font-bold block">{m.val2}</span>
                  <span className="text-[10px] text-gray-500 font-medium">{m.sub2}</span>
                  {m.better === 2 && (
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-700">
                      FAVORABLE
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* AI SUMMARY BOX */}
        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Comparative Decision Verdict
            </div>
            <p className="text-xs text-gray-600 font-medium">
              {city1.name} presents {context1.current.temperature < context2.current.temperature ? 'cooler' : 'warmer'} temperatures with AQI {context1.airQuality.aqi} vs {city2.name}'s AQI {context2.airQuality.aqi}. Peak rain risk is {c1Rain}% in {city1.name} vs {c2Rain}% in {city2.name}.
            </p>
          </div>

          <button
            onClick={() => onAskGptAboutComparison(`Compare the weather in ${city1.name} and ${city2.name} right now and tell me which city has better outdoor conditions today.`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs transition-all cursor-pointer"
          >
            <span>Ask WeatherGPT to Compare</span>
          </button>
        </div>

      </div>

    </div>
  );
};
