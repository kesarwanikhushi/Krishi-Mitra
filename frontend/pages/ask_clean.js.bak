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

  // Switch to a different session
  const switchSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    setQuestion('');
  };

  // Delete a session
  const deleteSession = (sessionId) => {
    setSessions(prev => {
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
      const updatedSession = {
        ...session,
        messages: [...session.messages, message],
        timestamp: new Date().toISOString()
      };
      
      // Update title if this is the first user message
      if (message.type === 'user' && session.messages.length === 0) {
        updatedSession.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
      }
      
      return {
        ...prev,
        [currentSessionId]: updatedSession
      };
    });
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
    addMessageToSession(userMessage);
    
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

      addMessageToSession(botMessage);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, there was an error processing your question. Please try again.',
        timestamp: new Date().toISOString()
      };
      addMessageToSession(errorMessage);
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

  const getSortedSessions = () => {
    return Object.values(sessions).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
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
      {/* 🚨 TEST BANNER - ASK_CLEAN.JS */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'orange',
        color: 'white',
        padding: '10px',
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
        zIndex: 9999
      }}>
        🚨 ASK_CLEAN.JS FILE IS BEING USED 🚨
      </div>
      
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
      <div className="flex-fill d-flex flex-column" style={{ height: '100vh' }}>
        {/* Header */}
        <div className="bg-white p-3 d-flex align-items-center justify-content-between border-bottom">
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
              {currentSession && (
                <small className="text-muted">
                  {currentSession.messages.length} {t('messages')}
                </small>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-fill p-3" style={{ overflowY: 'auto' }}>
          {currentSession && currentSession.messages.length > 0 ? (
            <div className="mb-4">
              {currentSession.messages.map((message) => (
                <div
                  key={message.id}
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
                      {message.content}
                    </div>
                    <div 
                      className={`mt-2 ${message.type === 'user' ? 'text-white-50' : 'text-muted'}`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : showSuggestions ? (
            <div className="text-center">
              <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🌾</div>
              <h2 className="fw-bold mb-4" style={{ color: '#2e7d32' }}>
                {t('askAI')}
              </h2>
              <p className="mb-4 text-muted" style={{ fontSize: '1.1rem' }}>
                {t('askPlaceholderSubtitle')}
              </p>
              
              <div className="row g-3 mb-4">
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
                        borderRadius: '16px',
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
                      <div className="card-body p-4 text-center">
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                          {['🌱', '🌾', '🚜', '📊'][index]}
                        </div>
                        <p className="mb-0" style={{ fontSize: '0.9rem', color: '#666' }}>
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
        <div className="p-3 bg-white border-top">
          <div className="d-flex gap-2">
            <textarea
              className="form-control border-0 shadow-sm"
              rows={1}
              placeholder={t('askPlaceholder')}
              style={{
                fontSize: '1rem',
                borderRadius: '12px',
                background: '#f8f9fa',
                resize: 'none'
              }}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
            />
            <button
              className="btn btn-success px-4"
              style={{
                borderRadius: '12px',
                background: loading ? '#cccccc' : '#4caf50',
                border: 'none'
              }}
              onClick={handleAsk}
              disabled={!question.trim() || loading}
            >
              {loading ? '⏳' : '🚀'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
