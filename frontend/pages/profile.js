import { useEffect, useState } from 'react';

const allDistricts = ['Kanpur', 'Lucknow'];
const allCrops = ['Wheat', 'Rice'];

function loadProfile() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('profile') || '{}');
  } catch { return {}; }
}

function saveProfile(profile) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('profile', JSON.stringify(profile));
  }
}

export default function Profile({ demoMode = false, demoState = {} }) {
  const [profile, setProfile] = useState({ name: '', district: '', language: 'en', crops: [] });

  useEffect(() => {
    if (demoMode && demoState?.district) {
      setProfile(p => ({ ...p, district: demoState.district, crops: demoState.crops || [] }));
    } else {
      setProfile(p => ({ ...p, ...loadProfile() }));
    }
    // eslint-disable-next-line
  }, [demoMode, demoState]);

  const handleChange = (field, value) => {
    if (demoMode && (field === 'district' || field === 'crops')) return;
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    saveProfile(updated);
  };

  const handleCropToggle = crop => {
    if (demoMode) return;
    const crops = profile.crops.includes(crop)
      ? profile.crops.filter(c => c !== crop)
      : [...profile.crops, crop];
    handleChange('crops', crops);
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column" style={{paddingBottom:60}}>
      <main className="container py-4 flex-grow-1">
        <h2 className="fw-bold mb-3" style={{fontSize: '1.5rem'}}>Profile</h2>
        <form className="mb-3" onSubmit={e => e.preventDefault()}>
          <div className="mb-3">
            <label className="form-label">Name (optional)</label>
            <input className="form-control" style={{fontSize:17}} value={profile.name || ''} onChange={e => handleChange('name', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">District</label>
            <select className="form-select" style={{fontSize:17}} value={profile.district || ''} onChange={e => handleChange('district', e.target.value)} required disabled={demoMode}>
              <option value="">Select district</option>
              {allDistricts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {demoMode && <div className="form-text text-success">Demo Mode: District is pre-filled</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Preferred Language</label>
            <select className="form-select" style={{fontSize:17}} value={profile.language} onChange={e => handleChange('language', e.target.value)}>
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Preferred Crops</label>
            <div className="d-flex flex-wrap gap-2">
              {allCrops.map(crop => (
                <button
                  type="button"
                  key={crop}
                  className={`btn btn-sm ${profile.crops && profile.crops.includes(crop) ? 'btn-success' : 'btn-outline-secondary'}`}
                  style={{fontSize:16, borderRadius:16}}
                  onClick={() => handleCropToggle(crop)}
                  aria-pressed={profile.crops && profile.crops.includes(crop)}
                  disabled={demoMode}
                >
                  {crop}
                </button>
              ))}
            </div>
            {demoMode && <div className="form-text text-success">Demo Mode: Crops are pre-filled</div>}
          </div>
        </form>
      </main>
    </div>
  );
}
