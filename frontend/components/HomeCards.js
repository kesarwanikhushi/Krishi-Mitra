import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function HomeCards() {
  const { t } = useTranslation();

  const cards = [
    {
      href: '/ask',
      icon: '🤖',
      title: t('askAI'),
      description: t('aiAdviceDesc'),
      gradient: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
      textColor: '#7b1fa2'
    },
    {
      href: '/calendar',
      icon: '📅',
      title: t('calendar'),
      description: t('calendarDesc'),
      gradient: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
      textColor: '#ef6c00'
    },
    {
      href: '/prices',
      icon: '💰',
      title: t('prices'),
      description: t('pricesDesc'),
      gradient: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
      textColor: '#2e7d32'
    },
    {
      href: '/weather',
      icon: '🌤️',
      title: t('weather'),
      description: t('weatherDesc'),
      gradient: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
      textColor: '#00695c'
    }
  ];

  return (
    <div className="container-fluid px-3">
      {/* Enhanced Header */}
      <div className="text-center mb-5 animate-fade-in-up">
        <div 
          className="d-inline-block p-4 rounded-circle mb-3"
          style={{
            width: 96,
            height: 96,
            minWidth: 96,
            minHeight: 96,
            maxWidth: 96,
            maxHeight: 96,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
            boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'static',
            transform: 'none !important',
            animation: 'none !important',
            transition: 'none !important'
          }}
        >
          <span style={{ 
            fontSize: 48, 
            color: 'white',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>🌾</span>
        </div>
        <h1 className="fw-bold mb-3 text-gradient" style={{ fontSize: '2.5rem' }}>
          {t('appName')}
        </h1>
        <p className="text-muted fs-5 mb-0">
          {t('smartFarmingCompanion')}
        </p>
      </div>

      {/* 4 Smaller Square Boxes in 2x2 Grid */}
      <div className="row g-3 mb-4 justify-content-center">
        {cards.map((card, index) => (
          <div key={index} className="col-auto">
            <Link href={card.href} legacyBehavior>
              <a className="text-decoration-none">
                <div 
                  className="card border-0 interactive-card animate-fade-in-scale"
                  style={{ 
                    background: card.gradient,
                    borderRadius: '12px',
                    width: '200px',
                    height: '200px',
                    animationDelay: `${index * 0.1}s`,
                    boxShadow: '0 3px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <div className="card-body d-flex flex-column justify-content-center align-items-center text-center h-100 p-3">
                    {/* Icon */}
                    <div 
                      className="mb-2"
                      style={{ fontSize: 36 }}
                    >
                      {card.icon}
                    </div>
                    
                    {/* Title */}
                    <h6 className="fw-bold mb-0" style={{ 
                      fontSize: '1.3rem',
                      color: card.textColor,
                      lineHeight: 1.2
                    }}>
                      {card.description}
                    </h6>
                  </div>
                </div>
              </a>
            </Link>
          </div>
        ))}
      </div>

    </div>
  );
}
