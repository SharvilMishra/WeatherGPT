import React from 'react';
import { X, Settings, Globe, Thermometer, Wind, Volume2, Bike, Moon, Sun } from 'lucide-react';
import { UserPreferences, SupportedLanguage } from '../types/weather';
import { SUPPORTED_LANGUAGES, getTranslation } from '../services/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">WeatherGPT Preferences</h3>
              <p className="text-xs text-gray-500 font-medium">Customize units, language, voice & commute profile</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Theme switch */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {preferences.theme === 'dark' ? <Moon className="w-5 h-5 text-blue-600" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <div>
                <span className="text-sm font-bold text-gray-900 block">Dark theme</span>
                <span className="text-xs text-gray-500 font-medium">Use a darker look across WeatherGPT</span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.theme === 'dark'}
              aria-label="Enable dark theme"
              onClick={() => onUpdatePreferences({ theme: preferences.theme === 'dark' ? 'light' : 'dark' })}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${preferences.theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-1 ${preferences.theme === 'dark' ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          
          {/* Language Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-600" />
              Interface & AI Language (12 Indian Languages)
            </label>
            <select
              value={preferences.language}
              onChange={(e) => onUpdatePreferences({ language: e.target.value as SupportedLanguage })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.nativeName} ({l.name})</option>
              ))}
            </select>
          </div>

          {/* Units */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-rose-500" />
                Temperature Unit
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ temperatureUnit: 'celsius' })}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    preferences.temperatureUnit === 'celsius'
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Celsius (°C)
                </button>
                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ temperatureUnit: 'fahrenheit' })}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    preferences.temperatureUnit === 'fahrenheit'
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-teal-600" />
                Wind Speed Unit
              </label>
              <select
                value={preferences.windSpeedUnit}
                onChange={(e) => onUpdatePreferences({ windSpeedUnit: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
              >
                <option value="kmh">km/h</option>
                <option value="ms">m/s</option>
                <option value="mph">mph</option>
              </select>
            </div>
          </div>

          {/* Voice Auto-Play Switch */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 text-blue-600" />
              <div>
                <span className="text-sm font-bold text-gray-900 block">Auto-Read AI Answers</span>
                <span className="text-xs text-gray-500 font-medium">Speak answers automatically in chosen language</span>
              </div>
            </div>
            <button
              onClick={() => onUpdatePreferences({ voiceAutoPlay: !preferences.voiceAutoPlay })}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                preferences.voiceAutoPlay ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-1 ${
                preferences.voiceAutoPlay ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Commute Profile Setup */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Bike className="w-4 h-4 text-emerald-600" />
              Daily Commute Schedule
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-500 font-medium block mb-1">Morning Departure</label>
                <input
                  type="time"
                  value={preferences.commuteStartTime}
                  onChange={(e) => onUpdatePreferences({ commuteStartTime: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 shadow-2xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-500 font-medium block mb-1">Evening Return</label>
                <input
                  type="time"
                  value={preferences.commuteEndTime}
                  onChange={(e) => onUpdatePreferences({ commuteEndTime: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 shadow-2xs"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-[11px] text-gray-500 font-medium">Created by @Sharvil Mishra</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
