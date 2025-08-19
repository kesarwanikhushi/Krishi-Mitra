import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ConfidenceBadge from '../components/ConfidenceBadge';

export default function Ask() {
  const { t, ready } = useTranslation();
  const [question, setQuestion] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessions, setSessions] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('en-US');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingMessageId, setCurrentSpeakingMessageId] = useState(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load all chat sessions from localStorage on component mount
  useEffect(() => {
    if (!mounted) return;
    
    const savedSessions = localStorage.getItem('krishimitra-chat-sessions');
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        
        // Ensure all sessions have messages arrays
        const validatedSessions = {};
        Object.keys(parsedSessions).forEach(sessionId => {
          const session = parsedSessions[sessionId];
          if (session && typeof session === 'object') {
            validatedSessions[sessionId] = {
              ...session,
              messages: Array.isArray(session.messages) ? session.messages : []
            };
          }
        });
        
        setSessions(validatedSessions);
        
        // If there are saved sessions, automatically select the most recent one
        const sessionIds = Object.keys(validatedSessions);
        if (sessionIds.length > 0) {
          const mostRecentSession = sessionIds.reduce((latest, current) => {
            return new Date(validatedSessions[current].timestamp) > new Date(validatedSessions[latest].timestamp) 
              ? current : latest;
          });
          setCurrentSessionId(mostRecentSession);
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error);
      }
    }
  }, [mounted]);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    if (Object.keys(sessions).length > 0 && mounted) {
      localStorage.setItem('krishimitra-chat-sessions', JSON.stringify(sessions));
    }
  }, [sessions, mounted]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const SpeechSynthesis = window.speechSynthesis;
      
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        // Start with English, will be updated based on detected language
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          const confidence = event.results[0][0].confidence;
          
          // Detect language from the transcript
          const detectedLang = detectLanguageFromText(transcript);
          setDetectedLanguage(detectedLang);
          
          setQuestion(prev => prev + transcript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }

      // Initialize speech synthesis
      if (SpeechSynthesis) {
        synthRef.current = SpeechSynthesis;
      }
    }
  }, []);

  // Function to detect language from text content
  const detectLanguageFromText = (text) => {
    // Simple language detection based on character patterns and common words
    const hindiPattern = /[\u0900-\u097F]/; // Devanagari script
    const arabicPattern = /[\u0600-\u06FF]/; // Arabic script
    const bengaliPattern = /[\u0980-\u09FF]/; // Bengali script
    const gujaratiPattern = /[\u0A80-\u0AFF]/; // Gujarati script
    const punjabiPattern = /[\u0A00-\u0A7F]/; // Punjabi script
    
    // Common words detection
    const hindiWords = /\b(क्या|कैसे|कब|कहाँ|कौन|मैं|आप|है|हैं|के|की|में|से|को|का|पर|और|या|नहीं|हाँ|जी|धन्यवाद|नमस्ते|खेती|फसल|किसान)\b/i;
    const bengaliWords = /\b(কি|কীভাবে|কখন|কোথায়|কে|আমি|আপনি|আছে|আছেন|এর|এই|তে|থেকে|কে|র|উপর|এবং|অথবা|না|হাঁ|ধন্যবাদ|নমস্কার|কৃষি|ফসল|কৃষক)\b/i;
    const gujaratiWords = /\b(શું|કેવી રીતે|ક્યારે|ક્યાં|કોણ|હું|તમે|છે|છો|ના|ની|માં|થી|ને|ના|પર|અને|અથવા|ના|હા|આભાર|નમસ્તે|ખેતી|પાક|ખેડૂત)\b/i;
    const punjabiWords = /\b(ਕੀ|ਕਿਵੇਂ|ਕਦੋਂ|ਕਿੱਥੇ|ਕੌਣ|ਮੈਂ|ਤੁਸੀਂ|ਹੈ|ਹੋ|ਦੇ|ਦੀ|ਵਿੱਚ|ਤੋਂ|ਨੂੰ|ਦਾ|ਤੇ|ਅਤੇ|ਜਾਂ|ਨਹੀਂ|ਹਾਂ|ਧੰਨਵਾਦ|ਸਤ ਸ੍ਰੀ ਅਕਾਲ|ਖੇਤੀ|ਫ਼ਸਲ|ਕਿਸਾਨ)\b/i;
    
    if (hindiPattern.test(text) || hindiWords.test(text)) {
      return 'hi-IN';
    } else if (bengaliPattern.test(text) || bengaliWords.test(text)) {
      return 'bn-IN';
    } else if (gujaratiPattern.test(text) || gujaratiWords.test(text)) {
      return 'gu-IN';
    } else if (punjabiPattern.test(text) || punjabiWords.test(text)) {
      return 'pa-IN';
    } else if (arabicPattern.test(text)) {
      return 'ar-SA';
    } else {
      return 'en-US';
    }
  };

  // Function to get language code for API request
  const getLanguageForAPI = (langCode) => {
    const langMap = {
      'hi-IN': 'hindi',
      'bn-IN': 'bengali',
      'gu-IN': 'gujarati',
      'pa-IN': 'punjabi',
      'en-US': 'english',
      'ar-SA': 'arabic'
    };
    return langMap[langCode] || 'english';
  };

  // Function to get language display name
  const getLanguageDisplayName = (langCode) => {
    const displayMap = {
      'hi-IN': 'Hindi',
      'bn-IN': 'Bengali',
      'gu-IN': 'Gujarati',
      'pa-IN': 'Punjabi',
      'en-US': 'English',
      'ar-SA': 'Arabic'
    };
    return displayMap[langCode] || 'English';
  };

  // Function to convert text to speech
  const speakText = (text, messageId, language = 'en-US') => {
    if (!synthRef.current || !text) return;

    // Stop any ongoing speech
    synthRef.current.cancel();

    // Clean text for speech (remove markdown formatting)
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\* /g, '') // Remove bullet points
      .replace(/\n+/g, '. ') // Replace line breaks with pauses
      .replace(/[#*]/g, '') // Remove other markdown characters
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Set language for speech
    const speechLang = getSpeechLanguage(language);
    utterance.lang = speechLang;
    
    // Set voice properties
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1;
    utterance.volume = 1;

    // Set up event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeakingMessageId(messageId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeakingMessageId(null);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      setCurrentSpeakingMessageId(null);
    };

    // Speak the text
    synthRef.current.speak(utterance);
  };

  // Function to stop speech
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingMessageId(null);
    }
  };

  // Function to get appropriate speech language code
  const getSpeechLanguage = (langCode) => {
    const speechLangMap = {
      'hi-IN': 'hi-IN',
      'bn-IN': 'bn-IN',
      'gu-IN': 'gu-IN',
      'pa-IN': 'pa-IN',
      'en-US': 'en-US',
      'ar-SA': 'ar-SA',
      'english': 'en-US',
      'hindi': 'hi-IN',
      'bengali': 'bn-IN',
      'gujarati': 'gu-IN',
      'punjabi': 'pa-IN',
      'arabic': 'ar-SA'
    };
    return speechLangMap[langCode] || 'en-US';
  };

  // Function to toggle speech recognition with language support
  const toggleSpeechRecognition = () => {
    if (!speechSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Set up recognition for multi-language support
      const supportedLanguages = ['hi-IN', 'en-US', 'bn-IN', 'gu-IN', 'pa-IN'];
      
      // Try to use the previously detected language, fallback to English
      recognitionRef.current.lang = detectedLanguage || 'en-US';
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Speech recognition start error:', error);
        // Fallback to English if the detected language fails
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.start();
      }
    }
  };

  // Don't render until component is mounted and translations are ready
  if (!mounted || !ready) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Create a new chat session
  const createNewSession = () => {
    const newSessionId = Date.now().toString();
    const newSession = {
      id: newSessionId,
      title: t('newChat') || 'New Chat',
      messages: [], // Ensure messages is always an array
      timestamp: new Date().toISOString()
    };
    
    setSessions(prev => {
      const prevSessions = prev || {};
      return {
        ...prevSessions,
        [newSessionId]: newSession
      };
    });
    setCurrentSessionId(newSessionId);
    setQuestion('');
    setShowSuggestions(true);
  };

  // Switch to a different session
  const switchSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    setQuestion('');
  };

  // Delete a session
  const deleteSession = (sessionId) => {
    setSessions(prev => {
      if (!prev || typeof prev !== 'object') return {};
      
      const newSessions = { ...prev };
      delete newSessions[sessionId];
      
      // If we deleted the current session, switch to another or create new
      if (sessionId === currentSessionId) {
        const remainingIds = Object.keys(newSessions);
        if (remainingIds.length > 0) {
          setCurrentSessionId(remainingIds[0]);
        } else {
          setCurrentSessionId(null);
          setShowSuggestions(true);
        }
      }
      
      return newSessions;
    });
  };

  // Add message to current session
  const addMessageToSession = (message) => {
    if (!currentSessionId) return;
    
    setSessions(prev => {
      const session = prev[currentSessionId];
      
      // If session doesn't exist, create a new one
      if (!session) {
        const newSession = {
          id: currentSessionId,
          title: message.type === 'user' ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '') : 'New Chat',
          messages: [message],
          timestamp: new Date().toISOString()
        };
        
        return {
          ...prev,
          [currentSessionId]: newSession
        };
      }
      
      const updatedSession = {
        ...session,
        messages: [...(session.messages || []), message],
        timestamp: new Date().toISOString()
      };
      
      // Update title if this is the first user message
      if (message.type === 'user' && (session.messages || []).length === 0) {
        updatedSession.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
      }
      
      return {
        ...prev,
        [currentSessionId]: updatedSession
      };
    });
  };

  const handleAsk = async (textToAsk = null) => {
    const questionText = textToAsk || question.trim();
    if (!questionText || loading) return;

    let sessionId = currentSessionId;

    // Create new session if none exists
    if (!sessionId) {
      sessionId = Date.now().toString();
      const newSession = {
        id: sessionId,
        title: t('newChat'),
        messages: [],
        timestamp: new Date().toISOString()
      };
      
      // Update sessions state with the new session
      setSessions(prev => ({
        ...prev,
        [sessionId]: newSession
      }));
      setCurrentSessionId(sessionId);
      setShowSuggestions(false);
    }

    setLoading(true);
    setShowSuggestions(false);
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: questionText,
      timestamp: new Date().toISOString()
    };

    // Add user message to the session (using the sessionId we just created)
    setSessions(prev => {
      const session = prev[sessionId];
      
      // If session doesn't exist, create a new one (fallback safety)
      if (!session) {
        const newSession = {
          id: sessionId,
          title: userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? '...' : ''),
          messages: [userMessage],
          timestamp: new Date().toISOString()
        };
        
        return {
          ...prev,
          [sessionId]: newSession
        };
      }
      
      const updatedSession = {
        ...session,
        messages: [...(session.messages || []), userMessage],
        timestamp: new Date().toISOString()
      };
      
      // Update title if this is the first user message
      if ((session.messages || []).length === 0) {
        updatedSession.title = userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? '...' : '');
      }
      
      return {
        ...prev,
        [sessionId]: updatedSession
      };
    });
    
    const currentQuestion = questionText;
    setQuestion('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      console.log('🔗 API URL:', apiUrl);
      console.log('📤 Sending question:', currentQuestion);
      console.log('🌐 Detected language:', detectedLanguage);
      
      // Detect language from the question if not already detected
      const questionLanguage = detectedLanguage || detectLanguageFromText(currentQuestion);
      const apiLanguage = getLanguageForAPI(questionLanguage);
      
      const response = await fetch(`${apiUrl}/advice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: currentQuestion,
          language: apiLanguage,
          preferredLanguage: questionLanguage
        }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📥 Response data:', data);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.advice || data.answer || 'Sorry, I could not process your question.',
        timestamp: new Date().toISOString(),
        confidence: data.confidence,
        confidenceScore: data.confidenceScore,
        confidenceFactors: data.confidenceFactors,
        sources: data.sources,
        provider: data.provider
      };

      // Add bot message to the session
      setSessions(prev => {
        const session = prev[sessionId];
        if (!session) return prev; // Safety check
        
        const updatedSession = {
          ...session,
          messages: [...(session.messages || []), botMessage],
          timestamp: new Date().toISOString()
        };
        
        return {
          ...prev,
          [sessionId]: updatedSession
        };
      });
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, there was an error processing your question. Please try again.',
        timestamp: new Date().toISOString(),
        confidence: 'Low',
        confidenceScore: 30,
        confidenceFactors: ['Network error', 'Unable to process request']
      };
      
      // Add error message to the session
      setSessions(prev => {
        const session = prev[sessionId];
        if (!session) return prev; // Safety check
        
        const updatedSession = {
          ...session,
          messages: [...(session.messages || []), errorMessage],
          timestamp: new Date().toISOString()
        };
        
        return {
          ...prev,
          [sessionId]: updatedSession
        };
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuestion(suggestion);
    setShowSuggestions(false);
  };

  const getCurrentSession = () => {
    if (!currentSessionId || !sessions || typeof sessions !== 'object' || !sessions[currentSessionId]) {
      return null;
    }
    const session = sessions[currentSessionId];
    if (!session || typeof session !== 'object') {
      return null;
    }
    // Ensure messages array exists
    return {
      ...session,
      messages: Array.isArray(session.messages) ? session.messages : []
    };
  };

  const getSortedSessions = () => {
    if (!sessions || typeof sessions !== 'object') {
      return [];
    }
    return Object.values(sessions)
      .filter(session => session && typeof session === 'object')
      .map(session => ({
        ...session,
        messages: Array.isArray(session.messages) ? session.messages : []
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return t('today');
    if (diffDays === 2) return t('yesterday');
    if (diffDays <= 7) return `${diffDays} ${t('daysAgo')}`;
    return date.toLocaleDateString();
  };

  const currentSession = getCurrentSession();

  return (
    <div className="d-flex" style={{ height: '100vh', background: '#f5f7fa' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `
      }} />
      {/* Sidebar */}
      <div 
        className={`bg-white shadow-lg ${sidebarOpen ? 'd-block' : 'd-none'}`} 
        style={{ 
          width: '300px', 
          borderRight: '1px solid #e0e0e0',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-bottom">
          <button 
            className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
            style={{ borderRadius: '12px' }}
            onClick={createNewSession}
          >
            <span>+</span>
            <span>{t('newChat')}</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="p-2" style={{ height: 'calc(100vh - 80px)', overflowY: 'auto' }}>
          {getSortedSessions().map((session) => (
            <div
              key={session.id}
              className={`p-3 rounded mb-2 cursor-pointer position-relative ${
                session.id === currentSessionId ? 'bg-light border border-success' : 'hover-bg-light'
              }`}
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderRadius: '12px'
              }}
              onClick={() => switchSession(session.id)}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => {
                if (session.id !== currentSessionId) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div 
                    className="fw-medium text-truncate" 
                    style={{ fontSize: '0.9rem', color: '#2e7d32' }}
                  >
                    {session.title}
                  </div>
                  <div 
                    className="text-muted text-truncate" 
                    style={{ fontSize: '0.75rem' }}
                  >
                    {formatTime(session.timestamp)}
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-outline-danger ms-2"
                  style={{ 
                    padding: '2px 6px', 
                    fontSize: '0.7rem',
                    borderRadius: '6px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          
          {getSortedSessions().length === 0 && (
            <div className="text-center text-muted p-4">
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬</div>
              <p style={{ fontSize: '0.9rem' }}>{t('noChatsYet')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-fill d-flex flex-column" style={{ height: '100vh', minHeight: 0 }}>
        {/* Header */}
        <div className="bg-white p-3 d-flex align-items-center justify-content-between border-bottom" style={{ flexShrink: 0 }}>
          <div className="d-flex align-items-center gap-3">
            <button 
              className="btn btn-outline-secondary"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ borderRadius: '8px' }}
            >
              ☰
            </button>
            <div>
              <h5 className="mb-0" style={{ color: '#2e7d32' }}>
                {currentSession ? currentSession.title : t('askAI')}
              </h5>
              {currentSession && currentSession.messages && Array.isArray(currentSession.messages) && (
                <small className="text-muted">
                  {currentSession.messages.length} {t('messages')}
                </small>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-fill p-3" style={{ overflowY: 'auto', height: 'calc(100vh - 160px)' }}>
          {currentSession && currentSession.messages && Array.isArray(currentSession.messages) && currentSession.messages.length > 0 ? (
            <div className="mb-4">
              {currentSession.messages.filter(message => message && typeof message === 'object').map((message) => (
                <div
                  key={message.id || Math.random()}
                  className={`mb-4 d-flex ${message.type === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div
                    className={`p-3 rounded-3 shadow-sm ${
                      message.type === 'user'
                        ? 'bg-success text-white'
                        : message.type === 'error'
                        ? 'bg-danger text-white'
                        : 'bg-white border'
                    }`}
                    style={{
                      maxWidth: '70%',
                      wordWrap: 'break-word'
                    }}
                  >
                    <div style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                      {message.content || 'No content'}
                    </div>
                    
                    {/* Confidence Badge for bot messages */}
                    {message.type !== 'user' && message.confidence && (
                      <div className="mt-2">
                        <ConfidenceBadge 
                          confidence={message.confidence}
                          confidenceScore={message.confidenceScore}
                          confidenceFactors={message.confidenceFactors}
                        />
                      </div>
                    )}
                    
                    <div 
                      className={`mt-2 d-flex align-items-center justify-content-between ${message.type === 'user' ? 'text-white-50' : 'text-muted'}`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      <span>
                        {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                      </span>
                      
                      {/* Speaker button for bot messages only */}
                      {message.type !== 'user' && message.content && synthRef.current && (
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            currentSpeakingMessageId === message.id 
                              ? 'btn-primary' 
                              : 'btn-outline-secondary'
                          }`}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            marginLeft: '10px',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => {
                            if (currentSpeakingMessageId === message.id) {
                              stopSpeaking();
                            } else {
                              speakText(message.content, message.id, detectedLanguage);
                            }
                          }}
                          title={
                            currentSpeakingMessageId === message.id 
                              ? 'Stop speaking' 
                              : 'Read aloud'
                          }
                        >
                          {currentSpeakingMessageId === message.id ? '⏹️' : '🔊'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : showSuggestions ? (
            <div className="text-center">
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌾</div>
              <h2 className="fw-bold mb-2" style={{ color: '#2e7d32' }}>
                {t('askAI')}
              </h2>
              <p className="mb-3 text-muted" style={{ fontSize: '1.1rem' }}>
                {t('askPlaceholderSubtitle')}
              </p>
              
              <div className="row g-2 mb-3">
                {[
                  t('suggestion1'),
                  t('suggestion2'),
                  t('suggestion3'),
                  t('suggestion4')
                ].map((suggestion, index) => (
                  <div key={index} className="col-md-6">
                    <div
                      className="card h-100 border-0 shadow-sm cursor-pointer"
                      style={{
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div className="card-body p-2 text-center">
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                          {['🌱', '🌾', '🚜', '📊'][index]}
                        </div>
                        <p className="mb-0" style={{ fontSize: '0.8rem', color: '#666' }}>
                          {suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted p-5">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <p>{t('startConversation')}</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="d-flex flex-column p-2 bg-white border-top" style={{
          minHeight: 70,
          maxHeight: 90,
          flexShrink: 0,
          position: 'sticky',
          bottom: 0,
          width: '100%'
        }}>
          <div className="d-flex align-items-center w-100 gap-2">
            {/* Text Input */}
            <div style={{ flex: '1' }}>
              <input
                type="text"
                className="form-control"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t('askPlaceholder') || 'Type your question...'}
                style={{fontSize:18, borderRadius: '8px'}}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (question.trim()) {
                      handleAsk(question);
                    }
                  }
                }}
              />
            </div>
            
            {/* Microphone Button */}
            {speechSupported && (
              <button
                type="button"
                className={`btn ${isListening ? 'btn-primary' : 'btn-outline-secondary'}`}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onClick={toggleSpeechRecognition}
                disabled={loading}
                title={`${isListening ? 'Stop listening' : 'Start voice input'} (${getLanguageDisplayName(detectedLanguage)})`}
              >
                🎤
                {detectedLanguage !== 'en-US' && (
                  <span 
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      background: '#28a745',
                      color: 'white',
                      borderRadius: '50%',
                      width: '12px',
                      height: '12px',
                      fontSize: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={`Detected: ${getLanguageDisplayName(detectedLanguage)}`}
                  >
                    •
                  </span>
                )}
              </button>
            )}
            
            {/* Send Button */}
            <button
              className="btn btn-primary"
              style={{fontSize:18, minWidth:70, borderRadius: '8px'}}
              disabled={!question.trim() || loading}
              onClick={() => {
                if (question.trim()) {
                  handleAsk(question);
                }
              }}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
