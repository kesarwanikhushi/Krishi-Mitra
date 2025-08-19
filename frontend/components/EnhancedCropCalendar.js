import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CropCalendarChart from './CropCalendarChart';
import UAVFlightConditions from './UAVFlightConditions';

export default function EnhancedCropCalendar({ data, selectedCrop, userLocation }) {
  const { t } = useTranslation();
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [thi, setThi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weatherRecommendations, setWeatherRecommendations] = useState([]);
  const [showUAVConditions, setShowUAVConditions] = useState(false);

  // Default coordinates for demo (Kanpur, India)
  const defaultLat = 26.4499;
  const defaultLon = 80.3319;
  
  const lat = userLocation?.lat || defaultLat;
  const lon = userLocation?.lon || defaultLon;

  useEffect(() => {
    if (selectedCrop && lat && lon) {
      fetchWeatherData();
    }
  }, [selectedCrop, lat, lon]);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      // Backend URL - adjust based on your setup
      const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://your-backend-url.com' 
        : 'http://localhost:5000';
      
      // Fetch current weather
      const weatherResponse = await fetch(`${backendUrl}/api/data/weather?lat=${lat}&lon=${lon}`);
      const weatherResult = await weatherResponse.json();
      setWeatherData(weatherResult);

      // Fetch 5-day forecast
      const forecastResponse = await fetch(`${backendUrl}/api/data/forecast5?lat=${lat}&lon=${lon}`);
      const forecastResult = await forecastResponse.json();
      setForecast(forecastResult);

      // Fetch Temperature-Humidity Index
      const thiResponse = await fetch(`${backendUrl}/api/data/thi?lat=${lat}&lon=${lon}`);
      const thiResult = await thiResponse.json();
      setThi(thiResult);

      // Generate weather-based recommendations
      generateRecommendations(weatherResult, forecastResult, thiResult);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (weather, forecast, thiData) => {
    const recommendations = [];
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    
    // Find current phase for selected crop
    const cropData = data.find(d => d.crop === selectedCrop);
    const currentPhase = cropData?.phases.find(p => p.month === currentMonth)?.phase;

    if (!currentPhase) {
      return;
    }

    // Temperature recommendations
    if (weather?.data?.main?.temp) {
      const temp = weather.data.main.temp;
      if (currentPhase === 'sow') {
        if (temp < 10) {
          recommendations.push({
            type: 'warning',
            message: `Low temperature (${temp}°C) may delay germination. Consider delaying sowing or using protective covers.`
          });
        } else if (temp > 35) {
          recommendations.push({
            type: 'warning', 
            message: `High temperature (${temp}°C) may stress seedlings. Ensure adequate irrigation and shade.`
          });
        } else {
          recommendations.push({
            type: 'success',
            message: `Temperature (${temp}°C) is optimal for sowing ${selectedCrop}.`
          });
        }
      } else if (currentPhase === 'grow') {
        if (temp > 40) {
          recommendations.push({
            type: 'danger',
            message: `Extreme heat (${temp}°C) detected. Increase irrigation frequency and provide shade protection.`
          });
        }
      }
    }

    // Humidity recommendations
    if (weather?.data?.main?.humidity) {
      const humidity = weather.data.main.humidity;
      if (humidity > 85 && (currentPhase === 'grow' || currentPhase === 'harvest')) {
        recommendations.push({
          type: 'warning',
          message: `High humidity (${humidity}%) increases disease risk. Monitor for fungal infections and ensure good air circulation.`
        });
      } else if (humidity < 30 && currentPhase === 'grow') {
        recommendations.push({
          type: 'info',
          message: `Low humidity (${humidity}%) may stress plants. Consider increasing irrigation.`
        });
      }
    }

    // THI recommendations
    if (thiData?.thi) {
      const thiValue = thiData.thi;
      if (thiValue > 80) {
        recommendations.push({
          type: 'danger',
          message: `High heat stress index (THI: ${thiValue}). Implement cooling measures immediately.`
        });
      } else if (thiValue > 70) {
        recommendations.push({
          type: 'warning',
          message: `Moderate heat stress (THI: ${thiValue}). Monitor crop condition closely.`
        });
      }
    }

    // Wind recommendations
    if (weather?.data?.wind?.speed) {
      const windSpeed = weather.data.wind.speed;
      if (windSpeed > 20 && currentPhase === 'harvest') {
        recommendations.push({
          type: 'warning',
          message: `High wind speed (${windSpeed} m/s) may cause crop lodging. Consider early harvest if crops are ready.`
        });
      }
    }

    setWeatherRecommendations(recommendations);
  };

  const formatTemperatureData = () => {
    if (!forecast) return [];
    
    return forecast
      .filter(item => item.measurement_type === 'ambient_temperature')
      .map(item => ({
        date: new Date(item.timestamp).toLocaleDateString(),
        temperature: item.value.toFixed(1)
      }));
  };

  const formatHumidityData = () => {
    if (!forecast) return [];
    
    return forecast
      .filter(item => item.measurement_type === 'ambient_humidity')
      .map(item => ({
        date: new Date(item.timestamp).toLocaleDateString(),
        humidity: item.value.toFixed(0)
      }));
  };

  return (
    <div className="space-y-4">
      {/* Crop Calendar Chart */}
      <CropCalendarChart data={data} selectedCrops={[selectedCrop]} />
      
      {/* Weather Integration Section */}
      <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">Weather-Aware Recommendations</h4>
          <div className="form-check form-switch">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="showUAV"
              checked={showUAVConditions}
              onChange={e => setShowUAVConditions(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="showUAV">
              Show UAV Conditions
            </label>
          </div>
        </div>
        
        {loading && (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading weather data...</span>
            </div>
            <span className="ms-2">Fetching weather data...</span>
          </div>
        )}

        {/* Current Weather Summary */}
        {weatherData && (
          <div className="card mb-3">
            <div className="card-body">
              <h6 className="card-title">Current Conditions</h6>
              <div className="row">
                <div className="col-md-3">
                  <small className="text-muted">Temperature</small>
                  <div className="fw-bold">{weatherData.data.main.temp}°C</div>
                </div>
                <div className="col-md-3">
                  <small className="text-muted">Humidity</small>
                  <div className="fw-bold">{weatherData.data.main.humidity}%</div>
                </div>
                <div className="col-md-3">
                  <small className="text-muted">Wind</small>
                  <div className="fw-bold">{weatherData.data.wind.speed} m/s</div>
                </div>
                <div className="col-md-3">
                  <small className="text-muted">Condition</small>
                  <div className="fw-bold">{weatherData.data.weather[0].description}</div>
                </div>
              </div>
              {thi && (
                <div className="mt-2">
                  <small className="text-muted">Heat Stress Index (THI)</small>
                  <div className="fw-bold">
                    {thi.thi}
                    <span className={`badge ms-2 ${thi.thi > 80 ? 'bg-danger' : thi.thi > 70 ? 'bg-warning' : 'bg-success'}`}>
                      {thi.thi > 80 ? 'High Stress' : thi.thi > 70 ? 'Moderate' : 'Low Stress'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weather Recommendations */}
        {weatherRecommendations.length > 0 && (
          <div className="card mb-3">
            <div className="card-body">
              <h6 className="card-title">Smart Recommendations for {selectedCrop}</h6>
              {weatherRecommendations.map((rec, index) => (
                <div key={index} className={`alert alert-${rec.type} mb-2`} style={{fontSize: '0.9rem', marginBottom: '0.5rem', padding: '0.5rem 0.75rem'}}>
                  {rec.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5-Day Forecast Summary */}
        {forecast && (
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">5-Day Weather Forecast</h6>
              <div className="row">
                <div className="col-md-6">
                  <small className="text-muted d-block mb-2">Temperature Trend</small>
                  <div className="small">
                    {formatTemperatureData().map((item, index) => (
                      <div key={index} className="d-flex justify-content-between">
                        <span>{item.date}</span>
                        <span className="fw-bold">{item.temperature}°C</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block mb-2">Humidity Trend</small>
                  <div className="small">
                    {formatHumidityData().map((item, index) => (
                      <div key={index} className="d-flex justify-content-between">
                        <span>{item.date}</span>
                        <span className="fw-bold">{item.humidity}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* UAV Flight Conditions */}
        <UAVFlightConditions 
          userLocation={{lat, lon}} 
          show={showUAVConditions}
        />
      </div>
    </div>
  );
}
