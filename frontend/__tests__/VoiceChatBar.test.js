import { render, fireEvent, screen } from '@testing-library/react';
import VoiceChatBar from '../components/VoiceChatBar';

describe('VoiceChatBar', () => {
  it('renders text input fallback if STT is unsupported', () => {
    const original = window.SpeechRecognition;
    delete window.SpeechRecognition;
    render(<VoiceChatBar language="en" district="TestDist" />);
    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
    window.SpeechRecognition = original;
  });

  it('shows error if STT permission denied', () => {
    window.SpeechRecognition = class {
      start() { setTimeout(() => this.onerror({ error: 'not-allowed' }), 10); }
      stop() {}
      set onresult(fn) {}
      set onerror(fn) { this._onerror = fn; }
      set onend(fn) {}
    };
    render(<VoiceChatBar language="en" district="TestDist" />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    setTimeout(() => {
      expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
    }, 20);
  });
});
