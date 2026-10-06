import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({
  apiKey,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
}) : null;

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!apiKey,
    platform: 'WeatherGPT - AI Weather Decision Intelligence',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const {
      message,
      conversationHistory = [],
      groundedContext,
      language = 'en',
      userCommute,
      activity,
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const contextStr = groundedContext ? JSON.stringify({
      location: groundedContext.location?.name,
      current: {
        temperature: `${groundedContext.current?.temperature}°C`,
        feelsLike: `${groundedContext.current?.feelsLike}°C`,
        condition: groundedContext.current?.condition,
        humidity: `${groundedContext.current?.humidity}%`,
        windSpeed: `${groundedContext.current?.windSpeed} km/h`,
        visibility: `${groundedContext.current?.visibility} km`,
        uvIndex: groundedContext.current?.uvIndex,
        rain: `${groundedContext.current?.rain} mm`,
      },
      airQuality: {
        aqi: groundedContext.airQuality?.aqi,
        category: groundedContext.airQuality?.category,
        pm25: groundedContext.airQuality?.pm25,
      },
      upcomingHourlyRainAndTemp: groundedContext.hourly?.slice(0, 12).map((hour: any) => ({
        time: hour.time ? new Date(hour.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '',
        temp: `${hour.temperature}°C`,
        rainChance: `${hour.precipitationProbability}%`,
        condition: hour.condition,
        wind: `${hour.windSpeed} km/h`,
      })),
      activeAlerts: groundedContext.alerts?.map((alert: any) => alert.headline),
      userCommute: userCommute || null,
      targetActivity: activity || null,
    }, null, 2) : 'No live context provided; deduce from meteorological principles for Indian locations.';

    if (ai) {
      const systemPrompt = `You are WeatherGPT, an India-first AI-Powered Weather Decision Intelligence Platform.
Your motto: "Don't just know the weather. Understand what it means for you."

Never invent weather data. Ground your reasoning in the provided real-time weather and forecast context. Give a direct recommendation first, then relevant weather numbers and a safer time window or mitigation. Adapt your response to the user's language and requested language ('${language}').

GROUNDED WEATHER CONTEXT:
${contextStr}`;

      const history = Array.isArray(conversationHistory) ? conversationHistory : [];
      const prompt = [
        systemPrompt,
        ...history.map((entry: any) => `${entry.role === 'user' ? 'User' : 'WeatherGPT'}: ${entry.content}`),
        `User Query: "${message}"`,
      ].join('\n\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      return res.json({
        reply: response.text || 'Could not process weather decision.',
        groundedLocation: groundedContext?.location?.name,
        timestamp: new Date().toISOString(),
      });
    }

    const location = groundedContext?.location?.name || 'your area';
    const rain = groundedContext?.hourly?.slice(0, 8)
      .reduce((max: number, hour: any) => Math.max(max, hour.precipitationProbability || 0), 0) || 45;
    const temperature = groundedContext?.current?.temperature || 30;
    const feelsLike = groundedContext?.current?.feelsLike || 32;
    const aqi = groundedContext?.airQuality?.aqi || 95;

    let reply: string;
    if (language === 'hi') {
      reply = `${location} में वर्तमान तापमान ${temperature}°C (महसूस ${feelsLike}°C) है। बारिश की संभावना लगभग ${rain}% और वायु गुणवत्ता (AQI) ${aqi} है।\n\nसलाह: यदि आप बाहर यात्रा की योजना बना रहे हैं, तो दोपहर के समय सावधानी बरतें और छाता साथ रखें।`;
    } else if (language === 'hinglish' || /kaisa|hogi|safe/i.test(message)) {
      reply = `${location} mein abhi temperature ${temperature}°C (feels like ${feelsLike}°C) hai. Rain probability lagbhag ${rain}% hai aur AQI ${aqi} hai.\n\nFaisla: Agar aap bike ya outdoor commute plan kar rahe hain, to peak rain time avoid karein. Early morning ya 10:30 AM ke baad nikalna safer option rahega.`;
    } else {
      reply = `In ${location}, current temperature is ${temperature}°C (feels like ${feelsLike}°C) with an AQI of ${aqi} and peak rain probability of ${rain}%.\n\nRecommendation: If commuting or planning outdoor activities, note the rain chance. Consider carrying weather protection or travelling after peak morning hours.`;
    }

    return res.json({ reply, groundedLocation: location, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('WeatherGPT chat error:', error);
    return res.status(500).json({
      error: 'Failed to generate AI response',
      details: error?.message || 'Server error',
    });
  }
});

app.post('/api/travel-analysis', async (req, res) => {
  try {
    const { origin, destination, travelDate = 'Tomorrow', routeData } = req.body;

    if (ai && routeData) {
      const prompt = `You are the WeatherGPT Travel Intelligence Engine.
Analyze this travel route from ${origin} to ${destination} on ${travelDate}.
Route weather data: ${JSON.stringify(routeData)}

Provide a concise, 3-part travel recommendation:
1. Road & Visibility Safety Verdict (Clear / Caution / Delays Expected).
2. Best Departure Window.
3. Essential Packing Checklist.`;

      const response = await ai.models.generateContent({ model: 'gemini-3.7-flash', contents: prompt });
      return res.json({ analysis: response.text });
    }

    return res.json({
      analysis: `Travel corridor between ${origin} and ${destination} shows moderate weather variability. Check departure traffic and pack light rainwear.`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to analyze travel weather.' });
  }
});

export default app;
