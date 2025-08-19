import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Ask() {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [sessions, setSessions] = useState({});
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load sessions from localStorage on component mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('krishimitra-chat-sessions');
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        setSessions(parsedSessions);
        
        // Set the most recent session as current
        const sessionIds = Object.keys(parsedSessions);
        if (sessionIds.length > 0) {
          const mostRecentSession = sessionIds.reduce((latest, current) => {
            return new Date(parsedSessions[current].timestamp) > new Date(parsedSessions[latest].timestamp) 
              ? current : latest;
          });
          setCurrentSessionId(mostRecentSession);
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error);
      }
    }
  }, []);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    if (Object.keys(sessions).length > 0) {
      localStorage.setItem('krishimitra-chat-sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Create a new chat session
  const createNewSession = () => {
    const newSessionId = Date.now().toString();
    const newSession = {
      id: newSessionId,
      title: t('newChat'),
      messages: [],
      timestamp: new Date().toISOString()
    };
    
    setSessions(prev => ({
      ...prev,
      [newSessionId]: newSession
    }));
    setCurrentSessionId(newSessionId);
    setQuestion('');
    setShowSuggestions(true);
  };

  const handleAsk = async () => {
    if (!question.trim() || loading) return;

    // Create new session if none exists
    if (!currentSessionId) {
      createNewSession();
    }

    setLoading(true);
    setShowSuggestions(false);
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: question.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message to session
    setSessions(prev => {
      const session = prev[currentSessionId];
      const updatedSession = {
        ...session,
        messages: [...session.messages, userMessage],
        timestamp: new Date().toISOString()
      };
      
      // Update title if this is the first user message
      if (session.messages.length === 0) {
        updatedSession.title = userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? '...' : '');
      }
      
      return {
        ...prev,
        [currentSessionId]: updatedSession
      };
    });
    
    const currentQuestion = question;
    setQuestion('');

    try {
      const response = await fetch('http://localhost:5001/advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: currentQuestion }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.advice || 'Sorry, I could not process your question.',
        timestamp: new Date().toISOString()
      };

      setSessions(prev => {
        const session = prev[currentSessionId];
        const updatedSession = {
          ...session,
          messages: [...session.messages, botMessage],
          timestamp: new Date().toISOString()
        };
        
        return {
          ...prev,
          [currentSessionId]: updatedSession
        };
      });
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, there was an error processing your question. Please try again.',
        timestamp: new Date().toISOString()
      };
      
      setSessions(prev => {
        const session = prev[currentSessionId];
        const updatedSession = {
          ...session,
          messages: [...session.messages, errorMessage],
          timestamp: new Date().toISOString()
        };
        
        return {
          ...prev,
          [currentSessionId]: updatedSession
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
    return currentSessionId ? sessions[currentSessionId] : null;
  };

  const currentSession = getCurrentSession();

  return (
    <div className="container mt-4">
      <div className="d-flex gap-3">
        {/* Sidebar */}
        <div className="bg-white p-3 rounded shadow" style={{ width: '300px', minHeight: '600px' }}>
          <button 
            className="btn btn-success w-100 mb-3"
            onClick={createNewSession}
          >
            + {t('newChat')}
          </button>
          
          <div>
            {Object.values(sessions)
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((session) => (
                <div
                  key={session.id}
                  className={`p-2 mb-2 rounded cursor-pointer ${
                    session.id === currentSessionId ? 'bg-light border border-success' : ''
                  }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setCurrentSessionId(session.id)}
                >
                  <div className="fw-medium text-truncate">{session.title}</div>
                  <small className="text-muted">{session.messages.length} messages</small>
                </div>
              ))}
            
            {Object.keys(sessions).length === 0 && (
              <div className="text-center text-muted p-3">
                <p>{t('noChatsYet')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-fill">
          <div className="bg-white p-4 rounded shadow" style={{ minHeight: '600px' }}>
            <h2 className="mb-4" style={{ color: '#2e7d32' }}>
              {currentSession ? currentSession.title : t('askAI')}
            </h2>

            {/* Messages */}
            {currentSession && currentSession.messages.length > 0 ? (
              <div className="mb-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {currentSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-3 d-flex ${message.type === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                  >
                    <div
                      className={`p-3 rounded ${
                        message.type === 'user'
                          ? 'bg-success text-white'
                          : message.type === 'error'
                          ? 'bg-danger text-white'
                          : 'bg-light'
                      }`}
                      style={{ maxWidth: '70%' }}
                    >
                      {message.content}
                      <div className="mt-1" style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : showSuggestions ? (
              <div className="text-center mb-4">
                <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🌾</div>
                <h3 className="mb-3">{t('askAI')}</h3>
                <p className="mb-4 text-muted">{t('askPlaceholderSubtitle')}</p>
                
                <div className="row g-3">
                  {[
                    t('suggestion1'),
                    t('suggestion2'),
                    t('suggestion3'),
                    t('suggestion4')
                  ].map((suggestion, index) => (
                    <div key={index} className="col-md-6">
                      <div
                        className="card h-100 cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="card-body text-center">
                          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                            {['🌱', '🌾', '🚜', '📊'][index]}
                          </div>
                          <p className="mb-0">{suggestion}</p>
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

            {/* Input Area */}
            <div style={{
              backgroundColor: 'red',
              color: 'white',
              padding: '10px',
              textAlign: 'center',
              fontSize: '20px',
              marginBottom: '10px'
            }}>
              🚨 ASK_WORKING.JS FILE IS BEING USED 🚨
            </div>
            
            <div className="d-flex gap-2">
              <textarea
                className="form-control"
                rows={2}
                placeholder={t('askPlaceholder')}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
              />
              
              {/* 🎤 MICROPHONE BUTTON */}
              <button
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '55px',
                  height: '55px',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => {
                  alert('🎤 Microphone button from ask_working.js clicked!');
                  
                  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                    const recognition = new SpeechRecognition();
                    
                    recognition.continuous = false;
                    recognition.interimResults = false;
                    recognition.lang = 'en-US';
                    
                    recognition.onstart = () => {
                      console.log('Speech recognition started');
                    };
                    
                    recognition.onresult = (event) => {
                      const transcript = event.results[0][0].transcript;
                      setQuestion(transcript);
                    };
                    
                    recognition.onerror = (event) => {
                      console.error('Speech recognition error:', event.error);
                      alert('Speech recognition error: ' + event.error);
                    };
                    
                    recognition.start();
                  } else {
                    alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
                  }
                }}
                title="Voice Input - Click to Speak"
              >
                🎤
              </button>
              
              <button
                className="btn btn-success"
                onClick={handleAsk}
                disabled={!question.trim() || loading}
              >
                {loading ? '⏳' : '🚀'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
