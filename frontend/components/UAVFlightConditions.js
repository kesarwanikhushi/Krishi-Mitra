import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function UAVFlightConditions({ userLocation, show = false }) {
  const { t } = useTranslation();
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedModels, setSelectedModels] = useState(['Mavic Pro', 'Phantom 4']);
  
  // Default coordinates for demo (Kanpur, India)
  const defaultLat = 26.4499;
  const defaultLon = 80.3319;
  
  const lat = userLocation?.lat || defaultLat;
  const lon = userLocation?.lon || defaultLon;

  useEffect(() => {
    if (show && lat && lon) {
      fetchFlightData();
    }
  }, [show, lat, lon, selectedModels]);

  const fetchFlightData = async () => {
    setLoading(true);
    try {
      const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://your-backend-url.com' 
        : 'http://localhost:5000';
      
      // Build query parameters
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString()
      });
      
      selectedModels.forEach(model => {
        params.append('uavmodels', model);
      });

      const response = await fetch(`${backendUrl}/api/data/flight_forecast5?${params}`);
      const result = await response.json();
      setFlightData(result);
    } catch (error) {
      console.error('Error fetching flight data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OK': return 'success';
      case 'MARGINAL': return 'warning';
      case 'NOT OK': return 'danger';
      default: return 'secondary';
    }
  };

  if (!show) return null;

  return (
    <div className="card mt-3">
      <div className="card-body">
        <h6 className="card-title d-flex align-items-center">
          🚁 UAV Flight Conditions
          <button 
            className="btn btn-sm btn-outline-primary ms-auto"
            onClick={fetchFlightData}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </h6>
        
        {/* UAV Model Selection */}
        <div className="mb-3">
          <small className="text-muted d-block mb-2">Select UAV Models:</small>
          <div className="d-flex flex-wrap gap-2">
            {['Mavic Pro', 'Mavic Pro Platinum', 'Phantom 4', 'Zip'].map(model => (
              <div key={model} className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`model-${model.replace(/\s+/g, '-')}`}
                  checked={selectedModels.includes(model)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedModels([...selectedModels, model]);
                    } else {
                      setSelectedModels(selectedModels.filter(m => m !== model));
                    }
                  }}
                />
                <label className="form-check-label" htmlFor={`model-${model.replace(/\s+/g, '-')}`}>
                  {model}
                </label>
              </div>
            ))}
          </div>
        </div>

        {loading && (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading flight data...</span>
            </div>
            <span className="ms-2">Checking flight conditions...</span>
          </div>
        )}

        {flightData && flightData.forecasts && (
          <div>
            <small className="text-muted d-block mb-2">3-Day Flight Forecast:</small>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Model</th>
                    <th>Status</th>
                    <th>Temp</th>
                    <th>Wind</th>
                    <th>Rain</th>
                  </tr>
                </thead>
                <tbody>
                  {flightData.forecasts.map((forecast, index) => (
                    <tr key={index}>
                      <td>{new Date(forecast.timestamp).toLocaleDateString()}</td>
                      <td>{forecast.uavmodel}</td>
                      <td>
                        <span className={`badge bg-${getStatusColor(forecast.status)}`}>
                          {forecast.status}
                        </span>
                      </td>
                      <td>{forecast.weather_params.temp}°C</td>
                      <td>{forecast.weather_params.wind} m/s</td>
                      <td>{forecast.weather_params.precipitation}mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Flight Recommendations */}
            <div className="mt-2">
              <small className="text-muted d-block mb-1">Flight Recommendations:</small>
              {flightData.forecasts.some(f => f.status === 'OK') && (
                <div className="alert alert-success p-2 small">
                  ✅ Good flying conditions available for selected timeframes
                </div>
              )}
              {flightData.forecasts.some(f => f.status === 'MARGINAL') && (
                <div className="alert alert-warning p-2 small">
                  ⚠️ Marginal conditions detected - fly with caution and monitor weather closely
                </div>
              )}
              {flightData.forecasts.some(f => f.status === 'NOT OK') && (
                <div className="alert alert-danger p-2 small">
                  ❌ Poor flying conditions detected - avoid flying during these periods
                </div>
              )}
            </div>
          </div>
        )}

        {flightData && !flightData.forecasts && (
          <div className="alert alert-info">
            No flight data available for selected models.
          </div>
        )}
      </div>
    </div>
  );
}
