import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Icon = ({ src, alt = '', size = 18, style = {} }) => {
  if (src && src.startsWith('http')) {
    return <img src={src} alt={alt} width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle', ...style }} />
  }
  return <i className={`fi ${src}`} style={{ fontSize: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, ...style }} title={alt}></i>
};

const ICONS = {
  menu:       'fi-rr-menu-burger',
  close:      'fi-rr-cross',
  logout:     'fi-rr-sign-out-alt',
  dashboard:  'fi-rr-apps',
  books:      'fi-rr-books',
  members:    'fi-rr-users',
  borrows:    'fi-rr-book-alt',
  home:       'fi-rr-home',
  catalog:    'fi-rr-search-alt',
  myBorrows:  'fi-rr-book-alt',
  brand:      'fi-rr-books',
  calendar:   'fi-rr-calendar',
  adminKey:   'fi-rr-key',
  memberCard: 'fi-rr-id-badge',
};

const adminNav = [
  { section: 'Main', items: [
    { path: '/admin/dashboard', iconKey: 'dashboard', label: 'Dashboard' },
    { path: '/admin/books',     iconKey: 'books',     label: 'Books' },
    { path: '/admin/users',     iconKey: 'members',   label: 'Members' },
    { path: '/admin/borrows',   iconKey: 'borrows',   label: 'Borrows' },
  ]},
];

const userNav = [
  { section: 'Main', items: [
    { path: '/dashboard',  iconKey: 'home',      label: 'Dashboard' },
    { path: '/books',      iconKey: 'catalog',   label: 'Books' },
    { path: '/my-borrows', iconKey: 'myBorrows', label: 'Borrows' },
  ]},
];

const pageTitles = {
  '/dashboard':       { title: 'Dashboard',       subtitle: 'Overview of your library activity' },
  '/books':           { title: 'Book Catalog',     subtitle: 'Search and browse all books' },
  '/my-borrows':      { title: 'My Borrows',       subtitle: 'Track your borrowed books' },
  '/admin/dashboard': { title: 'Admin Dashboard',  subtitle: 'Library management overview' },
  '/admin/books':     { title: 'Manage Books',     subtitle: 'Add, edit and remove books' },
  '/admin/users':     { title: 'Manage Members',   subtitle: 'View and manage library members' },
  '/admin/borrows':   { title: 'Manage Borrows',   subtitle: 'Track all borrow transactions' },
};

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = isAdmin ? adminNav : userNav;
  const allNavItems = navItems.flatMap(s => s.items);
  const pageInfo = pageTitles[location.pathname] || { title: 'Library', subtitle: '' };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="layout">

      {/* ── Mobile/Tablet overlay when sidebar drawer is open ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            zIndex: 199, backdropFilter: 'blur(2px)'
          }}
        />
      )}

      {/* ══════════════════════════════════
          DESKTOP SIDEBAR (always visible)
          ══════════════════════════════════ */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>

        {/* Close button — only visible on tablet/mobile inside drawer */}
        <div className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}><Icon src={ICONS.close} alt="Close" size={20} /></div>

        <div className="sidebar-brand">
          <div className="brand-icon"><Icon src={ICONS.brand} alt="Library" size={26} /></div>
          <div className="brand-text">
            LibraryCatalog
            <span>Book Management System</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(section => (
            <div className="nav-section" key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-icon">
                    <Icon src={ICONS[item.iconKey]} alt={item.label} size={18} style={{ opacity: 0.85 }} />
                  </span>
                  {item.label}
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card" onClick={handleLogout} title="Click to logout">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon src={user?.role === 'admin' ? ICONS.adminKey : ICONS.memberCard} alt="role" size={12} />
                {user?.role === 'admin' ? 'Administrator' : 'Member'}
              </div>
            </div>
            <span className="user-logout">
              <Icon src={ICONS.logout} alt="Logout" size={15} style={{ opacity: 0.65 }} />
            </span>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════
          MAIN CONTENT
          ══════════════════════════════════ */}
      <div className="main-content">

        {/* Top bar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Hamburger — visible on tablet only (hidden on mobile; mobile uses bottom nav) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hamburger-btn"
              aria-label="Open menu"
            >
              <Icon src={ICONS.menu} alt="Menu" size={22} />
            </button>
            <div>
              <div className="topbar-title">{pageInfo.title}</div>
              <div className="topbar-subtitle">{pageInfo.subtitle}</div>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="topbar-date-pill">
              <Icon src={ICONS.calendar} alt="Date" size={14} />
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {user?.membershipId && (
              <div className="topbar-member-pill">
                {user.membershipId}
              </div>
            )}
            {/* Logout button — visible on mobile only in topbar */}
            <button
              className="topbar-logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              <Icon src={ICONS.logout} alt="Logout" size={18} />
            </button>
          </div>
        </header>

        <main className="page-content">
          {children}
        </main>
      </div>

      {/* ══════════════════════════════════
          BOTTOM NAVIGATION (mobile only)
          ══════════════════════════════════ */}
      <nav className="bottom-nav">
        {allNavItems.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="bottom-nav-icon">
                <Icon src={ICONS[item.iconKey]} alt={item.label} size={22} />
              </span>
              <span className="bottom-nav-label">{item.label}</span>
            </NavLink>
          );
        })}
        {/* Logout tab in bottom nav */}
        <button className="bottom-nav-item bottom-nav-logout" onClick={handleLogout}>
          <span className="bottom-nav-icon">
            <Icon src={ICONS.logout} alt="Logout" size={22} />
          </span>
          <span className="bottom-nav-label">Logout</span>
        </button>
      </nav>

    </div>
  );
}
