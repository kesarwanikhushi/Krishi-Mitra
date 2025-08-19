import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Ask() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const { t } = useTranslation();

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
  };

  const handleAsk = () => {
    if (question.trim()) {
      // Handle the ask functionality here
      console.log('Question asked:', question);
      // You can add API call logic here
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex flex-column"
      style={{
        paddingBottom: 60,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%)'
      }}
    >
      {/* 🚨 TEST BANNER - ASK_BACKUP.JS */}
      <div style={{
        backgroundColor: 'green',
        color: 'white',
        padding: '10px',
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: 'bold'
      }}>
        🚨 ASK_BACKUP.JS FILE IS BEING USED 🚨
      </div>
      
      <main className="container py-4 flex-grow-1" style={{maxWidth: '900px'}}>
        {/* Modern Header */}
        <div className="text-center mb-4 animate-fade-in-up">
          <div className="d-flex justify-content-center align-items-center mb-3">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{
                width: 50,
                height: 50,
                background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
                boxShadow: '0 8px 25px rgba(156, 39, 176, 0.3)'
              }}
            >
              <span style={{ fontSize: 24 }}>🤖</span>
            </div>
            <div>
              <h2 className="fw-bold mb-0" style={{fontSize: '2rem', color: '#2e7d32'}}>
                {t('askAI')}
              </h2>
              <p className="mb-0 text-muted" style={{fontSize: '1rem'}}>
                AI असिस्टेंट से पूछें • Ask AI Assistant
              </p>
            </div>
          </div>
        </div>
        
        {/* Enhanced Input Section */}
        <div className="card border-0 shadow-lg mb-4 animate-fade-in-scale" style={{borderRadius: '24px'}}>
          <div className="card-body p-4">
            <div className="position-relative mb-3">
              <textarea 
                className="form-control border-0 shadow-sm" 
                rows={4} 
                placeholder={t('askPlaceholder')}
                style={{
                  fontSize: 18,
                  borderRadius: '16px',
                  background: '#f8f9fa',
                  resize: 'none',
                  paddingTop: '20px',
                  paddingBottom: '20px'
                }}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <div 
                className="position-absolute top-0 end-0 mt-3 me-3"
                style={{ opacity: 0.6 }}
              >
                <span style={{ fontSize: 20 }}>💭</span>
              </div>
            </div>
            <button 
              className="btn btn-success w-100 py-3 fw-bold" 
              style={{
                fontSize: 18,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                border: 'none',
                transition: 'all 0.3s ease'
              }}
              onClick={handleAsk}
              disabled={!question.trim()}
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
              <span className="me-2">🚀</span>
              {t('Send')}
            </button>
          </div>
        </div>

        {/* Enhanced Sample Questions Section */}
        <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <div className="d-flex align-items-center mb-4">
            <span style={{ fontSize: 24, marginRight: 12 }}>💡</span>
            <h5 className="mb-0 fw-bold" style={{fontSize: '1.3rem', color: '#2e7d32'}}>
              {t('sampleQuestions')}
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
                    animationDelay: `${index * 0.1}s`
                  }}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                        style={{
                          width: 40,
                          height: 40,
                          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                          fontSize: 16
                        }}
                      >
                        ❓
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-0" style={{
                          fontSize: '14px',
                          lineHeight: '1.5',
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
        
        {/* Enhanced Response Section */}
        {response && (
          <div className="card border-0 shadow-lg animate-fade-in" style={{borderRadius: '24px'}}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: 40,
                    height: 40,
                    background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                  }}
                >
                  <span style={{ fontSize: 18 }}>🌱</span>
                </div>
                <h5 className="mb-0 fw-bold" style={{color: '#2e7d32'}}>
                  AI की सलाह
                </h5>
              </div>
              <div 
                className="p-4 rounded-3" 
                style={{
                  background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                  border: '2px solid #c8e6c9',
                  fontSize: '16px',
                  lineHeight: 1.7,
                  color: '#2e7d32'
                }}
                dangerouslySetInnerHTML={{ __html: response }}
              />
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
              <span style={{ fontSize: 32 }}>🌾</span>
              <h6 className="fw-bold mt-2 mb-2" style={{ color: '#e65100' }}>
                Farmer's Tip • किसान की सलाह
              </h6>
              <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                AI से बेहतर जवाब पाने के लिए स्पष्ट और विस्तृत सवाल पूछें।<br/>
                <small>Ask clear and detailed questions to get better answers from AI.</small>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
