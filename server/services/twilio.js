import twilio from 'twilio'
import config from '../config/env.js'

const twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken)

/**
 * Send OTP SMS via Twilio Messaging Service
 */
export async function sendOtpSms(to, otp) {
  const message = await twilioClient.messages.create({
    body: `This is your OTP for HPCH Services authentication: ${otp}. It expires in ${config.otpExpiryMinutes} minutes. Do not share it with anyone.`,
    messagingServiceSid: config.twilio.messagingSid,
    to,
  })

  console.log('Phone OTP sent:', message.sid, 'to', to)
  return message
}

export default twilioClient
