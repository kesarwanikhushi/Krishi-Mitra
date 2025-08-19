import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export default function TopNav({ language, setLanguage, demoMode, setDemoMode }) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [offline, setOffline] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [demo, setDemo] = useState(demoMode || false);

  useEffect(() => {
    setMounted(true);
    if (typeof setDemoMode === 'function') setDemoMode(demo);
  }, [demo]);

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
    { href: '/calendar', icon: '📅', label: t('calendar'), color: '#ff9800' },
    { href: '/prices', icon: '💰', label: t('prices'), color: '#00bcd4' },
    { href: '/profile', icon: '👤', label: t('profile'), color: '#9c27b0' },
    { href: '/settings', icon: '⚙️', label: t('settings'), color: '#795548' },
  ];

  if (!mounted) return null;

  return (
    <nav 
      className="navbar sticky-top shadow-lg"
      style={{
        minHeight: 80,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(46, 125, 50, 0.1)',
        zIndex: 1050
      }}
    >
      <div className="container-fluid px-3">
        {/* Top Row - Logo, Title, and Controls */}
        <div className="d-flex justify-content-between align-items-center w-100 mb-2">
          {/* Left - Logo and Title */}
          <div className="d-flex align-items-center gap-3">
            <div 
              className="d-flex align-items-center justify-content-center rounded-circle shadow-sm"
              style={{ 
                width: 40, 
                height: 40, 
                minWidth: 40,
                minHeight: 40,
                maxWidth: 40,
                maxHeight: 40,
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
                fontSize: 20, 
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
                fontSize: '1.3rem', 
                color: '#2e7d32',
                letterSpacing: '0.5px'
              }}>
                {t('appName')}
              </h1>
              <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                {t('yourAgriculturalCompanion')}
              </p>
            </div>
          </div>

          {/* Right - Controls */}
          <div className="d-flex align-items-center gap-2">
            {/* Demo Toggle */}
            <div 
              className="d-flex align-items-center gap-2 px-2 py-1 rounded-pill bg-white shadow-sm"
              style={{ border: '1px solid #e8f5e9' }}
            >
              <span style={{ fontSize: '0.75rem', color: '#666' }}>Demo</span>
              <div className="form-check form-switch mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="demoSwitch"
                  checked={demo}
                  onChange={e => setDemo(e.target.checked)}
                  style={{ 
                    cursor: 'pointer',
                    accentColor: '#4caf50',
                    transform: 'scale(0.8)'
                  }}
                />
              </div>
            </div>

            {/* Language Selector */}
            <div className="position-relative">
              <select
                className="form-select border-0 rounded-pill shadow-sm"
                style={{ 
                  width: 160, 
                  fontSize: '0.75rem',
                  paddingLeft: '12px',
                  paddingRight: '30px',
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  background: 'white',
                  border: '1px solid #e8f5e9 !important',
                  appearance: 'none'
                }}
                value={language}
                onChange={handleLangChange}
              >
                <option value="en">🌐 English</option>
                <option value="hi">🇮🇳 हिन्दी</option>
                <option value="hinglish">🇮🇳 Hinglish</option>
                <option value="pa">🇮🇳 ਪੰਜਾਬੀ</option>
                <option value="gu">🇮🇳 ગુજરાતી</option>
                <option value="bn">🇧🇩 বাংলা</option>
              </select>
            </div>

            {/* Offline Indicator */}
            {offline && (
              <div
                className="d-flex align-items-center gap-2 px-2 py-1 rounded-pill shadow-sm"
                style={{ 
                  background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                <span>⚠️</span>
                {t('offline')}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row - Navigation Icons */}
        <div className="d-flex justify-content-around align-items-center w-100">
          {navs.map(({ href, icon, label, color }) => {
            const isActive = router.pathname === href;
            return (
              <Link key={href} href={href} legacyBehavior>
                <a 
                  className="d-flex flex-column align-items-center text-decoration-none position-relative"
                  style={{
                    color: isActive ? color : '#666',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 16,
                    transition: 'all 0.3s ease',
                    padding: '6px 10px',
                    borderRadius: '10px',
                    background: isActive ? `${color}15` : 'transparent'
                  }}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div 
                      className="position-absolute bottom-0 start-50 translate-middle-x"
                      style={{
                        width: 24,
                        height: 2,
                        background: color,
                        borderRadius: '1px',
                        marginBottom: '1px'
                      }}
                    />
                  )}
                  
                  {/* Icon */}
                  <span style={{ fontSize: 20, marginBottom: 2 }}>{icon}</span>
                  
                  {/* Label */}
                  <span style={{ fontSize: '0.7rem' }}>{label}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
