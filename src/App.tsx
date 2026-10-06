import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { WeatherGptChat } from './components/WeatherGptChat';
import { ActivityAdvisorView } from './components/ActivityAdvisorView';
import { TravelIntelligenceView } from './components/TravelIntelligenceView';
import { HistoricalIntelligenceView } from './components/HistoricalIntelligenceView';
import { WeatherComparisonView } from './components/WeatherComparisonView';
import { RadarMapView } from './components/RadarMapView';
import { SmartAlertsView } from './components/SmartAlertsView';
import { SettingsModal } from './components/SettingsModal';
import { 
  GeoLocation, 
  GroundedWeatherContext, 
  UserPreferences, 
  SupportedLanguage 
} from './types/weather';
import { 
  PRESET_INDIAN_LOCATIONS, 
  fetchLiveWeather, 
  generateFallbackWeather 
} from './services/weatherApi';
import { AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'en',
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
  voiceAutoPlay: false,
  commuteStartTime: '08:30',
  commuteEndTime: '18:00',
  commuteType: 'bike',
  theme: 'light',
};

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation>(PRESET_INDIAN_LOCATIONS[0]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [weatherContext, setWeatherContext] = useState<GroundedWeatherContext>(() => 
    generateFallbackWeather(PRESET_INDIAN_LOCATIONS[0])
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [chatPromptFromElsewhere, setChatPromptFromElsewhere] = useState<string>('');

  // Load and save preferences
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('weathergpt_preferences');
      return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('weathergpt_preferences', JSON.stringify(preferences));
    } catch {
      // ignore
    }
  }, [preferences]);

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme ?? 'light';
    document.documentElement.style.colorScheme = preferences.theme ?? 'light';
  }, [preferences.theme]);

  // Load weather when selectedLocation changes
  useEffect(() => {
    loadWeatherData(selectedLocation);
  }, [selectedLocation.id]);

  const loadWeatherData = async (loc: GeoLocation) => {
    setIsLoading(true);
    try {
      const liveData = await fetchLiveWeather(loc);
      setWeatherContext(liveData);
    } catch (err) {
      console.warn('Falling back to local high-precision weather simulation:', err);
      const fallback = generateFallbackWeather(loc);
      setWeatherContext(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  };

  const handleNavigateToChatWithPrompt = (promptText: string) => {
    setChatPromptFromElsewhere(promptText);
    setActiveTab('chat');
  };

  // Severe alert ticker
  const topSevereAlert = weatherContext.alerts.find(a => a.severity === 'EXTREME' || a.severity === 'SEVERE');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      
      {/* SEVERE ALERT NOTIFICATION TICKER (IF ACTIVE) */}
      {topSevereAlert && (
        <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 px-4 py-2 text-xs font-semibold flex items-center justify-between text-white shadow-sm">
          <div className="flex items-center gap-2 max-w-4xl truncate">
            <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />
            <span className="truncate">
              <strong>{topSevereAlert.headline}:</strong> {topSevereAlert.recommendedAction}
            </span>
          </div>
          <button 
            onClick={() => setActiveTab('alerts')}
            className="ml-2 px-2.5 py-0.5 bg-black/20 hover:bg-black/40 rounded-full text-[11px] font-bold border border-white/30 whitespace-nowrap cursor-pointer transition-colors"
          >
            Review Triage &rarr;
          </button>
        </div>
      )}

      {/* HEADER */}
      <Header
        currentLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* NAVIGATION BAR */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        lang={preferences.language}
        alertCount={weatherContext.alerts.length}
      />

      {/* MAIN VIEW CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Dynamic View Routing */}
        {activeTab === 'dashboard' && (
          <DashboardView
            weatherContext={weatherContext}
            preferences={preferences}
            onNavigateToChatWithPrompt={handleNavigateToChatWithPrompt}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'chat' && (
          <WeatherGptChat
            weatherContext={weatherContext}
            preferences={preferences}
            initialPrompt={chatPromptFromElsewhere}
            onClearInitialPrompt={() => setChatPromptFromElsewhere('')}
          />
        )}

        {activeTab === 'activities' && (
          <ActivityAdvisorView
            weatherContext={weatherContext}
            preferences={preferences}
            onAskGptAboutActivity={(activityTitle) => 
              handleNavigateToChatWithPrompt(`Can you analyze the weather conditions for ${activityTitle} in ${selectedLocation.name} today and tell me the best precautions?`)
            }
          />
        )}

        {activeTab === 'travel' && (
          <TravelIntelligenceView
            currentContext={weatherContext}
            preferences={preferences}
            onAskGptAboutTravel={handleNavigateToChatWithPrompt}
          />
        )}

        {activeTab === 'history' && (
          <HistoricalIntelligenceView
            currentContext={weatherContext}
            preferences={preferences}
            onAskGptClimateQuestion={handleNavigateToChatWithPrompt}
          />
        )}

        {activeTab === 'compare' && (
          <WeatherComparisonView
            currentContext={weatherContext}
            preferences={preferences}
            onAskGptAboutComparison={handleNavigateToChatWithPrompt}
          />
        )}

        {activeTab === 'radar' && (
          <RadarMapView
            currentContext={weatherContext}
            preferences={preferences}
            onSelectCity={(city) => {
              setSelectedLocation(city);
            }}
          />
        )}

        {activeTab === 'alerts' && (
          <SmartAlertsView
            currentContext={weatherContext}
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onAskGptAboutAlert={(headline) => 
              handleNavigateToChatWithPrompt(`How should I prepare for this weather alert in ${selectedLocation.name}: "${headline}"?`)
            }
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">WeatherGPT</span>
            <span>•</span>
            <span>Real-Time Grounded Meteorological Intelligence & AI Decision Engine</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <span>Live Open-Meteo & ERA5 Grounding</span>
            <span>•</span>
            <span>12 Indian Regional Languages</span>
          </div>
        </div>
      </footer>

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
      />

    </div>
  );
}
