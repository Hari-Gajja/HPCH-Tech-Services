/**
 * Format phone number to E.164 format (+91 for Indian numbers)
 */
export function formatPhone(phone) {
  let formatted = phone.replace(/[\s\-()]/g, '')
  if (!formatted.startsWith('+')) {
    formatted = '+91' + formatted.replace(/^0+/, '').slice(-10)
  }
  return formatted
}

/**
 * Validate phone number has at least 10 digits
 */
export function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10
}
