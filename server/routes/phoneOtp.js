import { Router } from 'express'
import { generateOtp, getOtpExpiry, createPhoneOtpHash, verifyOtpHash } from '../utils/otp.js'
import { formatPhone } from '../utils/phone.js'
import { sendOtpSms } from '../services/twilio.js'

const router = Router()

// POST /api/send-phone-otp
router.post('/send-phone-otp', async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' })
    }

    const formattedPhone = formatPhone(phone)
    const otp = generateOtp()
    const expiresAt = getOtpExpiry()
    const hash = createPhoneOtpHash(formattedPhone, otp, expiresAt)

    await sendOtpSms(formattedPhone, otp)

    res.json({ success: true, message: 'OTP sent to your phone!', phone: formattedPhone, hash, expiresAt })
  } catch (err) {
    console.error('Send Phone OTP error:', err.message)
    res.status(500).json({ error: err.message || 'Failed to send phone OTP' })
  }
})

// POST /api/verify-phone-otp
router.post('/verify-phone-otp', async (req, res) => {
  try {
    const { phone, code, hash, expiresAt } = req.body

    if (!phone || !code || !hash || !expiresAt) {
      return res.status(400).json({ error: 'Missing required fields.' })
    }

    const formattedPhone = formatPhone(phone)

    if (Date.now() > expiresAt) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' })
    }

    const expectedHash = createPhoneOtpHash(formattedPhone, code, expiresAt)
    if (!verifyOtpHash(expectedHash, hash)) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' })
    }

    console.log('Phone OTP verified for', formattedPhone)
    res.json({ success: true, message: 'Phone verified successfully!' })
  } catch (err) {
    console.error('Verify Phone OTP error:', err.message)
    res.status(500).json({ error: err.message || 'Phone verification failed' })
  }
})

export default router
