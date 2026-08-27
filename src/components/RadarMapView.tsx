import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Wind, 
  CloudRain, 
  Thermometer, 
  ShieldCheck, 
  MapPin,
  Sparkles
} from 'lucide-react';
import { GeoLocation, GroundedWeatherContext, UserPreferences } from '../types/weather';
import { PRESET_INDIAN_LOCATIONS } from '../services/weatherApi';

interface RadarMapViewProps {
  currentContext: GroundedWeatherContext;
  preferences: UserPreferences;
  onSelectCity: (loc: GeoLocation) => void;
}

export const RadarMapView: React.FC<RadarMapViewProps> = ({
  currentContext,
  preferences,
  onSelectCity,
}) => {
  const [activeLayer, setActiveLayer] = useState<'radar' | 'wind' | 'temp' | 'aqi'>('radar');
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeStep, setTimeStep] = useState(3); // 0 to 6 (representing -2h, -1h, Now, +1h, +2h, +3h, +4h)
  const timeLabels = ['-2 Hours', '-1 Hour', 'NOW (Live)', '+1 Hour', '+2 Hours', '+3 Hours', '+4 Hours'];

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setTimeStep(prev => (prev + 1) % timeLabels.length);
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Controls */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
              <Radar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Interactive Weather Radar & Atmospheric Map</h2>
              <p className="text-xs text-gray-500 font-medium">Real-time Doppler precipitation scan & wind vector isobar simulation</p>
            </div>
          </div>
        </div>

        {/* Layer Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
          <button
            onClick={() => setActiveLayer('radar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeLayer === 'radar' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rain Radar</span>
          </button>

          <button
            onClick={() => setActiveLayer('wind')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeLayer === 'wind' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind Flow</span>
          </button>

          <button
            onClick={() => setActiveLayer('temp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeLayer === 'temp' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Thermal Heat</span>
          </button>

          <button
            onClick={() => setActiveLayer('aqi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeLayer === 'aqi' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AQI Smog</span>
          </button>
        </div>
      </div>

      {/* RADAR CANVAS CONTAINER */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden min-h-[480px] flex flex-col justify-between">
        
        {/* Animated Background Grid & Radar Sweep */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e120_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e120_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        {/* Radar Circular Sweep Line */}
        {activeLayer === 'radar' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-blue-500/20 pointer-events-none">
            <div className="w-full h-full rounded-full border border-blue-500/10 scale-75" />
            <div className="w-full h-full rounded-full border border-blue-500/10 scale-50" />
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(59,130,246,0.15)_360deg)] animate-[spin_4s_linear_infinite]" />
          </div>
        )}

        {/* Dynamic Storm Cloud Blobs on Map */}
        {activeLayer === 'radar' && (
          <>
            <div 
              className="absolute top-1/3 left-1/3 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl transition-all duration-1000 pointer-events-none"
              style={{ transform: `translate(${timeStep * 12}px, ${timeStep * -6}px) scale(${1 + (timeStep % 2) * 0.15})` }}
            />
            <div 
              className="absolute top-1/2 left-1/2 w-48 h-48 bg-amber-400/15 rounded-full blur-xl transition-all duration-1000 pointer-events-none"
              style={{ transform: `translate(${timeStep * -8}px, ${timeStep * 10}px)` }}
            />
          </>
        )}

        {/* Interactive City Nodes on Canvas */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {PRESET_INDIAN_LOCATIONS.slice(0, 8).map((city) => {
            const isSelected = city.id === currentContext.location.id;
            return (
              <button
                key={city.id}
                onClick={() => onSelectCity(city)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/40 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    {city.name}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 border border-gray-200">
                    {city.state?.slice(0, 2).toUpperCase() || 'IN'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-lg font-black text-gray-900">
                    {isSelected ? `${currentContext.current.temperature}°C` : '31°C'}
                  </span>
                  <span className="text-xs font-semibold text-amber-700">
                    {isSelected ? currentContext.current.condition : 'Partly Cloudy'}
                  </span>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500 font-medium">
                  <span>Rain: {isSelected ? Math.max(...currentContext.hourly.slice(0, 8).map(h => h.precipitationProbability)) : 35}%</span>
                  <span>AQI: {isSelected ? currentContext.airQuality.aqi : 110}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* TIME CONTROLS & TIMELAPSE SLIDER */}
        <div className="relative z-10 mt-8 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setTimeStep(2)}
              title="Reset to Live Now"
              className="p-2.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="text-xs">
              <span className="text-gray-500 block text-[10px] font-medium">Active Frame</span>
              <span className="font-bold text-gray-900 text-sm">{timeLabels[timeStep]}</span>
            </div>
          </div>

          {/* Stepper Timeline Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {timeLabels.map((lbl, idx) => (
              <button
                key={idx}
                onClick={() => setTimeStep(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeStep === idx
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
