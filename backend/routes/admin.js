import express from 'express';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import User from '../models/User.js';
import SiteView from '../models/SiteView.js';
import Discount from '../models/Discount.js';
import StudentRequest from '../models/StudentRequest.js';

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer – memory storage for Cloudinary upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 800 * 1024 }, // 800 KB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

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

// ---------- Get current discount (public) ----------
router.get('/discount', async (_req, res) => {
  try {
    const discount = await Discount.findOne({ active: true }).sort({ updatedAt: -1 }).lean();
    return res.json({ discount: discount || { percentage: 0, active: false, note: '' } });
  } catch (err) {
    console.error('Get discount error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch discount' });
  }
});

// ---------- Set discount (admin only) ----------
router.post('/discount', requireAdmin, async (req, res) => {
  try {
    const { percentage, note } = req.body;
    const pct = Number(percentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      return res.status(400).json({ error: 'Percentage must be between 0 and 100' });
    }
    const safeNote = typeof note === 'string' ? note.slice(0, 200) : '';

    // Deactivate all existing discounts
    await Discount.updateMany({}, { active: false });

    if (pct > 0) {
      await Discount.create({ percentage: pct, note: safeNote, active: true });
    }

    return res.json({ success: true, percentage: pct });
  } catch (err) {
    console.error('Set discount error:', err.message);
    return res.status(500).json({ error: 'Failed to set discount' });
  }
});

// ---------- Upload student ID to Cloudinary ----------
router.post('/upload-student-id', upload.single('studentId'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'hpch-student-ids', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    return res.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
});

// ---------- Submit student discount request (public) ----------
router.post('/student-request', async (req, res) => {
  try {
    const { name, email, phone, collegeName, studentIdUrl, studentIdPublicId, message } = req.body;

    if (!name || !email || !collegeName || !studentIdUrl) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const request = await StudentRequest.create({
      name: String(name).slice(0, 200),
      email: String(email).slice(0, 200),
      phone: String(phone).slice(0, 20),
      collegeName: String(collegeName).slice(0, 300),
      studentIdUrl: String(studentIdUrl),
      studentIdPublicId: String(studentIdPublicId || ''),
      message: String(message || '').slice(0, 2000),
    });

    return res.json({ success: true, id: request._id });
  } catch (err) {
    console.error('Student request error:', err.message);
    return res.status(500).json({ error: 'Failed to submit request' });
  }
});

// ---------- Get all student requests (admin only) ----------
router.get('/student-requests', requireAdmin, async (_req, res) => {
  try {
    const requests = await StudentRequest.find().sort({ createdAt: -1 }).lean();
    return res.json({ requests });
  } catch (err) {
    console.error('Fetch student requests error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// ---------- Update student request status (admin only) ----------
router.patch('/student-request/:id', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const STUDENT_DISCOUNT = 10;
    const update = { status };
    if (status === 'approved') {
      update.discountPercentage = STUDENT_DISCOUNT;
    }

    const request = await StudentRequest.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).lean();

    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Sync fixed 10% discount to user account when approved
    if (status === 'approved') {
      await User.findOneAndUpdate(
        { email: request.email.toLowerCase() },
        { studentDiscount: STUDENT_DISCOUNT }
      );
    }
    // Remove discount from user account when rejected
    if (status === 'rejected') {
      await User.findOneAndUpdate(
        { email: request.email.toLowerCase() },
        { studentDiscount: 0 }
      );
    }

    return res.json({ success: true, request });
  } catch (err) {
    console.error('Update student request error:', err.message);
    return res.status(500).json({ error: 'Failed to update request' });
  }
});

// ---------- Delete student ID image only (admin only) ----------
router.delete('/student-request/:id/image', requireAdmin, async (req, res) => {
  try {
    const request = await StudentRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (request.studentIdPublicId) {
      await cloudinary.uploader.destroy(request.studentIdPublicId).catch((e) =>
        console.error('Cloudinary delete error:', e.message)
      );
    }

    request.studentIdUrl = '';
    request.studentIdPublicId = '';
    await request.save();

    return res.json({ success: true });
  } catch (err) {
    console.error('Delete student ID error:', err.message);
    return res.status(500).json({ error: 'Failed to delete student ID' });
  }
});

// ---------- Delete entire student request (admin only) ----------
router.delete('/student-request/:id', requireAdmin, async (req, res) => {
  try {
    const request = await StudentRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (request.studentIdPublicId) {
      await cloudinary.uploader.destroy(request.studentIdPublicId).catch((e) =>
        console.error('Cloudinary delete error:', e.message)
      );
    }

    await StudentRequest.findByIdAndDelete(req.params.id);

    return res.json({ success: true });
  } catch (err) {
    console.error('Delete student request error:', err.message);
    return res.status(500).json({ error: 'Failed to delete request' });
  }
});

// ---------- Remove all student discounts (admin only) ----------
router.delete('/student-discounts', requireAdmin, async (_req, res) => {
  try {
    await User.updateMany({ studentDiscount: { $gt: 0 } }, { studentDiscount: 0 });
    await StudentRequest.updateMany({ status: 'approved' }, { status: 'rejected', discountPercentage: 0 });
    return res.json({ success: true });
  } catch (err) {
    console.error('Remove all student discounts error:', err.message);
    return res.status(500).json({ error: 'Failed to remove student discounts' });
  }
});

export default router;
