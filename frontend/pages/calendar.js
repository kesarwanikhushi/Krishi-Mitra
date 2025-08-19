import CropCalendarChart from '../components/CropCalendarChart';
import EnhancedCropCalendar from '../components/EnhancedCropCalendar';
import WeatherAwareRecommendations from '../components/WeatherAwareRecommendations';
import SkeletonCard from '../components/SkeletonCard';
import FetchErrorRetry from '../components/FetchErrorRetry';
import WeatherWidget from '../components/WeatherWidget';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Calendar() {
  const { t } = useTranslation();
  const [calendarData, setCalendarData] = useState([]);
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [showWeatherRecommendations, setShowWeatherRecommendations] = useState(true);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    fetch('/data/calendar.sample.json')
      .then(r => {
        if (!r.ok) throw new Error(t('networkError'));
        return r.json();
      })
      .then(data => {
        setCalendarData(data);
        const cropSet = new Set(data.map(d => d.crop));
        setCrops([...cropSet]);
        // Set first crop as default selection
        if (cropSet.size > 0) {
          setSelectedCrop([...cropSet][0]);
        }
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = calendarData.filter(d => d.crop === selectedCrop);

  return (
    <div className="bg-light min-vh-100 d-flex flex-column" style={{paddingBottom:60}}>
      <main className="container py-4 flex-grow-1">
        <h2 className="fw-bold mb-3" style={{fontSize: '1.5rem'}}>{t('cropCalendarTitle')}</h2>
        
        <WeatherWidget compact={true} showForecast={false} />
        
        {offline && (
          <div className="alert alert-warning">{t('offlineMessage')}</div>
        )}
        {loading ? (
          <SkeletonCard height={120} />
        ) : error ? (
          <FetchErrorRetry error={error} onRetry={fetchData} />
        ) : (
          <>
            <div className="mb-3 d-flex flex-wrap gap-3 align-items-center">
              <label className="form-label mb-0" htmlFor="crop">{t('crop')}:</label>
              <select id="crop" className="form-select w-auto" style={{fontSize:17}} value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}>
                <option value="">{t('selectCrop')}</option>
                {crops.map(crop => <option key={crop} value={crop}>{crop}</option>)}
              </select>
              
              {/* Toggle for weather recommendations */}
              <div className="form-check form-switch ms-auto">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="weatherRecommendations"
                  checked={showWeatherRecommendations}
                  onChange={e => setShowWeatherRecommendations(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="weatherRecommendations">
                  Weather Recommendations
                </label>
              </div>
            </div>
            {!selectedCrop ? (
              <div className="alert alert-info">{t('selectCropMessage')}</div>
            ) : (
              <>
                <CropCalendarChart data={filtered} selectedCrops={[selectedCrop]} />
                {showWeatherRecommendations && (
                  <WeatherAwareRecommendations 
                    selectedCrop={selectedCrop}
                    cropData={filtered}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
