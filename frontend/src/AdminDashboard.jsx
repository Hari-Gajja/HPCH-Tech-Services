import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './auth/AuthContext';
import { fetchAdminStats, fetchStudentRequests, updateStudentRequestStatus, deleteStudentId, deleteStudentRequest, fetchDiscount, setDiscount, removeAllStudentDiscounts, fetchEmailUsage } from './auth/api';
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
  const [studentRequests, setStudentRequests] = useState([]);
  const [discountPct, setDiscountPct] = useState('');
  const [discountNote, setDiscountNote] = useState('');
  const [currentDiscount, setCurrentDiscount] = useState(null);
  const [discountSaving, setDiscountSaving] = useState(false);
  const [studentImageModal, setStudentImageModal] = useState(null);
  const [emailUsage, setEmailUsage] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [data, stuRes, discData, emailData] = await Promise.all([
        fetchAdminStats(),
        fetchStudentRequests().catch(() => ({ requests: [] })),
        fetchDiscount().catch(() => null),
        fetchEmailUsage().catch(() => null),
      ]);
      setStats(data.stats);
      setViewsChart(data.viewsChart || []);
      setRecentUsers(data.recentUsers || []);
      setAllUsers(data.allUsers || []);
      setStudentRequests(stuRes.requests || []);
      setCurrentDiscount(discData);
      setEmailUsage(emailData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStudentStatus = async (id, status) => {
    try {
      await updateStudentRequestStatus(id, status);
      setStudentRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status, ...(status === 'approved' ? { discountPercentage: 10 } : {}) } : r))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDownloadId = async (url, name) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `student-id-${name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleDeleteId = async (id) => {
    if (!window.confirm('Delete this student ID image from Cloudinary?')) return;
    try {
      await deleteStudentId(id);
      setStudentRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, studentIdUrl: '', studentIdPublicId: '' } : r))
      );
    } catch (err) {
      console.error('Delete ID failed:', err);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Delete this entire request and its ID image from Cloudinary?')) return;
    try {
      await deleteStudentRequest(id);
      setStudentRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error('Delete request failed:', err);
    }
  };

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
        <div className="ad-error-icon"><i className="fas fa-lock"></i></div>
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
            { id: 'overview', icon: 'fas fa-chart-pie', label: 'Overview' },
            { id: 'users', icon: 'fas fa-users', label: 'Users' },
            { id: 'analytics', icon: 'fas fa-chart-line', label: 'Analytics' },
            { id: 'students', icon: 'fas fa-user-graduate', label: 'Students' },
            { id: 'discounts', icon: 'fas fa-tags', label: 'Discounts' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`ad-nav-item ${activeTab === tab.id ? 'ad-nav-item--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="ad-nav-icon"><i className={tab.icon}></i></span>
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
              {activeTab === 'students' && 'Student Discount Requests'}
              {activeTab === 'discounts' && 'Overall Discount Management'}
            </h1>
            <p className="ad-header-sub">
              {activeTab === 'overview' && 'Monitor your website at a glance'}
              {activeTab === 'users' && 'View and manage all registered users'}
              {activeTab === 'analytics' && 'Track website traffic and engagement'}
              {activeTab === 'students' && 'Review student ID submissions and assign discounts'}
              {activeTab === 'discounts' && 'Set a site-wide discount for all services'}
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
                { label: 'Total Users', value: stats.totalUsers, icon: 'fas fa-users', color: '#ff0080' },
                { label: 'New Today', value: stats.newUsersToday, icon: 'fas fa-user-plus', color: '#00d4ff' },
                { label: 'Logins Today', value: stats.loginsToday, icon: 'fas fa-right-to-bracket', color: '#7928ca' },
                { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: 'fas fa-eye', color: '#00ff88' },
                { label: 'Views Today', value: stats.todayViews, icon: 'fas fa-chart-line', color: '#ffee00' },
                { label: 'Total Logins', value: stats.totalLogins, icon: 'fas fa-shield-halved', color: '#ff6b6b' },
              ].map((card, i) => (
                <div className="ad-stat-card" key={card.label} style={{ '--accent': card.color, '--i': i }}>
                  <div className="ad-stat-icon"><i className={card.icon}></i></div>
                  <div className="ad-stat-value">{card.value}</div>
                  <div className="ad-stat-label">{card.label}</div>
                  <div className="ad-stat-glow" />
                </div>
              ))}
            </div>

            {/* EmailJS Usage */}
            {emailUsage && (
              <div className="ad-section ad-email-usage">
                <h3 className="ad-section-title"><i className="fas fa-envelope"></i> EmailJS Usage — {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h3>
                <div className="ad-email-usage-body">
                  <div className="ad-email-stats-row">
                    <div className="ad-email-stat">
                      <span className="ad-email-stat-value" style={{ color: '#ff6b6b' }}>{emailUsage.sent}</span>
                      <span className="ad-email-stat-label">Sent</span>
                    </div>
                    <div className="ad-email-stat">
                      <span className="ad-email-stat-value" style={{ color: '#00ff88' }}>{emailUsage.remaining}</span>
                      <span className="ad-email-stat-label">Remaining</span>
                    </div>
                    <div className="ad-email-stat">
                      <span className="ad-email-stat-value" style={{ color: '#00d4ff' }}>{emailUsage.limit}</span>
                      <span className="ad-email-stat-label">Monthly Limit</span>
                    </div>
                  </div>
                  <div className="ad-email-bar-wrap">
                    <div
                      className={`ad-email-bar-fill${emailUsage.sent / emailUsage.limit > 0.8 ? ' ad-email-bar--danger' : ''}`}
                      style={{ width: `${Math.min(100, (emailUsage.sent / emailUsage.limit) * 100)}%` }}
                    />
                  </div>
                  <p className="ad-email-bar-label">
                    {Math.round((emailUsage.sent / emailUsage.limit) * 100)}% used
                    {emailUsage.sent / emailUsage.limit > 0.8 && <span className="ad-email-warn"> — Running low!</span>}
                  </p>
                </div>
              </div>
            )}

            {/* Recent Users */}
            <div className="ad-section">
              <h3 className="ad-section-title">Recent Logins</h3>
              <div className="ad-recent-list">
                {recentUsers.map((u) => (
                  <div className="ad-recent-item" key={u._id}>
                    <img
                      src={u.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=f0f1f3&color=171717`}
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
                            src={u.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=f0f1f3&color=171717`}
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
            {/* Stat Cards */}
            {stats && (
              <div className="ad-stats-grid ad-stats-grid--small">
                {[
                  { accent: '#00d4ff', icon: 'fas fa-eye', value: stats.totalViews.toLocaleString(), label: 'All-time Views' },
                  { accent: '#ff0080', icon: 'fas fa-calendar-day', value: stats.todayViews, label: "Today's Views" },
                  { accent: '#7928ca', icon: 'fas fa-chart-line', value: viewsChart.length ? Math.round(viewsChart.reduce((s, v) => s + v.count, 0) / viewsChart.length) : 0, label: 'Avg Daily Views' },
                  { accent: '#10b981', icon: 'fas fa-users', value: stats.totalUsers, label: 'Total Users' },
                ].map((card, idx) => (
                  <div key={idx} className="ad-stat-card" style={{ '--accent': card.accent, '--i': idx }}>
                    <div className="ad-stat-glow" />
                    <div className="ad-stat-icon"><i className={card.icon}></i></div>
                    <div className="ad-stat-value">{card.value}</div>
                    <div className="ad-stat-label">{card.label}</div>
                    <div className="ad-stat-accent-bar" style={{ background: card.accent }} />
                  </div>
                ))}
              </div>
            )}

            {/* Interactive Line Chart */}
            <div className="ad-section">
              <h3 className="ad-section-title"><span className="ad-section-title-icon"><i className="fas fa-chart-area"></i></span> Page Views – Last 30 Days</h3>
              {viewsChart.length === 0 ? (
                <p className="ad-empty">No view data yet</p>
              ) : (
                (() => {
                  const chartW = Math.max(viewsChart.length * 50, 400);
                  const chartH = 260;
                  const padL = 50, padR = 20, padT = 20, padB = 40;
                  const plotW = chartW - padL - padR;
                  const plotH = chartH - padT - padB;
                  const safeMax = maxViewCount || 1;
                  const niceMax = Math.ceil(safeMax / (Math.pow(10, Math.floor(Math.log10(safeMax || 1))) || 1)) * (Math.pow(10, Math.floor(Math.log10(safeMax || 1))) || 1) || 1;
                  const yTicks = 5;

                  const pts = viewsChart.map((v, i) => ({
                    x: padL + (i / Math.max(viewsChart.length - 1, 1)) * plotW,
                    y: padT + plotH - (v.count / niceMax) * plotH,
                    ...v,
                  }));

                  // Catmull-Rom to bezier smooth curve
                  const smoothPath = (() => {
                    if (pts.length < 2) return `M${pts[0].x},${pts[0].y}`;
                    let d = `M${pts[0].x},${pts[0].y}`;
                    for (let i = 0; i < pts.length - 1; i++) {
                      const p0 = pts[Math.max(i - 1, 0)];
                      const p1 = pts[i];
                      const p2 = pts[i + 1];
                      const p3 = pts[Math.min(i + 2, pts.length - 1)];
                      const t = 0.3;
                      const cp1x = p1.x + (p2.x - p0.x) * t;
                      const cp1y = p1.y + (p2.y - p0.y) * t;
                      const cp2x = p2.x - (p3.x - p1.x) * t;
                      const cp2y = p2.y - (p3.y - p1.y) * t;
                      d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
                    }
                    return d;
                  })();

                  const areaPath = smoothPath + ` L${pts[pts.length - 1].x},${padT + plotH} L${pts[0].x},${padT + plotH} Z`;

                  return (
                    <div className="ad-line-chart-wrapper">
                      <svg className="ad-line-chart" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="xMidYMid meet">
                        <defs>
                          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff0080" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#ff0080" stopOpacity="0.01" />
                          </linearGradient>
                          <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#ff0080" />
                            <stop offset="50%" stopColor="#7928ca" />
                            <stop offset="100%" stopColor="#00d4ff" />
                          </linearGradient>
                          <filter id="lineGlow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                          </filter>
                        </defs>

                        {/* Y-axis grid lines & labels */}
                        {Array.from({ length: yTicks + 1 }, (_, i) => {
                          const val = Math.round((niceMax / yTicks) * i);
                          const y = padT + plotH - (i / yTicks) * plotH;
                          return (
                            <g key={`y-${i}`}>
                              <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeDasharray={i === 0 ? 'none' : '4 4'} />
                              <text x={padL - 8} y={y + 3.5} textAnchor="end" fill="rgba(0,0,0,0.3)" fontSize="9" fontWeight="500">{val}</text>
                            </g>
                          );
                        })}

                        {/* Area fill */}
                        <path className="ad-line-area" d={areaPath} fill="url(#lineGrad)" />

                        {/* Smooth line */}
                        <path
                          className="ad-line-path"
                          d={smoothPath}
                          fill="none"
                          stroke="url(#strokeGrad)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter="url(#lineGlow)"
                        />

                        {/* Data points */}
                        {pts.map((p) => (
                          <g key={p.date} className="ad-line-dot-group">
                            <circle cx={p.x} cy={p.y} r="12" fill="transparent" className="ad-line-dot-hover" />
                            <circle cx={p.x} cy={p.y} r="3.5" fill="#ff0080" stroke="#fff" strokeWidth="2" className="ad-line-dot" />
                            <g className="ad-line-tooltip-group">
                              <rect x={p.x - 36} y={p.y - 44} width="72" height="30" rx="8" fill="rgba(23,23,23,0.92)" stroke="rgba(255,0,128,0.25)" strokeWidth="1" />
                              <text x={p.x} y={p.y - 26} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">{p.count}</text>
                              <text x={p.x} y={p.y - 16} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="7.5">views</text>
                            </g>
                          </g>
                        ))}

                        {/* X-axis labels */}
                        {pts.filter((_, i) => i % Math.max(1, Math.floor(pts.length / 7)) === 0).map((p) => (
                          <text key={p.date} x={p.x} y={chartH - 8} textAnchor="middle" fill="rgba(0,0,0,0.3)" fontSize="8.5" fontWeight="500">{formatDate(p.date)}</text>
                        ))}
                      </svg>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Pie Chart & Bar Chart Row */}
            {stats && (
              <div className="ad-analytics-charts-row">
                {/* Donut Pie Chart */}
                <div className="ad-section ad-pie-section">
                  <h3 className="ad-section-title"><span className="ad-section-title-icon"><i className="fas fa-chart-pie"></i></span> Traffic Distribution</h3>
                  {(() => {
                    const pieData = [
                      { label: 'Total Views', value: stats.totalViews, color: '#ff0080' },
                      { label: 'Total Users', value: stats.totalUsers, color: '#7928ca' },
                      { label: 'Logins', value: stats.totalLogins, color: '#00d4ff' },
                      { label: 'Today Views', value: stats.todayViews || 1, color: '#10b981' },
                    ];
                    const total = pieData.reduce((s, d) => s + d.value, 0) || 1;
                    let cumAngle = 0;
                    const slices = pieData.map((d) => {
                      const angle = (d.value / total) * 360;
                      const startAngle = cumAngle;
                      cumAngle += angle;
                      return { ...d, startAngle, angle, percent: ((d.value / total) * 100).toFixed(1) };
                    });

                    const toRad = (deg) => (deg * Math.PI) / 180;
                    const cx = 130, cy = 130, outerR = 110, innerR = 60;
                    const describeDonut = (start, end) => {
                      const s1 = { x: cx + outerR * Math.cos(toRad(start - 90)), y: cy + outerR * Math.sin(toRad(start - 90)) };
                      const e1 = { x: cx + outerR * Math.cos(toRad(end - 90)), y: cy + outerR * Math.sin(toRad(end - 90)) };
                      const s2 = { x: cx + innerR * Math.cos(toRad(end - 90)), y: cy + innerR * Math.sin(toRad(end - 90)) };
                      const e2 = { x: cx + innerR * Math.cos(toRad(start - 90)), y: cy + innerR * Math.sin(toRad(start - 90)) };
                      const large = end - start > 180 ? 1 : 0;
                      return `M${s1.x},${s1.y} A${outerR},${outerR} 0 ${large} 1 ${e1.x},${e1.y} L${s2.x},${s2.y} A${innerR},${innerR} 0 ${large} 0 ${e2.x},${e2.y} Z`;
                    };

                    return (
                      <div className="ad-pie-container">
                        <div className="ad-pie-3d-wrapper">
                          <svg className="ad-pie-svg" viewBox="0 0 260 260">
                            <defs>
                              {slices.map((sl, i) => (
                                <filter key={`shadow-${i}`} id={`pieShadow${i}`}>
                                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={sl.color} floodOpacity="0.35" />
                                </filter>
                              ))}
                              <filter id="pieInnerShadow">
                                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="rgba(0,0,0,0.15)" floodOpacity="0.15" />
                              </filter>
                            </defs>
                            {slices.map((sl, i) => {
                              const midAngle = sl.startAngle + sl.angle / 2;
                              const labelR = (outerR + innerR) / 2;
                              const lx = cx + labelR * Math.cos(toRad(midAngle - 90));
                              const ly = cy + labelR * Math.sin(toRad(midAngle - 90));
                              return (
                                <g key={i}>
                                  <path
                                    className="ad-pie-slice"
                                    d={describeDonut(sl.startAngle, sl.startAngle + Math.max(sl.angle - 1.5, 0.5))}
                                    fill={sl.color}
                                    filter={`url(#pieShadow${i})`}
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                  />
                                  {sl.angle > 25 && (
                                    <text x={lx} y={ly + 4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" style={{ pointerEvents: 'none', opacity: 0.9 }}>{sl.percent}%</text>
                                  )}
                                </g>
                              );
                            })}
                            {/* Center */}
                            <circle cx={cx} cy={cy} r={innerR - 2} fill="#fff" filter="url(#pieInnerShadow)" />
                            <circle cx={cx} cy={cy} r={innerR - 6} fill="#fafafa" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
                            <text x={cx} y={cy - 4} textAnchor="middle" fill="#171717" fontSize="18" fontWeight="800">{total.toLocaleString()}</text>
                            <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(0,0,0,0.35)" fontSize="9" fontWeight="500" letterSpacing="0.1em">TOTAL</text>
                          </svg>
                        </div>
                        <div className="ad-pie-legend">
                          {slices.map((sl, i) => (
                            <div key={i} className="ad-pie-legend-item">
                              <span className="ad-pie-legend-dot" style={{ background: sl.color }} />
                              <span className="ad-pie-legend-label">{sl.label}</span>
                              <span className="ad-pie-legend-value">{sl.value.toLocaleString()}</span>
                              <span className="ad-pie-legend-pct">{sl.percent}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Animated Bar Chart */}
                <div className="ad-section ad-bar-section">
                  <h3 className="ad-section-title"><span className="ad-section-title-icon"><i className="fas fa-chart-bar"></i></span> Activity Breakdown</h3>
                  {(() => {
                    const barData = [
                      { label: 'Total Users', value: stats.totalUsers, color: '#7928ca', icon: 'fas fa-users' },
                      { label: 'New Today', value: stats.newUsersToday, color: '#ff0080', icon: 'fas fa-user-plus' },
                      { label: 'Logins Today', value: stats.loginsToday, color: '#00d4ff', icon: 'fas fa-right-to-bracket' },
                      { label: 'Total Logins', value: stats.totalLogins, color: '#10b981', icon: 'fas fa-lock-open' },
                      { label: 'Today Views', value: stats.todayViews, color: '#f59e0b', icon: 'fas fa-calendar-day' },
                      { label: 'Avg Views', value: viewsChart.length ? Math.round(viewsChart.reduce((s, v) => s + v.count, 0) / viewsChart.length) : 0, color: '#ec4899', icon: 'fas fa-chart-line' },
                    ];
                    const maxVal = Math.max(...barData.map((d) => d.value), 1);
                    return (
                      <div className="ad-hbar-chart">
                        {barData.map((d, i) => {
                          const pct = ((d.value / maxVal) * 100).toFixed(0);
                          return (
                            <div key={i} className="ad-hbar-row" style={{ animationDelay: `${i * 0.08}s` }}>
                              <div className="ad-hbar-label">
                                <span className="ad-hbar-icon"><i className={d.icon}></i></span>
                                <span>{d.label}</span>
                              </div>
                              <div className="ad-hbar-track">
                                <div
                                  className="ad-hbar-fill"
                                  style={{ '--bar-width': `${pct}%`, '--bar-color': d.color, animationDelay: `${i * 0.1 + 0.3}s` }}
                                />
                                <span className="ad-hbar-pct">{pct}%</span>
                              </div>
                              <span className="ad-hbar-value" style={{ color: d.color }}>{d.value.toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== STUDENTS TAB ========== */}
        {activeTab === 'students' && (
          <div className="ad-content ad-fade-in">
            <div className="ad-section">
              <h3 className="ad-section-title">
                Student Discount Requests
                {studentRequests.length > 0 && (
                  <span className="ad-student-count">{studentRequests.length}</span>
                )}
              </h3>
              <button
                className="ad-remove-all-discounts-btn"
                onClick={async () => {
                  if (!window.confirm('Remove all student discounts? This will reset the discount for every student.')) return;
                  try {
                    await removeAllStudentDiscounts();
                    setStudentRequests((prev) => prev.map((r) => r.status === 'approved' ? { ...r, status: 'rejected', discountPercentage: 0 } : r));
                  } catch (err) { console.error(err); }
                }}
              >
                <i className="fas fa-ban"></i> Remove All Student Discounts
              </button>

              {studentRequests.length === 0 ? (
                <p className="ad-empty">No student requests yet</p>
              ) : (
                <div className="ad-student-grid">
                  {studentRequests.map((req) => (
                    <div className={`ad-student-card ad-student-card--${req.status}`} key={req._id}>
                      <div className="ad-student-card-header">
                        <div className="ad-student-info">
                          <h4 className="ad-student-name">{req.name}</h4>
                          <span className={`ad-badge ad-badge--${req.status}`}>
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                        </div>
                        <span className="ad-student-date">{formatDate(req.createdAt)}</span>
                      </div>

                      <div className="ad-student-details">
                        <div className="ad-student-detail">
                          <span className="ad-student-label">Email</span>
                          <span>{req.email}</span>
                        </div>
                        <div className="ad-student-detail">
                          <span className="ad-student-label">Phone</span>
                          <span>{req.phone}</span>
                        </div>
                        <div className="ad-student-detail">
                          <span className="ad-student-label">College</span>
                          <span>{req.collegeName}</span>
                        </div>
                        {req.message && (
                          <div className="ad-student-detail ad-student-detail--full">
                            <span className="ad-student-label">Message</span>
                            <span>{req.message}</span>
                          </div>
                        )}
                      </div>

                      <div className="ad-student-id-section">
                        <span className="ad-student-label">Student ID</span>
                        {req.studentIdUrl ? (
                          <>
                            <img
                              src={req.studentIdUrl}
                              alt={`Student ID - ${req.name}`}
                              className="ad-student-id-img"
                              onClick={() => setStudentImageModal(req.studentIdUrl)}
                            />
                            <div className="ad-student-id-actions">
                              <button
                                className="ad-student-btn ad-student-btn--download"
                                onClick={() => handleDownloadId(req.studentIdUrl, req.name)}
                              >
                                <span>⬇</span> Download
                              </button>
                              <button
                                className="ad-student-btn ad-student-btn--delete"
                                onClick={() => handleDeleteId(req._id)}
                              >
                                <i className="fas fa-trash"></i> Delete ID
                              </button>
                            </div>
                          </>
                        ) : (
                          <p className="ad-student-id-removed">ID image removed</p>
                        )}
                      </div>

                      <div className="ad-student-delete-section">
                        <button
                          className="ad-student-btn ad-student-btn--delete-request"
                          onClick={() => handleDeleteRequest(req._id)}
                        >
                          <i className="fas fa-trash"></i> Delete Request
                        </button>
                      </div>

                      {req.status === 'approved' && (
                        <div className="ad-student-discount-badge">
                          <i className="fas fa-check-circle"></i> 10% discount assigned
                        </div>
                      )}

                      {req.status === 'pending' && (
                        <div className="ad-student-actions">
                          <button
                            className="ad-student-btn ad-student-btn--approve"
                            onClick={() => handleStudentStatus(req._id, 'approved')}
                          >
                            <i className="fas fa-check"></i> Approve (10% Discount)
                          </button>
                          <button
                            className="ad-student-btn ad-student-btn--reject"
                            onClick={() => handleStudentStatus(req._id, 'rejected')}
                          >
                            <i className="fas fa-xmark"></i> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image Modal */}
            {studentImageModal && (
              <div className="ad-image-modal" onClick={() => setStudentImageModal(null)}>
                <div className="ad-image-modal-content" onClick={(e) => e.stopPropagation()}>
                  <button className="ad-image-modal-close" onClick={() => setStudentImageModal(null)}><i className="fas fa-xmark"></i></button>
                  <img src={studentImageModal} alt="Student ID" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== DISCOUNTS TAB ========== */}
        {activeTab === 'discounts' && (
          <div className="ad-section">
            <div className="ad-discount-panel">
              <h3 className="ad-discount-title"><i className="fas fa-tag"></i> Current Discount</h3>
              {currentDiscount?.active && currentDiscount.percentage > 0 ? (
                <div className="ad-discount-active">
                  <span className="ad-discount-active-pct">{currentDiscount.percentage}%</span>
                  <span className="ad-discount-active-label">discount active</span>
                  {currentDiscount.note && <p className="ad-discount-active-note">{currentDiscount.note}</p>}
                </div>
              ) : (
                <p className="ad-discount-none">No active discount</p>
              )}

              <div className="ad-discount-form">
                <h4>Set New Discount</h4>
                <div className="ad-discount-form-row">
                  <div className="ad-discount-input-group">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Percentage"
                      value={discountPct}
                      onChange={(e) => setDiscountPct(e.target.value)}
                      className="ad-discount-field"
                    />
                    <span className="ad-discount-pct-symbol">%</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Note (optional, e.g. Summer sale)"
                    value={discountNote}
                    onChange={(e) => setDiscountNote(e.target.value)}
                    className="ad-discount-field ad-discount-note-field"
                  />
                </div>
                <div className="ad-discount-form-actions">
                  <button
                    className="ad-student-btn ad-student-btn--approve"
                    disabled={discountSaving}
                    onClick={async () => {
                      setDiscountSaving(true);
                      try {
                        await setDiscount(Number(discountPct) || 0, discountNote);
                        const d = await fetchDiscount();
                        setCurrentDiscount(d);
                        setDiscountPct('');
                        setDiscountNote('');
                      } catch (err) { console.error(err); }
                      setDiscountSaving(false);
                    }}
                  >
                    {discountSaving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-check"></i> Apply Discount</>}
                  </button>
                  <button
                    className="ad-student-btn ad-student-btn--reject"
                    disabled={discountSaving}
                    onClick={async () => {
                      setDiscountSaving(true);
                      try {
                        await setDiscount(0, '');
                        setCurrentDiscount({ percentage: 0, active: false, note: '' });
                      } catch (err) { console.error(err); }
                      setDiscountSaving(false);
                    }}
                  >
                    <i className="fas fa-xmark"></i> Remove Discount
                  </button>
                </div>
              </div>

              {/* Price Preview */}
              {(() => {
                const services = [
                  { name: 'Frontend Development', price: 4999 },
                  { name: 'Frontend + Custom Domain', price: 5999 },
                  { name: 'Full Stack Web Development', price: 8999 },
                  { name: 'Full Stack + Custom Domain', price: 9999 },
                  { name: 'Full Stack + AI Chat', price: 11999 },
                  { name: 'Full Stack + AI Chat + Domain', price: 12999 },
                ];
                const previewPct = Number(discountPct) || (currentDiscount?.active ? currentDiscount.percentage : 0);
                return (
                  <div className="ad-price-preview">
                    <h4 className="ad-price-preview-title">
                      <i className="fas fa-receipt"></i> Price Preview
                      {previewPct > 0 && <span className="ad-price-preview-badge">−{previewPct}%</span>}
                    </h4>
                    <div className="ad-price-preview-table">
                      <div className="ad-price-preview-header">
                        <span>Service</span>
                        <span>Original</span>
                        <span>Discount</span>
                        <span>Final Price</span>
                      </div>
                      {services.map((s, i) => {
                        const discountAmt = previewPct > 0 ? Math.round(s.price * previewPct / 100) : 0;
                        const finalPrice = s.price - discountAmt;
                        return (
                          <div key={i} className="ad-price-preview-row" style={{ animationDelay: `${i * 0.05}s` }}>
                            <span className="ad-price-preview-name">{s.name}</span>
                            <span className="ad-price-preview-original">₹{s.price.toLocaleString()}</span>
                            <span className={`ad-price-preview-discount ${discountAmt > 0 ? 'active' : ''}`}>
                              {discountAmt > 0 ? `−₹${discountAmt.toLocaleString()}` : '—'}
                            </span>
                            <span className={`ad-price-preview-final ${discountAmt > 0 ? 'discounted' : ''}`}>
                              ₹{finalPrice.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {previewPct > 0 && (
                      <p className="ad-price-preview-note">
                        {discountPct && Number(discountPct) !== (currentDiscount?.percentage || 0)
                          ? <><i className="fas fa-bolt"></i> Previewing unsaved discount — click "Apply Discount" to save</>
                          : <><i className="fas fa-circle-check"></i> Showing currently active discount</>}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
