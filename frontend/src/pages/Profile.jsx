import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser, getCurrentUser } from '../api/client';

export default function Profile() {
  const { user, login, logout } = useAuth();
  const [tab, setTab] = useState('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) { setError('Please fill in all fields.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await loginUser(loginEmail, loginPassword);
      const token = res.data.access_token;

      // Set token FIRST before any subsequent API call
      localStorage.setItem('token', token);

      const userRes = await getCurrentUser(); // interceptor now finds the token
      login(token, userRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed.');
    } finally { setLoading(false); }
  };

  const handleSignup = async () => {
    if (!signupName || !signupEmail || !signupPassword || !signupConfirm) { setError('Please fill in all fields.'); return; }
    if (signupPassword !== signupConfirm) { setError('Passwords do not match.'); return; }
    if (signupPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      await registerUser(signupName, signupEmail, signupPassword);
      setSuccess('Account created. Please log in.');
      setTab('login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally { setLoading(false); }
  };

  /* ---- Logged in ---- */
  if (user) return (
    <div className="page">
      <h1 className="page-title">Profile</h1>
      <p className="page-subtitle">Manage your account details.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        {/* Avatar */}
        <div className="card" style={{ padding: 32, textAlign: 'center', alignSelf: 'start' }}>
          <div style={{
            width: 72, height: 72,
            background: '#CCFBF1',
            border: '2px solid #99F6E4',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Fraunces, serif',
            fontSize: 28, fontWeight: 700, color: '#0D9488',
            margin: '0 auto 16px',
          }}>
            {user.name[0].toUpperCase()}
          </div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
            {user.name}
          </div>
          <div style={{ fontSize: 13, color: '#64748B' }}>{user.email}</div>
          <hr className="divider" />
          <button className="btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={logout}>
            Sign Out
          </button>
        </div>

        {/* Details */}
        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, marginBottom: 24, color: '#0F172A' }}>
            Account Details
          </h2>
          {[
            { label: 'Full Name', value: user.name },
            { label: 'Email', value: user.email },
            { label: 'User ID', value: `#${user.user_id}` },
          ].map((row, i) => (
            <div key={i} style={{
              padding: '16px 0',
              borderBottom: i < 2 ? '1px solid #F1F5F9' : 'none',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{row.label}</span>
              <span style={{ fontSize: 14, color: '#0F172A', fontWeight: 600 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ---- Logged out ---- */
  return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <h1 className="page-title" style={{ textAlign: 'center' }}>Welcome back</h1>
        <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: 32 }}>
          Sign in to your account or create a new one.
        </p>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: '#F1F5F9',
          borderRadius: 10, padding: 4, marginBottom: 28,
        }}>
          {['login', 'signup'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); setSuccess(''); }}
              style={{
                flex: 1, padding: '9px 0',
                background: tab === t ? 'white' : 'transparent',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: tab === t ? 600 : 400,
                color: tab === t ? '#0F172A' : '#64748B',
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}>
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="alert-success" style={{ marginBottom: 16 }}>{success}</div>}

        {tab === 'login' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">Email address</label>
              <input className="input" type="email" placeholder="you@example.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Enter your password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: 4, padding: 13 }} onClick={handleLogin} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">Full name</label>
              <input className="input" type="text" placeholder="Your name" value={signupName} onChange={e => setSignupName(e.target.value)} />
            </div>
            <div>
              <label className="label">Email address</label>
              <input className="input" type="email" placeholder="you@example.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Minimum 6 characters" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} />
            </div>
            <div>
              <label className="label">Confirm password</label>
              <input className="input" type="password" placeholder="Repeat password" value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)} />
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: 4, padding: 13 }} onClick={handleSignup} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}