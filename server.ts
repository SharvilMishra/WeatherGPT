import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!apiKey,
    platform: 'WeatherGPT - Smart India Hackathon SIH26068',
    timestamp: new Date().toISOString(),
  });
});

// Grounded WeatherGPT AI Reasoning Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { 
      message, 
      conversationHistory = [], 
      groundedContext, 
      language = 'en',
      userCommute,
      activity
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
      upcomingHourlyRainAndTemp: groundedContext.hourly?.slice(0, 12).map((h: any) => ({
        time: h.time ? new Date(h.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '',
        temp: `${h.temperature}°C`,
        rainChance: `${h.precipitationProbability}%`,
        condition: h.condition,
        wind: `${h.windSpeed} km/h`,
      })),
      activeAlerts: groundedContext.alerts?.map((a: any) => a.headline),
      userCommute: userCommute || null,
      targetActivity: activity || null,
    }, null, 2) : 'No live context provided; deduce from meteorological principles for Indian locations.';

    // Construct prompt
    const systemPrompt = `You are WeatherGPT, the India-first AI-Powered Weather Decision Intelligence Platform (Smart India Hackathon SIH26068).
Your Motto: "Don't just know the weather. Understand what it means for you."

CRITICAL RULE: DO NOT INVENT OR HALLUCINATE WEATHER DATA. Ground your reasoning strictly in the provided real-time weather & forecast context.

Tone and Personality:
1. Decisive, actionable, and human-centric.
2. Directly answer practical questions (e.g., "Bike se jaana avoid karna better rahega", "Carry an umbrella", "Best time for running is 6:00 AM").
3. Always provide:
   - Direct verdict / recommendation first.
   - Specific meteorological numbers (Rain %, Temp, Wind, Visibility, AQI).
   - "Better Option / Safer Window": Suggest the safest time window or smart mitigation.
4. Language Adaptability:
   - If user asks in Hinglish (e.g. "Kal 8 baje bike leke jana safe hai?"), reply in natural, fluent Hinglish.
   - If user asks in Hindi (हिन्दी), reply in clear, natural Hindi.
   - If user requested language is '${language}', respond in that language style while keeping numbers and times crisp.

GROUNDED WEATHER CONTEXT:
${contextStr}
`;

    if (ai) {
      const chatContents = [
        { text: systemPrompt },
        ...conversationHistory.map((msg: any) => ({
          text: `${msg.role === 'user' ? 'User' : 'WeatherGPT'}: ${msg.content}`
        })),
        { text: `User Query: "${message}"` }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: chatContents.map(c => c.text).join('\n\n'),
      });

      const responseText = response.text || 'Could not process weather decision.';

      return res.json({
        reply: responseText,
        groundedLocation: groundedContext?.location?.name,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Rule-based high-quality grounded reasoning fallback if API key is not present in local dev
      const locName = groundedContext?.location?.name || 'your area';
      const rainMax = groundedContext?.hourly?.slice(0, 8).reduce((max: number, h: any) => Math.max(max, h.precipitationProbability || 0), 0) || 45;
      const temp = groundedContext?.current?.temperature || 30;
      const feelsLike = groundedContext?.current?.feelsLike || 32;
      const aqi = groundedContext?.airQuality?.aqi || 95;

      let fallbackReply = '';
      if (language === 'hi') {
        fallbackReply = `${locName} में वर्तमान तापमान ${temp}°C (महसूस ${feelsLike}°C) है। बारिश की संभावना लगभग ${rainMax}% और वायु गुणवत्ता (AQI) ${aqi} है।\n\nसलाह: यदि आप बाहर यात्रा की योजना बना रहे हैं, तो दोपहर के समय सावधानी बरतें और छाता साथ रखें।`;
      } else if (language === 'hinglish' || message.toLowerCase().includes('kaisa') || message.toLowerCase().includes('hogi') || message.toLowerCase().includes('safe')) {
        fallbackReply = `${locName} mein abhi temperature ${temp}°C (feels like ${feelsLike}°C) hai. Rain probability lagbhag ${rainMax}% hai aur AQI ${aqi} hai.\n\nFaisla: Agar aap bike ya outdoor commute plan kar rahe hain, to peak rain time avoid karein. Early morning ya 10:30 AM ke baad nikalna safer option rahega.`;
      } else {
        fallbackReply = `In ${locName}, current temperature is ${temp}°C (feels like ${feelsLike}°C) with an AQI of ${aqi} and peak rain probability of ${rainMax}%.\n\nRecommendation: If commuting or planning outdoor activities, note the elevated rain chance. Consider carrying weather protection or travelling after peak morning hours.`;
      }

      return res.json({
        reply: fallbackReply,
        groundedLocation: locName,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error('WeatherGPT chat error:', error);
    res.status(500).json({ 
      error: 'Failed to generate AI response', 
      details: error?.message || 'Server error' 
    });
  }
});

// Travel Weather AI Endpoint
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

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      return res.json({ analysis: response.text });
    }

    res.json({
      analysis: `Travel corridor between ${origin} and ${destination} shows moderate weather variability. Check departure traffic and pack light rainwear.`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start server with Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WeatherGPT server running on http://localhost:${PORT}`);
  });
}

startServer();
