import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export default function CombinedNav({ language, setLanguage }) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [offline, setOffline] = useState(false);
  const [mounted, setMounted] = useState(false);

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
  
  const navs = [
    { href: '/', icon: '🏠', label: t('home'), color: '#4caf50' },
    { href: '/ask', icon: '🤖', label: t('aiAdvice'), color: '#2196f3' },
    { href: '/calendar', icon: '📅', label: t('calendar'), color: '#ff9800' },
    { href: '/prices', icon: '💰', label: t('prices'), color: '#00bcd4' },
    { href: '/settings', icon: '⚙️', label: t('settings'), color: '#795548' },
  ];

  if (!mounted) return null;

  return (
    <nav 
      className="navbar sticky-top shadow-lg"
      style={{
        minHeight: 60,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(46, 125, 50, 0.1)',
        zIndex: 1050
      }}
    >
      <div className="container-fluid px-3 d-flex justify-content-between align-items-center">
        {/* Left - Logo and Title */}
        <div className="d-flex align-items-center gap-2">
          <div 
            className="d-flex align-items-center justify-content-center rounded-circle shadow-sm"
            style={{ 
              width: 36, 
              height: 36, 
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)'
            }}
          >
            <span style={{ 
              fontSize: 18, 
              lineHeight: 1
            }}>🌾</span>
          </div>
          <div>
            <h1 className="mb-0 fw-bold" style={{ 
              fontSize: '1.1rem', 
              color: '#2e7d32',
              letterSpacing: '0.3px'
            }}>
              {t('appName')}
            </h1>
          </div>
        </div>

        {/* Center - Navigation Icons */}
        <div className="d-flex align-items-center gap-4">
          {navs.map(({ href, icon, label, color }) => {
            const isActive = router.pathname === href;
            return (
              <Link key={href} href={href} legacyBehavior>
                <a 
                  className="d-flex flex-column align-items-center text-decoration-none position-relative"
                  style={{
                    color: isActive ? color : '#666',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 14,
                    transition: 'all 0.3s ease',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    background: isActive ? `${color}15` : 'transparent',
                    minWidth: '50px'
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#f5f5f5';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div 
                      className="position-absolute top-0 start-50 translate-middle-x"
                      style={{
                        width: 24,
                        height: 2,
                        background: color,
                        borderRadius: '1px',
                        marginTop: '-1px'
                      }}
                    />
                  )}
                  
                  {/* Icon */}
                  <span style={{ 
                    fontSize: isActive ? 18 : 16, 
                    marginBottom: 2,
                    transition: 'font-size 0.2s ease'
                  }}>{icon}</span>
                  
                  {/* Label */}
                  <span style={{ 
                    fontSize: '0.65rem',
                    letterSpacing: '0.02em',
                    textAlign: 'center'
                  }}>{label}</span>
                </a>
              </Link>
            );
          })}
        </div>

        {/* Right - Controls */}
        <div className="d-flex align-items-center gap-2">
          {/* Language Selector */}
          <div className="position-relative">
            <select
              className="form-select border-0 rounded shadow-sm"
              style={{ 
                width: 160, 
                fontSize: '0.75rem',
                paddingLeft: '12px',
                paddingRight: '30px',
                paddingTop: '6px',
                paddingBottom: '6px',
                background: 'white',
                border: '1px solid #dee2e6 !important',
                appearance: 'none',
                fontWeight: '500',
                color: '#495057'
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
              <option value="ta">🇮🇳 தமிழ் • Tamil</option>
              <option value="mr">🇮🇳 मराठी • Marathi</option>
              <option value="kn">🇮🇳 ಕನ್ನಡ • Kannada</option>
              <option value="ml">🇮🇳 മലയാളം • Malayalam</option>
              <option value="or">🇮🇳 ଓଡିଆ • Odia</option>
              <option value="as">🇮🇳 অসমীয়া • Assamese</option>
              <option value="ur">🇵🇰 اردو • Urdu</option>
            </select>
            <div 
              className="position-absolute top-50 end-0 translate-middle-y me-2 pointer-events-none"
              style={{ fontSize: '10px', color: '#6c757d' }}
            >
              ▼
            </div>
          </div>

          {/* Offline Indicator */}
          {offline && (
            <div
              className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill shadow-sm"
              style={{ 
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: '500'
              }}
            >
              <span>⚠️</span>
              <span>{t('offline')}</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
