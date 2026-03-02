import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const router = express.Router();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Verify Google ID token (credential) and save user
router.post('/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Missing Google credential' });
  }

  try {
    // Verify the ID token directly — no code exchange needed
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Upsert user in MongoDB (create if new, update if existing)
    const updateData = {
      googleId: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      emailVerified: payload.email_verified,
      lastLogin: new Date(),
    };

    const dbUser = await User.findOneAndUpdate(
      { googleId: payload.sub },
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const userPayload = {
      id: dbUser._id,
      googleId: dbUser.googleId,
      email: dbUser.email,
      name: dbUser.name,
      phone: dbUser.phone,
      picture: dbUser.picture,
      emailVerified: dbUser.emailVerified,
    };

    // Create a session JWT (valid for 24 hours)
    const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Set token as httpOnly cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.json({ success: true, user: userPayload });
  } catch (error) {
    console.error('Google auth error:', error.message);
    return res.status(401).json({ error: 'Invalid Google credential' });
  }
});

// Check if the user is authenticated
router.get('/me', async (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch fresh data from DB
    const dbUser = await User.findById(decoded.id).lean();
    if (!dbUser) {
      return res.status(401).json({ authenticated: false });
    }
    const user = {
      id: dbUser._id,
      googleId: dbUser.googleId,
      email: dbUser.email,
      name: dbUser.name,
      phone: dbUser.phone,
      picture: dbUser.picture,
      emailVerified: dbUser.emailVerified,
    };
    return res.json({ authenticated: true, user });
  } catch {
    return res.status(401).json({ authenticated: false });
  }
});

// Update phone number for the authenticated user
router.put('/phone', async (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { phone } = req.body;

    if (phone === undefined) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { phone },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: updatedUser._id,
        googleId: updatedUser.googleId,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        picture: updatedUser.picture,
        emailVerified: updatedUser.emailVerified,
      },
    });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Get all users (admin endpoint)
router.get('/users', async (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    const users = await User.find({}, 'name email phone picture lastLogin createdAt').sort({ lastLogin: -1 }).lean();
    return res.json({ users });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Logout – clear the auth cookie
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  return res.json({ success: true, message: 'Logged out' });
});

export default router;
