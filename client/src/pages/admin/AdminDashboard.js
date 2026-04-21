import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

const Icon = ({ src, alt = '', size = 20, style = {} }) => (
  <img src={src} alt={alt} width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle', ...style }} />
);

const ICONS = {
  books:    'https://cdn-icons-png.flaticon.com/512/2232/2232688.png',
  members:  'https://cdn-icons-png.flaticon.com/512/681/681494.png',
  borrows:  'https://cdn-icons-png.flaticon.com/512/2965/2965395.png',
  warning:  'https://cdn-icons-png.flaticon.com/512/2797/2797387.png',
  check:    'https://cdn-icons-png.flaticon.com/512/5290/5290058.png',
  chart:    'https://cdn-icons-png.flaticon.com/512/1828/1828791.png',
  category: 'https://cdn-icons-png.flaticon.com/512/3480/3480292.png',
  trophy:   'https://cdn-icons-png.flaticon.com/512/2917/2917995.png',
  activity: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png',
  book:     'https://cdn-icons-png.flaticon.com/512/2991/2991112.png',
  overview: 'https://cdn-icons-png.flaticon.com/512/1828/1828791.png',
};
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#1a56db','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getAdminStats()
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div className="spinner" />
    </div>
  );

  const { stats, monthlyTrend = [], categoryStats = [], topBooks = [], recentBorrows = [] } = data || {};

  const monthlyChartData = {
    labels: monthlyTrend.map(m => MONTH_NAMES[m._id.month - 1] + ' ' + m._id.year),
    datasets: [{
      label: 'Books Borrowed',
      data: monthlyTrend.map(m => m.count),
      backgroundColor: 'rgba(26,86,219,0.15)',
      borderColor: '#1a56db',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#1a56db',
      pointRadius: 4,
    }]
  };

  const categoryChartData = {
    labels: categoryStats.slice(0, 8).map(c => c._id),
    datasets: [{
      data: categoryStats.slice(0, 8).map(c => c.count),
      backgroundColor: COLORS,
      borderWidth: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y || ctx.parsed} items` } } },
    scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 11 } } }, x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } } }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { font: { size: 11 }, padding: 12, color: '#64748b' } },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed} books` } }
    }
  };

  return (
    <div>
      {/* Welcome banner */}
      <div className="welcome-banner" style={{ marginBottom: 24 }}>
        <div className="welcome-text">
          <h2><Icon src={ICONS.overview} alt="Overview" size={22} style={{ marginRight: 8 }} />Library Overview</h2>
          <p>Here's what's happening in your library today</p>
        </div>
        <div className="admin-time-pill" style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 20px', border: '1px solid rgba(255,255,255,0.25)', flexShrink: 0 }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)', marginBottom: 2 }}>Last updated</div>
          <div style={{ fontWeight: 700, color: 'white' }}>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Icon src={ICONS.books} alt="Books" size={22} /></div>
          <div>
            <div className="stat-value">{stats?.totalBooks || 0}</div>
            <div className="stat-label">Total Books</div>
            <div className="stat-change" style={{ color: '#64748b' }}>{stats?.totalCopies || 0} copies total</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Icon src={ICONS.members} alt="Members" size={22} /></div>
          <div>
            <div className="stat-value">{stats?.totalUsers || 0}</div>
            <div className="stat-label">Total Members</div>
            <div className="stat-change positive">Registered members</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Icon src={ICONS.borrows} alt="Borrows" size={22} /></div>
          <div>
            <div className="stat-value">{stats?.activeBorrows || 0}</div>
            <div className="stat-label">Active Borrows</div>
            <div className="stat-change" style={{ color: '#64748b' }}>{stats?.totalBorrows || 0} all time</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><Icon src={ICONS.warning} alt="Overdue" size={22} /></div>
          <div>
            <div className="stat-value">{stats?.overdueBorrows || 0}</div>
            <div className="stat-label">Overdue Books</div>
            {stats?.overdueBorrows > 0
              ? <div className="stat-change negative">Needs attention!</div>
              : <div className="stat-change positive">All on time ✓</div>}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Icon src={ICONS.check} alt="Available" size={22} /></div>
          <div>
            <div className="stat-value">{stats?.availableCopies || 0}</div>
            <div className="stat-label">Available Copies</div>
            <div className="stat-change" style={{ color: '#64748b' }}>of {stats?.totalCopies || 0} total</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Icon src={ICONS.chart} alt="" size={16} style={{ marginRight: 6 }} />Monthly Borrow Trend</div>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Last 6 months</span>
          </div>
          <div className="card-body">
            <div className="chart-container">
              {monthlyTrend.length > 0
                ? <Line data={monthlyChartData} options={chartOptions} />
                : <div className="empty-state" style={{ padding: 30 }}><p>No borrow data yet</p></div>}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><Icon src={ICONS.category} alt="" size={16} style={{ marginRight: 6 }} />Books by Category</div>
          </div>
          <div className="card-body">
            <div className="chart-container">
              {categoryStats.length > 0
                ? <Doughnut data={categoryChartData} options={doughnutOptions} />
                : <div className="empty-state" style={{ padding: 30 }}><p>No category data yet</p></div>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Top books */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Icon src={ICONS.trophy} alt="" size={16} style={{ marginRight: 6 }} />Top Borrowed Books</div>
          </div>
          <div className="card-body" style={{ padding: '12px 20px' }}>
            {topBooks.length === 0 ? (
              <div className="empty-state" style={{ padding: 30 }}><p>No borrow data yet</p></div>
            ) : topBooks.map((book, i) => (
              <div key={book._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < topBooks.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: i === 0 ? '#fef9c3' : i === 1 ? '#f1f5f9' : i === 2 ? '#fff7ed' : '#f8fafc',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 800,
                  color: i === 0 ? '#ca8a04' : i === 1 ? '#64748b' : i === 2 ? '#ea580c' : '#94a3b8'
                }}>
                  {i === 0 ? <Icon src="https://cdn-icons-png.flaticon.com/512/2583/2583344.png" alt="Gold" size={18} /> : i === 1 ? <Icon src="https://cdn-icons-png.flaticon.com/512/2583/2583347.png" alt="Silver" size={18} /> : i === 2 ? <Icon src="https://cdn-icons-png.flaticon.com/512/2583/2583434.png" alt="Bronze" size={18} /> : `#${i + 1}`}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{book.author}</div>
                </div>
                <span className="badge badge-blue">{book.totalBorrows} borrows</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Icon src={ICONS.activity} alt="" size={16} style={{ marginRight: 6 }} />Recent Activity</div>
          </div>
          <div className="card-body" style={{ padding: '12px 20px' }}>
            {recentBorrows.length === 0 ? (
              <div className="empty-state" style={{ padding: 30 }}><p>No recent activity</p></div>
            ) : recentBorrows.slice(0, 8).map(b => (
              <div key={b._id} className="activity-item">
                <div className={`activity-dot ${b.status === 'returned' ? 'return' : b.status === 'overdue' ? 'overdue' : 'borrow'}`}>
                  {b.status === 'returned' ? <Icon src={ICONS.check} alt="" size={14} /> : b.status === 'overdue' ? <Icon src={ICONS.warning} alt="" size={14} /> : <Icon src={ICONS.book} alt="" size={14} />}
                </div>
                <div className="activity-text">
                  <strong>{b.user?.name || 'Unknown'} borrowed "{b.book?.title?.slice(0, 25) || 'Unknown'}..."</strong>
                  <span>{new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
                <span className={`badge ${b.status === 'returned' ? 'badge-green' : b.status === 'overdue' ? 'badge-red' : 'badge-blue'}`} style={{ flexShrink: 0 }}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
