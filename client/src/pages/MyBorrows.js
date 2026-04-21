import React, { useState, useEffect, useCallback } from 'react';
import { borrowsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Icon = ({ src, alt = '', size = 18, style = {} }) => (
  <img src={src} alt={alt} width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle', ...style }} />
);

const ICONS = {
  book:    'https://cdn-icons-png.flaticon.com/512/2991/2991112.png',
  books:   'https://cdn-icons-png.flaticon.com/512/2232/2232688.png',
  warning: 'https://cdn-icons-png.flaticon.com/512/2797/2797387.png',
  check:   'https://cdn-icons-png.flaticon.com/512/5290/5290058.png',
  list:    'https://cdn-icons-png.flaticon.com/512/3480/3480292.png',
  refresh: 'https://cdn-icons-png.flaticon.com/512/2965/2965395.png',
  money:   'https://cdn-icons-png.flaticon.com/512/2460/2460396.png',
  calendar:'https://cdn-icons-png.flaticon.com/512/747/747310.png',
  clock:   'https://cdn-icons-png.flaticon.com/512/2784/2784459.png',
};

const BOOK_ICONS = { Fiction: 'https://cdn-icons-png.flaticon.com/512/2991/2991112.png', 'Non-Fiction': 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png', Science: 'https://cdn-icons-png.flaticon.com/512/2103/2103651.png', Technology: 'https://cdn-icons-png.flaticon.com/512/3281/3281289.png',
  History: 'https://cdn-icons-png.flaticon.com/512/854/854874.png', Biography: 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png', 'Self-Help': 'https://cdn-icons-png.flaticon.com/512/3588/3588295.png', Business: 'https://cdn-icons-png.flaticon.com/512/2942/2942909.png', Other: 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png' };

export default function MyBorrows() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [actionLoading, setActionLoading] = useState({});

  const fetchBorrows = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const res = await borrowsAPI.getMyBorrows(params);
      setBorrows(res.data);
    } catch { toast.error('Failed to load borrows'); }
    finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { fetchBorrows(); }, [fetchBorrows]);

  const handleReturn = async (borrowId) => {
    setActionLoading(a => ({ ...a, [borrowId]: 'return' }));
    try {
      const res = await borrowsAPI.return(borrowId);
      toast.success(`Returned! ${res.data.fine > 0 ? `Fine incurred: ₹${res.data.fine}` : 'No fine.'}`);
      fetchBorrows();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return');
    } finally { setActionLoading(a => ({ ...a, [borrowId]: null })); }
  };

  const handleRenew = async (borrowId) => {
    setActionLoading(a => ({ ...a, [borrowId]: 'renew' }));
    try {
      await borrowsAPI.renew(borrowId);
      toast.success('Renewed for 14 more days!');
      fetchBorrows();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to renew');
    } finally { setActionLoading(a => ({ ...a, [borrowId]: null })); }
  };

  const handlePayFine = async (borrowId) => {
    setActionLoading(a => ({ ...a, [borrowId]: 'pay' }));
    try {
      await borrowsAPI.payFine(borrowId);
      toast.success('Fine marked as paid!');
      fetchBorrows();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to pay fine');
    } finally { setActionLoading(a => ({ ...a, [borrowId]: null })); }
  };

  const tabs = [
    { key: 'all', label: 'All', count: borrows.length },
    { key: 'borrowed', label: 'Active', count: borrows.filter(b => b.status === 'borrowed').length },
    { key: 'overdue', label: 'Overdue', count: borrows.filter(b => b.status === 'overdue').length },
    { key: 'returned', label: 'Returned', count: borrows.filter(b => b.status === 'returned').length },
  ];

  const overdueBorrows = borrows.filter(b => b.status === 'overdue');

  return (
    <div>
      {/* Overdue alert */}
      {overdueBorrows.length > 0 && (
        <div className="overdue-alert" style={{ marginBottom: 24 }}>
          <span className="alert-icon"><Icon src={ICONS.warning} alt="Alert" size={22} /></span>
          <div className="alert-text">
            <strong>{overdueBorrows.length} Overdue Book{overdueBorrows.length > 1 ? 's' : ''}</strong>
            <p>Fine: ₹{overdueBorrows.reduce((sum, b) => sum + (b.fine || 0), 0)} total. Please return as soon as possible.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                marginLeft: 6, background: activeTab === tab.key ? '#1a56db' : '#e2e8f0',
                color: activeTab === tab.key ? 'white' : '#64748b',
                padding: '1px 7px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700
              }}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : borrows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Icon src={ICONS.books} alt="Books" size={38} /></div>
          <h3>No {activeTab !== 'all' ? activeTab : ''} borrows</h3>
          <p>Your borrowing history will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {borrows.map(borrow => {
            const dueDate = new Date(borrow.dueDate);
            const today = new Date();
            const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            const isOverdue = borrow.status === 'overdue';
            const isReturned = borrow.status === 'returned';
            const isUrgent = !isOverdue && !isReturned && daysLeft <= 3;

            return (
              <div key={borrow._id} className="borrow-card">
                <div className="borrow-book-cover">
                    {borrow.book?.coverImage
                      ? <img src={`http://localhost:5000${borrow.book.coverImage}`} alt={borrow.book.title} />
                      : <Icon src={BOOK_ICONS[borrow.book?.category] || ICONS.books} alt="cover" size={30} />}
                </div>
                <div className="borrow-details" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div className="borrow-book-title">{borrow.book?.title}</div>
                      <div className="borrow-book-author">by {borrow.book?.author}</div>
                    </div>
                    <span className={`badge ${isOverdue ? 'badge-red' : isReturned ? 'badge-green' : isUrgent ? 'badge-yellow' : 'badge-blue'}`}>
                      {isOverdue ? 'Overdue' : isReturned ? 'Returned' : 'Active'}
                    </span>
                  </div>
                  <div className="borrow-meta">
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        <Icon src={ICONS.calendar} alt="" size={13} style={{ marginRight: 4 }} />Borrowed: <strong>{new Date(borrow.borrowDate).toLocaleDateString('en-IN')}</strong>
                      </span>
                      <span style={{ fontSize: '0.8rem', color: isOverdue ? '#dc2626' : '#64748b' }}>
                        <Icon src={ICONS.clock} alt="" size={13} style={{ marginRight: 4 }} />Due: <strong>{dueDate.toLocaleDateString('en-IN')}</strong>
                      </span>
                    {!isReturned && (
                      <span style={{ fontSize: '0.8rem', color: isOverdue ? '#dc2626' : isUrgent ? '#d97706' : '#10b981', fontWeight: 600 }}>
                        {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d remaining`}
                      </span>
                    )}
                    {isReturned && borrow.returnDate && (
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        ✓ Returned: <strong>{new Date(borrow.returnDate).toLocaleDateString('en-IN')}</strong>
                      </span>
                    )}
                    {borrow.renewCount > 0 && (
                      <span className="badge badge-gray"><Icon src={ICONS.refresh} alt="" size={12} style={{ marginRight: 4 }} />Renewed {borrow.renewCount}x</span>
                    )}
                  </div>

                  {/* Fine */}
                  {borrow.fine > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, padding: '8px 12px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
                      <span><Icon src={ICONS.money} alt="" size={14} style={{ marginRight: 4 }} /></span>
                      <span style={{ fontSize: '0.82rem', color: '#92400e' }}>
                        Fine: <strong>₹{borrow.fine}</strong>
                        {borrow.finePaid ? <span style={{ color: '#15803d', marginLeft: 6 }}>✓ Paid</span> : ''}
                      </span>
                      {!borrow.finePaid && isReturned && (
                        <button
                          className="btn btn-sm"
                          style={{ background: '#f59e0b', color: 'white', marginLeft: 'auto' }}
                          onClick={() => handlePayFine(borrow._id)}
                          disabled={actionLoading[borrow._id] === 'pay'}
                        >
                          {actionLoading[borrow._id] === 'pay' ? '...' : 'Mark Paid'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {!isReturned && (
                    <div className="borrow-actions">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleReturn(borrow._id)}
                        disabled={!!actionLoading[borrow._id]}
                      >
                        {actionLoading[borrow._id] === 'return' ? '...' : ''}  Return Book
                      </button>
                      {borrow.renewCount < 2 && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleRenew(borrow._id)}
                          disabled={!!actionLoading[borrow._id]}
                        >
                          {actionLoading[borrow._id] === 'renew' ? '...' : <Icon src={ICONS.refresh} alt="" size={14} style={{ marginRight: 4 }} />} Renew ({2 - borrow.renewCount} left)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
