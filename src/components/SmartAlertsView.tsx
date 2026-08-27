import React, { useState } from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  Bike, 
  CheckCircle2, 
  Sparkles, 
  Settings,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { GroundedWeatherContext, UserPreferences, WeatherAlert } from '../types/weather';

interface SmartAlertsViewProps {
  currentContext: GroundedWeatherContext;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onAskGptAboutAlert: (alertHeadline: string) => void;
}

export const SmartAlertsView: React.FC<SmartAlertsViewProps> = ({
  currentContext,
  preferences,
  onUpdatePreferences,
  onAskGptAboutAlert,
}) => {
  const { location, alerts, hourly, current } = currentContext;
  const [commuteStart, setCommuteStart] = useState(preferences.commuteStartTime);
  const [commuteEnd, setCommuteEnd] = useState(preferences.commuteEndTime);
  const [commuteType, setCommuteType] = useState(preferences.commuteType);

  // Check if any rain / storm / AQI peaks overlap with commute hours
  const morningCommuteHour = parseInt(commuteStart.split(':')[0], 10);
  const eveningCommuteHour = parseInt(commuteEnd.split(':')[0], 10);

  const morningWeather = hourly.find(h => new Date(h.time).getHours() === morningCommuteHour);
  const eveningWeather = hourly.find(h => new Date(h.time).getHours() === eveningCommuteHour);

  const isMorningRisky = (morningWeather?.precipitationProbability || 0) > 50 || (morningWeather?.windSpeed || 0) > 25;
  const isEveningRisky = (eveningWeather?.precipitationProbability || 0) > 50 || (eveningWeather?.windSpeed || 0) > 25;

  const handleSaveCommute = () => {
    onUpdatePreferences({
      commuteStartTime: commuteStart,
      commuteEndTime: commuteEnd,
      commuteType: commuteType,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Commute Config Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Smart Alert & Commute Relevance Watchdog</h2>
            <p className="text-xs text-gray-500 font-medium">Proactive alerts filtered strictly by your daily schedule & travel mode</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Morning Commute
            </label>
            <input
              type="time"
              value={commuteStart}
              onChange={(e) => setCommuteStart(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Evening Commute
            </label>
            <input
              type="time"
              value={commuteEnd}
              onChange={(e) => setCommuteEnd(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center gap-1">
              <Bike className="w-3.5 h-3.5 text-emerald-600" />
              Transit Mode
            </label>
            <select
              value={commuteType}
              onChange={(e) => setCommuteType(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
            >
              <option value="bike">Bike / Two-Wheeler</option>
              <option value="public_transit">Bus / Metro / Train</option>
              <option value="car">Car / Taxi</option>
              <option value="walk">Walking</option>
            </select>
          </div>

          <div>
            <button
              onClick={handleSaveCommute}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              Save Commute Schedule
            </button>
          </div>

        </div>
      </div>

      {/* COMMUTE COLLISION WATCHDOG CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Morning Watchdog */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isMorningRisky 
            ? 'bg-rose-50/50 border-rose-200' 
            : 'bg-emerald-50/40 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Morning Commute ({commuteStart})
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              isMorningRisky ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {isMorningRisky ? 'HAZARD OVERLAP' : 'CLEAR COMMUTE'}
            </span>
          </div>

          <p className="text-xs text-gray-700 font-medium mb-3">
            {isMorningRisky
              ? `Rain chance is ${morningWeather?.precipitationProbability || 60}% during your ${commuteStart} departure. Roads will be wet.`
              : `Morning conditions favorable. Rain probability is low (${morningWeather?.precipitationProbability || 10}%) with clear visibility.`}
          </p>

          <div className="text-xs font-semibold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Recommendation: {isMorningRisky ? 'Leave 25 mins earlier or take metro' : 'Standard departure time is optimal'}</span>
          </div>
        </div>

        {/* Evening Watchdog */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isEveningRisky 
            ? 'bg-rose-50/50 border-rose-200' 
            : 'bg-emerald-50/40 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Evening Return ({commuteEnd})
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              isEveningRisky ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {isEveningRisky ? 'HAZARD OVERLAP' : 'CLEAR RETURN'}
            </span>
          </div>

          <p className="text-xs text-gray-700 font-medium mb-3">
            {isEveningRisky
              ? `Heavy rain and wind gusts forecast between 5 PM and 8 PM. Rain probability peaks at ${eveningWeather?.precipitationProbability || 75}%.`
              : `Evening commute window is clear with mild breeze (${eveningWeather?.windSpeed || 12} km/h).`}
          </p>

          <div className="text-xs font-semibold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Recommendation: {isEveningRisky ? 'Avoid two-wheeler riding; wait until 8 PM or take car/train' : 'Safe for two-wheeler riding'}</span>
          </div>
        </div>

      </div>

      {/* ACTIVE WEATHER ALERTS FEED */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Active Meteorological Warnings & Alerts</h3>
            <p className="text-xs text-gray-500 font-medium">Grounded IMD & Open-Meteo severe weather detection</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            {alerts.length} Active Notice{alerts.length === 1 ? '' : 's'}
          </span>
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                      {alert.type} • {alert.severity}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      Window: {alert.affectedTimeWindow || 'Upcoming'}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-gray-900">{alert.headline}</h4>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">{alert.description}</p>
                  
                  <div className="pt-1 text-xs text-amber-700 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Action: {alert.recommendedAction}</span>
                  </div>
                </div>

                <button
                  onClick={() => onAskGptAboutAlert(alert.headline)}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer shadow-2xs"
                >
                  Ask AI Mitigation &rarr;
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 text-gray-500 text-xs">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <span className="font-bold text-gray-900 block text-sm mb-1">No Severe Hazards Detected</span>
            Atmospheric parameters in {location.name} are within safe thresholds.
          </div>
        )}
      </div>

    </div>
  );
};
