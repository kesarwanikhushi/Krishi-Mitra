import React from 'react';

const FormattedMessage = ({ content, type = 'bot' }) => {
  if (!content) return null;
  
  // Split content by horizontal dividers
  const sections = content.split('---').map(section => section.trim()).filter(Boolean);
  
  const formatTextPart = (text) => {
    if (!text) return null;
    
    // Split by line breaks to handle paragraphs
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    
    return lines.map((line, lineIndex) => {
      // Check if line is a main heading (with emoji and **)
      const mainHeadingMatch = line.match(/^((?:📋|📝|💡|🛠️|⏰|✅|⚠️|🎯)\s*)\*\*(.*?)\*\*/);
      if (mainHeadingMatch) {
        return (
          <div key={lineIndex} className="mb-3 mt-3">
            <h5 className="fw-bold mb-2" style={{ 
              color: '#2e7d32', 
              borderBottom: '2px solid #4caf50', 
              paddingBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '10px', fontSize: '1.2rem' }}>{mainHeadingMatch[1]}</span>
              {mainHeadingMatch[2]}
            </h5>
          </div>
        );
      }
      
      // Check if line has ** formatting (sub-headings)
      const subHeadingMatch = line.match(/^\*\*(.*?)\*\*:?$/);
      if (subHeadingMatch && !mainHeadingMatch) {
        return (
          <h6 key={lineIndex} className="fw-bold mt-3 mb-2" style={{ 
            color: '#1976d2',
            textDecoration: 'underline',
            textDecorationColor: '#4caf50'
          }}>
            {subHeadingMatch[1]}
          </h6>
        );
      }
      
      // Check if line is a bullet point (starts with *)
      if (line.startsWith('* ')) {
        const bulletContent = line.substring(2);
        return (
          <div key={lineIndex} className="mb-2" style={{ 
            paddingLeft: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start'
          }}>
            <span style={{ 
              color: '#4caf50', 
              marginRight: '10px',
              fontSize: '1.1rem',
              marginTop: '0.1rem',
              fontWeight: 'bold'
            }}>
              •
            </span>
            <span 
              style={{ flex: 1, lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{ __html: formatInlineText(bulletContent) }} 
            />
          </div>
        );
      }
      
      // Check if line starts with emojis (general content with emojis)
      const emojiLineMatch = line.match(/^((?:🌾|🌱|🌽|💊|🛡️|💧|🌍|☀️|🦠|📈|🌿|💰|🔧|💡|⚠️|❗|✅|❌)\s+)/);
      if (emojiLineMatch && !mainHeadingMatch && !subHeadingMatch) {
        return (
          <p key={lineIndex} className="mb-2" style={{ lineHeight: '1.6' }}>
            <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>{emojiLineMatch[1]}</span>
            <span dangerouslySetInnerHTML={{ __html: formatInlineText(line.substring(emojiLineMatch[1].length)) }} />
          </p>
        );
      }
      
      // Regular paragraph
      if (line.length > 0) {
        return (
          <p key={lineIndex} className="mb-2" style={{ lineHeight: '1.6' }}>
            <span dangerouslySetInnerHTML={{ __html: formatInlineText(line) }} />
          </p>
        );
      }
      
      return null;
    }).filter(Boolean);
  };
  
  const formatInlineText = (text) => {
    if (!text) return '';
    
    // Remove standalone asterisks and convert **text** to bold
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #2e7d32; font-weight: 600;">$1</strong>');
    
    // Remove remaining single asterisks that are not part of formatting
    formatted = formatted.replace(/(?<!\*)\*(?!\*)/g, '');
    
    // Highlight important agricultural keywords
    const importantKeywords = [
      'organic farming', 'irrigation', 'fertilizer', 'pesticide', 'soil health', 
      'biodiversity', 'water conservation', 'cover crops', 'composting', 'crop rotation',
      'sustainable', 'no-till', 'carbon footprint', 'agroforestry', 'pollination',
      'hedgerows', 'beneficial insects', 'rainwater harvesting', 'extension services'
    ];
    
    importantKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
      formatted = formatted.replace(regex, '<mark style="background-color: #e8f5e8; color: #2e7d32; padding: 1px 3px; border-radius: 3px; font-weight: 500;">$1</mark>');
    });
    
    // Add emoji spacing if not already present
    formatted = formatted.replace(/(🌾|🌱|🌽|💊|🛡️|💧|🌍|☀️|🦠|📈|🌿|💰|🔧|💡|⚠️|❗|✅|❌)(\w)/g, '$1 $2');
    
    return formatted;
  };
  
  if (sections.length === 1) {
    // No dividers, render as single section
    return (
      <div className="formatted-message">
        {formatTextPart(sections[0])}
      </div>
    );
  }
  
  // Multiple sections with dividers
  return (
    <div className="formatted-message">
      {sections.map((section, sectionIndex) => (
        <React.Fragment key={sectionIndex}>
          {sectionIndex > 0 && (
            <div className="section-divider my-4">
              <hr style={{ 
                border: 'none', 
                height: '3px',
                background: 'linear-gradient(90deg, #4caf50 0%, #81c784 50%, #4caf50 100%)',
                borderRadius: '2px',
                margin: '1.5rem 0',
                boxShadow: '0 2px 4px rgba(76, 175, 80, 0.3)'
              }} />
            </div>
          )}
          <div className="section">
            {formatTextPart(section)}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default FormattedMessage;
