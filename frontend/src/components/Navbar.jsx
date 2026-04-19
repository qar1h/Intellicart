import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { path: '/', label: 'Home' },
  { path: '/products', label: 'Products' },
  { path: '/cart', label: 'Cart' },
  { path: '/orders', label: 'Orders' },
  { path: '/scheduled', label: 'Scheduled' },
  { path: '/calendar', label: 'Calendar' },
  { path: '/profile', label: 'Profile' },
];

export default function Navbar({ cartCount }) {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(12px)',
      borderBottom: '2px solid #0D9488',
      padding: '0 32px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      height: 60,
    }}>
      {/* Logo */}
      <Link to="/" style={{
        fontFamily: 'Fraunces, serif',
        fontSize: 20,
        fontWeight: 700,
        color: '#0D9488',
        letterSpacing: '-0.3px',
      }}>
        Intellicart
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {links.map(link => {
          const isActive = location.pathname === link.path;
          const label = link.path === '/cart' && cartCount > 0
            ? `Cart (${cartCount})`
            : link.label;

          return (
            <Link key={link.path} to={link.path} style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#0D9488' : '#64748B',
              background: isActive ? '#CCFBF1' : 'transparent',
              transition: 'all 0.15s',
            }}>
              {label}
            </Link>
          );
        })}
      </div>

      {/* User */}
      <div style={{
        fontSize: 13,
        color: '#64748B',
        background: '#F7F8FA',
        border: '1px solid #E2E8F0',
        borderRadius: 100,
        padding: '5px 14px',
      }}>
        {user ? user.name : 'Not logged in'}
      </div>
    </nav>
  );
}