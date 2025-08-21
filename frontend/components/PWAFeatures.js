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
      
      // If not installed, wait a bit then check if we can show install prompt
      if (!standalone) {
        setTimeout(() => {
          // Check PWA installability criteria
          const isPWAInstallable = 
            window.location.protocol === 'https:' || 
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';
          
          if (isPWAInstallable && !deferredPrompt) {
            setInstallable(true); // Enable the button even without prompt
          }
        }, 2000);
      }
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
  }, [deferredPrompt]);

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

    // If we have the deferred prompt, use it
    if (deferredPrompt) {
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
      return;
    }

    // Fallback: Provide manual installation instructions
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isEdge = /Edg/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    let message = 'To install this app:\n\n';
    
    if (isChrome) {
      message += '• Look for the install icon (⊕) in the address bar\n';
      message += '• Or click the 3-dot menu → "Install Krishi Mitra"\n';
      message += '• Or click "Add to Home screen" from the menu';
    } else if (isEdge) {
      message += '• Look for the install icon (⊞) in the address bar\n';
      message += '• Or click the 3-dot menu → "Apps" → "Install this site as an app"';
    } else if (isSafari) {
      message += '• Tap the Share button (□↗)\n';
      message += '• Select "Add to Home Screen"\n';
      message += '• Tap "Add" to confirm';
    } else if (isFirefox) {
      message += '• Click the 3-line menu → "Install"\n';
      message += '• Or look for the install option in the address bar';
    } else {
      message += '• Try using Chrome, Edge, or Safari\n';
      message += '• Look for "Install" or "Add to Home Screen" options in your browser menu';
    }
    
    alert(message);
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
