import React, { useState, useEffect, useCallback } from 'react';
import { borrowsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Icon = ({ src, alt = '', size = 18, style = {} }) => (
  <img src={src} alt={alt} width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle', ...style }} />
);

const ICONS = {
  book:    'https://cdn-icons-png.flaticon.com/512/2991/2991112.png',
  warning: 'https://cdn-icons-png.flaticon.com/512/2797/2797387.png',
  check:   'https://cdn-icons-png.flaticon.com/512/5290/5290058.png',
  list:    'https://cdn-icons-png.flaticon.com/512/3480/3480292.png',
  refresh: 'https://cdn-icons-png.flaticon.com/512/2965/2965395.png',
  borrows: 'https://cdn-icons-png.flaticon.com/512/2965/2965395.png',
  money:   'https://cdn-icons-png.flaticon.com/512/2460/2460396.png',
};

export default function AdminBorrows() {
  const [borrows, setBorrows] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState({});

  const fetchBorrows = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await borrowsAPI.getAll(params);
      setBorrows(res.data.borrows);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load borrows'); }
    finally { setLoading(false); }
  }, [statusFilter, page]);

  useEffect(() => { fetchBorrows(); }, [fetchBorrows]);

  const handleReturn = async (borrowId) => {
    setActionLoading(a => ({ ...a, [borrowId]: 'return' }));
    try {
      const res = await borrowsAPI.return(borrowId);
      toast.success(`Book returned! Fine: ₹${res.data.fine || 0}`);
      fetchBorrows();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return');
    } finally { setActionLoading(a => ({ ...a, [borrowId]: null })); }
  };

  const handlePayFine = async (borrowId) => {
    setActionLoading(a => ({ ...a, [borrowId]: 'pay' }));
    try {
      await borrowsAPI.payFine(borrowId);
      toast.success('Fine marked as paid');
      fetchBorrows();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to pay fine');
    } finally { setActionLoading(a => ({ ...a, [borrowId]: null })); }
  };

  const tabs = [
    { key: '', label: 'All' },
    { key: 'borrowed', label: 'Active' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'returned', label: 'Returned' },
  ];

  const overdueCount = borrows.filter(b => b.status === 'overdue').length;

  return (
    <div>
      {/* Toolbar */}
      <div className="admin-toolbar">
        <span className="admin-toolbar-title">
          {pagination.total > 0 ? `${pagination.total} records` : 'All borrow records'}
        </span>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>

        <div className="stat-card">
          <div className="stat-icon blue"><Icon src={ICONS.book} alt="" size={22} /></div>
          <div>
            <div className="stat-value">{pagination.total || 0}</div>
            <div className="stat-label">Total Records</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><Icon src={ICONS.warning} alt="" size={22} /></div>
          <div>
            <div className="stat-value">{overdueCount}</div>
            <div className="stat-label">Overdue (this page)</div>
            {overdueCount > 0 && <div className="stat-change negative">Needs action</div>}
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${statusFilter === tab.key ? 'active' : ''}`}
            onClick={() => { setStatusFilter(tab.key); setPage(1); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><Icon src={ICONS.borrows} alt="" size={16} style={{ marginRight: 6 }} />Borrow Records</div>
          <button className="btn btn-secondary btn-sm" onClick={fetchBorrows}><Icon src={ICONS.refresh} alt="Refresh" size={14} style={{ marginRight: 4 }} />Refresh</button>
        </div>
        <div className="table-container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
          ) : borrows.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon"><Icon src={ICONS.list} alt="" size={38} /></div><h3>No records found</h3></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Book</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Fine</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrows.map(borrow => {
                  const dueDate = new Date(borrow.dueDate);
                  const today = new Date();
                  const isOverdue = borrow.status === 'overdue';
                  const isReturned = borrow.status === 'returned';
                  const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

                  return (
                    <tr key={borrow._id} style={{ background: isOverdue ? '#fef2f2' : 'inherit' }}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{borrow.user?.name || 'Unknown'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{borrow.user?.membershipId || borrow.user?.email}</div>
                        </div>
                      </td>
                      <td>
                        <div style={{ maxWidth: 180 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {borrow.book?.title || 'Unknown'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{borrow.book?.author}</div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {new Date(borrow.borrowDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: isOverdue ? '#dc2626' : '#64748b', fontWeight: isOverdue ? 700 : 400 }}>
                        {dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                        {!isReturned && (
                          <div style={{ fontSize: '0.72rem', color: isOverdue ? '#dc2626' : daysLeft <= 3 ? '#d97706' : '#10b981' }}>
                            {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {borrow.returnDate
                          ? new Date(borrow.returnDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
                          : '—'}
                      </td>
                      <td>
                        <span className={`badge ${
                          borrow.status === 'returned' ? 'badge-green' :
                          borrow.status === 'overdue' ? 'badge-red' : 'badge-blue'
                        }`}>
                        {borrow.status === 'returned' ? <Icon src={ICONS.check} alt="" size={14} /> : borrow.status === 'overdue' ? <Icon src={ICONS.warning} alt="" size={14} /> : <Icon src={ICONS.book} alt="" size={14} />} {borrow.status}
                        </span>
                      </td>
                      <td>
                        {borrow.fine > 0 ? (
                          <div>
                            <span className={`badge ${borrow.finePaid ? 'badge-green' : 'badge-yellow'}`}>
                              ₹{borrow.fine} {borrow.finePaid ? '✓ paid' : 'unpaid'}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {!isReturned && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleReturn(borrow._id)}
                              disabled={!!actionLoading[borrow._id]}
                            >
                              {actionLoading[borrow._id] === 'return' ? '...' : 'Return'}
                            </button>
                          )}
                          {borrow.fine > 0 && !borrow.finePaid && isReturned && (
                            <button
                              className="btn btn-sm"
                              style={{ background: '#f59e0b', color: 'white', border: 'none' }}
                              onClick={() => handlePayFine(borrow._id)}
                              disabled={!!actionLoading[borrow._id]}
                            >
                              {actionLoading[borrow._id] === 'pay' ? '...' : <Icon src={ICONS.money} alt="" size={14} style={{ marginRight: 4 }} />} Pay Fine
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {pagination.pages > 1 && (
          <div className="pagination" style={{ padding: '16px 0' }}>
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => (
              <button key={i + 1} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}
