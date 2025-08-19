import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

export default function TopNav() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const navs = [
    { href: '/', icon: '🏠', label: t('home'), color: '#4caf50' },
    { href: '/calendar', icon: '📅', label: t('calendar'), color: '#ff9800' },
    { href: '/prices', icon: '💰', label: t('prices'), color: '#00bcd4' },
    { href: '/settings', icon: '⚙️', label: t('settings'), color: '#795548' },
  ];

  return (
    <nav 
      className="navbar fixed-top border-bottom-0 shadow-lg"
      style={{
        height: 60,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(46, 125, 50, 0.1)',
        zIndex: 1050
      }}
    >
      <div className="container-fluid d-flex justify-content-around align-items-center h-100 px-3">
        {navs.map(({ href, icon, label, color }) => {
          const isActive = router.pathname === href;
          return (
            <Link key={href} href={href} legacyBehavior>
              <a 
                className="d-flex flex-column align-items-center text-decoration-none position-relative"
                style={{
                  color: isActive ? color : '#666',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 18,
                  transition: 'all 0.3s ease',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  background: isActive ? `${color}15` : 'transparent'
                }}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div 
                    className="position-absolute top-0 start-50 translate-middle-x"
                    style={{
                      width: 30,
                      height: 3,
                      background: color,
                      borderRadius: '2px',
                      marginTop: '-2px'
                    }}
                  />
                )}
                
                {/* Icon with animation */}
                <div 
                  style={{
                    fontSize: isActive ? 26 : 24,
                    transition: 'font-size 0.2s ease'
                  }}
                >
                  {icon}
                </div>
                
                {/* Label */}
                <span 
                  style={{
                    fontSize: isActive ? 11 : 10,
                    marginTop: 2,
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: '0.025em'
                  }}
                >
                  {label}
                </span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
