import React from "react";
import { useMute } from "../components/GlobalMuteProvider";

export default function MuteButton() {
  const { muted, toggleMute } = useMute();
  
  return (
    <button
      onClick={toggleMute}
      className="btn d-flex align-items-center justify-content-center rounded-circle shadow-sm flex-shrink-0"
      aria-label={muted ? "Unmute" : "Mute"}
      style={{ 
        width: 44, 
        height: 44, 
        minWidth: 44,
        minHeight: 44,
        maxWidth: 44,
        maxHeight: 44,
        borderRadius: '50%',
        border: 'none',
        background: muted ? 
          'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' : 
          'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
        color: 'white',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = muted ? 
          '0 4px 12px rgba(244, 67, 54, 0.3)' : 
          '0 4px 12px rgba(33, 150, 243, 0.3)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
    >
      <span style={{ 
        fontSize: 18, 
        lineHeight: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        {muted ? "🔇" : "🔊"}
      </span>
    </button>
  );
}
