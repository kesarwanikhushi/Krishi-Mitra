import React, { useState } from 'react';

export default function SaferAlternativesPanel({ alternatives }) {
  const [open, setOpen] = useState(false);
  if (!alternatives || alternatives.length === 0) return null;
  return (
    <div className="mt-2">
      <button
        className="btn btn-outline-danger btn-sm mb-1"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="safer-alternatives-panel"
      >
        {open ? 'Hide' : 'Show'} Safer Alternatives
      </button>
      {open && (
        <div id="safer-alternatives-panel" className="alert alert-danger mt-2" style={{fontSize:16}}>
          <ul style={{marginBottom:0}}>
            {alternatives.map((alt, i) => <li key={i}>{alt}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
