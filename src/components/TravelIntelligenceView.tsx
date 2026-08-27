import React, { useState } from 'react';
import { 
  Navigation2, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  ShieldAlert, 
  Clock, 
  Luggage, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles,
  CloudRain,
  SunMedium,
  Car
} from 'lucide-react';
import { GeoLocation, GroundedWeatherContext, UserPreferences, TravelRiskReport } from '../types/weather';
import { PRESET_INDIAN_LOCATIONS, fetchLiveWeather, generateFallbackWeather } from '../services/weatherApi';
import { generateTravelRiskAssessment } from '../services/riskEngine';

interface TravelIntelligenceViewProps {
  currentContext: GroundedWeatherContext;
  preferences: UserPreferences;
  onAskGptAboutTravel: (prompt: string) => void;
}

export const TravelIntelligenceView: React.FC<TravelIntelligenceViewProps> = ({
  currentContext,
  preferences,
  onAskGptAboutTravel,
}) => {
  const [originLocation, setOriginLocation] = useState<GeoLocation>(currentContext.location);
  const [destLocation, setDestLocation] = useState<GeoLocation>(
    PRESET_INDIAN_LOCATIONS.find(l => l.name.toLowerCase() !== currentContext.location.name.toLowerCase()) || PRESET_INDIAN_LOCATIONS[1]
  );
  const [travelDate, setTravelDate] = useState('Tomorrow');
  const [travelReport, setTravelReport] = useState<TravelRiskReport>(() => {
    const destContext = generateFallbackWeather(PRESET_INDIAN_LOCATIONS[1]);
    return generateTravelRiskAssessment(currentContext.location, PRESET_INDIAN_LOCATIONS[1], currentContext, destContext, 'Tomorrow');
  });
  const [isCalculating, setIsCalculating] = useState(false);

  const handleComputeRoute = async () => {
    setIsCalculating(true);
    try {
      const destCtx = await fetchLiveWeather(destLocation);
      const report = generateTravelRiskAssessment(originLocation, destLocation, currentContext, destCtx, travelDate);
      setTravelReport(report);
    } catch {
      const fallbackDest = generateFallbackWeather(destLocation);
      const report = generateTravelRiskAssessment(originLocation, destLocation, currentContext, fallbackDest, travelDate);
      setTravelReport(report);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Route Selector Input Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
            <Navigation2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Travel Weather Intelligence Engine</h2>
            <p className="text-xs text-gray-500 font-medium">Corridor hazard analysis & departure window recommendations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          {/* Origin Selection */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Departure Origin
            </label>
            <select
              value={originLocation.id}
              onChange={(e) => {
                const loc = PRESET_INDIAN_LOCATIONS.find(l => l.id === e.target.value) || PRESET_INDIAN_LOCATIONS[0];
                setOriginLocation(loc);
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 font-medium"
            >
              {PRESET_INDIAN_LOCATIONS.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.state || l.country})</option>
              ))}
            </select>
          </div>

          {/* Destination Selection */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              Arrival Destination
            </label>
            <select
              value={destLocation.id}
              onChange={(e) => {
                const loc = PRESET_INDIAN_LOCATIONS.find(l => l.id === e.target.value) || PRESET_INDIAN_LOCATIONS[1];
                setDestLocation(loc);
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 font-medium"
            >
              {PRESET_INDIAN_LOCATIONS.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.state || l.country})</option>
              ))}
            </select>
          </div>

          {/* Travel Date */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Travel Date
            </label>
            <div className="flex items-center gap-2">
              <select
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 font-medium"
              >
                <option value="Today">Today</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="In 2 Days">In 2 Days</option>
                <option value="This Weekend">This Weekend</option>
              </select>
              <button
                onClick={handleComputeRoute}
                disabled={isCalculating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs transition-all cursor-pointer"
              >
                {isCalculating ? 'Analysing...' : 'Analyze Route'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* TRAVEL RISK OVERVIEW CARD */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <span className="font-bold text-gray-900">{travelReport.origin}</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-gray-900">{travelReport.destination}</span>
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md border border-gray-200 font-medium">
                {travelReport.travelDate}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mt-1">Route Weather Risk Assessment</h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-medium">Overall Route Hazard:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${
              travelReport.overallRisk === 'HIGH' 
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : travelReport.overallRisk === 'MODERATE'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {travelReport.overallRisk} RISK
            </span>
          </div>
        </div>

        {/* DECISION VERDICT BANNER */}
        <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-800 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Decision Support Recommendation
          </div>
          <p className="text-sm font-semibold text-gray-900 leading-relaxed">
            {travelReport.recommendation}
          </p>
          <div className="flex items-center gap-2 text-xs text-blue-700 font-medium pt-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{travelReport.departureAdvice}</span>
          </div>
        </div>

        {/* STRUCTURED ROUTE SEGMENTS TABLE */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Corridor Segments Breakdown
          </span>
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600 font-semibold bg-gray-50">
                  <th className="py-2.5 px-3">Segment</th>
                  <th className="py-2.5 px-3">Location / Stretch</th>
                  <th className="py-2.5 px-3">Expected Weather</th>
                  <th className="py-2.5 px-3">Temp</th>
                  <th className="py-2.5 px-3">Rain Risk</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3">Operational Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {travelReport.routeSegments.map((seg, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-gray-900">{seg.segment}</td>
                    <td className="py-3 px-3 text-gray-700 font-medium">{seg.locationName}</td>
                    <td className="py-3 px-3 text-amber-700 font-semibold">{seg.weatherCondition}</td>
                    <td className="py-3 px-3 font-bold text-gray-900">{seg.temperature}°C</td>
                    <td className="py-3 px-3 font-bold text-blue-600">{seg.rainProbability}%</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        seg.riskLevel === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' : seg.riskLevel === 'MODERATE' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {seg.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{seg.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ESSENTIAL PACKING LIST */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
            <Luggage className="w-4 h-4 text-emerald-600" />
            <span>Recommended Packing Checklist for {travelReport.destination} Trip:</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {travelReport.packingList.map((item, idx) => (
              <span key={idx} className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-xs text-gray-800 flex items-center gap-1.5 font-medium shadow-2xs">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Ask WeatherGPT Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onAskGptAboutTravel(`Main kal ${travelReport.origin} se ${travelReport.destination} ja raha hoon. Travel time aur safety tips batayein.`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Ask WeatherGPT for Route Optimization</span>
          </button>
        </div>

      </div>

    </div>
  );
};
