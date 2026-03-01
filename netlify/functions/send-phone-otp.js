import twilio from 'twilio'
import crypto from 'crypto'

const OTP_SECRET = process.env.OTP_SECRET
const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10)
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
const TWILIO_MESSAGING_SID = process.env.TWILIO_MESSAGING_SID

function createPhoneOtpHash(phone, otp, expiresAt) {
  return crypto.createHmac('sha256', OTP_SECRET).update(`phone|${phone}|${otp}|${expiresAt}`).digest('hex')
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const { phone } = await req.json()
    if (!phone) {
      return new Response(JSON.stringify({ error: 'Phone number is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    let formattedPhone = phone.replace(/[\s\-()]/g, '')
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone.replace(/^0+/, '').slice(-10)
    }

    const otp = crypto.randomInt(100000, 999999).toString()
    const expiresAt = Date.now() + OTP_EXPIRY * 60 * 1000
    const hash = createPhoneOtpHash(formattedPhone, otp, expiresAt)

    await twilioClient.messages.create({
      body: `This is your OTP for HPCH Services authentication: ${otp}. It expires in ${OTP_EXPIRY} minutes. Do not share it with anyone.`,
      messagingServiceSid: TWILIO_MESSAGING_SID,
      to: formattedPhone,
    })

    return new Response(JSON.stringify({ success: true, message: 'OTP sent to your phone!', phone: formattedPhone, hash, expiresAt }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('Send Phone OTP error:', err)
    return new Response(JSON.stringify({ error: err.message || 'Failed to send phone OTP' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
