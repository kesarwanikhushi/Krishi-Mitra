import WeatherWidget from '../components/WeatherWidget';
import { useState } from 'react';

export default function Soil() {
  const [selectedSoilType, setSelectedSoilType] = useState('');
  
  const soilTypes = [
    { 
      id: 'alluvial',
      name: 'Alluvial Soil',
      description: 'Rich in minerals, ideal for crops like wheat, rice, and sugarcane',
      crops: ['Wheat', 'Rice', 'Sugarcane', 'Cotton'],
      ph: '6.0 - 7.0',
      nutrients: 'High in nitrogen and phosphorus'
    },
    {
      id: 'black',
      name: 'Black Soil (Regur)',
      description: 'Rich in iron, aluminum and magnesium, excellent for cotton',
      crops: ['Cotton', 'Sugarcane', 'Wheat', 'Jowar'],
      ph: '6.5 - 8.5',
      nutrients: 'High in calcium, potassium and magnesium'
    },
    {
      id: 'red',
      name: 'Red Soil',
      description: 'Rich in iron oxide, suitable for various crops',
      crops: ['Cotton', 'Wheat', 'Rice', 'Pulses'],
      ph: '5.5 - 7.0',
      nutrients: 'Moderate fertility, needs organic matter'
    },
    {
      id: 'laterite',
      name: 'Laterite Soil',
      description: 'Well-drained but low in fertility',
      crops: ['Rice', 'Ragi', 'Cashew', 'Rubber'],
      ph: '5.0 - 6.5',
      nutrients: 'Low in nitrogen, phosphorus and potassium'
    }
  ];

  return (
    <div className="bg-light min-vh-100 d-flex flex-column" style={{paddingBottom:60}}>
      <main className="container py-4 flex-grow-1">
        <h2 className="fw-bold mb-3" style={{fontSize: '1.5rem'}}>Soil Information</h2>
        
        <WeatherWidget compact={true} showForecast={false} />
        
        <div className="card shadow-sm mb-4" style={{borderRadius: 16}}>
          <div className="card-body">
            <h5 className="card-title mb-3">🌱 Soil Type Selector</h5>
            <div className="mb-3">
              <select 
                className="form-select" 
                value={selectedSoilType} 
                onChange={(e) => setSelectedSoilType(e.target.value)}
                style={{borderRadius: 12}}
              >
                <option value="">Select your soil type</option>
                {soilTypes.map(soil => (
                  <option key={soil.id} value={soil.id}>{soil.name}</option>
                ))}
              </select>
            </div>
            
            {selectedSoilType && (
              <div className="mt-3">
                {soilTypes.filter(soil => soil.id === selectedSoilType).map(soil => (
                  <div key={soil.id} className="border rounded p-3 bg-white">
                    <h6 className="fw-bold text-primary">{soil.name}</h6>
                    <p className="mb-2">{soil.description}</p>
                    
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center mb-2">
                          <span className="me-2">🌾</span>
                          <strong>Suitable Crops:</strong>
                        </div>
                        <div className="d-flex flex-wrap gap-1">
                          {soil.crops.map(crop => (
                            <span key={crop} className="badge bg-success" style={{borderRadius: 8}}>
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="mb-2">
                          <span className="me-2">⚖️</span>
                          <strong>pH Level:</strong> {soil.ph}
                        </div>
                        <div>
                          <span className="me-2">🧪</span>
                          <strong>Nutrients:</strong> {soil.nutrients}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="row g-3">
          {soilTypes.map(soil => (
            <div key={soil.id} className="col-md-6">
              <div className="card h-100 shadow-sm" style={{borderRadius: 16}}>
                <div className="card-body">
                  <h6 className="card-title text-primary">{soil.name}</h6>
                  <p className="card-text small">{soil.description}</p>
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {soil.crops.slice(0, 2).map(crop => (
                      <span key={crop} className="badge bg-light text-dark" style={{borderRadius: 6}}>
                        {crop}
                      </span>
                    ))}
                    {soil.crops.length > 2 && (
                      <span className="badge bg-light text-muted" style={{borderRadius: 6}}>
                        +{soil.crops.length - 2} more
                      </span>
                    )}
                  </div>
                  <small className="text-muted">pH: {soil.ph}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
