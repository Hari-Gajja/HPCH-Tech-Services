import crypto from 'crypto'
import config from '../config/env.js'

/**
 * Generate a cryptographically random 6-digit OTP
 */
export function generateOtp() {
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Get OTP expiry timestamp (ms)
 */
export function getOtpExpiry() {
  return Date.now() + config.otpExpiryMinutes * 60 * 1000
}

/**
 * Create HMAC hash for email OTP verification
 */
export function createEmailOtpHash(email, otp, expiresAt) {
  return crypto
    .createHmac('sha256', config.otpSecret)
    .update(`email|${email}|${otp}|${expiresAt}`)
    .digest('hex')
}

/**
 * Create HMAC hash for phone OTP verification
 */
export function createPhoneOtpHash(phone, otp, expiresAt) {
  return crypto
    .createHmac('sha256', config.otpSecret)
    .update(`phone|${phone}|${otp}|${expiresAt}`)
    .digest('hex')
}

/**
 * Verify an OTP hash (constant-time comparison)
 */
export function verifyOtpHash(expected, actual) {
  if (expected.length !== actual.length) return false
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(actual))
}
