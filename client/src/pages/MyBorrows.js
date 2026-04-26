import React, { useState, useEffect, useCallback } from 'react';
import { borrowsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Icon = ({ src, alt = '', size = 18, style = {} }) => {
  if (src && src.startsWith('http')) {
    return <img src={src} alt={alt} width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle', ...style }} />
  }
  return <i className={`fi ${src}`} style={{ fontSize: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, ...style }} title={alt}></i>
};

const ICONS = {
  book:    'fi-rr-book-alt',
  books:   'fi-rr-books',
  warning: 'fi-rr-triangle-warning',
  check:   'fi-rr-check-circle',
  close:   'fi-rr-cross',
  star:    'fi-sr-star',
  list:    'fi-rr-list',
  refresh: 'fi-rr-refresh',
  money:   'fi-rr-coins',
  calendar:'fi-rr-calendar',
  clock:   'fi-rr-time-fast',
};

const BOOK_ICONS = { 
  Fiction: 'fi-rr-book-alt', 'Non-Fiction': 'fi-rr-books', Science: 'fi-rr-microscope', Technology: 'fi-rr-laptop',
  History: 'fi-rr-time-past', Biography: 'fi-rr-user', 'Self-Help': 'fi-rr-bulb', Business: 'fi-rr-briefcase', Other: 'fi-rr-books' 
};

export default function MyBorrows() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [actionLoading, setActionLoading] = useState({});
  const [renewModal, setRenewModal] = useState(null);
  const [renewalDays, setRenewalDays] = useState(14);
  const [returnModal, setReturnModal] = useState(null);
  const [returnRating, setReturnRating] = useState(5);
  const [returnComment, setReturnComment] = useState('');

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

  const handleReturnClick = (borrowId) => {
    setReturnModal(borrowId);
    setReturnRating(5);
    setReturnComment('');
  };

  const handleReturnConfirm = async (borrowId, skipReview = false) => {
    setActionLoading(a => ({ ...a, [borrowId]: 'return' }));
    try {
      const payload = skipReview ? {} : { rating: returnRating, comment: returnComment };
      const res = await borrowsAPI.return(borrowId, payload);
      toast.success(`Returned! ${res.data.fine > 0 ? `Fine incurred: ₹${res.data.fine}` : 'No fine.'}`);
      if (res.data.reviewAdded) toast.success('Thank you for your review!');
      setReturnModal(null);
      fetchBorrows();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return');
    } finally { setActionLoading(a => ({ ...a, [borrowId]: null })); }
  };

  const handleRenew = async (borrowId) => {
    setActionLoading(a => ({ ...a, [borrowId]: 'renew' }));
    try {
      await borrowsAPI.renew(borrowId, renewalDays);
      toast.success(`Renewed for ${renewalDays} more days!`);
      setRenewModal(null);
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
                      ? <img src={borrow.book.coverImage.startsWith('http') ? borrow.book.coverImage : `http://localhost:5000${borrow.book.coverImage}`} alt={borrow.book.title} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x220?text=No+Cover'; }} />
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
                        <Icon src={ICONS.check} alt="" size={13} style={{ marginRight: 4 }} />Returned: <strong>{new Date(borrow.returnDate).toLocaleDateString('en-IN')}</strong>
                      </span>
                    )}
                    {borrow.renewCount > 0 && (
                      <span className="badge badge-gray"><Icon src={ICONS.refresh} alt="" size={12} style={{ marginRight: 4 }} />Renewed {borrow.renewCount}x</span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginTop: 10, fontSize: '0.82rem', color: '#475569' }}>
                    {borrow.book?.publisher && (
                      <div><strong>Publisher:</strong> {borrow.book.publisher}</div>
                    )}
                    <div><strong>Copies:</strong> {borrow.book?.availableCopies ?? 0}/{borrow.book?.totalCopies ?? 0}</div>
                  </div>

                  {/* Fine */}
                  {borrow.fine > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, padding: '8px 12px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
                      <span><Icon src={ICONS.money} alt="" size={14} style={{ marginRight: 4 }} /></span>
                      <span style={{ fontSize: '0.82rem', color: '#92400e' }}>
                        <Icon src={ICONS.money} alt="" size={14} style={{ marginRight: 4 }} />Fine: <strong>₹{borrow.fine}</strong>
                        {borrow.finePaid ? <span style={{ color: '#15803d', marginLeft: 6 }}><Icon src={ICONS.check} alt="" size={13} style={{ marginRight: 2 }} />Paid</span> : ''}
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
                        onClick={() => handleReturnClick(borrow._id)}
                        disabled={!!actionLoading[borrow._id]}
                      >
                        {actionLoading[borrow._id] === 'return' ? '...' : ''}  Return Book
                      </button>
                      {borrow.renewCount < 2 && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setRenewModal(borrow._id);
                            setRenewalDays(14);
                          }}
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

      {/* Renewal Modal */}
      {renewModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setRenewModal(null); }}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title"><Icon src={ICONS.refresh} alt="" size={18} style={{ marginRight: 6 }} />Renew Book</div>
              <button className="modal-close" onClick={() => setRenewModal(null)}><Icon src={ICONS.close} alt="" size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#64748b', marginBottom: 16 }}>Select how long you'd like to renew this book for:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 10, marginBottom: 20 }}>
                {[7, 14, 21, 30].map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setRenewalDays(days)}
                    style={{
                      padding: '12px 16px',
                      border: renewalDays === days ? '2px solid #1a56db' : '1px solid #cbd5e1',
                      background: renewalDays === days ? '#dbeafe' : 'white',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: renewalDays === days ? '#1a56db' : '#475569',
                      transition: 'all 0.2s'
                    }}
                  >
                    {days} days
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-primary btn-full"
                  onClick={() => handleRenew(renewModal)}
                  disabled={actionLoading[renewModal] === 'renew'}
                >
                  {actionLoading[renewModal] === 'renew' ? 'Processing...' : 'Confirm Renewal'}
                </button>
                <button
                  className="btn btn-outline btn-full"
                  onClick={() => setRenewModal(null)}
                  disabled={actionLoading[renewModal] === 'renew'}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {returnModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setReturnModal(null); }}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title"><Icon src={ICONS.check} alt="" size={18} style={{ marginRight: 6 }} />Return & Review</div>
              <button className="modal-close" onClick={() => setReturnModal(null)}><Icon src={ICONS.close} alt="" size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#64748b', marginBottom: 16 }}>Please rate your reading experience before returning the book.</p>
              <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReturnRating(star)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      border: returnRating === star ? '2px solid #1a56db' : '1px solid #cbd5e1',
                      background: returnRating === star ? '#dbeafe' : '#f8fafc',
                      color: '#0f172a',
                      cursor: 'pointer',
                      fontSize: 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon src={ICONS.star} alt="" size={24} style={{ filter: returnRating === star ? 'none' : 'grayscale(1) opacity(0.3)' }} />
                  </button>
                ))}
              </div>
              <textarea
                className="form-input form-textarea"
                placeholder="Add an optional comment..."
                value={returnComment}
                onChange={e => setReturnComment(e.target.value)}
                style={{ marginBottom: 16 }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-primary btn-full"
                  onClick={() => handleReturnConfirm(returnModal)}
                  disabled={actionLoading[returnModal] === 'return'}
                >
                  {actionLoading[returnModal] === 'return' ? 'Processing...' : 'Return Book & Submit Review'}
                </button>
                <button
                  className="btn btn-outline btn-full"
                  onClick={() => handleReturnConfirm(returnModal, true)}
                  disabled={actionLoading[returnModal] === 'return'}
                >
                  Skip Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
