import crypto from 'crypto'

const OTP_SECRET = process.env.OTP_SECRET

function createOtpHash(email, otp, expiresAt) {
  return crypto.createHmac('sha256', OTP_SECRET).update(`email|${email}|${otp}|${expiresAt}`).digest('hex')
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const { email, otp, hash, expiresAt } = await req.json()

    if (!email || !otp || !hash || !expiresAt) {
      return new Response(JSON.stringify({ error: 'Missing required fields.' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    if (Date.now() > expiresAt) {
      return new Response(JSON.stringify({ error: 'OTP has expired. Please request a new one.' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const expectedHash = createOtpHash(email.toLowerCase(), otp, expiresAt)
    if (!crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(hash))) {
      return new Response(JSON.stringify({ error: 'Invalid OTP. Please try again.' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ success: true, message: 'Email verified successfully!' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('Verify OTP error:', err)
    return new Response(JSON.stringify({ error: 'Verification failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
