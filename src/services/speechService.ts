import { SupportedLanguage } from '../types/weather';

export interface SpeechRecognitionResultHandler {
  onResult: (text: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export class VoiceWeatherService {
  private recognition: any = null;
  private isListening: boolean = false;
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public getSpeechLangCode(lang: SupportedLanguage): string {
    switch (lang) {
      case 'hi':
      case 'hinglish':
        return 'hi-IN';
      case 'bn':
        return 'bn-IN';
      case 'mr':
        return 'mr-IN';
      case 'te':
        return 'te-IN';
      case 'ta':
        return 'ta-IN';
      case 'gu':
        return 'gu-IN';
      case 'kn':
        return 'kn-IN';
      case 'ml':
        return 'ml-IN';
      case 'pa':
        return 'pa-IN';
      case 'or':
        return 'or-IN';
      case 'en':
      default:
        return 'en-IN';
    }
  }

  public startListening(lang: SupportedLanguage, handlers: SpeechRecognitionResultHandler) {
    if (!this.recognition) {
      handlers.onError('Speech recognition is not supported in this browser. You can type your query directly.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    try {
      this.recognition.lang = this.getSpeechLangCode(lang);
      this.isListening = true;

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }
        handlers.onResult(transcript, isFinal);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        handlers.onError(event.error || 'Speech recognition encountered an issue');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        handlers.onEnd();
      };

      this.recognition.start();
    } catch (e: any) {
      this.isListening = false;
      handlers.onError(e?.message || 'Could not start voice recognition');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }

  public speak(text: string, lang: SupportedLanguage = 'en') {
    if (!this.synth || typeof window === 'undefined') return;

    try {
      this.synth.cancel(); // Stop any ongoing speech
      // Strip markdown asterisks or special characters for clean TTS
      const cleanText = text
        .replace(/[*_~`#>-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = this.getSpeechLangCode(lang);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select matching voice if available
      const voices = this.synth.getVoices();
      const langCodePrefix = this.getSpeechLangCode(lang).split('-')[0];
      const matchedVoice = voices.find(v => v.lang.startsWith(langCodePrefix) || v.lang.includes('IN'));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const voiceWeatherService = new VoiceWeatherService();
