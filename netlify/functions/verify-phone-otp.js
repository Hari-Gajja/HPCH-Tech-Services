import crypto from 'crypto'

const OTP_SECRET = process.env.OTP_SECRET || 'hpch-otp-secret-key-2024-secure'

function createPhoneOtpHash(phone, otp, expiresAt) {
  return crypto.createHmac('sha256', OTP_SECRET).update(`phone|${phone}|${otp}|${expiresAt}`).digest('hex')
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const { phone, code, hash, expiresAt } = await req.json()
    if (!phone || !code || !hash || !expiresAt) {
      return new Response(JSON.stringify({ error: 'Missing required fields.' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    let formattedPhone = phone.replace(/[\s\-()]/g, '')
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone.replace(/^0+/, '').slice(-10)
    }

    if (Date.now() > expiresAt) {
      return new Response(JSON.stringify({ error: 'OTP expired. Please request a new one.' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const expectedHash = createPhoneOtpHash(formattedPhone, code, expiresAt)
    if (!crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(hash))) {
      return new Response(JSON.stringify({ error: 'Invalid OTP. Please try again.' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ success: true, message: 'Phone verified successfully!' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('Verify Phone OTP error:', err)
    return new Response(JSON.stringify({ error: 'Verification failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
