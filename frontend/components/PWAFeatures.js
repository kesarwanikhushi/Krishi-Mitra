import React, { useEffect, useState } from 'react';

export default function PWAFeatures() {
  const [online, setOnline] = useState(typeof window !== 'undefined' ? window.navigator.onLine : true);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const handleInstall = () => {
    alert('Install prompt placeholder');
  };

  return (
    <div style={{
      background: online ? '#43a047' : '#c62828',
      color: 'white',
      padding: '4px 0',
      textAlign: 'center',
      fontWeight: 500,
      fontSize: 15
    }}>
      {online ? 'You are online' : 'You are offline'}
      <button
        style={{ marginLeft: 16, background: '#fff', color: '#333', border: 'none', borderRadius: 4, padding: '2px 10px', cursor: 'pointer' }}
        onClick={handleInstall}
      >
        Install App
      </button>
    </div>
  );
}
