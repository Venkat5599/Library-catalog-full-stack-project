import React, { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Icon = ({ src, alt = '', size = 18, style = {} }) => (
  <img src={src} alt={alt} width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle', ...style }} />
);

const ICONS = {
  search:   'https://cdn-icons-png.flaticon.com/512/622/622669.png',
  members:  'https://cdn-icons-png.flaticon.com/512/681/681494.png',
  view:     'https://cdn-icons-png.flaticon.com/512/159/159604.png',
  lock:     'https://cdn-icons-png.flaticon.com/512/3064/3064197.png',
  unlock:   'https://cdn-icons-png.flaticon.com/512/483/483408.png',
  id:       'https://cdn-icons-png.flaticon.com/512/1077/1077114.png',
  book:     'https://cdn-icons-png.flaticon.com/512/2991/2991112.png',
  chart:    'https://cdn-icons-png.flaticon.com/512/1828/1828791.png',
  money:    'https://cdn-icons-png.flaticon.com/512/2460/2460396.png',
  phone:    'https://cdn-icons-png.flaticon.com/512/0/191.png',
  calendar: 'https://cdn-icons-png.flaticon.com/512/747/747310.png',
  user:     'https://cdn-icons-png.flaticon.com/512/1077/1077063.png',
  close:    'https://cdn-icons-png.flaticon.com/512/1828/1828774.png',
  check:    'https://cdn-icons-png.flaticon.com/512/3143/3143615.png',
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll({ search, page, limit: 15 });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async (userId) => {
    setActionLoading(a => ({ ...a, [userId]: true }));
    try {
      const res = await usersAPI.toggleStatus(userId);
      toast.success(res.data.message);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally { setActionLoading(a => ({ ...a, [userId]: false })); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersAPI.delete(userId);
      toast.success('User deleted');
      fetchUsers();
      setSelectedUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div>
      {/* Toolbar — count label left, no extra button */}
      <div className="admin-toolbar">
        <span className="admin-toolbar-title">
          {pagination.total > 0 ? `${pagination.total} members` : 'All members'}
        </span>
      </div>

      {/* Search */}
      <div className="search-filters" style={{ marginBottom: 20 }}>
        <div className="search-box" style={{ flex: 1 }}>
          <span className="search-icon"><Icon src={ICONS.search} alt="Search" size={18} /></span>
          <input
            className="form-input"
            style={{ paddingLeft: 44 }}
            placeholder="Search by name, email, or membership ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        {search && (
          <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setPage(1); }}><Icon src={ICONS.close} alt="" size={14} style={{ marginRight: 4 }} /> Clear</button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><Icon src={ICONS.members} alt="" size={16} style={{ marginRight: 6 }} />Library Members ({pagination.total || 0})</div>
        </div>


        <div className="table-container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
          ) : users.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon"><Icon src={ICONS.members} alt="" size={38} /></div><h3>No members found</h3></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Membership ID</th>
                  <th>Current Borrows</th>
                  <th>Total Borrows</th>
                  <th>Fines Due</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0
                        }}>
                          {initials(user.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b' }}>
                      {user.membershipId || '—'}
                    </td>
                    <td>
                      <span className={`badge ${user.currentBorrows > 0 ? 'badge-blue' : 'badge-gray'}`}>
                        {user.currentBorrows}/5
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{user.totalBorrows}</td>
                    <td>
                      {user.finesDue > 0
                        ? <span className="badge badge-red">₹{user.finesDue}</span>
                        : <span className="badge badge-green">₹0</span>}
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-green' : 'badge-red'}`}>
                        {user.isActive ? <><Icon src={ICONS.check} alt="" size={13} style={{ marginRight: 4 }} />Active</> : <><Icon src={ICONS.close} alt="" size={13} style={{ marginRight: 4 }} />Inactive</>}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedUser(user)}
                        ><Icon src={ICONS.view} alt="View" size={14} /></button>
                        <button
                          className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggleStatus(user._id)}
                          disabled={actionLoading[user._id]}
                        >
                          {actionLoading[user._id] ? '...' : user.isActive ? <Icon src={ICONS.lock} alt="Lock" size={14} /> : <Icon src={ICONS.unlock} alt="Unlock" size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* User detail modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedUser(null); }}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title"><Icon src={ICONS.user} alt="" size={16} style={{ marginRight: 6 }} />Member Details</div>
              <button className="modal-close" onClick={() => setSelectedUser(null)}><Icon src={ICONS.close} alt="" size={16} /></button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{
                  width: 70, height: 70, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: '1.5rem', margin: '0 auto 12px'
                }}>
                  {initials(selectedUser.name)}
                </div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>{selectedUser.name}</div>
                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{selectedUser.email}</div>
                <div style={{ marginTop: 8 }}>
                  <span className={`badge ${selectedUser.isActive ? 'badge-green' : 'badge-red'}`}>
                    {selectedUser.isActive ? <><Icon src={ICONS.check} alt="" size={14} style={{ marginRight: 4 }} />Active Member</> : <><Icon src={ICONS.close} alt="" size={14} style={{ marginRight: 4 }} />Inactive</>}
                  </span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Membership ID', value: selectedUser.membershipId || '—', iconKey: 'id' },
                  { label: 'Current Borrows', value: `${selectedUser.currentBorrows}/5`, iconKey: 'book' },
                  { label: 'Total Borrows', value: selectedUser.totalBorrows, iconKey: 'chart' },
                  { label: 'Fines Due', value: `₹${selectedUser.finesDue}`, iconKey: 'money' },
                  { label: 'Phone', value: selectedUser.phone || 'Not provided', iconKey: 'phone' },
                  { label: 'Joined', value: new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), iconKey: 'calendar' },
                ].map(item => (
                  <div key={item.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 2 }}><Icon src={ICONS[item.iconKey]} alt="" size={12} style={{ marginRight: 4 }} />{item.label}</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className={`btn ${selectedUser.isActive ? 'btn-danger' : 'btn-success'}`}
                onClick={() => { handleToggleStatus(selectedUser._id); setSelectedUser(null); }}
              >
                {selectedUser.isActive ? <><Icon src={ICONS.lock} alt="" size={14} style={{ marginRight: 6 }} />Deactivate Account</> : <><Icon src={ICONS.unlock} alt="" size={14} style={{ marginRight: 6 }} />Activate Account</>}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setSelectedUser(null)}
              >Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
