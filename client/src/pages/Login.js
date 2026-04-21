import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Icon = ({ src, alt = '', size = 20, style = {} }) => (
  <img src={src} alt={alt} width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle', ...style }} />
);

const ICONS = {
  brand:    'https://cdn-icons-png.flaticon.com/512/2232/2232688.png',
  catalog:  'https://cdn-icons-png.flaticon.com/512/3480/3480292.png',
  book:     'https://cdn-icons-png.flaticon.com/512/2991/2991112.png',
  bell:     'https://cdn-icons-png.flaticon.com/512/1827/1827392.png',
  star:     'https://cdn-icons-png.flaticon.com/512/1828/1828884.png',
  email:    'https://cdn-icons-png.flaticon.com/512/542/542638.png',
  lock:     'https://cdn-icons-png.flaticon.com/512/3064/3064197.png',
  eyeOpen:  'https://cdn-icons-png.flaticon.com/512/159/159604.png',
  eyeClose: 'https://cdn-icons-png.flaticon.com/512/2767/2767146.png',
  admin:    'https://cdn-icons-png.flaticon.com/512/2092/2092693.png',
  user:     'https://cdn-icons-png.flaticon.com/512/1077/1077063.png',
  arrow:    'https://cdn-icons-png.flaticon.com/512/271/271228.png',
};

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // One-click fill demo credentials
  const fillAdmin = () => {
    setForm({ email: 'admin@library.com', password: 'admin123' });
    toast('Admin credentials filled!', { icon: '✅', duration: 2000 });
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">
            <div className="auth-brand-icon"><Icon src={ICONS.brand} alt="Library" size={40} /></div>
            <h1>Library<span>Catalog</span></h1>
          </div>
          <h2>Your Digital Library Management System</h2>
          <p>Access thousands of books, manage borrows, and explore your reading journey.</p>
          <div className="auth-feature">
            <span className="auth-feature-icon"><Icon src={ICONS.catalog} alt="Catalog" size={22} /></span>
            <span>Browse and search our complete book catalog</span>
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon"><Icon src={ICONS.book} alt="Borrow" size={22} /></span>
            <span>Borrow, renew, and return books online</span>
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon"><Icon src={ICONS.bell} alt="Notify" size={22} /></span>
            <span>Get notified about due dates and fines</span>
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon"><Icon src={ICONS.star} alt="Rate" size={22} /></span>
            <span>Rate and review books you've read</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-right-brand">
          <div className="icon"><Icon src={ICONS.brand} alt="Library" size={26} /></div>
          <span>LibraryCatalog</span>
        </div>

        <h2>Welcome back</h2>
        <p className="subtitle">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, pointerEvents: 'none' }}>
                <Icon src={ICONS.email} alt="" size={16} />
              </span>
              <input
                className="form-input"
                style={{ paddingLeft: 40 }}
                type="email"
                placeholder="e.g. admin@library.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                autoFocus
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password with show/hide toggle */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, pointerEvents: 'none' }}>
                <Icon src={ICONS.lock} alt="" size={16} />
              </span>
              <input
                className="form-input"
                style={{ paddingLeft: 40, paddingRight: 48 }}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
                  opacity: 0.5, display: 'flex', alignItems: 'center', borderRadius: 6,
                  transition: 'opacity 0.2s',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon
                  src={showPassword ? ICONS.eyeClose : ICONS.eyeOpen}
                  alt={showPassword ? 'Hide' : 'Show'}
                  size={18}
                />
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? (
              <>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                Signing in...
              </>
            ) : 'Sign In →'}
          </button>
        </form>

        <div className="divider">or</div>

        <p className="auth-link">
          New to the library? <Link to="/register">Create an account</Link>
        </p>

        {/* Demo credentials — click to auto-fill */}
        <div
          className="admin-hint"
          onClick={fillAdmin}
          style={{ cursor: 'pointer', userSelect: 'none' }}
          title="Click to auto-fill admin credentials"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <Icon src={ICONS.admin} alt="Admin" size={15} />
            <strong>Demo Admin Credentials</strong>
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', background: '#bfdbfe', color: '#1a56db', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
              Tap to fill
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: '0.8rem' }}>
            <span style={{ fontFamily: 'monospace', background: '#dbeafe', padding: '2px 8px', borderRadius: 5, color: '#1e40af' }}>
              admin@library.com
            </span>
            <span style={{ color: '#94a3b8' }}>/</span>
            <span style={{ fontFamily: 'monospace', background: '#dbeafe', padding: '2px 8px', borderRadius: 5, color: '#1e40af' }}>
              admin123
            </span>
          </div>
          <div style={{ marginTop: 8, fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon src={ICONS.user} alt="" size={12} />
            <strong>Member:</strong> Register a new account to get started
          </div>
        </div>
      </div>
    </div>
  );
}
