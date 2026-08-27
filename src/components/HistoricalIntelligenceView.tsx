import React, { useState, useEffect } from 'react';
import { 
  History, 
  TrendingUp, 
  Flame, 
  CloudRain, 
  Calendar, 
  MapPin, 
  Sparkles, 
  BarChart2, 
  Info 
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
  CartesianGrid,
  Legend
} from 'recharts';
import { GroundedWeatherContext, HistoricalAnalysisResult, UserPreferences } from '../types/weather';
import { fetchHistoricalTrends, PRESET_INDIAN_LOCATIONS } from '../services/weatherApi';

interface HistoricalIntelligenceViewProps {
  currentContext: GroundedWeatherContext;
  preferences: UserPreferences;
  onAskGptClimateQuestion: (question: string) => void;
}

export const HistoricalIntelligenceView: React.FC<HistoricalIntelligenceViewProps> = ({
  currentContext,
  preferences,
  onAskGptClimateQuestion,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [historyData, setHistoryData] = useState<HistoricalAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistoricalData();
  }, [currentContext.location.id, selectedMonth]);

  const loadHistoricalData = async () => {
    setIsLoading(true);
    const data = await fetchHistoricalTrends(currentContext.location, selectedMonth);
    setHistoryData(data);
    setIsLoading(false);
  };

  const sampleHistoricalQuestions = [
    `Has ${selectedMonth} become hotter over the last 10 years in ${currentContext.location.name}?`,
    `Compare this year's monsoon rainfall in ${currentContext.location.name} with historical averages.`,
    `How have extreme heat days increased in ${currentContext.location.name} since 2016?`
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Historical Weather Intelligence & Climate Trends</h2>
              <p className="text-xs text-gray-500 font-medium">
                10-Year ERA5 / Open-Meteo climate analytics for {currentContext.location.name}
              </p>
            </div>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-700">Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500"
          >
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* QUICK STATS COMPARISON */}
      {historyData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              <span>Decadal Temperature Climb</span>
            </div>
            <div className="text-xl font-bold text-gray-900">
              +{((historyData.yearlySummaries[historyData.yearlySummaries.length - 1]?.avgTemperature || 32) - (historyData.yearlySummaries[0]?.avgTemperature || 30)).toFixed(1)}°C
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-1">Average shift from 2016 baseline</p>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Extreme Heat Days Surge</span>
            </div>
            <div className="text-xl font-bold text-gray-900">
              {historyData.yearlySummaries[historyData.yearlySummaries.length - 1]?.extremeHeatDays} Days / Year
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-1">Up from {historyData.yearlySummaries[0]?.extremeHeatDays} days in 2016</p>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
              <CloudRain className="w-4 h-4 text-blue-600" />
              <span>Precipitation Pattern</span>
            </div>
            <div className="text-xl font-bold text-gray-900">
              {historyData.yearlySummaries[historyData.yearlySummaries.length - 1]?.totalRainfall} mm
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-1">Intense episodic downpours</p>
          </div>

        </div>
      )}

      {/* CHARTS CONTAINER: 10-YEAR TEMPERATURE & PRECIPITATION TRENDS */}
      {historyData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Temperature Trend Chart */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                10-Year {selectedMonth} Temperature Trends (°C)
              </h3>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData.yearlySummaries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="avgTempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="year" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area type="monotone" dataKey="avgTemperature" stroke="#F43F5E" strokeWidth={2.5} fillOpacity={1} fill="url(#avgTempGrad)" name="Avg Temp °C" />
                  <Area type="monotone" dataKey="maxTemperature" stroke="#FB923C" strokeWidth={1.5} strokeDasharray="3 3" fill="none" name="Peak Max °C" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-2">
              {historyData.tempTrendDescription}
            </p>
          </div>

          {/* Rainfall Trend Chart */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-blue-600" />
                10-Year {selectedMonth} Total Rainfall (mm)
              </h3>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData.yearlySummaries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="year" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="totalRainfall" fill="#2563EB" radius={[4, 4, 0, 0]} name="Rainfall (mm)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-2">
              {historyData.rainfallTrendDescription}
            </p>
          </div>

        </div>
      )}

      {/* AI CLIMATE DATA SCIENCE SYNTHESIS CARD */}
      {historyData && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-600" />
            AI Climate Intelligence Synthesis
          </div>

          <div className="space-y-2 text-sm text-gray-800">
            <p className="leading-relaxed font-medium">
              {historyData.aiClimateInsight}
            </p>
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 font-medium">
              <span className="font-bold text-gray-900 block mb-0.5">Key Decision Takeaway:</span>
              {historyData.keyTakeaway}
            </div>
          </div>

          {/* Quick AI Prompt Trigger Chips */}
          <div className="pt-2">
            <span className="text-xs text-gray-500 block mb-2 font-semibold">Explore with WeatherGPT AI:</span>
            <div className="flex flex-wrap gap-2">
              {sampleHistoricalQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onAskGptClimateQuestion(q)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
