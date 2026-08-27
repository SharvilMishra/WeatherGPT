import React, { useState } from 'react';
import { 
  CloudSun, 
  MapPin, 
  Search, 
  Globe, 
  Mic, 
  MicOff, 
  Settings, 
  Volume2, 
  VolumeX, 
  Navigation as NavIcon,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { GeoLocation, SupportedLanguage, UserPreferences } from '../types/weather';
import { SUPPORTED_LANGUAGES, getTranslation } from '../services/i18n';
import { PRESET_INDIAN_LOCATIONS, searchLocations } from '../services/weatherApi';

interface HeaderProps {
  currentLocation: GeoLocation;
  onSelectLocation: (loc: GeoLocation) => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onOpenSettings: () => void;
  onTriggerVoiceChat: () => void;
  isVoiceListening: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onSelectLocation,
  preferences,
  onUpdatePreferences,
  onOpenSettings,
  onTriggerVoiceChat,
  isVoiceListening,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      setIsSearching(true);
      const results = await searchLocations(val);
      setSearchResults(results);
      setIsSearching(false);
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  const handleSelectSearchedLocation = (loc: GeoLocation) => {
    onSelectLocation(loc);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const handleDetectGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const gpsLoc: GeoLocation = {
            id: 'gps_current',
            name: 'My Live Location',
            city: 'Detected Location',
            country: 'India',
            latitude: Number(position.coords.latitude.toFixed(4)),
            longitude: Number(position.coords.longitude.toFixed(4)),
          };
          onSelectLocation(gpsLoc);
        },
        () => {
          alert('GPS location permission denied or unavailable. Using default city.');
        }
      );
    }
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === preferences.language) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 text-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & SIH Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-xs">
              <CloudSun className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-gray-900">
                  WeatherGPT
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  SIH26068
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block font-medium">
                AI Weather Decision Intelligence
              </p>
            </div>
          </div>

          {/* Search bar & Location Picker */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchQuery.length >= 2) setShowSearchDropdown(true);
                }}
                placeholder={getTranslation(preferences.language, 'searchPlaceholder')}
                className="w-full pl-9 pr-10 py-1.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-blue-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-50 transition-all font-medium"
              />
              <button
                onClick={handleDetectGPS}
                title="Detect Live Location"
                className="absolute right-2.5 p-1 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <NavIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-72 overflow-y-auto">
                <div className="p-2.5 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500 font-semibold">
                  <span>Search Locations</span>
                  {isSearching && <span className="animate-pulse text-blue-600">Fetching...</span>}
                </div>
                {searchResults.length > 0 ? (
                  searchResults.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectSearchedLocation(loc)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between text-sm transition-colors border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <span className="font-semibold text-gray-900">{loc.name}</span>
                          {loc.state && <span className="text-xs text-gray-500 ml-1.5">({loc.state})</span>}
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400">{loc.country}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-500">
                    No matching cities found. Try typing Varanasi, Delhi, or Mumbai.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">

            {/* Current Active Location Pill */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-800">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span className="max-w-[100px] truncate">{currentLocation.name}</span>
            </div>

            {/* Voice Assistant Mic Button */}
            <button
              onClick={onTriggerVoiceChat}
              title="Voice WeatherGPT"
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                isVoiceListening 
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-sm' 
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
            >
              {isVoiceListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span className="hidden sm:inline">Voice</span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 hover:bg-gray-100 transition-colors font-medium"
              >
                <span>{currentLangObj.flag}</span>
                <span className="hidden lg:inline">{currentLangObj.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 z-50 max-h-80 overflow-y-auto">
                  <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Select Language
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onUpdatePreferences({ language: lang.code });
                        setShowLangDropdown(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                        preferences.language === lang.code 
                          ? 'bg-blue-600 text-white font-semibold' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </div>
                      <span className={`text-[10px] ${preferences.language === lang.code ? 'text-blue-100' : 'text-gray-400'}`}>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Unit Switcher */}
            <button
              onClick={() => onUpdatePreferences({
                temperatureUnit: preferences.temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius'
              })}
              title="Toggle °C / °F"
              className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              °{preferences.temperatureUnit === 'celsius' ? 'C' : 'F'}
            </button>

            {/* Settings Modal Toggle */}
            <button
              onClick={onOpenSettings}
              title="Preferences & Commute Settings"
              className="p-2 text-gray-600 hover:text-gray-900 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Quick Indian City Chips */}
        <div className="py-2 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs border-t border-gray-100">
          <span className="text-gray-400 text-[11px] shrink-0 font-medium">Quick Cities:</span>
          {PRESET_INDIAN_LOCATIONS.map((loc) => {
            const isSelected = currentLocation.name.toLowerCase() === loc.name.toLowerCase();
            return (
              <button
                key={loc.id}
                onClick={() => onSelectLocation(loc)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70 border border-gray-200/60'
                }`}
              >
                {loc.name}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
