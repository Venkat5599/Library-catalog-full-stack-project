import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, borrowsAPI } from '../services/api';
import toast from 'react-hot-toast';
const ICONS = {
  book:      'fi-rr-book-alt',
  books:     'fi-rr-books',
  check:     'fi-rr-check-circle',
  warning:   'fi-rr-triangle-warning',
  money:     'fi-rr-coins',
  search:    'fi-rr-search',
  refresh:   'fi-rr-refresh',
  lightning: 'fi-rr-bolt',
  info:      'fi-rr-info',
  id:        'fi-rr-id-badge',
  calendar:  'fi-rr-calendar',
  clock:     'fi-rr-time-fast',
};

const Icon = ({ src, alt = '', size = 20, style = {} }) => {
  if (src && src.startsWith('http')) {
    return <img src={src} alt={alt} width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle', ...style }} />
  }
  return <i className={`fi ${src}`} style={{ fontSize: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, ...style }} title={alt}></i>
};

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getUserStats()
      .then(res => setStats(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const handleReturn = async (borrowId) => {
    try {
      const res = await borrowsAPI.return(borrowId);
      toast.success(`Book returned! ${res.data.fine > 0 ? `Fine: ₹${res.data.fine}` : 'No fine.'}`);
      const updated = await dashboardAPI.getUserStats();
      setStats(updated.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return book');
    }
  };

  const handleRenew = async (borrowId) => {
    try {
      await borrowsAPI.renew(borrowId);
      toast.success('Book renewed for 14 more days!');
      const updated = await dashboardAPI.getUserStats();
      setStats(updated.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to renew book');
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div className="spinner" />
    </div>
  );

  const overdueBorrows = stats?.overdueBorrows || [];
  const activeBorrows = stats?.activeBorrows || [];

  return (
    <div>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Welcome back, {user?.name?.split(' ')[0]}! <Icon src={ICONS.book} alt="Hi" size={22} /></h2>
          <p>
            {activeBorrows.length === 0
              ? 'You have no active borrows. Explore our catalog!'
              : `You have ${activeBorrows.length} book${activeBorrows.length > 1 ? 's' : ''} currently borrowed.`}
          </p>
        </div>
        <div className="welcome-actions">
          <Link to="/books" className="btn btn-white btn-lg">
            <Icon src={ICONS.search} alt="Browse" size={16} style={{ marginRight: 6 }} /> Browse Books
          </Link>
          <Link to="/my-borrows" className="btn btn-ghost btn-lg">
            <Icon src={ICONS.book} alt="Borrows" size={16} style={{ marginRight: 6 }} /> My Borrows
          </Link>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueBorrows.length > 0 && (
        <div className="overdue-alert">
          <span className="alert-icon"><Icon src={ICONS.warning} alt="Alert" size={22} /></span>
          <div className="alert-text">
            <strong>You have {overdueBorrows.length} overdue book{overdueBorrows.length > 1 ? 's' : ''}!</strong>
            <p>Please return them to avoid additional fines. Fine: ₹5 per day per book.</p>
          </div>
          <Link to="/my-borrows" className="btn btn-danger btn-sm" style={{ marginLeft: 'auto', flexShrink: 0 }}>
            View Now
          </Link>
        </div>
      )}

      {/* Fine Alert */}
      {stats?.finesDue > 0 && (
        <div className="fine-card" style={{ marginBottom: 20 }}>
          <span className="fine-icon"><Icon src={ICONS.money} alt="Fine" size={22} /></span>
          <div className="fine-text">
            <strong>Outstanding Fine</strong>
            <p>Please pay your pending fine at the library counter</p>
          </div>
          <div className="fine-amount">₹{stats.finesDue}</div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Icon src={ICONS.book} alt="Borrowed" size={22} /></div>
          <div>
            <div className="stat-value">{activeBorrows.length}</div>
            <div className="stat-label">Currently Borrowed</div>
            <div className="stat-change" style={{ color: '#64748b' }}>Max 5 books</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Icon src={ICONS.check} alt="Done" size={22} /></div>
          <div>
            <div className="stat-value">{stats?.totalBorrows || 0}</div>
            <div className="stat-label">Total Borrows Ever</div>
            <div className="stat-change positive">All time</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><Icon src={ICONS.warning} alt="Overdue" size={22} /></div>
          <div>
            <div className="stat-value">{overdueBorrows.length}</div>
            <div className="stat-label">Overdue Books</div>
            {overdueBorrows.length > 0
              ? <div className="stat-change negative">Action needed!</div>
              : <div className="stat-change positive"><Icon src={ICONS.check} alt="" size={14} style={{ marginRight: 4 }} />All clear</div>}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Icon src={ICONS.money} alt="Fines" size={22} /></div>
          <div>
            <div className="stat-value">₹{stats?.finesDue || 0}</div>
            <div className="stat-label">Outstanding Fines</div>
            {stats?.finesDue > 0
              ? <div className="stat-change negative">Pay at counter</div>
              : <div className="stat-change positive"><Icon src={ICONS.check} alt="" size={14} style={{ marginRight: 4 }} />No dues</div>}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Active Borrows */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Icon src={ICONS.book} alt="" size={16} style={{ marginRight: 6 }} /> Currently Borrowed</div>
            <Link to="/my-borrows" style={{ fontSize: '0.82rem', color: '#1a56db', textDecoration: 'none', fontWeight: 600 }}>
              View All →
            </Link>
          </div>
          <div className="card-body" style={{ padding: '16px 20px' }}>
            {activeBorrows.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 20px' }}>
                <div className="empty-state-icon"><Icon src={ICONS.books} alt="Books" size={38} /></div>
                <h3>No books borrowed</h3>
                <p>Browse our catalog to find your next great read!</p>
                <Link to="/books" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                  Browse Books
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activeBorrows.slice(0, 3).map(borrow => {
                  const dueDate = new Date(borrow.dueDate);
                  const today = new Date();
                  const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                  const isOverdue = daysLeft < 0;
                  const isUrgent = daysLeft <= 3 && daysLeft >= 0;
                  return (
                    <div key={borrow._id} className="borrow-card" style={{ padding: '14px 16px' }}>
                      <div className="borrow-book-cover">
                        {borrow.book?.coverImage
                          ? <img src={borrow.book.coverImage.startsWith('http') ? borrow.book.coverImage : `http://localhost:5000${borrow.book.coverImage}`} alt={borrow.book.title} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x220?text=No+Cover'; }} />
                          : <Icon src={ICONS.book} alt="Cover" size={30} />}
                      </div>
                      <div className="borrow-details">
                        <div className="borrow-book-title" style={{ fontSize: '0.875rem' }}>
                          {borrow.book?.title}
                        </div>
                        <div className="borrow-book-author">{borrow.book?.author}</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span className={`badge ${isOverdue ? 'badge-red' : isUrgent ? 'badge-yellow' : 'badge-blue'}`}>
                          {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                          </span>
                        </div>
                        <div className="borrow-actions">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleReturn(borrow._id)}
                          >Return</button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleRenew(borrow._id)}
                          ><Icon src={ICONS.refresh} alt="Renew" size={13} style={{ marginRight: 4 }} />Renew</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="profile-card">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-name">{user?.name}</div>
            <div style={{ color: '#64748b', fontSize: '0.82rem', margin: '4px 0 8px' }}>{user?.email}</div>
            <span className="profile-role">{user?.role}</span>
            {user?.membershipId && (
              <div style={{ marginTop: 10, fontSize: '0.78rem', color: '#94a3b8' }}>
                <Icon src={ICONS.id} alt="ID" size={14} style={{ marginRight: 4 }} /> {user.membershipId}
              </div>
            )}
            <div className="profile-stats">
              <div className="profile-stat">
                <div className="val">{activeBorrows.length}</div>
                <div className="lbl">Active</div>
              </div>
              <div className="profile-stat">
                <div className="val">{stats?.totalBorrows || 0}</div>
                <div className="lbl">Total</div>
              </div>
              <div className="profile-stat">
                <div className="val">{overdueBorrows.length}</div>
                <div className="lbl">Overdue</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><Icon src={ICONS.lightning} alt="" size={16} style={{ marginRight: 6 }} /> Quick Actions</div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/books" className="btn btn-primary" style={{ justifyContent: 'flex-start', gap: 10 }}>
                <Icon src={ICONS.search} alt="" size={16} /> Search Book Catalog
              </Link>
              <Link to="/my-borrows" className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 10 }}>
                <Icon src={ICONS.book} alt="" size={16} /> View All My Borrows
              </Link>
              <Link to="/books?availability=available" className="btn btn-outline" style={{ justifyContent: 'flex-start', gap: 10 }}>
                <Icon src={ICONS.check} alt="" size={16} /> Available Books Only
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Member info */}
      <div style={{ marginTop: 24, padding: '14px 20px', background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20 }}><Icon src={ICONS.info} alt="Info" size={20} /></span>
        <div style={{ fontSize: '0.82rem', color: '#1e40af' }}>
          <strong>Library Rules:</strong> Max 5 books at a time · 14-day borrow period · Renew up to 2 times · ₹5/day fine for overdue books
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#3b82f6', fontWeight: 600 }}>
          Member since {stats?.memberSince ? new Date(stats.memberSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'}
        </div>
      </div>
    </div>
  );
}
