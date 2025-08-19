import React, { useEffect, useState } from 'react';

export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const handleRetry = () => {
    setSyncing(true);
    setSynced(false);
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'PRECACHE_LATEST_DATASETS' });
      // Listen for offline ready event
      const handler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'OFFLINE_READY') {
          setSyncing(false);
          setSynced(true);
          window.removeEventListener('message', handler);
        }
      };
      window.addEventListener('message', handler);
      setTimeout(() => {
        setSyncing(false);
        window.removeEventListener('message', handler);
      }, 8000);
    } else {
      setSyncing(false);
      alert('Background sync not available.');
    }
  };

  if (!offline) return null;
  return (
    <div style={{
      background: '#d32f2f', color: '#fff', padding: '10px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontWeight: 500, fontSize: 16, position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }} role="status" aria-live="polite">
      <span>
        You are offline. Some features may be unavailable.
        {synced && <span style={{ marginLeft: 12, color: '#fff', fontWeight: 400 }}>(Offline data updated!)</span>}
      </span>
      <button
        className="btn btn-light btn-sm ms-3"
        style={{ fontWeight: 600, borderRadius: 16 }}
        onClick={handleRetry}
        disabled={syncing}
      >
        {syncing ? 'Syncing...' : 'Retry Background Sync'}
      </button>
    </div>
  );
}

export default OfflineBanner;
