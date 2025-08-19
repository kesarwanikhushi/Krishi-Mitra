import React from 'react';

export default function SourceList({ sources }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-2">
      <strong>Sources:</strong>
      <ul className="mb-1" style={{paddingLeft:18}}>
        {sources.map((s, i) => (
          <li key={i}>
            {s.url ? (
              <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title || s.url}</a>
            ) : (
              <span>{s.title || `Document ${s.doc_id}`}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
