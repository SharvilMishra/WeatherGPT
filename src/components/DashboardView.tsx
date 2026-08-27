import React from 'react';
import { 
  CloudRain, 
  Wind, 
  Droplets, 
  Sun, 
  Eye, 
  Gauge, 
  Compass, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert,
  Bike,
  Footprints,
  Shirt,
  Sunrise,
  Sunset
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { GroundedWeatherContext, UserPreferences } from '../types/weather';
import { getTranslation } from '../services/i18n';
import { getAqiCategory } from '../services/weatherApi';

interface DashboardViewProps {
  weatherContext: GroundedWeatherContext;
  preferences: UserPreferences;
  onNavigateToChatWithPrompt: (prompt: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  weatherContext,
  preferences,
  onNavigateToChatWithPrompt,
  onNavigateToTab,
}) => {
  const { location, current, hourly, daily, airQuality, alerts } = weatherContext;
  const lang = preferences.language;

  // Compute highest rain probability in next 12 hours
  const upcomingPeakRain = Math.max(...hourly.slice(0, 12).map(h => h.precipitationProbability), current.precipitation > 0 ? 80 : 0);
  const peakRainHour = hourly.slice(0, 12).find(h => h.precipitationProbability === upcomingPeakRain);
  const peakRainTimeStr = peakRainHour ? new Date(peakRainHour.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'this evening';

  // Format hourly chart data
  const chartData = hourly.slice(0, 18).map(h => ({
    time: new Date(h.time).toLocaleTimeString([], { hour: 'numeric' }),
    temp: preferences.temperatureUnit === 'fahrenheit' ? Math.round((h.temperature * 9) / 5 + 32) : h.temperature,
    rainChance: h.precipitationProbability,
    rainMm: h.rain,
    wind: h.windSpeed,
    condition: h.condition,
  }));

  const aqiInfo = getAqiCategory(airQuality.aqi);

  // Quick Decision Highlights
  const isBikeSafe = upcomingPeakRain < 40 && current.windSpeed < 25;
  const isRunningSafe = airQuality.aqi < 130 && current.feelsLike < 35 && upcomingPeakRain < 35;
  const isLaundrySafe = upcomingPeakRain < 30 && current.humidity < 75;

  return (
    <div className="space-y-6 pb-12">
      
      {/* 🚀 TOP AI DECISION SUMMARY BANNER */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-sky-50 border border-blue-200/80 rounded-2xl p-4 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                WeatherGPT Real-Time Decision Verdict
              </span>
              <span className="text-xs text-gray-500 font-medium">for {location.name}</span>
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              {upcomingPeakRain >= 60 ? (
                <span>⚠️ Heavy rain risk ({upcomingPeakRain}%) expected around <span className="text-amber-700 underline decoration-amber-400/50">{peakRainTimeStr}</span>. Avoid two-wheeler commute during peak showers.</span>
              ) : airQuality.aqi > 160 ? (
                <span>😷 Elevated AQI ({airQuality.aqi}) in {location.name}. Wear an N95 mask for outdoor workouts and travel.</span>
              ) : current.feelsLike >= 38 ? (
                <span>☀️ High thermal heat index (Feels like {current.feelsLike}°C). Stay hydrated; best outdoor window is before 9:00 AM.</span>
              ) : (
                <span>✨ Favorable conditions across {location.name}. Moderate temperature ({current.temperature}°C) and low rain risk ({upcomingPeakRain}%).</span>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              {upcomingPeakRain >= 60 
                ? `Safe window recommendation: If travelling, depart early or wait until conditions ease after peak storm cells pass.`
                : `Decision metrics: Rain chance ${upcomingPeakRain}%, AQI ${airQuality.aqi} (${airQuality.category}), Wind ${current.windSpeed} km/h.`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateToChatWithPrompt(`Kal 8 baje ${location.name} mein bike leke nikalna kaisa rahega?`)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Ask Custom Decision</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK DECISION TRIAGE CARDS (Bike, Run, Laundry) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* Bike Commute Status */}
        <div 
          onClick={() => onNavigateToTab('activities')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            isBikeSafe 
              ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300' 
              : 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${isBikeSafe ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                <Bike className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-gray-900">Bike / Commute</span>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isBikeSafe ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}>
              {isBikeSafe ? 'SAFE TO RIDE' : 'RISKY / AVOID'}
            </span>
          </div>
          <p className="text-xs text-gray-600 font-medium">
            {isBikeSafe 
              ? `Dry roads, ${current.windSpeed} km/h wind. Great for two-wheelers.` 
              : `High rain risk (${upcomingPeakRain}%) and slippery tarmac around ${peakRainTimeStr}.`}
          </p>
        </div>

        {/* Outdoor Fitness / Jogging */}
        <div 
          onClick={() => onNavigateToTab('activities')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            isRunningSafe 
              ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300' 
              : 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${isRunningSafe ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                <Footprints className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-gray-900">Outdoor Workout</span>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isRunningSafe ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              {isRunningSafe ? 'FAVORABLE' : 'MODERATE CAUTION'}
            </span>
          </div>
          <p className="text-xs text-gray-600 font-medium">
            {isRunningSafe 
              ? `AQI is ${airQuality.aqi}. Optimal window is 6:00 AM – 7:30 AM.` 
              : `Air quality ${airQuality.aqi} & heat index ${current.feelsLike}°C. Moderate intensity only.`}
          </p>
        </div>

        {/* Outdoor Laundry Drying */}
        <div 
          onClick={() => onNavigateToTab('activities')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            isLaundrySafe 
              ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300' 
              : 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${isLaundrySafe ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                <Shirt className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-gray-900">Dry Laundry Outdoors</span>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isLaundrySafe ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}>
              {isLaundrySafe ? 'DRY TODAY' : 'USE INDOOR RACKS'}
            </span>
          </div>
          <p className="text-xs text-gray-600 font-medium">
            {isLaundrySafe 
              ? `Good solar irradiance. Clothes will dry in 2-3 hours.` 
              : `Sudden rain showers or high humidity (${current.humidity}%) will dampen clothes.`}
          </p>
        </div>

      </div>

      {/* MAIN METEOROLOGY GRID: HERO WEATHER CARD + AQI GAUGE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Main Live Weather Card */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{location.name}</h1>
                <span className="text-xs text-gray-600 font-semibold px-2 py-0.5 bg-gray-100 rounded-md border border-gray-200">
                  {location.state || location.country}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Updated {new Date(current.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Live Open-Meteo Grounded Data
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-right">
              <span className="text-xs font-bold text-amber-700 block">{current.condition}</span>
              <span className="text-[11px] text-gray-500 font-medium">{current.conditionDesc}</span>
            </div>
          </div>

          {/* Temperature Display */}
          <div className="my-6 flex flex-wrap items-baseline gap-6">
            <div className="flex items-start">
              <span className="text-6xl sm:text-7xl font-black tracking-tighter text-gray-900">
                {preferences.temperatureUnit === 'fahrenheit' 
                  ? Math.round((current.temperature * 9) / 5 + 32)
                  : current.temperature}
              </span>
              <span className="text-2xl sm:text-3xl font-light text-gray-400 ml-1">
                °{preferences.temperatureUnit === 'fahrenheit' ? 'F' : 'C'}
              </span>
            </div>

            <div className="space-y-1 text-sm">
              <div className="text-gray-700 font-medium">
                {getTranslation(lang, 'feelsLike')}: <span className="font-bold text-gray-900">{preferences.temperatureUnit === 'fahrenheit' ? Math.round((current.feelsLike * 9) / 5 + 32) : current.feelsLike}°</span>
              </div>
              <div className="text-xs text-gray-500 font-medium">
                Today's Range: <span className="text-emerald-700 font-bold">{daily[0]?.temperatureMin ?? 22}°</span> — <span className="text-rose-600 font-bold">{daily[0]?.temperatureMax ?? 33}°</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 pt-1 font-medium">
                <span className="flex items-center gap-1">
                  <Sunrise className="w-3.5 h-3.5 text-amber-500" /> {daily[0]?.sunrise || '05:42'}
                </span>
                <span className="flex items-center gap-1">
                  <Sunset className="w-3.5 h-3.5 text-orange-500" /> {daily[0]?.sunset || '18:48'}
                </span>
              </div>
            </div>
          </div>

          {/* 6 Key Weather Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100">
            
            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/80">
              <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1 font-medium">
                <CloudRain className="w-4 h-4 text-blue-600" />
                <span>{getTranslation(lang, 'rainProbability')}</span>
              </div>
              <div className="text-base font-bold text-gray-900">{upcomingPeakRain}%</div>
              <div className="text-[11px] text-gray-500">{current.precipitation > 0 ? `${current.precipitation} mm now` : 'Precipitation chance'}</div>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/80">
              <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1 font-medium">
                <Wind className="w-4 h-4 text-teal-600" />
                <span>{getTranslation(lang, 'wind')}</span>
              </div>
              <div className="text-base font-bold text-gray-900">{current.windSpeed} km/h</div>
              <div className="text-[11px] text-gray-500">Gusts up to {current.windGusts || current.windSpeed + 6} km/h</div>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/80">
              <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1 font-medium">
                <Droplets className="w-4 h-4 text-sky-600" />
                <span>{getTranslation(lang, 'humidity')}</span>
              </div>
              <div className="text-base font-bold text-gray-900">{current.humidity}%</div>
              <div className="text-[11px] text-gray-500">Dew point: {current.dewPoint || 21}°C</div>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/80">
              <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1 font-medium">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>{getTranslation(lang, 'uvIndex')}</span>
              </div>
              <div className="text-base font-bold text-gray-900">{current.uvIndex} / 11</div>
              <div className="text-[11px] text-gray-500">{current.uvIndex > 6 ? 'High solar intensity' : 'Moderate UV'}</div>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/80">
              <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1 font-medium">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>{getTranslation(lang, 'visibility')}</span>
              </div>
              <div className="text-base font-bold text-gray-900">{current.visibility} km</div>
              <div className="text-[11px] text-gray-500">{current.visibility < 4 ? 'Reduced morning fog' : 'Clear road horizon'}</div>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/80">
              <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1 font-medium">
                <Gauge className="w-4 h-4 text-purple-600" />
                <span>{getTranslation(lang, 'pressure')}</span>
              </div>
              <div className="text-base font-bold text-gray-900">{current.pressure} hPa</div>
              <div className="text-[11px] text-gray-500">Normal barometric baseline</div>
            </div>

          </div>
        </div>

        {/* Right 1 Col: Air Quality Index (AQI) Dial Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-black text-xs">
                  AQI
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{getTranslation(lang, 'aqi')}</h3>
                  <span className="text-[11px] text-gray-500 font-medium">CPCB & European Standard</span>
                </div>
              </div>

              <span 
                className="px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: aqiInfo.color }}
              >
                {airQuality.category}
              </span>
            </div>

            {/* AQI Big Score */}
            <div className="my-4 text-center py-4 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-5xl font-black text-gray-900 tracking-tight">{airQuality.aqi}</span>
              <span className="text-xs text-gray-500 font-medium block mt-1">Air Quality Index</span>
              
              {/* Colored Indicator Bar */}
              <div className="w-4/5 mx-auto bg-gray-200 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${Math.min(100, (airQuality.aqi / 300) * 100)}%`,
                    backgroundColor: aqiInfo.color 
                  }}
                />
              </div>
            </div>

            {/* Pollutant Matrix Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-500 block text-[10px] font-medium">PM2.5</span>
                <span className="font-bold text-gray-900">{airQuality.pm25} µg/m³</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-500 block text-[10px] font-medium">PM10</span>
                <span className="font-bold text-gray-900">{airQuality.pm10} µg/m³</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-500 block text-[10px] font-medium">NO₂</span>
                <span className="font-bold text-gray-900">{airQuality.nitrogenDioxide} µg/m³</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-500 block text-[10px] font-medium">Ozone (O₃)</span>
                <span className="font-bold text-gray-900">{airQuality.ozone} µg/m³</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700">
            <span className="font-bold text-gray-900 block mb-0.5">Health Guidance:</span>
            {airQuality.healthAdvice}
          </div>
        </div>

      </div>

      {/* 24-HOUR HOURLY DECISION TIMELINE (RECHARTS) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              {getTranslation(lang, 'hourlyForecast')}
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Interactive hourly temperature trend (°C) & precipitation chance (%)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
              <span className="text-gray-700">Temperature</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="text-gray-700">Rain Probability %</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '12px', fontSize: '12px', color: '#111827', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#1E40AF' }}
              />
              <Area type="monotone" dataKey="temp" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#tempGradient)" name="Temperature" />
              <Area type="monotone" dataKey="rainChance" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#rainGradient)" name="Rain Chance %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Scrollable Hourly Strip */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {hourly.slice(0, 16).map((h, i) => (
            <div 
              key={i} 
              className={`p-2.5 rounded-xl text-center min-w-[76px] shrink-0 border ${
                h.precipitationProbability >= 60 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200/80'
              }`}
            >
              <span className="text-[11px] text-gray-500 font-semibold block">
                {new Date(h.time).toLocaleTimeString([], { hour: 'numeric' })}
              </span>
              <span className="text-sm font-bold text-gray-900 my-1 block">
                {preferences.temperatureUnit === 'fahrenheit' ? Math.round((h.temperature * 9) / 5 + 32) : h.temperature}°
              </span>
              <div className="flex items-center justify-center gap-1 text-[10px] text-amber-700 font-bold">
                <CloudRain className="w-3 h-3 text-amber-600" />
                <span>{h.precipitationProbability}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-DAY FORECAST CARDS */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              {getTranslation(lang, 'dailyForecast')}
            </h3>
            <p className="text-xs text-gray-500 font-medium">Longer horizon planning & precipitation probabilities</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {daily.map((day, i) => {
            const dateObj = new Date(day.date);
            const dayName = i === 0 ? getTranslation(lang, 'today') : i === 1 ? getTranslation(lang, 'tomorrow') : dateObj.toLocaleDateString([], { weekday: 'short' });
            const dateNum = dateObj.toLocaleDateString([], { day: 'numeric', month: 'short' });

            return (
              <div 
                key={day.date}
                className="bg-gray-50/70 border border-gray-200/80 hover:border-gray-300 rounded-xl p-3 text-center flex flex-col justify-between transition-all"
              >
                <div>
                  <span className="text-xs font-bold text-gray-900 block">{dayName}</span>
                  <span className="text-[10px] text-gray-500 font-medium block mb-2">{dateNum}</span>
                  <span className="text-xs font-semibold text-amber-700 block">{day.condition}</span>
                </div>

                <div className="my-3">
                  <div className="flex items-center justify-center gap-1.5 text-sm font-bold">
                    <span className="text-rose-600">{day.temperatureMax}°</span>
                    <span className="text-gray-300">/</span>
                    <span className="text-blue-600">{day.temperatureMin}°</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200/80 flex items-center justify-center gap-1 text-[11px] text-gray-600 font-medium">
                  <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-bold">{day.precipitationProbabilityMax}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
