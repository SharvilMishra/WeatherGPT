# WeatherGPT

WeatherGPT is an AI-assisted weather decision dashboard for Indian cities. It combines live weather and air-quality data with practical guidance for commuting, activities, travel, and alerts.

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Keep the terminal running while using the app. Do not open `index.html` directly from your file system; the app needs the Vite development server to load its React modules and API routes.

### Gemini AI (optional)

Weather data and the dashboard work without a Gemini key. Chat and AI-assisted travel analysis use a rule-based fallback until a key is configured.

1. Copy `.env.example` to `.env`.
2. Set `GEMINI_API_KEY` in `.env`.
3. Restart `npm run dev`.

Never commit `.env` or publish your API key. The key is read by the server and is not intended to be exposed in browser code.

## Deploy to Vercel

This repository is set up for a Vite frontend and Vercel Functions for the Express API. Vercel builds the frontend as static assets and deploys the functions under `api/` for chat, travel analysis, and the health check.

When importing the repository in Vercel, use:

- **Framework preset:** Vite
- **Root directory:** `./`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variable:** `GEMINI_API_KEY` (optional; add it in Vercel's Environment Variables settings to enable Gemini responses)

The dashboard and weather data can run without a Gemini key; chat and travel analysis use their fallback responses. Keep the key in Vercel's server-side environment variables. Do not add it to a `VITE_` variable or commit it to Git.

Vercel imports the selected GitHub branch. Commit and push local changes before importing or redeploying so the deployment contains the latest code. Preview deployments let you check a change before assigning it to a production domain. A separate Vercel project does not change the existing live site unless you move its domain to the new project.

## Build and run on a Node.js host

```bash
npm install
npm run build
npm start
```

The build creates the browser app in `dist/` and the Express server at `dist/server.cjs`. The server serves both the app and its `/api/*` endpoints. It listens on the hosting platform's `PORT` environment variable, using port `3000` when `PORT` is not set.

For a Node.js hosting service, configure:

- **Build command:** `npm run build`
- **Start command:** `npm start`
- **Runtime:** Node.js 20 or newer
- **Environment variable:** `GEMINI_API_KEY` (optional; configure it in the host's secret settings to enable Gemini responses)

This start command is for hosts that run a persistent Node.js web service. On Vercel, use the Vite settings above so the frontend is served from `dist/` and API routes run as Vercel Functions.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the frontend and production server |
| `npm start` | Start the production server (after building) |
| `npm run lint` | Check TypeScript types |

## App structure

- `src/App.tsx` — main dashboard and view switching
- `src/components/` — dashboard, chat, travel, alerts, and other views
- `src/services/` — weather data, language, speech, and risk logic
- `src/server/apiApp.ts` — shared Express API handlers for local development and Vercel Functions
- `api/` — Vercel Function entry points for the API
- `server.ts` — Express API and production/development server setup
- `vite.config.ts` — Vite, React, and Tailwind configuration
