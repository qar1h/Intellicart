import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const stats = [
  { number: '95+', label: 'Products' },
  { number: '8', label: 'Categories' },
  { number: 'AI', label: 'Recommendations' },
  { number: 'Auto', label: 'Scheduling' },
];

const features = [
  {
    title: 'Smart Shopping',
    desc: 'Browse 95 products across 8 categories. Add to cart and checkout in seconds.',
    link: '/products',
    linkLabel: 'Browse Products',
  },
  {
    title: 'Auto Scheduling',
    desc: 'Set recurring orders for your essentials. The system places them automatically.',
    link: '/scheduled',
    linkLabel: 'View Schedules',
  },
  {
    title: 'AI Recommendations',
    desc: 'Personalised product suggestions based on your purchase history, powered by PyTorch.',
    link: '/products',
    linkLabel: 'See Recommendations',
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="page">
      {/* Hero */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 48,
        marginBottom: 64,
        alignItems: 'center',
      }}>
        <div>
          <div style={{
            display: 'inline-block',
            background: '#F0FDFA',
            border: '1px solid #99F6E4',
            borderRadius: 100,
            padding: '4px 14px',
            fontSize: 13,
            fontWeight: 500,
            color: '#0D9488',
            marginBottom: 24,
          }}>
            AI-powered grocery platform
          </div>
          <h1 style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-1px',
            color: '#0F172A',
            marginBottom: 20,
          }}>
            Shop smarter,<br />
            <span style={{ color: '#0D9488' }}>live better.</span>
          </h1>
          <p style={{
            fontSize: 17,
            color: '#64748B',
            lineHeight: 1.7,
            marginBottom: 32,
          }}>
            Personalised recommendations, automated scheduling,
            and seamless grocery ordering — all in one place.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/products" className="btn-primary" style={{ padding: '13px 28px', fontSize: 15 }}>
              Start Shopping
            </Link>
            <Link to="/profile" className="btn-secondary" style={{ padding: '13px 28px', fontSize: 15 }}>
              {user ? 'My Profile' : 'Sign In'}
            </Link>
          </div>
        </div>

        {/* Right side — teal stat block like the reference */}
        <div style={{
          background: '#0D9488',
          borderRadius: 20,
          padding: '40px 36px',
          color: 'white',
        }}>
          <div style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 22,
            fontWeight: 600,
            marginBottom: 32,
            lineHeight: 1.3,
          }}>
            Everything you need for smarter grocery shopping.
          </div>
          {[
            { number: '95+', label: 'Products available' },
            { number: '8', label: 'Categories' },
            { number: 'AI', label: 'Powered recommendations' },
          ].map((s, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '14px 0',
              borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.15)' : 'none',
            }}>
              <div style={{
                fontFamily: 'Fraunces, serif',
                fontSize: 32,
                fontWeight: 700,
                color: 'white',
                minWidth: 64,
              }}>
                {s.number}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{
        background: '#0F766E',
        borderRadius: 20,
        padding: '48px 48px',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 32,
        alignItems: 'center',
        marginTop: 16,
      }}>
        <div>
          <h3 style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 28,
            fontWeight: 700,
            color: 'white',
            marginBottom: 8,
            letterSpacing: '-0.3px',
          }}>
            {user ? `Welcome back, ${user.name}` : 'Ready to get started?'}
          </h3>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
            {user
              ? 'Your groceries are ready. Head to Products to continue shopping.'
              : 'Create an account to unlock recommendations, order history, and auto-scheduling.'}
          </p>
        </div>
        <Link
          to={user ? '/products' : '/profile'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '14px 32px',
            background: 'white',
            color: '#0F766E',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 15,
            whiteSpace: 'nowrap',
            transition: 'opacity 0.15s',
          }}
        >
          {user ? 'Shop Now' : 'Create Account'}
        </Link>
      </div>
    </div>
  );
}