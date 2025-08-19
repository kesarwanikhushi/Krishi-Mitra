import React, { useState, useRef, useEffect } from 'react';
import SpeechPlayer from './SpeechPlayer';
import { useMute } from '../components/GlobalMuteProvider';
import ConfidenceBadge from './ConfidenceBadge';
import SourceList from './SourceList';
import SaferAlternativesPanel from './SaferAlternativesPanel';

const getLangCode = (lang) => {
  if (lang === 'hi') return 'hi-IN';
  return 'en-IN'; // Hinglish/English
};

export default function VoiceChatBar({ language = 'en', demoMode = false, demoState = {}, onSend }) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [adviceResponse, setAdviceResponse] = useState('');
  const [ragMeta, setRagMeta] = useState(null);
  const [slow, setSlow] = useState(false);
  const recognitionRef = useRef(null);
  const { muted, toggleMute } = useMute();

  // Autofill demo district/crops if demoMode
  useEffect(() => {
    if (demoMode && demoState?.district) {
      // Optionally, set district/crops in global state or localStorage if needed
    }
  }, [demoMode, demoState]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSupported(true);
    } else {
      setSupported(false);
    }
  }, []);

  const startSTT = () => {
    setError('');
    setTranscript('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = getLangCode(language);
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      let t = '';
      for (let i = 0; i < event.results.length; ++i) {
        t += event.results[i][0].transcript;
      }
      setTranscript(t);
    };
    recognition.onerror = (e) => {
      setError(e.error === 'not-allowed' ? 'Permission denied' : e.error);
      setRecording(false);
    };
    recognition.onend = () => setRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const stopSTT = () => {
    recognitionRef.current && recognitionRef.current.stop();
    setRecording(false);
  };

  const handleSend = async () => {
    if (!transcript.trim()) return;
    
    // If onSend callback is provided, use it instead of making API call
    if (onSend) {
      onSend(transcript);
      setTranscript('');
      setRecording(false);
      return;
    }
    
    // Use demo district/crops if in demoMode, otherwise use default values
    const district = demoMode && demoState?.district ? demoState.district : 'Kanpur';
    const crops = demoMode && demoState?.crops ? demoState.crops : [];
    
    console.log('Sending request:', { text: transcript, language, district, crops });
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiUrl}/advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript, language, district, crops }),
      });
      
      console.log('Response status:', res.status);
      
      let data = '';
      let meta = null;
      
      // Get the response text first
      const responseText = await res.text();
      console.log('Response text:', responseText);
      
      // Try to parse as JSON
      try {
        const json = JSON.parse(responseText);
        data = json.answer || '';
        meta = json;
      } catch {
        // If JSON parsing fails, use the text directly
        data = responseText;
      }
    } catch (error) {
      console.error('Error fetching advice:', error);
      data = 'Sorry, there was an error processing your request.';
    }
    setAdviceResponse(data);
    setRagMeta(meta);
    setTranscript('');
    setRecording(false);
  };

  const handleMicClick = () => {
    if (supported) {
      if (recording) {
        stopSTT();
      } else {
        startSTT();
      }
    } else {
      // Fallback when speech recognition is not supported
      alert('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
    }
  };

  return (
    <div className="d-flex flex-column p-2 bg-white border-top" style={{minHeight:60}}>
      {/* Status indicator for debugging */}
      {recording && (
        <div className="alert alert-info mb-2" style={{fontSize:14, padding:'8px'}}>
          🎤 Recording... Speak now!
        </div>
      )}
      
      <div className="d-flex align-items-center w-100 gap-2">
        {/* Text Input */}
        <div className="flex-grow-1">
          <input
            type="text"
            className="form-control"
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder={supported && recording ? 'Listening...' : 'Type your message or use the mic...'}
            style={{fontSize:18, borderRadius: '8px'}}
          />
        </div>
        
        {/* Microphone Button - Always visible between input and send */}
        <button
          className={`btn ${recording ? 'btn-danger' : 'btn-primary'}`}
          style={{
            fontSize: 18,
            minWidth: 50,
            height: 44,
            borderRadius: '8px',
            backgroundColor: recording ? '#dc3545' : '#007bff',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            border: '2px solid #007bff'
          }}
          onClick={handleMicClick}
          aria-label={recording ? 'Stop Recording' : 'Start Recording'}
          onMouseEnter={(e) => {
            if (!recording) {
              e.target.style.backgroundColor = '#0056b3';
              e.target.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (!recording) {
              e.target.style.backgroundColor = '#007bff';
              e.target.style.transform = 'scale(1)';
            }
          }}
        >
          {recording ? '⏹️' : '🎤'}
        </button>
        
        {/* Send Button */}
        <button
          className="btn btn-primary"
          style={{fontSize:18, minWidth:70, borderRadius: '8px'}}
          disabled={!transcript.trim()}
          onClick={handleSend}
        >
          Send
        </button>
        {error && <span className="text-danger ms-2">{error}</span>}
      </div>
      {adviceResponse && (
        <div className="mt-2">
          <div className="alert alert-success mb-2" style={{fontSize:17, position:'relative'}}>
            {ragMeta && ragMeta.confidence && (
              <span style={{position:'absolute', top:8, right:12}}>
                <ConfidenceBadge level={ragMeta.confidence} />
              </span>
            )}
            {adviceResponse}
          </div>
          <SpeechPlayer text={adviceResponse} language={language} slow={slow} globalMute={muted} />
          <label className="form-check-label ms-2" style={{fontSize:16}}>
            <input
              type="checkbox"
              className="form-check-input me-1"
              checked={slow}
              onChange={e => setSlow(e.target.checked)}
            />
            Slow speech
          </label>
          {ragMeta && <SourceList sources={ragMeta.sources} />}
          {ragMeta && ragMeta.confidence === 'Low' && (
            <SaferAlternativesPanel alternatives={ragMeta.safety_alternatives} />
          )}
        </div>
      )}
    </div>
  );
}
