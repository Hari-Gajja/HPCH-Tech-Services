import nodemailer from 'nodemailer'
import crypto from 'crypto'

const OTP_SECRET = process.env.OTP_SECRET
const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10)

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

function createOtpHash(email, otp, expiresAt) {
  return crypto.createHmac('sha256', OTP_SECRET).update(`email|${email}|${otp}|${expiresAt}`).digest('hex')
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const { email } = await req.json()
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const otp = crypto.randomInt(100000, 999999).toString()
    const expiresAt = Date.now() + OTP_EXPIRY * 60 * 1000
    const hash = createOtpHash(email.toLowerCase(), otp, expiresAt)

    const fromName = process.env.GMAIL_FROM_NAME || 'HPCH TECH'
    await transporter.sendMail({
      from: `"${fromName}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Verification Code',
      text: `Your OTP code is: ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0a0a0a;border:1px solid #333;border-radius:12px;">
          <h2 style="color:#00e5ff;text-align:center;margin-bottom:8px;">HPCH TECH</h2>
          <p style="color:#ccc;text-align:center;">Email Verification Code</p>
          <div style="text-align:center;margin:24px 0;">
            <span style="display:inline-block;font-size:32px;font-weight:bold;letter-spacing:8px;color:#fff;background:#1a1a2e;padding:16px 32px;border-radius:8px;border:1px solid #00e5ff;">${otp}</span>
          </div>
          <p style="color:#888;text-align:center;font-size:13px;">This code expires in 5 minutes. Do not share it with anyone.</p>
        </div>
      `,
    })

    return new Response(JSON.stringify({ success: true, message: 'OTP sent successfully', hash, expiresAt }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('Send OTP error:', err)
    return new Response(JSON.stringify({ error: 'Failed to send OTP' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
