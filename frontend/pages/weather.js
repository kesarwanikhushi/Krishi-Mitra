import { useState, useEffect } from 'react';

export default function Weather() {
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
      setError('Geolocation is not supported by this browser');
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
              { day: 'Day 3', temp: Math.round(20 + Math.random() * 15), condition: 'Rain' },
              { day: 'Day 4', temp: Math.round(20 + Math.random() * 15), condition: 'Sunny' },
              { day: 'Day 5', temp: Math.round(20 + Math.random() * 15), condition: 'Partly Cloudy' }
            ]
          };
          setWeather(mockWeather);
        } catch (err) {
          setError('Failed to fetch weather data');
        }
        setLoading(false);
      },
      (error) => {
        setError('Unable to get your location: ' + error.message);
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

  return (
    <div className="bg-light min-vh-100 d-flex flex-column" style={{paddingBottom:60}}>
      <main className="container py-4 flex-grow-1">
        <h2 className="fw-bold mb-3" style={{fontSize: '1.5rem'}}>Weather</h2>
        
        {loading && (
          <div className="card shadow-sm" style={{borderRadius: 16}}>
            <div className="card-body text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 mb-0">Getting your location weather...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger d-flex align-items-center" style={{borderRadius: 16}}>
            <span className="me-2">⚠️</span>
            <div>
              <strong>{error}</strong>
              <button 
                className="btn btn-outline-danger btn-sm ms-3" 
                onClick={getCurrentLocationWeather}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {weather && (
          <>
            {/* Current Weather Card */}
            <div className="card shadow-sm mb-4" style={{borderRadius: 16}}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h5 className="card-title mb-1">Current Weather</h5>
                    <small className="text-muted">📍 {weather.location}</small>
                  </div>
                  <button 
                    className="btn btn-outline-primary btn-sm" 
                    onClick={getCurrentLocationWeather}
                  >
                    🔄 Refresh
                  </button>
                </div>
                <div className="row align-items-center">
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <span style={{fontSize: 48}}>{getWeatherIcon(weather.condition)}</span>
                      <div className="ms-3">
                        <h2 className="mb-0">{weather.temperature}°C</h2>
                        <p className="mb-0 text-muted">{weather.condition}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="row g-2">
                      <div className="col-12">
                        <small className="text-muted">💧 Humidity: {weather.humidity}%</small>
                      </div>
                      <div className="col-12">
                        <small className="text-muted">💨 Wind: {weather.windSpeed} km/h</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div className="card shadow-sm" style={{borderRadius: 16}}>
              <div className="card-body">
                <h5 className="card-title mb-3">5-Day Forecast</h5>
                <div className="row g-2">
                  {weather.forecast.map((day, index) => (
                    <div key={index} className="col-12">
                      <div className="d-flex align-items-center justify-content-between p-2 bg-light rounded">
                        <div className="d-flex align-items-center">
                          <span style={{fontSize: 24}} className="me-2">
                            {getWeatherIcon(day.condition)}
                          </span>
                          <div>
                            <div className="fw-bold">{day.day}</div>
                            <small className="text-muted">{day.condition}</small>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold">{day.temp}°C</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
