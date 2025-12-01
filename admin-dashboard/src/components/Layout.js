import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'dashboard' },
    { name: 'Polls Management', href: '/polls', icon: 'poll' },
    { name: 'Petitions Management', href: '/petitions', icon: 'description' },
    { name: 'Analytics', href: '/analytics', icon: 'analytics' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getCurrentPageTitle = () => {
    const currentNav = navigation.find(nav => nav.href === location.pathname);
    return currentNav ? currentNav.name : 'Dashboard';
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>JanMat Admin</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`nav-link ${location.pathname === item.href ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{getIcon(item.icon)}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.name || 'Admin'}</p>
              <p className="user-role">{user?.role || 'Administrator'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="main-header">
          <div className="header-left">
            <button 
              className="mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h1>{getCurrentPageTitle()}</h1>
          </div>
          
          <div className="header-right">
            <div className="header-stats">
              <div className="stat">
                <span className="stat-label">Active Users</span>
                <span className="stat-value">12.5K</span>
              </div>
              <div className="stat">
                <span className="stat-label">Live Polls</span>
                <span className="stat-value">47</span>
              </div>
              <div className="stat">
                <span className="stat-label">Open Petitions</span>
                <span className="stat-value">23</span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

const getIcon = (iconName) => {
  const icons = {
    dashboard: '📊',
    poll: '📝',
    description: '📋',
    analytics: '📈'
  };
  return icons[iconName] || '•';
};

export default Layout;