import { useState, useEffect } from 'react';

export default function WeatherWidget({ compact = false, showForecast = false }) {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCurrentLocationWeather();
  }, []);

  const getCurrentLocationWeather = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lon: longitude });
        
        try {
          // Mock weather data based on location
          const mockWeather = {
            location: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
            temperature: Math.round(20 + Math.random() * 15),
            condition: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
            humidity: Math.round(40 + Math.random() * 40),
            windSpeed: Math.round(5 + Math.random() * 10),
            forecast: [
              { day: 'Today', temp: Math.round(20 + Math.random() * 15), condition: 'Sunny' },
              { day: 'Tomorrow', temp: Math.round(20 + Math.random() * 15), condition: 'Cloudy' },
              { day: 'Day 3', temp: Math.round(20 + Math.random() * 15), condition: 'Rain' }
            ]
          };
          setWeather(mockWeather);
        } catch (err) {
          setError('Failed to fetch weather data');
        }
        setLoading(false);
      },
      (error) => {
        setError('Unable to get location');
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return '☀️';
      case 'cloudy': return '☁️';
      case 'partly cloudy': return '⛅';
      case 'rain':
      case 'light rain': return '🌧️';
      default: return '🌤️';
    }
  };

  if (loading) {
    return (
      <div className={`card shadow-sm ${compact ? 'mb-3' : 'mb-4'}`} style={{borderRadius: 16}}>
        <div className="card-body text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <small className="ms-2">Getting weather...</small>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`alert alert-warning ${compact ? 'py-2' : ''}`} style={{borderRadius: 16}}>
        <small>
          ⚠️ {error}
          <button 
            className="btn btn-outline-warning btn-sm ms-2" 
            onClick={getCurrentLocationWeather}
            style={{fontSize: '0.75rem', padding: '0.25rem 0.5rem'}}
          >
            Retry
          </button>
        </small>
      </div>
    );
  }

  if (!weather) return null;

  if (compact) {
    return (
      <div className="card shadow-sm mb-3" style={{borderRadius: 16}}>
        <div className="card-body py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <span style={{fontSize: 24}}>{getWeatherIcon(weather.condition)}</span>
              <div className="ms-2">
                <div className="fw-bold">{weather.temperature}°C</div>
                <small className="text-muted">{weather.condition}</small>
              </div>
            </div>
            <div className="text-end">
              <small className="text-muted d-block">📍 Current Location</small>
              <small className="text-muted">💧 {weather.humidity}%</small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm mb-4" style={{borderRadius: 16}}>
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h6 className="card-title mb-1">Current Weather</h6>
            <small className="text-muted">📍 Current Location</small>
          </div>
          <button 
            className="btn btn-outline-primary btn-sm" 
            onClick={getCurrentLocationWeather}
          >
            🔄
          </button>
        </div>
        <div className="row align-items-center">
          <div className="col-8">
            <div className="d-flex align-items-center">
              <span style={{fontSize: 36}}>{getWeatherIcon(weather.condition)}</span>
              <div className="ms-3">
                <h4 className="mb-0">{weather.temperature}°C</h4>
                <p className="mb-0 text-muted">{weather.condition}</p>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="text-end">
              <small className="text-muted d-block">💧 {weather.humidity}%</small>
              <small className="text-muted">💨 {weather.windSpeed} km/h</small>
            </div>
          </div>
        </div>
        
        {showForecast && weather.forecast && (
          <div className="mt-3 pt-3 border-top">
            <h6 className="mb-2">3-Day Forecast</h6>
            <div className="row g-1">
              {weather.forecast.slice(0, 3).map((day, index) => (
                <div key={index} className="col-4">
                  <div className="text-center p-2 bg-light rounded">
                    <div style={{fontSize: 20}}>{getWeatherIcon(day.condition)}</div>
                    <small className="fw-bold d-block">{day.day}</small>
                    <small className="text-muted">{day.temp}°C</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
