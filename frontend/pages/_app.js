
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { GlobalMuteProvider } from '../components/GlobalMuteProvider';
import CombinedNav from '../components/CombinedNav';
import PWAFeatures from '../components/PWAFeatures';
import i18n from '../i18n'; // Import i18n configuration
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lang = localStorage.getItem('lang');
      if (lang) {
        setLanguage(lang);
        // Make sure i18n is also set to the stored language
        if (i18n.changeLanguage) {
          i18n.changeLanguage(lang);
        }
      }

      // Register service worker for PWA functionality
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      }
    }
  }, []);

  return (
    <GlobalMuteProvider>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#388e3c" />
        <link rel="icon" href="/icons/icon-192x192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
  <PWAFeatures />
  <CombinedNav language={language} setLanguage={setLanguage} />
      {/* Pass language to components that need it */}
      {Component.name === 'Settings' ? (
        <Component {...pageProps} language={language} setLanguage={setLanguage} />
      ) : (
        <Component {...pageProps} language={language} />
      )}
    </GlobalMuteProvider>
  );
}

export default MyApp;
