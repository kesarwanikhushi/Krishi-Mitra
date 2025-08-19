import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

function loadSettings() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('settings') || '{}');
  } catch { return {}; }
}

function saveSettings(settings) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('settings', JSON.stringify(settings));
  }
}

export default function Settings({ language: appLanguage, setLanguage: setAppLanguage }) {
  const [settings, setSettings] = useState({ language: 'en' });
  const { i18n, t } = useTranslation();

  useEffect(() => {
    setSettings(s => ({ ...s, ...loadSettings(), language: appLanguage || 'en' }));
  }, [appLanguage]);

  const handleChange = (field, value) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    saveSettings(updated);
    
    // If language was changed, update i18n and app state
    if (field === 'language' && typeof setAppLanguage === 'function') {
      if (i18n && typeof i18n.changeLanguage === 'function') {
        i18n.changeLanguage(value);
      }
      setAppLanguage(value);
      localStorage.setItem('lang', value);
    }
  };

  const handleUpdateCache = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'PRECACHE_LATEST_DATASETS' });
      alert('Offline data update requested.');
    } else {
      alert('Offline update not available.');
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column" style={{paddingBottom:60}}>
      <main className="container py-4 flex-grow-1">
        <h2 className="fw-bold mb-3" style={{fontSize: '1.5rem'}}>{t('settings')}</h2>
        <div className="mb-3">
          <label className="form-label">{t('language')}</label>
          <select className="form-select" style={{fontSize:17}} value={settings.language} onChange={e => handleChange('language', e.target.value)}>
            <option value="en">🇺🇸 English</option>
            <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
            <option value="hinglish">🇮🇳 Hinglish</option>
            <option value="pa">🇮🇳 ਪੰਜਾਬੀ (Punjabi)</option>
            <option value="gu">🇮🇳 ગુજરાતી (Gujarati)</option>
            <option value="bn">🇧🇩 বাংলা (Bengali)</option>
          </select>
        </div>
        <div className="mb-3">
          <button className="btn btn-outline-primary" style={{fontSize:17}} onClick={handleUpdateCache}>
            {t('updateOfflineData')}
          </button>
        </div>
        <div className="alert alert-info" style={{fontSize:16}}>
          <strong>{t('dataUsage')}:</strong> {t('dataUsageInfo')}
        </div>
      </main>
    </div>
  );
}
