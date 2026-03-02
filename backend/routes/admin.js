import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import SiteView from '../models/SiteView.js';

const router = express.Router();

/* ------------------------------------------------
   ADMIN EMAIL – only this email can access the
   admin dashboard API. Change if needed.
   ------------------------------------------------ */
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

// Middleware: verify JWT + check admin email
function requireAdmin(req, res, next) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If ADMIN_EMAIL is set, enforce it; otherwise allow any logged-in user
    if (ADMIN_EMAIL && decoded.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Admin access only' });
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ---------- Track page view (called from frontend) ----------
router.post('/track-view', async (_req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    await SiteView.findOneAndUpdate(
      { date: today },
      { $inc: { count: 1 } },
      { upsert: true }
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('Track view error:', err.message);
    return res.status(500).json({ error: 'Failed to track view' });
  }
});

// ---------- Dashboard stats (admin only) ----------
router.get('/stats', requireAdmin, async (_req, res) => {
  try {
    // Total registered users
    const totalUsers = await User.countDocuments();

    // Users registered today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: startOfDay } });

    // Logins today (users whose lastLogin is today)
    const loginsToday = await User.countDocuments({ lastLogin: { $gte: startOfDay } });

    // Total logins (approximate – sum of all views as a proxy, or count of users who ever logged in)
    const totalLogins = await User.countDocuments({ lastLogin: { $exists: true } });

    // Page views – last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().slice(0, 10);
    const viewDocs = await SiteView.find({ date: { $gte: dateStr } }).sort({ date: 1 }).lean();

    const totalViewsAllTime = await SiteView.aggregate([{ $group: { _id: null, total: { $sum: '$count' } } }]);
    const totalViews = totalViewsAllTime[0]?.total || 0;

    const todayViews = viewDocs.find((v) => v.date === new Date().toISOString().slice(0, 10))?.count || 0;

    // Recent users (last 10)
    const recentUsers = await User.find({}, 'name email picture lastLogin createdAt')
      .sort({ lastLogin: -1 })
      .limit(10)
      .lean();

    // All users list
    const allUsers = await User.find({}, 'name email phone picture lastLogin createdAt emailVerified')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      stats: {
        totalUsers,
        newUsersToday,
        loginsToday,
        totalLogins,
        totalViews,
        todayViews,
      },
      viewsChart: viewDocs, // { date, count }[]
      recentUsers,
      allUsers,
    });
  } catch (err) {
    console.error('Admin stats error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
