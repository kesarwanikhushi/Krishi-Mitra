import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Ask() {
  const [question, setQuestion] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessions, setSessions] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { t } = useTranslation();

  // Sample questions array
  const sampleQuestions = [
    t('sampleQ1'),
    t('sampleQ2'),
    t('sampleQ3'),
    t('sampleQ4'),
    t('sampleQ5'),
    t('sampleQ6'),
  ];

  // Load all chat sessions from localStorage on component mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('krishimitra-chat-sessions');
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        setSessions(parsedSessions);
        
        // Load the most recent session or create a new one
        const sessionIds = Object.keys(parsedSessions);
        if (sessionIds.length > 0) {
          const mostRecentId = sessionIds.sort((a, b) => 
            new Date(parsedSessions[b].lastUpdated) - new Date(parsedSessions[a].lastUpdated)
          )[0];
          setCurrentSessionId(mostRecentId);
          setShowSuggestions(parsedSessions[mostRecentId].messages.length === 0);
        } else {
          createNewSession();
        }
      } catch (e) {
        console.error('Error loading chat sessions:', e);
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  // Save sessions to localStorage whenever they change
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
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    setSessions(prev => ({
      ...prev,
      [newSessionId]: newSession
    }));
    
    setCurrentSessionId(newSessionId);
    setShowSuggestions(true);
  };

  // Get current session data
  const getCurrentSession = () => {
    return currentSessionId ? sessions[currentSessionId] : null;
  };

  // Update session title based on first message
  const updateSessionTitle = (sessionId, firstMessage) => {
    const title = firstMessage.length > 50 
      ? firstMessage.substring(0, 50) + '...' 
      : firstMessage;
    
    setSessions(prev => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        title: title,
        lastUpdated: new Date().toISOString()
      }
    }));
  };

  const handleSuggestionClick = (suggestion) => {
    setQuestion(suggestion);
    // Note: Not auto-submitting, let user click send button
  };

  const handleAsk = async (questionText = null) => {
    const currentQuestion = questionText || question.trim();
    if (!currentQuestion || !currentSessionId) return;
    
    setLoading(true);
    setShowSuggestions(false); // Hide suggestions after first question
    
    // Add user question to current session immediately
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentQuestion,
      timestamp: new Date().toISOString()
    };
    
    const currentSession = getCurrentSession();
    const isFirstMessage = currentSession.messages.length === 0;
    
    // Update session with user message
    setSessions(prev => ({
      ...prev,
      [currentSessionId]: {
        ...prev[currentSessionId],
        messages: [...prev[currentSessionId].messages, userMessage],
        lastUpdated: new Date().toISOString()
      }
    }));
    
    // Update session title if this is the first message
    if (isFirstMessage) {
      updateSessionTitle(currentSessionId, currentQuestion);
    }
    
    setQuestion(''); // Clear input immediately
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/advice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const aiResponse = data.advice || data.message || 'Response received successfully!';
      
      // Add AI response to current session
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };
      
      setSessions(prev => ({
        ...prev,
        [currentSessionId]: {
          ...prev[currentSessionId],
          messages: [...prev[currentSessionId].messages, aiMessage],
          lastUpdated: new Date().toISOString()
        }
      }));
    } catch (err) {
      console.error('Error calling API:', err);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, there was an error processing your question. Please try again.',
        timestamp: new Date().toISOString()
      };
      
      setSessions(prev => ({
        ...prev,
        [currentSessionId]: {
          ...prev[currentSessionId],
          messages: [...prev[currentSessionId].messages, errorMessage],
          lastUpdated: new Date().toISOString()
        }
      }));
    } finally {
      setLoading(false);
    }
  };

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
          createNewSession();
        }
      }
      
      return newSessions;
    });
  };

  return (
    <div className="d-flex min-vh-100" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%)'}}>
      {/* Sidebar */}
      <div 
        className={`bg-white border-end shadow-sm ${sidebarOpen ? '' : 'd-none d-md-block'}`}
        style={{
          width: sidebarOpen ? '300px' : '0px',
          minWidth: sidebarOpen ? '300px' : '0px',
          transition: 'all 0.3s ease',
          overflow: 'hidden'
        }}
      >
        <div className="p-3 border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold" style={{color: '#2e7d32'}}>Chat History</h6>
            <button 
              className="btn btn-sm btn-outline-primary rounded-pill" 
              onClick={createNewSession}
              style={{fontSize: '12px'}}
            >
              + New Chat
            </button>
          </div>
        </div>
        
        <div className="overflow-auto" style={{height: 'calc(100vh - 80px)'}}>
          {Object.values(sessions)
            .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
            .map(session => (
            <div 
              key={session.id}
              className={`p-3 border-bottom cursor-pointer ${
                session.id === currentSessionId ? 'bg-light' : ''
              }`}
              style={{
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => setCurrentSessionId(session.id)}
              onMouseEnter={(e) => {
                if (session.id !== currentSessionId) {
                  e.target.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (session.id !== currentSessionId) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1 me-2">
                  <p className="mb-1 small fw-medium" style={{
                    fontSize: '13px',
                    lineHeight: '1.3',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {session.title}
                  </p>
                  <small className="text-muted" style={{fontSize: '11px'}}>
                    {new Date(session.lastUpdated).toLocaleDateString()}
                  </small>
                </div>
                <button 
                  className="btn btn-sm text-muted p-0" 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  style={{fontSize: '12px', opacity: 0.7}}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Header */}
        <div className="bg-white border-bottom p-3 shadow-sm">
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-link text-muted p-0 me-3 d-md-none" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <div className="d-flex align-items-center">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
                  boxShadow: '0 4px 15px rgba(156, 39, 176, 0.2)'
                }}
              >
                <span style={{fontSize: 20, color: 'white'}}>🤖</span>
              </div>
              <h5 className="mb-0 fw-bold" style={{color: '#2e7d32'}}>
                {t('askAI')} - Krishi Mitra
              </h5>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-grow-1 overflow-auto p-4">
          {getCurrentSession()?.messages.length > 0 ? (
            <div style={{maxWidth: '800px', margin: '0 auto'}}>
              {getCurrentSession().messages.map((message) => (
                <div key={message.id} className="mb-4">
                  <div 
                    className={`d-flex ${message.type === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                  >
                    <div 
                      className={`card border-0 shadow-sm ${
                        message.type === 'user' 
                          ? 'bg-primary text-white' 
                          : message.type === 'error'
                          ? 'bg-danger text-white'
                          : 'bg-light'
                      }`}
                      style={{
                        maxWidth: '75%',
                        borderRadius: message.type === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px'
                      }}
                    >
                      <div className="card-body p-3">
                        <div className="d-flex align-items-start">
                          <div className="me-2">
                            {message.type === 'user' ? '👤' : message.type === 'error' ? '❌' : '🤖'}
                          </div>
                          <div className="flex-grow-1">
                            <p className="mb-1" style={{fontSize: '14px', lineHeight: '1.4'}}>
                              {message.content}
                            </p>
                            <small style={{opacity: 0.8, fontSize: '11px'}}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : showSuggestions && (
            <div style={{maxWidth: '800px', margin: '0 auto'}}>
              {/* Sample Questions */}
              <div className="text-center mb-5">
                <h4 className="fw-bold mb-3" style={{color: '#2e7d32'}}>
                  Welcome to Krishi Mitra AI! 🌾
                </h4>
                <p className="text-muted">
                  Ask me anything about farming, crops, weather, or agriculture. Choose from suggestions below or type your own question.
                </p>
              </div>
              
              <div className="row g-3">
                {sampleQuestions.map((suggestion, index) => (
                  <div className="col-md-6" key={index}>
                    <div
                      className="card border-0 shadow-sm h-100"
                      style={{
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)'
                      }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex align-items-start">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: 35,
                              height: 35,
                              background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                              fontSize: 14
                            }}
                          >
                            ❓
                          </div>
                          <div className="flex-grow-1">
                            <p className="mb-0" style={{
                              fontSize: '14px',
                              lineHeight: '1.4',
                              color: '#444',
                              fontWeight: 500
                            }}>
                              {suggestion}
                            </p>
                          </div>
                          <div className="flex-shrink-0 ms-2">
                            <span style={{ fontSize: 12, color: '#4caf50' }}>→</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-top p-4">
          <div style={{maxWidth: '800px', margin: '0 auto'}}>
            <div className="position-relative">
              <textarea
                className="form-control border-0 shadow-sm"
                placeholder={t('askPlaceholder')}
                rows={2}
                style={{
                  borderRadius: '20px',
                  paddingRight: '60px',
                  paddingLeft: '20px',
                  paddingTop: '15px',
                  paddingBottom: '15px',
                  resize: 'none',
                  fontSize: '14px'
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
                className="btn btn-primary rounded-circle position-absolute"
                style={{
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                  fontSize: '16px'
                }}
                onClick={() => handleAsk()}
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
