import React from 'react';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

const COLORS: Record<ConfidenceLevel, string> = {
  High: '#388e3c', // green
  Medium: '#fbc02d', // yellow
  Low: '#d32f2f', // red
};

const DESCRIPTIONS: Record<ConfidenceLevel, string> = {
  High: 'High confidence: This answer is based on trusted sources and is likely reliable. You can follow this advice as is.',
  Medium: 'Medium confidence: This answer is somewhat reliable, but you may want to double-check with a local expert or trusted source.',
  Low: 'Low confidence: This answer may be incomplete or uncertain. Please consult an expert or use extra caution before acting.',
};

export interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
}


export function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  return (
    <span
      tabIndex={0}
      aria-label={DESCRIPTIONS[level]}
      title={DESCRIPTIONS[level]}
      style={{
        display: 'inline-block',
        padding: '2px 12px',
        borderRadius: 16,
        background: COLORS[level],
        color: '#fff',
        fontWeight: 600,
        fontSize: 14,
        outline: 'none',
        cursor: 'help',
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        border: 'none',
      }}
      role="status"
    >
      {level} Confidence
    </span>
  );
}

export default ConfidenceBadge;
