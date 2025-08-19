import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Ask() {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const { t } = useTranslation();

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('krishimitra-chat-history');
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
        setShowSuggestions(false); // Hide suggestions if there's existing history
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('krishimitra-chat-history', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const sampleQuestions = [
    t('sampleQ1'),
    t('sampleQ2'),
    t('sampleQ3'),
    t('sampleQ4'),
    t('sampleQ5'),
    t('sampleQ6'),
  ];

  const handleSuggestionClick = (suggestion) => {
    setQuestion(suggestion);
    handleAsk(suggestion);
  };

  const handleAsk = async (questionText = null) => {
    const currentQuestion = questionText || question.trim();
    if (!currentQuestion) return;
    
    setLoading(true);
    setShowSuggestions(false); // Hide suggestions after first question
    
    // Add user question to chat history immediately
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentQuestion,
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
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
      
      // Add AI response to chat history
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error calling API:', err);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, there was an error processing your question. Please try again.',
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('krishimitra-chat-history');
    setShowSuggestions(true);
    setQuestion('');
  };

  return (
    <div 
      className="min-vh-100 d-flex flex-column"
      style={{
        paddingTop: 0,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%)'
      }}
    >
      {/* 🚨 TEST BANNER - ASK_NEW.JS */}
      <div style={{
        backgroundColor: 'purple',
        color: 'white',
        padding: '10px',
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: 'bold'
      }}>
        🚨 ASK_NEW.JS FILE IS BEING USED 🚨
      </div>
      
      <main className="container py-4 flex-grow-1" style={{maxWidth: '900px'}}>
        {/* Header */}
        <div className="text-center mb-4 animate-fade-in-up">
          <div className="d-flex justify-content-center align-items-center mb-3">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
              style={{
                width: 50,
                height: 50,
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
              }}
            >
              <span style={{ fontSize: 24, color: 'white' }}>🌱</span>
            </div>
            <h1 className="mb-0 fw-bold" style={{color: '#2e7d32', fontSize: '2rem'}}>
              {t('aiAdvice')}
            </h1>
          </div>
          <p className="text-muted mb-0" style={{fontSize: '1.1rem'}}>
            Ask your farming questions and get AI-powered advice
          </p>
          
          {/* Clear Chat Button */}
          {chatHistory.length > 0 && (
            <button 
              className="btn btn-outline-secondary btn-sm mt-2"
              onClick={clearChatHistory}
              style={{ borderRadius: '20px' }}
            >
              🗑️ Clear Chat History
            </button>
          )}
        </div>

        {/* Chat History */}
        {chatHistory.length > 0 && (
          <div className="mb-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {chatHistory.map((message) => (
              <div 
                key={message.id} 
                className={`mb-3 d-flex ${message.type === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
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
                    maxWidth: '80%',
                    borderRadius: message.type === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px'
                  }}
                >
                  <div className="card-body p-3">
                    {message.type === 'user' && (
                      <div className="d-flex align-items-center mb-2">
                        <span style={{ fontSize: 16 }}>👨‍🌾</span>
                        <small className="ms-2 opacity-75">You</small>
                      </div>
                    )}
                    {message.type === 'ai' && (
                      <div className="d-flex align-items-center mb-2">
                        <span style={{ fontSize: 16 }}>🤖</span>
                        <small className="ms-2 text-muted">Krishi AI</small>
                      </div>
                    )}
                    {message.type === 'error' && (
                      <div className="d-flex align-items-center mb-2">
                        <span style={{ fontSize: 16 }}>⚠️</span>
                        <small className="ms-2 opacity-75">Error</small>
                      </div>
                    )}
                    <div style={{ lineHeight: 1.5 }}>
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="mb-3 d-flex justify-content-start">
            <div className="card border-0 shadow-sm bg-light" style={{ borderRadius: '20px 20px 20px 5px' }}>
              <div className="card-body p-3">
                <div className="d-flex align-items-center mb-2">
                  <span style={{ fontSize: 16 }}>🤖</span>
                  <small className="ms-2 text-muted">Krishi AI</small>
                </div>
                <div className="d-flex align-items-center">
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Question Input */}
        <div className="card border-0 shadow-sm mb-4" style={{borderRadius: '24px'}}>
          <div className="card-body p-4">
            <div className="position-relative">
              <textarea 
                className="form-control border-0 shadow-none" 
                style={{
                  resize: 'none',
                  fontSize: 18,
                  borderRadius: '16px',
                  background: '#f8f9fa',
                  paddingTop: '20px',
                  paddingBottom: '20px',
                  minHeight: '80px'
                }}
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
              <div 
                className="position-absolute top-0 end-0 mt-3 me-3"
                style={{ opacity: 0.6 }}
              >
                <span style={{ fontSize: 20 }}>💭</span>
              </div>
            </div>
            <button 
              className="btn btn-success w-100 py-3 fw-bold mt-3" 
              style={{
                fontSize: 18,
                borderRadius: '16px',
                background: loading ? '#cccccc' : 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                border: 'none',
                transition: 'all 0.3s ease'
              }}
              onClick={() => handleAsk()}
              disabled={!question.trim() || loading}
              onMouseOver={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.3)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span className="me-2" style={{ 
                lineHeight: 1, 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>{loading ? '⏳' : '🚀'}</span>
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>

        {/* Sample Questions Section - Only show when no chat history */}
        {showSuggestions && chatHistory.length === 0 && (
          <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="d-flex align-items-center mb-4">
              <span style={{ 
                fontSize: 24, 
                marginRight: 12, 
                lineHeight: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>💡</span>
              <h5 className="mb-0 fw-bold" style={{fontSize: '1.3rem', color: '#2e7d32'}}>
                Sample Questions
              </h5>
            </div>
            
            <div className="row g-3">
              {sampleQuestions.map((suggestion, index) => (
                <div className="col-md-6" key={index}>
                  <div
                    className="card border-0 shadow-sm interactive-card h-100"
                    style={{
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                    }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(76, 175, 80, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                    }}
                  >
                    <div className="card-body p-4 text-center">
                      <span style={{ 
                        fontSize: 32, 
                        lineHeight: 1, 
                        display: 'block', 
                        marginBottom: 16,
                        opacity: 0.8 
                      }}>❓</span>
                      <p className="card-text mb-0" style={{
                        fontSize: '1rem',
                        lineHeight: 1.5,
                        color: '#2e7d32',
                        fontWeight: '500'
                      }}>
                        {suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Farmer Tips Section */}
        <div className="mt-5 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
          <div 
            className="card border-0 shadow-sm"
            style={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)'
            }}
          >
            <div className="card-body p-4 text-center">
              <span style={{ 
                fontSize: 32, 
                lineHeight: 1, 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: 0,
                padding: 0,
                textAlign: 'center',
                verticalAlign: 'middle'
              }}>🌾</span>
              <h6 className="fw-bold mt-2 mb-2" style={{ color: '#e65100' }}>
                Farmer Tip
              </h6>
              <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                Ask clear and specific questions to get better AI responses
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
