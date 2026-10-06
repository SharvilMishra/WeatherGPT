import type { Request, Response } from 'express';
import app from '../src/server/apiApp';

function route(path: string) {
  return (request: Request, response: Response) => {
    request.url = path;
    return app(request, response);
  };
}

export const chat = route('/api/chat');
export const health = route('/api/health');
export const travelAnalysis = route('/api/travel-analysis');
