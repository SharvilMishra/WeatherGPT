import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Bike, 
  Navigation2, 
  History, 
  GitCompare, 
  Radar, 
  BellRing 
} from 'lucide-react';
import { SupportedLanguage } from '../types/weather';
import { getTranslation } from '../services/i18n';

export type ActiveTab = 
  | 'dashboard'
  | 'chat'
  | 'activities'
  | 'travel'
  | 'history'
  | 'compare'
  | 'radar'
  | 'alerts';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  lang: SupportedLanguage;
  alertCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  lang,
  alertCount = 0,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: getTranslation(lang, 'dashboard'), icon: LayoutDashboard },
    { id: 'chat', label: getTranslation(lang, 'chat'), icon: MessageSquare },
    { id: 'activities', label: getTranslation(lang, 'activities'), icon: Bike },
    { id: 'travel', label: getTranslation(lang, 'travel'), icon: Navigation2 },
    { id: 'history', label: getTranslation(lang, 'history'), icon: History },
    { id: 'compare', label: getTranslation(lang, 'compare'), icon: GitCompare },
    { id: 'radar', label: getTranslation(lang, 'radar'), icon: Radar },
    { id: 'alerts', label: getTranslation(lang, 'alerts'), icon: BellRing },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <span>{item.label}</span>
                {item.id === 'alerts' && alertCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                    {alertCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
