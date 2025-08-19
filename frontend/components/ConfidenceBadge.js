import React, { useState } from 'react';

const badgeInfo = {
  'Very High': {
    color: 'success',
    icon: '🟢',
    tip: 'Very high confidence (80-100%): Comprehensive and well-structured response with high agricultural specificity.'
  },
  High: {
    color: 'success', 
    icon: '✅',
    tip: 'High confidence (70-79%): Strong evidence and good agricultural specificity with proper structure.'
  },
  Medium: {
    color: 'warning',
    icon: '⚠️',
    tip: 'Medium confidence (55-69%): Adequate response but may lack detail or specificity.'
  },
  Low: {
    color: 'danger',
    icon: '❓',
    tip: 'Low confidence (40-54%): Limited detail or agricultural specificity. Consult experts.'
  },
  'Very Low': {
    color: 'dark',
    icon: '⚫',
    tip: 'Very low confidence (0-39%): Insufficient or unclear response. Professional consultation recommended.'
  }
};

export default function ConfidenceBadge({ confidence, confidenceScore, confidenceFactors, compact = false }) {
  const [showDetails, setShowDetails] = useState(false);
  
  const info = badgeInfo[confidence] || badgeInfo.Low;
  const score = confidenceScore || 0;
  
  if (compact) {
    return (
      <span
        className={`badge bg-${info.color} d-inline-flex align-items-center`}
        title={`${info.tip} (Score: ${score}%)`}
        style={{fontSize: 12, cursor: 'help'}}
      >
        <span style={{fontSize: 14, marginRight: 4}}>{info.icon}</span>
        {score}%
      </span>
    );
  }

  return (
    <div className="confidence-meter mb-2">
      <div 
        className={`badge bg-${info.color} d-inline-flex align-items-center me-2`}
        style={{fontSize: 14, cursor: 'pointer'}}
        onClick={() => setShowDetails(!showDetails)}
        title="Click for details"
      >
        <span style={{fontSize: 16, marginRight: 6}}>{info.icon}</span>
        {confidence} Confidence ({score}%)
      </div>
      
      {/* Progress bar */}
      <div className="progress mt-1" style={{height: '6px', width: '200px', display: 'inline-block'}}>
        <div 
          className={`progress-bar bg-${info.color}`}
          role="progressbar" 
          style={{width: `${score}%`}}
          aria-valuenow={score}
          aria-valuemin="0" 
          aria-valuemax="100"
        ></div>
      </div>
      
      {/* Detailed breakdown */}
      {showDetails && confidenceFactors && (
        <div className="mt-2 p-2 bg-light rounded" style={{fontSize: '12px'}}>
          <strong>Confidence Factors:</strong>
          <ul className="mb-0 mt-1" style={{paddingLeft: '16px'}}>
            {confidenceFactors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
          <small className="text-muted mt-1 d-block">
            Click the badge again to hide details
          </small>
        </div>
      )}
    </div>
  );
}
