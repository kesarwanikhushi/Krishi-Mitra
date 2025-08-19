import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function WeatherAwareRecommendations({ selectedCrop, cropData }) {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (selectedCrop) {
      getCurrentLocation();
    }
  }, [selectedCrop]);

  useEffect(() => {
    if (location && selectedCrop) {
      fetchWeatherData();
    }
  }, [location, selectedCrop]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied, using default location (Delhi)');
          setLocation({
            lat: 28.6139, // Delhi coordinates as fallback
            lon: 77.2090
          });
        }
      );
    } else {
      // Fallback to Delhi coordinates
      setLocation({
        lat: 28.6139,
        lon: 77.2090
      });
    }
  };

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      // Using OpenWeatherMap API (you can get a free key from openweathermap.org)
      const API_KEY = '895284fb2d2c50a520ea537456963d9c'; // This is a demo key, replace with your own
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric`
      );
      
      if (response.ok) {
        const data = await response.json();
        setWeather(data);
        generateRecommendations(data);
      } else {
        // Fallback to sample weather data
        const sampleWeather = {
          main: { temp: 25, humidity: 60, pressure: 1013 },
          weather: [{ description: "clear sky", main: "Clear" }],
          wind: { speed: 3.5 },
          name: "Current Location"
        };
        setWeather(sampleWeather);
        generateRecommendations(sampleWeather);
      }
    } catch (error) {
      console.error('Weather API error:', error);
      // Use sample data as fallback
      const sampleWeather = {
        main: { temp: 25, humidity: 60, pressure: 1013 },
        weather: [{ description: "clear sky", main: "Clear" }],
        wind: { speed: 3.5 },
        name: "Current Location"
      };
      setWeather(sampleWeather);
      generateRecommendations(sampleWeather);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPhase = () => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    if (!cropData || cropData.length === 0) return null;
    
    const crop = cropData.find(d => d.crop === selectedCrop);
    if (!crop) return null;
    
    const phase = crop.phases.find(p => p.month === currentMonth);
    return phase ? phase.phase : null;
  };

  const generateRecommendations = (weatherData) => {
    const recommendations = [];
    const currentPhase = getCurrentPhase();
    
    if (!currentPhase || !weatherData) {
      setRecommendations([]);
      return;
    }

    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const weatherCondition = weatherData.weather[0].main.toLowerCase();

    // Helper function to get translation with fallback
    const getTranslation = (key, params = {}, fallback = '') => {
      try {
        const translated = t(key, params);
        // Check if translation actually worked (not just returning the key)
        if (translated && translated !== key && !translated.includes('{{')) {
          return translated;
        }
        return fallback;
      } catch (error) {
        return fallback;
      }
    };

    // Temperature-based recommendations
    if (currentPhase === 'sow') {
      if (temp < 10) {
        const message = getTranslation('lowTempSowing', { temp, crop: selectedCrop }, 
          `Low temperature (${temp}°C) may delay seed germination. Consider delaying sowing or using protective covers.`);
        recommendations.push({
          type: 'warning',
          icon: '🌡️',
          message: message
        });
      } else if (temp > 35) {
        const message = getTranslation('highTempSowing', { temp }, 
          `High temperature (${temp}°C) may stress young seedlings. Ensure adequate irrigation and provide shade protection.`);
        recommendations.push({
          type: 'warning',
          icon: '🔥',
          message: message
        });
      } else {
        const message = getTranslation('optimalTempSowing', { temp, crop: selectedCrop }, 
          `Temperature (${temp}°C) is optimal for sowing ${selectedCrop}. Good conditions for germination.`);
        recommendations.push({
          type: 'success',
          icon: '🌱',
          message: message
        });
      }
    }

    if (currentPhase === 'grow') {
      if (temp > 40) {
        const message = getTranslation('extremeHeatGrowing', { temp }, 
          `Extreme heat (${temp}°C) detected. Increase irrigation frequency and consider heat stress management.`);
        recommendations.push({
          type: 'danger',
          icon: '🌡️',
          message: message
        });
      } else if (temp < 5) {
        const message = getTranslation('coldGrowing', { temp }, 
          `Cold conditions (${temp}°C) may slow growth. Monitor crops for frost damage.`);
        recommendations.push({
          type: 'warning',
          icon: '❄️',
          message: message
        });
      }
    }

    if (currentPhase === 'harvest') {
      if (temp > 35) {
        const message = getTranslation('hotHarvesting', { temp }, 
          `High temperature (${temp}°C) - consider early morning harvesting to avoid heat stress.`);
        recommendations.push({
          type: 'info',
          icon: '⏰',
          message: message
        });
      }
      if (windSpeed > 10) {
        const message = getTranslation('windyHarvesting', { windSpeed }, 
          `High wind speed (${windSpeed} m/s) may cause crop lodging. Consider early harvest if crops are ready.`);
        recommendations.push({
          type: 'warning',
          icon: '💨',
          message: message
        });
      }
    }

    // Humidity-based recommendations
    if (humidity > 85) {
      const message = getTranslation('highHumidity', { humidity }, 
        `High humidity (${humidity}%) increases disease risk. Monitor for fungal infections and ensure good air circulation.`);
      recommendations.push({
        type: 'warning',
        icon: '💧',
        message: message
      });
    } else if (humidity < 30 && currentPhase === 'grow') {
      const message = getTranslation('lowHumidity', { humidity }, 
        `Low humidity (${humidity}%) may stress plants. Consider increasing irrigation frequency.`);
      recommendations.push({
        type: 'info',
        icon: '🏜️',
        message: message
      });
    }

    // Weather condition-based recommendations
    if (weatherCondition.includes('rain')) {
      if (currentPhase === 'harvest') {
        const message = getTranslation('rainyHarvest', {}, 
          'Rainy conditions detected. Delay harvesting to prevent crop damage and ensure proper drying.');
        recommendations.push({
          type: 'warning',
          icon: '🌧️',
          message: message
        });
      } else if (currentPhase === 'sow') {
        const message = getTranslation('rainySowing', {}, 
          'Rainy conditions are favorable for sowing. Good natural irrigation for seed germination.');
        recommendations.push({
          type: 'success',
          icon: '🌧️',
          message: message
        });
      }
    }

    // Crop-specific recommendations
    if (selectedCrop === 'Rice' && currentPhase === 'grow') {
      const message = getTranslation('riceGrowingTip', {}, 
        'Rice requires consistent water levels. Maintain 2-5cm water depth in fields during growing phase.');
      recommendations.push({
        type: 'info',
        icon: '🌾',
        message: message
      });
    } else if (selectedCrop === 'Wheat' && currentPhase === 'grow' && temp > 30) {
      const message = getTranslation('wheatHeatWarning', { temp }, 
        'Wheat growth may be affected by high temperatures. Consider additional watering during hot periods.');
      recommendations.push({
        type: 'warning',
        icon: '🌾',
        message: message
      });
    }

    // Current phase information
    const phaseText = getTranslation(`phase_${currentPhase}`, {}, currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1));
    const message = getTranslation('currentPhaseInfo', { crop: selectedCrop, phase: phaseText }, 
      `Current ${selectedCrop} phase: ${phaseText}. Monitor local conditions regularly.`);
    recommendations.push({
      type: 'info',
      icon: '📍',
      message: message
    });

    setRecommendations(recommendations);
  };

  const getAlertClass = (type) => {
    switch (type) {
      case 'success': return 'alert-success';
      case 'warning': return 'alert-warning';
      case 'danger': return 'alert-danger';
      case 'info': return 'alert-info';
      default: return 'alert-info';
    }
  };

  // Helper function to get translation with fallback
  const getTranslation = (key, params = {}, fallback = '') => {
    try {
      const translated = t(key, params);
      // Check if translation actually worked (not just returning the key)
      if (translated && translated !== key && !translated.includes('{{')) {
        return translated;
      }
      return fallback;
    } catch (error) {
      return fallback;
    }
  };

  if (!selectedCrop) {
    return null;
  }

  return (
    <div className="mt-4">
      <h5 className="fw-bold mb-3">
        🌤️ {getTranslation('weatherRecommendationsTitle', { crop: selectedCrop }, `Weather-Aware Recommendations for ${selectedCrop}`)}
      </h5>
      
      {loading && (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">{getTranslation('loadingWeather', {}, 'Loading weather data...')}</span>
          </div>
          <span className="ms-2">{getTranslation('fetchingWeather', {}, 'Fetching current weather conditions...')}</span>
        </div>
      )}

      {weather && (
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title">📍 {getTranslation('currentWeatherTitle', {}, 'Current Weather Conditions')}</h6>
            <div className="row">
              <div className="col-md-3">
                <small className="text-muted">{getTranslation('temperature', {}, 'Temperature')}</small>
                <div className="fw-bold">{weather.main.temp}°C</div>
              </div>
              <div className="col-md-3">
                <small className="text-muted">{getTranslation('humidity', {}, 'Humidity')}</small>
                <div className="fw-bold">{weather.main.humidity}%</div>
              </div>
              <div className="col-md-3">
                <small className="text-muted">{getTranslation('windSpeed', {}, 'Wind Speed')}</small>
                <div className="fw-bold">{weather.wind.speed} m/s</div>
              </div>
              <div className="col-md-3">
                <small className="text-muted">{getTranslation('condition', {}, 'Condition')}</small>
                <div className="fw-bold text-capitalize">{weather.weather[0].description}</div>
              </div>
            </div>
            <small className="text-muted">📍 {weather.name || getTranslation('currentLocation', {}, 'Current Location')}</small>
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="recommendations">
          <h6 className="fw-bold mb-2">💡 {getTranslation('smartRecommendations', {}, 'Smart Recommendations')}</h6>
          {recommendations.map((rec, index) => (
            <div key={index} className={`alert ${getAlertClass(rec.type)} d-flex align-items-start`} style={{fontSize: '0.9rem', marginBottom: '0.5rem', padding: '0.75rem'}}>
              <span className="me-2" style={{fontSize: '1.1rem'}}>{rec.icon}</span>
              <span>{rec.message}</span>
            </div>
          ))}
          <div className="mt-2">
            <small className="text-muted">
              💡 <strong>{getTranslation('tip', {}, 'Tip')}:</strong> {getTranslation('recommendationDisclaimer', {}, 'These recommendations are based on current weather conditions and crop phase. Always consult local agricultural experts for region-specific advice.')}
            </small>
          </div>
        </div>
      )}
    </div>
  );
}
