import React, { useEffect, useState } from 'react';

export default function PWAFeatures() {
  const [online, setOnline] = useState(typeof window !== 'undefined' ? window.navigator.onLine : true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt event fired');
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to notify the user they can add to home screen
      setInstallable(true);
      console.log('Install prompt is now available');
    };

    const handleAppInstalled = () => {
      console.log('App was installed');
      // Hide the install promotion
      setInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      alert('App is already installed!');
      return;
    }

    // Check if running in standalone mode (already installed)
    if (window.navigator.standalone) {
      alert('App is already installed!');
      return;
    }

    if (!deferredPrompt) {
      // If no install prompt is available, provide helpful feedback
      alert('Install is not currently available. Please ensure you are using a supported browser (Chrome, Edge, Firefox) and accessing via HTTPS.');
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        alert('App installation started!');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the deferredPrompt so it can only be used once
      setDeferredPrompt(null);
      setInstallable(false);
    } catch (error) {
      console.error('Error during installation:', error);
      alert('Installation failed. Please try again.');
    }
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
        style={{ 
          marginLeft: 16, 
          background: '#fff', 
          color: '#333', 
          border: 'none', 
          borderRadius: 4, 
          padding: '2px 10px', 
          cursor: 'pointer',
          opacity: 1
        }}
        onClick={handleInstall}
      >
        Install App
      </button>
    </div>
  );
}
