import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export default function Header({ language, setLanguage }) {
  const [offline, setOffline] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    setOffline(typeof window !== 'undefined' ? !window.navigator.onLine : false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [mounted]);

  const handleLangChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    if (i18n && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(lang);
    }
    if (typeof window !== 'undefined') localStorage.setItem('lang', lang);
  };

  if (!mounted) return null;

  return (
    <header
      className="sticky-top shadow-sm"
      style={{ 
        minHeight: 72, 
        zIndex: 1050,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(46, 125, 50, 0.1)'
      }}
    >
      <div
        className="container-lg d-flex align-items-center justify-content-between py-3 px-4"
        style={{ maxWidth: 1200, margin: '0 auto' }}
      >
        <div className="d-flex align-items-center gap-3">
          <div 
            className="d-flex align-items-center justify-content-center rounded-circle shadow-sm"
            style={{ 
              width: 48, 
              height: 48, 
              minWidth: 48,
              minHeight: 48,
              maxWidth: 48,
              maxHeight: 48,
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              flexGrow: 0,
              position: 'static',
              transform: 'none !important',
              transition: 'none !important',
              animation: 'none !important',
              overflow: 'hidden',
              boxSizing: 'border-box',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <span style={{ 
              fontSize: 24, 
              lineHeight: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: 0,
              padding: 0,
              textAlign: 'center'
            }}>🌾</span>
          </div>
          <div>
            <h1 className="mb-0 fw-bold" style={{ 
              fontSize: '1.6rem', 
              color: '#2e7d32',
              letterSpacing: '0.5px'
            }}>
              {t('appName')}
            </h1>
            <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
              {t('yourAgriculturalCompanion')}
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="position-relative">
            <select
              className="form-select border-0 rounded-pill shadow-sm"
              style={{ 
                width: 200, 
                fontSize: '0.85rem',
                paddingLeft: '16px',
                paddingRight: '40px',
                background: 'white',
                border: '1px solid #e8f5e9 !important',
                appearance: 'none'
              }}
              value={language}
              onChange={handleLangChange}
            >
              <option value="en">🌐 English</option>
              <option value="hi">🇮🇳 हिन्दी • Hindi</option>
              <option value="hinglish">🇮🇳 Hinglish</option>
              <option value="pa">🇮🇳 ਪੰਜਾਬੀ • Punjabi</option>
              <option value="gu">🇮🇳 ગુજરાતી • Gujarati</option>
              <option value="bn">🇧🇩 বাংলা • Bengali</option>
              <option value="te">🇮🇳 తెలుగు • Telugu</option>
              <option value="ta">🇮🇳 தமিழ் • Tamil</option>
              <option value="mr">🇮🇳 मराठी • Marathi</option>
              <option value="kn">🇮🇳 ಕನ್ನಡ • Kannada</option>
              <option value="ml">🇮🇳 മലയാളം • Malayalam</option>
              <option value="or">🇮🇳 ଓଡିଆ • Odia</option>
              <option value="as">🇮🇳 অসমীয়া • Assamese</option>
              <option value="ur">🇵🇰 اردو • Urdu</option>
            </select>
            <div 
              className="position-absolute top-50 end-0 translate-middle-y me-3 pointer-events-none"
              style={{ fontSize: '12px', color: '#666' }}
            >
              ▼
            </div>
          </div>

          {offline && (
            <div
              className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-sm"
              style={{ 
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: '500'
              }}
            >
              <span>⚠️</span>
              {t('offline')}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}