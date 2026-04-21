import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Icon = ({ src, alt = '', size = 20, style = {} }) => (
  <img src={src} alt={alt} width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle', ...style }} />
);

const ICONS = {
  brand:    'https://cdn-icons-png.flaticon.com/512/2232/2232688.png',
  mobile:   'https://cdn-icons-png.flaticon.com/512/0/191.png',
  book:     'https://cdn-icons-png.flaticon.com/512/2232/2232688.png',
  refresh:  'https://cdn-icons-png.flaticon.com/512/2965/2965395.png',
  chart:    'https://cdn-icons-png.flaticon.com/512/1828/1828791.png',
  person:   'https://cdn-icons-png.flaticon.com/512/1077/1077063.png',
  email:    'https://cdn-icons-png.flaticon.com/512/542/542638.png',
  lock:     'https://cdn-icons-png.flaticon.com/512/3064/3064197.png',
  lockCheck: 'https://cdn-icons-png.flaticon.com/512/5290/5290058.png',
  eyeOpen:  'https://cdn-icons-png.flaticon.com/512/159/159604.png',
  eyeClose: 'https://cdn-icons-png.flaticon.com/512/2767/2767146.png',
};

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password });
      toast.success(
        `Account created successfully! Welcome, ${user.name}. Please sign in to continue.`,
        { duration: 4000, icon: '✅' }
      );
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputIcon = (src) => (
    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, pointerEvents: 'none' }}>
      <Icon src={src} alt="" size={16} />
    </span>
  );

  const eyeBtn = (show, toggle) => (
    <button
      type="button"
      onClick={toggle}
      style={{
        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
        opacity: 0.5, display: 'flex', alignItems: 'center', borderRadius: 6,
        transition: 'opacity 0.2s',
      }}
      title={show ? 'Hide password' : 'Show password'}
    >
      <Icon src={show ? ICONS.eyeClose : ICONS.eyeOpen} alt={show ? 'Hide' : 'Show'} size={18} />
    </button>
  );

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">
            <div className="auth-brand-icon"><Icon src={ICONS.brand} alt="Library" size={40} /></div>
            <h1>Library<span>Catalog</span></h1>
          </div>
          <h2>Join Our Library Community</h2>
          <p>Create your free account and start exploring thousands of books today.</p>
          <div className="auth-feature">
            <span className="auth-feature-icon"><Icon src={ICONS.mobile} alt="Mobile" size={22} /></span>
            <span>Access your account from any device</span>
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon"><Icon src={ICONS.book} alt="Books" size={22} /></span>
            <span>Borrow up to 5 books simultaneously</span>
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon"><Icon src={ICONS.refresh} alt="Renew" size={22} /></span>
            <span>Renew books without visiting the library</span>
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon"><Icon src={ICONS.chart} alt="Stats" size={22} /></span>
            <span>Track your reading history and stats</span>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-right-brand">
          <div className="icon"><Icon src={ICONS.brand} alt="Library" size={26} /></div>
          <span>LibraryCatalog</span>
        </div>

        <h2>Create account</h2>
        <p className="subtitle">Join our library community today</p>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              {inputIcon(ICONS.person)}
              <input
                className="form-input"
                style={{ paddingLeft: 40 }}
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                autoFocus
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              {inputIcon(ICONS.email)}
              <input
                className="form-input"
                style={{ paddingLeft: 40 }}
                type="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password with show/hide */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              {inputIcon(ICONS.lock)}
              <input
                className="form-input"
                style={{ paddingLeft: 40, paddingRight: 48 }}
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
              />
              {eyeBtn(showPassword, () => setShowPassword(p => !p))}
            </div>
          </div>

          {/* Confirm Password with show/hide */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              {inputIcon(ICONS.lockCheck)}
              <input
                className="form-input"
                style={{ paddingLeft: 40, paddingRight: 48 }}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                autoComplete="new-password"
              />
              {eyeBtn(showConfirm, () => setShowConfirm(p => !p))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? (
              <>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                Creating account...
              </>
            ) : 'Create Account →'}
          </button>
        </form>

        <div className="divider">or</div>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
