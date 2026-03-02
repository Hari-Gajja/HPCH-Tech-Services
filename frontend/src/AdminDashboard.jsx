import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './auth/AuthContext';
import { fetchAdminStats } from './auth/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [viewsChart, setViewsChart] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAdminStats();
      setStats(data.stats);
      setViewsChart(data.viewsChart || []);
      setRecentUsers(data.recentUsers || []);
      setAllUsers(data.allUsers || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) loadStats();
  }, [authLoading, loadStats]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [loadStats]);

  if (authLoading) {
    return (
      <div className="ad-loading-screen">
        <div className="ad-loader" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="ad-error-screen">
        <div className="ad-error-icon">🔒</div>
        <h2>Authentication Required</h2>
        <p>Please login to access the admin dashboard.</p>
        <a href="/" className="ad-back-link">← Back to site</a>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="ad-error-screen">
        <div className="ad-error-icon">⚠️</div>
        <h2>Access Denied</h2>
        <p>{error}</p>
        <a href="/" className="ad-back-link">← Back to site</a>
      </div>
    );
  }

  const maxViewCount = viewsChart.length ? Math.max(...viewsChart.map((v) => v.count), 1) : 1;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const timeSince = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="ad-root">
      {/* Animated background */}
      <div className="ad-bg">
        <div className="ad-bg-orb ad-bg-orb--1" />
        <div className="ad-bg-orb ad-bg-orb--2" />
        <div className="ad-bg-orb ad-bg-orb--3" />
      </div>

      {/* Sidebar */}
      <aside className="ad-sidebar">
        <div className="ad-sidebar-brand">
          <span className="ad-brand-logo">HPCH</span>
          <span className="ad-brand-sub">Admin Panel</span>
        </div>

        <nav className="ad-nav">
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'users', icon: '👥', label: 'Users' },
            { id: 'analytics', icon: '📈', label: 'Analytics' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`ad-nav-item ${activeTab === tab.id ? 'ad-nav-item--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="ad-nav-icon">{tab.icon}</span>
              <span className="ad-nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          <div className="ad-admin-info">
            {user.picture && <img src={user.picture} alt="" className="ad-admin-avatar" />}
            <div>
              <div className="ad-admin-name">{user.name}</div>
              <div className="ad-admin-email">{user.email}</div>
            </div>
          </div>
          <a href="/" className="ad-back-btn">← Back to site</a>
        </div>
      </aside>

      {/* Main content */}
      <main className="ad-main">
        <header className="ad-header">
          <div>
            <h1 className="ad-header-title">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'analytics' && 'Analytics'}
            </h1>
            <p className="ad-header-sub">
              {activeTab === 'overview' && 'Monitor your website at a glance'}
              {activeTab === 'users' && 'View and manage all registered users'}
              {activeTab === 'analytics' && 'Track website traffic and engagement'}
            </p>
          </div>
          <button className="ad-refresh-btn" onClick={loadStats} disabled={loading}>
            <span className={`ad-refresh-icon ${loading ? 'ad-refresh-icon--spin' : ''}`}>⟳</span>
            Refresh
          </button>
        </header>

        {/* ========== OVERVIEW TAB ========== */}
        {activeTab === 'overview' && stats && (
          <div className="ad-content ad-fade-in">
            {/* Stat Cards */}
            <div className="ad-stats-grid">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#ff0080' },
                { label: 'New Today', value: stats.newUsersToday, icon: '🆕', color: '#00d4ff' },
                { label: 'Logins Today', value: stats.loginsToday, icon: '🔑', color: '#7928ca' },
                { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: '👁️', color: '#00ff88' },
                { label: 'Views Today', value: stats.todayViews, icon: '📈', color: '#ffee00' },
                { label: 'Total Logins', value: stats.totalLogins, icon: '🔐', color: '#ff6b6b' },
              ].map((card, i) => (
                <div className="ad-stat-card" key={card.label} style={{ '--accent': card.color, '--i': i }}>
                  <div className="ad-stat-icon">{card.icon}</div>
                  <div className="ad-stat-value">{card.value}</div>
                  <div className="ad-stat-label">{card.label}</div>
                  <div className="ad-stat-glow" />
                </div>
              ))}
            </div>

            {/* Recent Users */}
            <div className="ad-section">
              <h3 className="ad-section-title">Recent Logins</h3>
              <div className="ad-recent-list">
                {recentUsers.map((u) => (
                  <div className="ad-recent-item" key={u._id}>
                    <img
                      src={u.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=1a1a2e&color=fff`}
                      alt=""
                      className="ad-recent-avatar"
                    />
                    <div className="ad-recent-info">
                      <span className="ad-recent-name">{u.name}</span>
                      <span className="ad-recent-email">{u.email}</span>
                    </div>
                    <span className="ad-recent-time">{timeSince(u.lastLogin)}</span>
                  </div>
                ))}
                {recentUsers.length === 0 && (
                  <p className="ad-empty">No users yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========== USERS TAB ========== */}
        {activeTab === 'users' && (
          <div className="ad-content ad-fade-in">
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Verified</th>
                    <th>Last Login</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="ad-table-user">
                          <img
                            src={u.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=1a1a2e&color=fff`}
                            alt=""
                            className="ad-table-avatar"
                          />
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone || '—'}</td>
                      <td>
                        <span className={`ad-badge ${u.emailVerified ? 'ad-badge--yes' : 'ad-badge--no'}`}>
                          {u.emailVerified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>{formatDateTime(u.lastLogin)}</td>
                      <td>{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allUsers.length === 0 && (
                <p className="ad-empty" style={{ padding: '2rem' }}>No users registered yet</p>
              )}
            </div>
          </div>
        )}

        {/* ========== ANALYTICS TAB ========== */}
        {activeTab === 'analytics' && (
          <div className="ad-content ad-fade-in">
            <div className="ad-section">
              <h3 className="ad-section-title">Page Views – Last 30 Days</h3>
              <div className="ad-chart">
                {viewsChart.length === 0 && <p className="ad-empty">No view data yet</p>}
                <div className="ad-chart-bars">
                  {viewsChart.map((v) => (
                    <div className="ad-chart-col" key={v.date}>
                      <div className="ad-chart-tooltip">{v.count}</div>
                      <div
                        className="ad-chart-bar"
                        style={{ height: `${(v.count / maxViewCount) * 100}%` }}
                      />
                      <span className="ad-chart-label">{formatDate(v.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {stats && (
              <div className="ad-stats-grid ad-stats-grid--small">
                <div className="ad-stat-card" style={{ '--accent': '#00d4ff' }}>
                  <div className="ad-stat-icon">📊</div>
                  <div className="ad-stat-value">{stats.totalViews.toLocaleString()}</div>
                  <div className="ad-stat-label">All-time Views</div>
                </div>
                <div className="ad-stat-card" style={{ '--accent': '#ff0080' }}>
                  <div className="ad-stat-icon">📅</div>
                  <div className="ad-stat-value">{stats.todayViews}</div>
                  <div className="ad-stat-label">Today's Views</div>
                </div>
                <div className="ad-stat-card" style={{ '--accent': '#7928ca' }}>
                  <div className="ad-stat-icon">📈</div>
                  <div className="ad-stat-value">
                    {viewsChart.length
                      ? Math.round(viewsChart.reduce((s, v) => s + v.count, 0) / viewsChart.length)
                      : 0}
                  </div>
                  <div className="ad-stat-label">Avg Daily Views</div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
