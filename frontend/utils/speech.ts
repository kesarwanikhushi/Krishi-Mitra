
// TypeScript: Add missing types for SpeechRecognition if not present
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  onresult: ((event: any) => void) | null;
  start(): void;
  stop(): void;
}
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}
// speech.ts
// Speech helpers for STT (SpeechRecognition) and TTS (SpeechSynthesis)

export type SpeechEvents = {
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onPermission?: (granted: boolean) => void;
};

let recognition: SpeechRecognition | null = null;
let listening = false;

export function startListening(lang: string, events: SpeechEvents = {}) {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    events.onError?.('Speech recognition not supported');
    return;
  }
  const SpeechRecognitionImpl = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  recognition = new SpeechRecognitionImpl();
  if (recognition) {
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      listening = true;
      events.onStart?.();
    };
    recognition.onend = () => {
      listening = false;
      events.onEnd?.();
    };
    recognition.onerror = (e: any) => {
      if (e.error === 'not-allowed') events.onPermission?.(false);
      events.onError?.(e.error);
      listening = false;
    };
    recognition.onresult = (event: any) => {
      let transcript = '';
      let isFinal = false;
      for (let i = 0; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) isFinal = true;
      }
      events.onResult?.(transcript, isFinal);
    };
    try {
      recognition.start();
    } catch (e) {
      events.onError?.('Failed to start recognition');
    }
  }
}

export function stopListening() {
  if (recognition && listening) {
    recognition.stop();
    listening = false;
  }
}

export function speak(text: string, lang: string, rate: number = 1) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new window.SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = rate;
  window.speechSynthesis.speak(utter);
}
