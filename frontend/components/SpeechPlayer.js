import { useEffect, useRef, useState } from 'react';
import { useMute } from './GlobalMuteProvider';

const getLangCode = (lang) => {
  if (lang === 'hi') return 'hi-IN';
  return 'en-IN';
};

export default function SpeechPlayer({ text, language = 'en', slow = false, globalMute = false }) {
  const { muted } = useMute();
  const [playing, setPlaying] = useState(false);
  const [voices, setVoices] = useState([]);
  const [voice, setVoice] = useState(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    const updateVoices = () => {
      const allVoices = synthRef.current.getVoices();
      setVoices(allVoices);
      const langCode = getLangCode(language);
      const match = allVoices.find(v => v.lang === langCode) || allVoices.find(v => v.lang.startsWith(langCode.split('-')[0]));
      setVoice(match || null);
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [language]);

  useEffect(() => {
    if (!playing) {
      window.speechSynthesis.cancel();
    }
    // Stop speech if muted
    if (globalMute || muted) {
      setPlaying(false);
      window.speechSynthesis.cancel();
    }
  }, [playing, globalMute, muted]);

  const handlePlay = () => {
    if (!text || globalMute || muted) return;
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = getLangCode(language);
    if (voice) utter.voice = voice;
    utter.rate = slow ? 0.7 : 1;
    utter.onend = () => setPlaying(false);
    window.speechSynthesis.speak(utter);
    setPlaying(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setPlaying(false);
  };

  return (
    <div className="d-flex align-items-center gap-2 mt-2">
      <button
        className={`btn btn-${playing ? 'danger' : 'primary'} btn-sm`}
        onClick={playing ? handleStop : handlePlay}
  disabled={!text || globalMute || muted}
        style={{fontSize:18}}
      >
        {playing ? 'Stop' : 'Play'}
      </button>
      <label className="form-check-label ms-2" style={{fontSize:16}}>
        <input
          type="checkbox"
          className="form-check-input me-1"
          checked={slow}
          onChange={e => {
            if (playing) handleStop();
            if (typeof window !== 'undefined') setTimeout(() => handlePlay(), 100);
          }}
        />
        Slow
      </label>
    </div>
  );
}
