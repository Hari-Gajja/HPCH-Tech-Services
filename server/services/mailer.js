import nodemailer from 'nodemailer'
import config from '../config/env.js'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.gmail.user,
    pass: config.gmail.password,
  },
})

// Verify SMTP connection on startup
transporter.verify()
  .then(() => console.log('✓ Gmail SMTP connected'))
  .catch((err) => console.error('✗ Gmail SMTP error:', err.message))

/**
 * Send OTP verification email
 */
export async function sendOtpEmail(to, otp) {
  const info = await transporter.sendMail({
    from: `"${config.gmail.fromName}" <${config.gmail.user}>`,
    to,
    subject: 'Your OTP Verification Code',
    text: `Your OTP code is: ${otp}. It expires in ${config.otpExpiryMinutes} minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0a0a0a;border:1px solid #333;border-radius:12px;">
        <h2 style="color:#00e5ff;text-align:center;margin-bottom:8px;">${config.gmail.fromName}</h2>
        <p style="color:#ccc;text-align:center;">Email Verification Code</p>
        <div style="text-align:center;margin:24px 0;">
          <span style="display:inline-block;font-size:32px;font-weight:bold;letter-spacing:8px;color:#fff;background:#1a1a2e;padding:16px 32px;border-radius:8px;border:1px solid #00e5ff;">${otp}</span>
        </div>
        <p style="color:#888;text-align:center;font-size:13px;">This code expires in ${config.otpExpiryMinutes} minutes. Do not share it with anyone.</p>
      </div>
    `,
  })

  console.log('OTP email sent:', info.messageId, 'to', to)
  return info
}

export default transporter
