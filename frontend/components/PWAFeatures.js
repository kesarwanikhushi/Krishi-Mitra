import React, { useEffect, useState } from 'react';

export default function PWAFeatures() {
  const [online, setOnline] = useState(typeof window !== 'undefined' ? window.navigator.onLine : true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installable, setInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed/running in standalone mode
    if (typeof window !== 'undefined') {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      setIsStandalone(standalone);
    }

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
      setIsStandalone(true);
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

    // Check browser compatibility and provide specific guidance
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isEdge = /Edg/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (!deferredPrompt) {
      let message = 'Install option not available right now. ';
      
      if (isSafari) {
        message += 'On Safari, tap the Share button and select "Add to Home Screen".';
      } else if (isChrome || isEdge) {
        message += 'Try refreshing the page, or look for the install icon in your browser\'s address bar.';
      } else if (isFirefox) {
        message += 'Firefox supports PWA installation. Please check your browser settings or try refreshing.';
      } else {
        message += 'Please use Chrome, Edge, or Firefox for the best install experience.';
      }
      
      alert(message);
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
      {!isStandalone && (
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
          {installable ? 'Install App' : 'Add to Home'}
        </button>
      )}
    </div>
  );
}
