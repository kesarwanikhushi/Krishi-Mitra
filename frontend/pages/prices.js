import MarketPriceChart from '../components/MarketPriceChart';
import SkeletonCard from '../components/SkeletonCard';
import FetchErrorRetry from '../components/FetchErrorRetry';
import { useEffect, useState } from 'react';

export default function Prices() {
  const [crop, setCrop] = useState('Wheat');
  const [market, setMarket] = useState('Kanpur');
  const [days, setDays] = useState(7);
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [allCrops, setAllCrops] = useState([]);
  const [allMarkets, setAllMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Set initial offline state after component mounts
    setOffline(!navigator.onLine);
    
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
    
    // Use backend API instead of static JSON file
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    fetch(`${apiUrl}/market?crop=${crop}&market=${market}&days=30`)
      .then(r => {
        if (!r.ok) throw new Error('Network error');
        return r.json();
      })
      .then(marketData => {
        // Transform the backend response to match expected format
        setAllData(marketData);
        
        // For getting all crops and markets, we need a separate call or extend the backend
        // For now, extract from current data
        const crops = [...new Set(marketData.map(d => d.crop))];
        const markets = [...new Set(marketData.map(d => d.market))];
        setAllCrops(crops);
        setAllMarkets(markets);
        
        setLoading(false);
      })
      .catch(e => {
        // Fallback to static data in development
        if (process.env.NODE_ENV === 'development') {
          fetch('/data/market-prices.json')
            .then(r => r.json())
            .then(marketData => {
              setAllData(marketData);
              const crops = [...new Set(marketData.map(d => d.crop))];
              const markets = [...new Set(marketData.map(d => d.market))];
              setAllCrops(crops);
              setAllMarkets(markets);
              setLoading(false);
            })
            .catch(() => {
              setError(e.message);
              setLoading(false);
            });
        } else {
          setError(e.message);
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data based on current selections
  useEffect(() => {
    if (allData.length > 0) {
      const filtered = allData
        .filter(d => d.crop === crop && d.market === market)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, days);
      setData(filtered);
    }
  }, [crop, market, days, allData]);

  const handleDownloadCSV = () => {
    if (!data || !data.length) return;
    
    // Format dates properly for CSV
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      // Format as DD/MM/YYYY which is more widely compatible
      return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    };
    
    // Create CSV with proper formatting
    const csvHeader = 'Date,Price (₹),Unit,Crop,Market';
    const csvRows = data.map(d => {
      const formattedDate = formatDate(d.date);
      const price = d.price || 0;
      const unit = d.unit || 'per quintal';
      // Escape commas in text fields and wrap in quotes if needed
      return `"${formattedDate}","${price}","${unit}","${crop}","${market}"`;
    });
    
    const csv = [csvHeader, ...csvRows].join('\n');
    
    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${crop}_${market}_prices_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column" style={{paddingBottom:60}}>
      <main className="container py-4 flex-grow-1">
        <h2 className="fw-bold mb-3" style={{fontSize: '1.5rem'}}>Mandi Prices</h2>
        
        {offline && (
          <div className="alert alert-warning">You are offline. Showing cached data if available.</div>
        )}
        
        {loading ? (
          <SkeletonCard height={120} />
        ) : error ? (
          <FetchErrorRetry error={error} onRetry={fetchData} />
        ) : (
          <>
            <div className="mb-3 d-flex flex-wrap gap-3 align-items-center">
              <label className="form-label mb-0" htmlFor="crop">Crop:</label>
              <select id="crop" className="form-select w-auto" style={{fontSize:17}} value={crop} onChange={e => setCrop(e.target.value)}>
                {allCrops.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className="form-label mb-0 ms-3" htmlFor="market">Market:</label>
              <select id="market" className="form-select w-auto" style={{fontSize:17}} value={market} onChange={e => setMarket(e.target.value)}>
                {allMarkets.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <label className="form-label mb-0 ms-3" htmlFor="days">Days:</label>
              <select id="days" className="form-select w-auto" style={{fontSize:17}} value={days} onChange={e => setDays(Number(e.target.value))}>
                {[7, 14, 30].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <button className="btn btn-outline-secondary ms-3" style={{fontSize:16}} onClick={handleDownloadCSV}>Download CSV</button>
            </div>
            
            {data.length === 0 ? (
              <div className="alert alert-info">No price data available for {crop} in {market}.</div>
            ) : (
              <>
                <div className="card shadow-sm mb-3" style={{borderRadius: 16}}>
                  <div className="card-body">
                    <h5 className="card-title">Current Price</h5>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="text-center p-3 bg-success text-white rounded">
                          <h3 className="mb-0">₹{data[0]?.price}</h3>
                          <small>{data[0]?.unit}</small>
                        </div>
                      </div>
                      <div className="col-md-8">
                        <div className="row g-2">
                          <div className="col-6">
                            <small className="text-muted">Crop:</small>
                            <div className="fw-bold">{crop}</div>
                          </div>
                          <div className="col-6">
                            <small className="text-muted">Market:</small>
                            <div className="fw-bold">{market}</div>
                          </div>
                          <div className="col-6">
                            <small className="text-muted">Date:</small>
                            <div className="fw-bold">{new Date(data[0]?.date).toLocaleDateString()}</div>
                          </div>
                          <div className="col-6">
                            <small className="text-muted">Trend:</small>
                            <div className="fw-bold text-success">
                              {data.length > 1 && data[0].price > data[1].price ? '📈 Rising' : 
                               data.length > 1 && data[0].price < data[1].price ? '📉 Falling' : 
                               '➡️ Stable'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <MarketPriceChart data={data} crop={crop} market={market} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
