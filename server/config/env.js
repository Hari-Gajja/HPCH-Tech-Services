import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

// Load .env from project root
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // OTP
  otpSecret: process.env.OTP_SECRET || 'hpch-otp-secret-key-2024-secure',
  otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 5,

  // Gmail SMTP
  gmail: {
    user: process.env.GMAIL_USER,
    password: process.env.GMAIL_APP_PASSWORD,
    fromName: process.env.GMAIL_FROM_NAME || 'HPCH TECH',
  },

  // Twilio
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    messagingSid: process.env.TWILIO_MESSAGING_SID,
  },
}

// Validate required env vars
const required = [
  ['GMAIL_USER', config.gmail.user],
  ['GMAIL_APP_PASSWORD', config.gmail.password],
  ['TWILIO_ACCOUNT_SID', config.twilio.accountSid],
  ['TWILIO_AUTH_TOKEN', config.twilio.authToken],
  ['TWILIO_MESSAGING_SID', config.twilio.messagingSid],
]

const missing = required.filter(([, val]) => !val).map(([name]) => name)
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`)
  console.error('Copy .env.example to .env and fill in the values.')
  process.exit(1)
}

export default config
