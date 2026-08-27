import { 
  GroundedWeatherContext, 
  ActivityAssessment, 
  ActivityType, 
  ViabilityRating, 
  TravelRiskReport,
  TravelWeatherSegment,
  GeoLocation
} from '../types/weather';

export function evaluateActivityRisk(
  context: GroundedWeatherContext,
  activity: ActivityType,
  targetTime?: string
): ActivityAssessment {
  const { current, hourly, airQuality } = context;

  // Find peak rain probability and max temp in relevant hours
  const upcomingRainMax = Math.max(...hourly.slice(0, 12).map(h => h.precipitationProbability), current.precipitation > 0 ? 80 : 0);
  const maxTemp = Math.max(...hourly.slice(0, 8).map(h => h.temperature), current.temperature);
  const maxWind = Math.max(...hourly.slice(0, 8).map(h => h.windSpeed), current.windSpeed);
  const aqi = airQuality.aqi;

  switch (activity) {
    case 'bike_commute':
    case 'cycling': {
      const isRainy = upcomingRainMax >= 55 || current.precipitation > 0.5;
      const isHighWind = maxWind > 28;
      const isPoorAqi = aqi > 160;

      let rating: ViabilityRating = 'GOOD';
      if (isRainy || isHighWind || aqi > 220) {
        rating = 'NOT RECOMMENDED';
      } else if (upcomingRainMax >= 30 || maxWind > 18 || isPoorAqi || maxTemp > 38) {
        rating = 'MODERATE';
      }

      // Find best safe window
      const safeHours = hourly.filter(h => h.precipitationProbability < 25 && h.windSpeed < 20 && h.temperature < 36);
      const bestWindow = safeHours.length > 0
        ? `${new Date(safeHours[0].time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} – ${new Date(safeHours[Math.min(3, safeHours.length - 1)].time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
        : 'After 10:30 AM or early morning (before 8 AM)';

      return {
        id: activity,
        title: activity === 'bike_commute' ? 'Two-Wheeler / Bike Commute' : 'Cycling & Riding',
        iconName: 'bike',
        rating,
        summary: rating === 'NOT RECOMMENDED' 
          ? 'High rain probability and slippery road hazards during peak commute hours. Public transit or car recommended.'
          : rating === 'MODERATE'
            ? 'Proceed with caution. Carry a waterproof raincoat and keep eye protection for wind and particulate dust.'
            : 'Conditions are safe for riding. Pleasant temperature and dry road conditions.',
        bestTimeWindow: bestWindow,
        riskFactors: [
          { factor: 'Rain', level: upcomingRainMax > 50 ? 'HIGH' : upcomingRainMax > 25 ? 'MODERATE' : 'LOW', detail: `Peak rain chance: ${upcomingRainMax}%` },
          { factor: 'Wind', level: maxWind > 25 ? 'HIGH' : maxWind > 15 ? 'MODERATE' : 'LOW', detail: `Gusts up to ${maxWind} km/h` },
          { factor: 'AQI', level: aqi > 180 ? 'HIGH' : aqi > 100 ? 'MODERATE' : 'LOW', detail: `AQI ${aqi} (${airQuality.category})` },
          { factor: 'Visibility', level: current.visibility < 3 ? 'HIGH' : current.visibility < 6 ? 'MODERATE' : 'LOW', detail: `${current.visibility} km visibility` },
        ],
        tips: [
          'Wear a reflective waterproof jacket if riding in reduced visibility.',
          'Check tire pressure and avoid abrupt braking on wet tarmac.',
          'Keep mobile phone in a sealed waterproof pouch.',
        ]
      };
    }

    case 'running':
    case 'walking':
    case 'outdoor_sports': {
      let rating: ViabilityRating = 'GOOD';
      if (aqi > 200 || current.feelsLike > 40 || upcomingRainMax > 70) {
        rating = 'NOT RECOMMENDED';
      } else if (aqi > 120 || current.feelsLike > 34 || upcomingRainMax > 40 || current.uvIndex > 8) {
        rating = 'MODERATE';
      }

      return {
        id: activity,
        title: activity === 'running' ? 'Jogging & Running' : activity === 'walking' ? 'Brisk Walking' : 'Outdoor Sports (Cricket, Football)',
        iconName: activity === 'running' ? 'activity' : 'footprints',
        rating,
        summary: rating === 'NOT RECOMMENDED'
          ? `High cardiovascular strain due to ${aqi > 180 ? `elevated AQI (${aqi})` : `thermal heat stress (feels like ${current.feelsLike}°C)`}. Indoor workout recommended.`
          : rating === 'MODERATE'
            ? 'Acceptable with precautions. Keep intensity moderate and hydrate frequently with electrolytes.'
            : 'Favorable conditions for endurance exercise. Moderate temperatures and clear air.',
        bestTimeWindow: '05:30 AM – 07:30 AM or 06:00 PM – 07:30 PM',
        riskFactors: [
          { factor: 'AQI', level: aqi > 180 ? 'HIGH' : aqi > 100 ? 'MODERATE' : 'LOW', detail: `Air Index: ${aqi} (${airQuality.category})` },
          { factor: 'Temperature', level: current.feelsLike > 37 ? 'HIGH' : current.feelsLike > 32 ? 'MODERATE' : 'LOW', detail: `Feels like ${current.feelsLike}°C` },
          { factor: 'UV', level: current.uvIndex > 8 ? 'HIGH' : current.uvIndex > 5 ? 'MODERATE' : 'LOW', detail: `UV Index: ${current.uvIndex}` },
          { factor: 'Rain', level: upcomingRainMax > 50 ? 'HIGH' : 'LOW', detail: `${upcomingRainMax}% precipitation chance` },
        ],
        tips: [
          'Run before 7:30 AM before solar heat and ozone concentrate.',
          'Drink at least 500ml water 30 mins before stepping outside.',
          'Use SPF 50 sunscreen on exposed skin if exercising during daylight.',
        ]
      };
    }

    case 'photography':
    case 'picnic': {
      const isRain = upcomingRainMax > 45;
      const isOvercast = current.cloudCover > 80;
      const rating: ViabilityRating = isRain ? 'NOT RECOMMENDED' : (current.feelsLike > 36 || current.windSpeed > 25) ? 'MODERATE' : 'GOOD';

      return {
        id: activity,
        title: activity === 'photography' ? 'Outdoor Photography & Shoots' : 'Family Picnic & Park Outing',
        iconName: activity === 'photography' ? 'camera' : 'tree-pine',
        rating,
        summary: isRain 
          ? 'Wet weather will endanger delicate camera gear and make outdoor picnic spots muddy.'
          : rating === 'MODERATE'
            ? 'Humid and warm conditions. Golden hour lighting will be diffused by cloud cover.'
            : 'Pleasant natural ambient light with comfortable temperature and moderate breezes.',
        bestTimeWindow: '06:00 AM – 08:30 AM & 05:00 PM – 06:45 PM (Golden Hour)',
        riskFactors: [
          { factor: 'Rain', level: isRain ? 'HIGH' : 'LOW', detail: `${upcomingRainMax}% chance of showers` },
          { factor: 'Humidity', level: current.humidity > 80 ? 'MODERATE' : 'LOW', detail: `${current.humidity}% humidity` },
          { factor: 'Wind', level: current.windSpeed > 22 ? 'MODERATE' : 'LOW', detail: `${current.windSpeed} km/h breeze` },
        ],
        tips: [
          'Bring a camera weather cover or plastic ziplock bags for lens protection.',
          'Morning diffused light provides great high-dynamic-range framing.',
        ]
      };
    }

    case 'farming_outdoor_work': {
      const isHeavyRain = upcomingRainMax > 65;
      const isSevereHeat = current.feelsLike > 40;
      const rating: ViabilityRating = (isHeavyRain || isSevereHeat) ? 'NOT RECOMMENDED' : (upcomingRainMax > 35 || current.feelsLike > 35) ? 'MODERATE' : 'GOOD';

      return {
        id: activity,
        title: 'Farming & Field Labor',
        iconName: 'sprout',
        rating,
        summary: isSevereHeat 
          ? 'Risk of heat exhaustion. Schedule field spraying and heavy manual labor for early morning.'
          : isHeavyRain
            ? 'Heavy precipitation expected. Soil waterlogging and pesticide wash-off risk. Delay spray operations.'
            : 'Good conditions for field inspections, weeding, and standard agricultural tasks.',
        bestTimeWindow: '05:30 AM – 10:00 AM & 04:30 PM – 06:30 PM',
        riskFactors: [
          { factor: 'Temperature', level: isSevereHeat ? 'HIGH' : 'MODERATE', detail: `Peak index: ${current.feelsLike}°C` },
          { factor: 'Rain', level: isHeavyRain ? 'HIGH' : 'LOW', detail: `${upcomingRainMax}% rain probability` },
          { factor: 'Wind', level: current.windSpeed > 20 ? 'MODERATE' : 'LOW', detail: `${current.windSpeed} km/h (affects spray drift)` },
        ],
        tips: [
          'Do not spray pesticides within 4 hours of forecasted rain.',
          'Take mandatory 15-minute shaded breaks every hour under direct sun.',
        ]
      };
    }

    case 'laundry': {
      const willRain = upcomingRainMax > 40 || current.humidity > 80;
      const rating: ViabilityRating = willRain ? 'NOT RECOMMENDED' : current.humidity > 70 ? 'MODERATE' : 'GOOD';

      return {
        id: activity,
        title: 'Drying Laundry Outdoors',
        iconName: 'shirt',
        rating,
        summary: willRain 
          ? 'High chance of sudden showers or excessive humidity preventing natural line drying. Use indoor racks.'
          : rating === 'MODERATE'
            ? 'Drying will be slow due to 70%+ relative humidity, but safe between noon and 3 PM.'
            : 'Excellent fast drying conditions with solar radiation and gentle breezes.',
        bestTimeWindow: '10:00 AM – 03:00 PM',
        riskFactors: [
          { factor: 'Rain', level: willRain ? 'HIGH' : 'LOW', detail: `${upcomingRainMax}% chance of rain` },
          { factor: 'Humidity', level: current.humidity > 75 ? 'HIGH' : 'LOW', detail: `${current.humidity}% humidity` },
        ],
        tips: [
          'Pin clothes securely against wind gusts up to ' + current.windSpeed + ' km/h.',
          'Retrieve laundry by 4:30 PM before evening moisture condensation.',
        ]
      };
    }

    case 'kids_outdoor':
    default: {
      const isUnsafe = aqi > 180 || current.feelsLike > 39 || upcomingRainMax > 60;
      const rating: ViabilityRating = isUnsafe ? 'NOT RECOMMENDED' : (aqi > 110 || current.feelsLike > 34) ? 'MODERATE' : 'GOOD';

      return {
        id: 'kids_outdoor',
        title: 'Kids Outdoor Play',
        iconName: 'smile',
        rating,
        summary: isUnsafe 
          ? `Keep children indoors due to ${aqi > 150 ? `high particulate pollution (AQI ${aqi})` : `high rain and heat risk`}. Organize indoor board games.`
          : rating === 'MODERATE'
            ? 'Safe for 45–60 minutes in shaded playground areas. Ensure cap and water bottle are used.'
            : 'Great weather for outdoor playground fun and park activities.',
        bestTimeWindow: '04:45 PM – 06:30 PM',
        riskFactors: [
          { factor: 'AQI', level: aqi > 150 ? 'HIGH' : aqi > 100 ? 'MODERATE' : 'LOW', detail: `Air quality ${aqi}` },
          { factor: 'UV', level: current.uvIndex > 7 ? 'HIGH' : 'LOW', detail: `UV level ${current.uvIndex}` },
          { factor: 'Rain', level: upcomingRainMax > 50 ? 'HIGH' : 'LOW', detail: `${upcomingRainMax}% rain chance` },
        ],
        tips: [
          'Ensure kids drink water before and during play.',
          'Avoid asphalt and metal slide surfaces during peak sun.',
        ]
      };
    }
  }
}

// Generate Travel Weather Risk Analysis (Origin -> Journey -> Destination)
export function generateTravelRiskAssessment(
  originLoc: GeoLocation,
  destLoc: GeoLocation,
  originContext: GroundedWeatherContext,
  destContext: GroundedWeatherContext,
  travelDate: string = 'Tomorrow'
): TravelRiskReport {
  const originRain = Math.max(...originContext.hourly.slice(0, 12).map(h => h.precipitationProbability));
  const destRain = Math.max(...destContext.hourly.slice(0, 12).map(h => h.precipitationProbability));
  const destTemp = destContext.current.temperature;
  const destAqi = destContext.airQuality.aqi;

  const transitRain = Math.round((originRain + destRain) / 2);
  const transitRisk: 'LOW' | 'MODERATE' | 'HIGH' = transitRain > 60 ? 'HIGH' : transitRain > 30 ? 'MODERATE' : 'LOW';
  const destRisk: 'LOW' | 'MODERATE' | 'HIGH' = (destRain > 60 || destAqi > 200 || destTemp > 39) ? 'HIGH' : (destRain > 30 || destAqi > 120) ? 'MODERATE' : 'LOW';

  const segments: TravelWeatherSegment[] = [
    {
      segment: 'Departure',
      locationName: originLoc.name,
      weatherCondition: originContext.current.condition,
      temperature: originContext.current.temperature,
      rainProbability: originRain,
      riskLevel: originRain > 60 ? 'HIGH' : originRain > 30 ? 'MODERATE' : 'LOW',
      notes: originRain > 40 ? 'Possible delays due to wet road traffic.' : 'Normal departure conditions.',
    },
    {
      segment: 'Journey / Transit',
      locationName: `Highway / Rail Corridor between ${originLoc.name} & ${destLoc.name}`,
      weatherCondition: transitRain > 50 ? 'Scattered Rain & Gusty Winds' : 'Clear Highway Visibility',
      temperature: Math.round((originContext.current.temperature + destContext.current.temperature) / 2),
      rainProbability: transitRain,
      riskLevel: transitRisk,
      notes: transitRain > 45 ? 'Reduced visibility and wet road friction along highway sections.' : 'Smooth transit corridor.',
    },
    {
      segment: 'Destination',
      locationName: destLoc.name,
      weatherCondition: destContext.current.condition,
      temperature: destTemp,
      rainProbability: destRain,
      riskLevel: destRisk,
      notes: destTemp > 35 ? `Hot & humid (${destTemp}°C), feels like ${destContext.current.feelsLike}°C.` : `${destContext.current.conditionDesc}. AQI is ${destAqi}.`,
    }
  ];

  let overallRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' = 'MODERATE';
  if (segments.some(s => s.riskLevel === 'HIGH')) {
    overallRisk = 'HIGH';
  } else if (segments.every(s => s.riskLevel === 'LOW')) {
    overallRisk = 'LOW';
  }

  const packingList: string[] = ['ID & Tickets', 'Power Bank'];
  if (originRain > 40 || destRain > 40 || transitRain > 40) {
    packingList.push('Compact Umbrella / Raincoat', 'Waterproof Bag Cover');
  }
  if (destTemp > 32) {
    packingList.push('Breathable Cotton Wear', 'Sunscreen SPF 50', 'Electrolyte Sachets');
  } else if (destTemp < 18) {
    packingList.push('Light Jacket / Windbreaker');
  }
  if (destAqi > 150) {
    packingList.push('N95 Anti-Pollution Mask');
  }

  return {
    origin: originLoc.name,
    destination: destLoc.name,
    travelDate,
    departureTime: '08:00 AM',
    overallRisk,
    recommendation: overallRisk === 'HIGH'
      ? `Expect weather delays. Carry waterproof gear and allow at least 45 minutes buffer time for travel.`
      : overallRisk === 'MODERATE'
        ? `Carry rain protection and check route traffic before departure. Destination ${destLoc.name} has ${destContext.current.condition.toLowerCase()}.`
        : `Smooth and favorable travel weather throughout the corridor between ${originLoc.name} and ${destLoc.name}.`,
    departureAdvice: transitRain > 50 
      ? 'Advised to leave before 07:30 AM or after 11:00 AM to avoid the heaviest rain bands.'
      : 'Early morning departure (07:00 – 09:00 AM) provides cooler temperatures and smooth highway flow.',
    packingList,
    routeSegments: segments,
    aiAnalysis: `Weather along the ${originLoc.name} → ${destLoc.name} corridor features temperature variance of ${Math.abs(originContext.current.temperature - destContext.current.temperature)}°C and peak rain risk of ${Math.max(originRain, destRain, transitRain)}%.`,
  };
}
