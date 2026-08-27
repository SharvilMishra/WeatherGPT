import React, { useState } from 'react';
import { 
  Bike, 
  Footprints, 
  Activity, 
  Trophy, 
  Camera, 
  TreePine, 
  Sprout, 
  Shirt, 
  Smile, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Lightbulb, 
  Filter 
} from 'lucide-react';
import { GroundedWeatherContext, ActivityType, ActivityAssessment, UserPreferences } from '../types/weather';
import { evaluateActivityRisk } from '../services/riskEngine';
import { getTranslation } from '../services/i18n';

interface ActivityAdvisorViewProps {
  weatherContext: GroundedWeatherContext;
  preferences: UserPreferences;
  onAskGptAboutActivity: (activityTitle: string) => void;
}

export const ActivityAdvisorView: React.FC<ActivityAdvisorViewProps> = ({
  weatherContext,
  preferences,
  onAskGptAboutActivity,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'commute' | 'fitness' | 'leisure' | 'work'>('all');
  const [selectedActivityId, setSelectedActivityId] = useState<ActivityType | null>('bike_commute');

  const activitiesList: { type: ActivityType; category: 'commute' | 'fitness' | 'leisure' | 'work'; icon: any }[] = [
    { type: 'bike_commute', category: 'commute', icon: Bike },
    { type: 'cycling', category: 'fitness', icon: Bike },
    { type: 'running', category: 'fitness', icon: Activity },
    { type: 'walking', category: 'fitness', icon: Footprints },
    { type: 'outdoor_sports', category: 'fitness', icon: Trophy },
    { type: 'photography', category: 'leisure', icon: Camera },
    { type: 'picnic', category: 'leisure', icon: TreePine },
    { type: 'farming_outdoor_work', category: 'work', icon: Sprout },
    { type: 'laundry', category: 'work', icon: Shirt },
    { type: 'kids_outdoor', category: 'leisure', icon: Smile },
  ];

  const filteredActivities = activitiesList.filter(
    a => selectedCategory === 'all' || a.category === selectedCategory
  );

  const assessments: ActivityAssessment[] = activitiesList.map(a => 
    evaluateActivityRisk(weatherContext, a.type)
  );

  const activeAssessment = assessments.find(a => a.id === selectedActivityId) || assessments[0];

  const getRatingBadge = (rating: ActivityAssessment['rating']) => {
    switch (rating) {
      case 'GOOD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            GOOD
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            MODERATE
          </span>
        );
      case 'NOT RECOMMENDED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            NOT RECOMMENDED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bike className="w-5 h-5 text-blue-600" />
            Activity & Decision Advisor
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Real-time multi-factor meteorological evaluation for daily routines in {weatherContext.location.name}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
          {(['all', 'commute', 'fitness', 'leisure', 'work'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Activity Cards + Right Detailed Constraint Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Activity Cards Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredActivities.map((act) => {
            const assessment = assessments.find(a => a.id === act.type)!;
            const Icon = act.icon;
            const isSelected = selectedActivityId === act.type;

            return (
              <div
                key={act.type}
                onClick={() => setSelectedActivityId(act.type)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
                  isSelected
                    ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm text-gray-900">{assessment.title}</span>
                    </div>
                    {getRatingBadge(assessment.rating)}
                  </div>

                  <p className="text-xs text-gray-600 font-medium line-clamp-2 mb-3">
                    {assessment.summary}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                  <span className="flex items-center gap-1 text-amber-700 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Best: {assessment.bestTimeWindow}
                  </span>
                  <span className="text-blue-600 font-bold">Inspect &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 1 Col: Detailed Constraint & Safe Window Drawer */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">Inspecting Activity</span>
                <h3 className="text-base font-bold text-gray-900">{activeAssessment.title}</h3>
              </div>
              {getRatingBadge(activeAssessment.rating)}
            </div>

            {/* AI Summary Statement */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700">
              <span className="font-bold text-gray-900 block mb-1">Evaluation Summary:</span>
              {activeAssessment.summary}
            </div>

            {/* Safest Time Window */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs">
              <span className="font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                Recommended Time Window
              </span>
              <p className="text-blue-800 font-medium">{activeAssessment.bestTimeWindow}</p>
            </div>

            {/* Risk Factor Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-900 block">Meteorological Risk Factors:</span>
              {activeAssessment.riskFactors.map((rf, idx) => (
                <div key={idx} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-800 font-medium">{rf.factor}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500 font-medium">{rf.detail}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      rf.level === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' : rf.level === 'MODERATE' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {rf.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Smart Actionable Tips */}
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Practical Decision Tips:
              </span>
              <ul className="space-y-1 text-xs text-gray-600 font-medium">
                {activeAssessment.tips.map((tip, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={() => onAskGptAboutActivity(activeAssessment.title)}
            className="w-full mt-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <span>Ask WeatherGPT for Custom Advice</span>
          </button>
        </div>

      </div>

    </div>
  );
};
