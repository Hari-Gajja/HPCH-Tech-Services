import { Router } from 'express'
import { generateOtp, getOtpExpiry, createEmailOtpHash, verifyOtpHash } from '../utils/otp.js'
import { sendOtpEmail } from '../services/mailer.js'

const router = Router()

// POST /api/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    const otp = generateOtp()
    const expiresAt = getOtpExpiry()
    const hash = createEmailOtpHash(email.toLowerCase(), otp, expiresAt)

    await sendOtpEmail(email, otp)

    res.json({ success: true, message: 'OTP sent successfully', hash, expiresAt })
  } catch (err) {
    console.error('Send OTP error:', err.message)
    res.status(500).json({ error: 'Failed to send OTP' })
  }
})

// POST /api/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, hash, expiresAt } = req.body

    if (!email || !otp || !hash || !expiresAt) {
      return res.status(400).json({ error: 'Missing required fields.' })
    }

    if (Date.now() > expiresAt) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' })
    }

    const expectedHash = createEmailOtpHash(email.toLowerCase(), otp, expiresAt)
    if (!verifyOtpHash(expectedHash, hash)) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' })
    }

    res.json({ success: true, message: 'Email verified successfully!' })
  } catch (err) {
    console.error('Verify OTP error:', err.message)
    res.status(500).json({ error: 'Verification failed' })
  }
})

export default router
