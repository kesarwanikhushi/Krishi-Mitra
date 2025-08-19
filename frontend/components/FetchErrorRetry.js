import React from 'react';

export default function FetchErrorRetry({ error, onRetry }) {
  return (
    <div className="alert alert-danger d-flex flex-column align-items-center" style={{fontSize:16}}>
      <span>{error || 'Failed to load data.'}</span>
      <button className="btn btn-outline-danger btn-sm mt-2" onClick={onRetry}>Retry</button>
    </div>
  );
}
